import PQueue from 'p-queue';
import {
  createContext,
  ReactNode,
  RefObject,
  useEffect,
  useState,
} from 'react';
import { OutputAreaRef } from '../../components/input_output/OutputArea';
import { cellsToFiles, ExecutionResponse } from '../codeExecution';
import { ToolboxFunction } from '../localStorage/schema';
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

type ClientResult =
  | Uint8Array // array for rendering result
  | Sized; // object for size result

let pyodideWorker: Worker | null = null;
let ffiImpl: PyTamaroFFI | null = null;

let sharedSyncBuffer: SharedArrayBuffer | null = null;
let syncBuffer: Int32Array | null = null;
let sharedResultLengthBuffer: SharedArrayBuffer | null = null;
let resultLengthBuffer: Int32Array | null = null;
let interruptBuffer: Uint8Array | null = null;

let outputAreaGlobalRef: RefObject<OutputAreaRef | null>;

const pendingResults = new Map<string, ClientResult>();

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

function sendExecutionRequestToWorkerAndWaitForResponse(
  files: RunPythonFile[],
  updateExecutionResult: (response: ExecutionResponse) => void,
): Promise<ExecutionResponse> {
  return new Promise<ExecutionResponse>((resolve) => {
    const resultListener = (event: MessageEvent<WorkerMessage>) => {
      if (event.data?.type === Message.PARTIAL_RESULT) {
        updateExecutionResult(event.data.result);
      }
      if (event.data?.type === Message.RESULT) {
        pyodideWorker?.removeEventListener('message', resultListener);
        resolve(event.data.result);
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
  const toDeliver = pendingResults.get(uuid);
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
  switch (data.type) {
    case Message.DRAW:
      {
        const { graphic, debug } = data;
        ffiImpl!.draw(graphic, debug).then((result: string) => {
          const encoded = new Uint8Array(Buffer.from(result));
          pendingResults.set(uuid, encoded);
          resultLengthBuffer![0] = encoded.byteLength;
          notifyWorkerUsingSyncBuffer();
        });
      }
      break;
    case Message.SIZE:
      {
        const { graphic } = data;
        const result = ffiImpl!.sizeWhenRendered(graphic);
        pendingResults.set(uuid, result);
        resultLengthBuffer![0] = Int32Array.BYTES_PER_ELEMENT * 2;
        notifyWorkerUsingSyncBuffer();
      }
      break;
    case Message.INPUT:
      {
        outputAreaGlobalRef.current?.activateInputField();
        outputAreaGlobalRef.current?.getInput().then((value: string) => {
          const encoded = new Uint8Array(Buffer.from(value));
          pendingResults.set(uuid, encoded);
          resultLengthBuffer![0] = encoded.byteLength;
          notifyWorkerUsingSyncBuffer();
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
      // this should be an message with the request for the result.
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
  updateExecutionResult: (response: ExecutionResponse) => void = () => {},
  outputAreaRef: RefObject<OutputAreaRef | null> | undefined = undefined,
): Promise<ExecutionResponse> {
  const files = cellsToFiles(
    sources,
    idx,
    toolboxFunctions,
    extraPythonFiles,
  );
  return (await executionQueue!.add(() => {
    if (outputAreaRef) {
      outputAreaGlobalRef = outputAreaRef;
    }
    return sendExecutionRequestToWorkerAndWaitForResponse(
      files,
      updateExecutionResult,
    );
  })) as ExecutionResponse;
}

export function restart(): Promise<void> {
  return new Promise((resolve) => {
    outputAreaGlobalRef?.current?.deactivatePossibleInputField();
    pyodideWorker?.terminate();
    initPyodide(ffiImpl!).then(resolve);
  });
}

export function interruptExecution() {
  interruptBuffer![0] = 2; // 2 for SIGINT
  outputAreaGlobalRef.current?.deactivatePossibleInputField();
}

interface PyodideWorkerClientInterface {
  isReady: boolean;
  execute: (
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: PythonFile[],
    updateExecutionResult?: (response: ExecutionResponse) => void,
    outputAreaRef?: RefObject<OutputAreaRef | null>,
  ) => Promise<ExecutionResponse>;
  interruptExecution: () => void;
  restart: () => Promise<void>;
}

export const PyodideWorkerClientContext =
  createContext<PyodideWorkerClientInterface>({
    isReady: false,
    execute,
    interruptExecution,
    restart,
  });

export function PyodideWorkerClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isReady, setReady] = useState(false);

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
        restart: async () => {
          setReady(false);
          await restart();
          setReady(true);
        },
      }}
    >
      {children}
    </PyodideWorkerClientContext>
  );
}
