import * as Sentry from '@sentry/nextjs';
import PQueue from 'p-queue';
import { createContext, ReactNode, useEffect, useState } from 'react';
import { OutputAreaRef } from '../../components/input_output/OutputArea';
import { cellsToFiles, ExecutionResponse } from '../codeExecution';
import { ToolboxFunction } from '../localStorage/schema';
import useLocalProfile from '../localStorage/useLocalProfile';
import { PythonFile } from '../schemas/activitySchema';
import initFfi, { PyTamaroFFI } from './ffi';
import {
  ExecutionRequestMessage,
  ExecutionResultRequestMessage,
  Message,
  RunPythonFile,
  WorkerMessage,
} from './messagesTypes';
import { Sized } from './spec';

enum ResultStatus {
  Computing,
  Ready,
  Failure,
}
type ClientResultValue =
  | Uint8Array // array for rendering result
  | Sized; // object for size result
type ClientResult =
  | { status: ResultStatus.Computing }
  | { status: ResultStatus.Failure }
  | { status: ResultStatus.Ready; value: ClientResultValue };

let pyodideWorker: Worker | null = null;
let ffiImpl: PyTamaroFFI | null = null;

let sharedSyncBuffer: SharedArrayBuffer | null = null;
let syncBuffer: Int32Array | null = null;
let sharedResultLengthBuffer: SharedArrayBuffer | null = null;
let resultLengthBuffer: Int32Array | null = null;
let interruptBuffer: Uint8Array | null = null;

let activeCodeCell: number | null = null;
let getOutputAreaRef: (idx: number) => OutputAreaRef | null = () => null;
const getActiveOutputAreaRef = () =>
  activeCodeCell == null ? null : getOutputAreaRef(activeCodeCell);

const pendingResults = new Map<string, ClientResult>();

// Initialization deferred to initPyodide so that when we restart the worker
// we can "forcibly clear" the queue without waiting for promises that will
// never be resolved (because the worker had been killed).
// Unfortunately the PQueue class itself does not offer any proper way to
// cancel "running events", so we have to let the GC do the dirty job for us.
let executionQueue = null;

/**
 * Notify the worker that a result is ready in the shared buffer.
 * There are rare cases in which we might attempt to notify the worker
 * before it is waiting on the sync buffer. In that case, we retry
 * until the worker is successfully notified.
 * Log an error message every million unsuccessful attempts.
 */
function notifyWorkerUsingSyncBuffer() {
  let notified = false;
  let tries = 0;
  while (!notified) {
    const awoken = Atomics.notify(syncBuffer!, 0);
    if (awoken > 0) {
      notified = true;
    } else {
      tries++;
      if (tries % 1_000_000 === 0) {
        // eslint-disable-next-line no-console
        console.error(`${tries} unsuccessful attempts to notify worker`);
      }
    }
  }
}

function notifyWorkerResultReady(
  uuid: string,
  length: number,
  result: ClientResultValue,
) {
  const curr = pendingResults.get(uuid);
  if (curr === undefined) {
    // This guard is necessary due to potential concurrency issues
    return;
  }
  if (curr.status !== ResultStatus.Computing) {
    throw Error(
      `Trying to deliver notification of work completion multiple times for ${uuid}`,
    );
  }

  pendingResults.set(uuid, { status: ResultStatus.Ready, value: result });
  resultLengthBuffer![0] = length;
  notifyWorkerUsingSyncBuffer();
}

function notifyWorkerResultFailure(uuid: string) {
  const curr = pendingResults.get(uuid);
  if (curr == undefined) {
    // This guard is necessary due to potential concurrency issues
    return;
  }
  if (curr.status !== ResultStatus.Computing) {
    throw Error(
      `Trying to deliver notification of failure multiple times for ${uuid}`,
    );
  }

  pendingResults.set(uuid, { status: ResultStatus.Failure });
  resultLengthBuffer![0] = -1;
  notifyWorkerUsingSyncBuffer();
}

function captureErrorWithSentry(error: unknown, tags: Record<string, unknown>) {
  // Use captureMessage instead of captureException,
  // because Sentry cannot deal with some custom Pyodide errors.
  Sentry.captureMessage('Client-Side Execution Failure', {
    tags: {
      pyodide: true,
      ...tags,
    },
    extra: {
      error,
    },
  });
}

function sendExecutionRequestToWorkerAndWaitForResponse(
  files: RunPythonFile[],
  updateExecutionResult: (idx: number, response: ExecutionResponse) => void,
  onActiveCellChange: (before: number | null, after: number) => void = () => {},
): Promise<ExecutionResponse> {
  return new Promise<ExecutionResponse>((resolve) => {
    const resultListener = (event: MessageEvent<WorkerMessage>) => {
      if (
        event.data?.type === Message.PARTIAL_RESULT &&
        activeCodeCell !== null
      ) {
        updateExecutionResult(activeCodeCell, event.data.result);
      }
      if (event.data?.type === Message.RESULT) {
        const result = event.data.result;
        if (result.type === 'failure') {
          captureErrorWithSentry(event.data.pythonError, {
            pyodide_fatal_error: true,
          });
        }
        pyodideWorker?.removeEventListener('message', resultListener);
        resolve(result);
      }
      if (event.data?.type === Message.SET_ACTIVE_CELL) {
        const oldIdx = activeCodeCell;
        const newIdx = event.data.idx;
        activeCodeCell = newIdx;
        onActiveCellChange(oldIdx, newIdx);
      }
    };
    pyodideWorker?.addEventListener('message', resultListener);
    pyodideWorker?.postMessage({
      type: Message.RUN,
      files,
    });
  });
}

function deliverPendingResult(
  uuid: string,
  data: ExecutionResultRequestMessage,
) {
  const { type } = data;
  const result = pendingResults.get(uuid);
  if (!result || result?.status !== ResultStatus.Ready) {
    // This guard is necessary due to potential concurrency issues
    return;
  }
  const toDeliver = result.value;
  switch (type) {
    case Message.DRAW:
    case Message.INPUT:
      {
        const src = toDeliver as Uint8Array;
        const resultBuffer = new Uint8Array(data.resultBuffer);
        resultBuffer.set(src);
      }
      break;
    case Message.SIZE:
      {
        const src = toDeliver as Sized;
        const resultBuffer = new Float32Array(data.resultBuffer);
        resultBuffer[0] = src.width;
        resultBuffer[1] = src.height;
      }
      break;
  }
  pendingResults.delete(uuid);
  notifyWorkerUsingSyncBuffer();
}

function invokeProcedure(uuid: string, data: ExecutionRequestMessage) {
  pendingResults.set(uuid, { status: ResultStatus.Computing });
  switch (data.type) {
    case Message.DRAW:
      {
        const { specs, scaling_factor, debug } = data;
        ffiImpl!
          .draw(specs, scaling_factor, debug)
          .then((result: string) => {
            const encoded = new Uint8Array(Buffer.from(result));
            notifyWorkerResultReady(uuid, encoded.byteLength, encoded);
          })
          .catch((err) => {
            captureErrorWithSentry(err, {
              pyodide_function: 'draw',
            });
            notifyWorkerResultFailure(uuid);
          });
      }
      break;
    case Message.SIZE:
      {
        const { specs } = data;
        try {
          const result = ffiImpl!.sizeWhenRendered(specs);
          notifyWorkerResultReady(
            uuid,
            Int32Array.BYTES_PER_ELEMENT * 2,
            result,
          );
        } catch (err) {
          captureErrorWithSentry(err, {
            pyodide_function: 'size',
          });
          notifyWorkerResultFailure(uuid);
        }
      }
      break;
    case Message.INPUT:
      {
        const outputArea = getActiveOutputAreaRef();
        outputArea?.activateInputField();
        outputArea
          ?.getInput()
          .then((value: string) => {
            const encoded = new Uint8Array(Buffer.from(value));
            notifyWorkerResultReady(uuid, encoded.byteLength, encoded);
          })
          .catch((err) => {
            captureErrorWithSentry(err, {
              pyodide_function: 'input',
            });
            notifyWorkerResultFailure(uuid);
          });
      }
      break;
  }
}

function initPyodide(ffi: PyTamaroFFI): Promise<void> {
  if (typeof window === 'undefined') {
    // Only in the browser
    return new Promise((resolve) => resolve());
  }

  ffiImpl = ffi;
  sharedSyncBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
  syncBuffer = new Int32Array(sharedSyncBuffer);
  sharedResultLengthBuffer = new SharedArrayBuffer(
    Int32Array.BYTES_PER_ELEMENT,
  );
  resultLengthBuffer = new Int32Array(sharedResultLengthBuffer);
  interruptBuffer = new Uint8Array(
    new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT),
  );
  executionQueue = new PQueue({ concurrency: 1 });

  const worker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), {
    type: 'module',
    name: 'Pyodide Worker',
  });
  pyodideWorker = worker;
  worker.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
    const { data } = event;
    // In this listener, we only process execution requests (messages with an uuid).
    // Messages with the execution result are received by a specific listener in
    // sendExecutionRequestToWorkerAndWaitForResponse.
    if (!('uuid' in data)) {
      return;
    }
    const { uuid } = data;
    if (pendingResults.has(uuid)) {
      // If we have already received the execution request message,
      // this should be a message with the request for the result.
      deliverPendingResult(uuid, data as ExecutionResultRequestMessage);
    } else {
      // Otherwise, this should be the execution request message.
      invokeProcedure(uuid, data as ExecutionRequestMessage);
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return new Promise((resolve, _reject) => {
    const listener = (event: MessageEvent<WorkerMessage>) => {
      const { data } = event;
      if (data.type === Message.READY) {
        // Worker is ready!
        worker.removeEventListener('message', listener);
        resolve();
      }
    };
    worker.addEventListener('message', listener);
    worker.postMessage({
      type: Message.INIT,
      syncBuffer: sharedSyncBuffer,
      resultLengthBuffer: sharedResultLengthBuffer,
      interruptBuffer: interruptBuffer,
    });
  });
}

export async function execute(
  sources: string[],
  idx: number,
  toolboxFunctions: ToolboxFunction[],
  extraPythonFiles: PythonFile[],
  updateExecutionResult: (
    idx: number,
    response: ExecutionResponse,
  ) => void = () => {},
  onActiveCellChange: (before: number | null, after: number) => void = () => {},
  getOutputRef: (idx: number) => OutputAreaRef | null = () => null,
): Promise<ExecutionResponse> {
  const files = cellsToFiles(sources, idx, toolboxFunctions, extraPythonFiles);
  return (await executionQueue!.add(() => {
    // Reset active code cell in between runs
    activeCodeCell = null;
    // Set function to obtain output area ref for stdin
    getOutputAreaRef = getOutputRef;
    // Execute the code
    return sendExecutionRequestToWorkerAndWaitForResponse(
      files,
      updateExecutionResult,
      onActiveCellChange,
    );
  })) as ExecutionResponse;
}

export function restartWorker(): Promise<void> {
  return new Promise((resolve) => {
    getActiveOutputAreaRef()?.deactivatePossibleInputField();
    pendingResults.clear();
    pyodideWorker?.terminate();
    initPyodide(ffiImpl!).then(resolve);
  });
}

export function interruptExecution() {
  interruptBuffer![0] = 2; // 2 for SIGINT
  getActiveOutputAreaRef()?.deactivatePossibleInputField();
}

interface PyodideWorkerClientInterface {
  isReady: boolean;
  execute: (
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: PythonFile[],
    updateExecutionResult?: (idx: number, response: ExecutionResponse) => void,
    onActiveCellChange?: (before: number | null, after: number) => void,
    getOutputRef?: (idx: number) => OutputAreaRef | null,
  ) => Promise<ExecutionResponse>;
  interruptExecution: () => void;
  restart: () => Promise<void>;
}

export const PyodideWorkerClientContext =
  createContext<PyodideWorkerClientInterface>({
    isReady: false,
    execute,
    interruptExecution,
    restart: restartWorker,
  });

export function PyodideWorkerClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { metadata } = useLocalProfile();
  const [isReady, setReady] = useState(false);

  const restart = async () => {
    setReady(false);
    await restartWorker();
    setReady(true);
  };

  // TMP for transition period: mark immediately as ready if using SSE
  useEffect(() => {
    setReady(metadata.executionMode === 'sse' || isReady);
  }, [metadata, isReady]);

  useEffect(() => {
    if (typeof SharedArrayBuffer !== 'undefined') {
      initFfi()
        .then(initPyodide)
        .then(() => setReady(true));
    }
  }, []);

  return (
    <PyodideWorkerClientContext
      value={{
        isReady,
        execute,
        interruptExecution,
        restart,
      }}
    >
      {children}
    </PyodideWorkerClientContext>
  );
}
