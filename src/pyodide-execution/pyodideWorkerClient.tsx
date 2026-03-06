import * as Sentry from '@sentry/nextjs';
import PQueue from 'p-queue';
import { createContext, ReactNode, useEffect, useRef, useState } from 'react';
import { OutputAreaRef } from '../../components/input_output/OutputArea';
import { cellsToFiles, ExecutionResponse } from '../codeExecution';
import { Metadata, ToolboxFunction } from '../localStorage/schema';
import useLocalProfile from '../localStorage/useLocalProfile';
import { PythonFile } from '../schemas/activitySchema';
import { EventName, storeDbEvent } from '../storeDbEvent';
import initFfi, { PyTamaroFFI } from './ffi';
import {
  ExecutionMetadata,
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

interface ExecutionInProgressInfo {
  executionUUID: string;
  activeCellIdx: number | null;
}

interface IExecutor {
  isReady: boolean;
  activeExecutionInfo: ExecutionInProgressInfo | null;
  execute: (
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: PythonFile[],
    executionMetadata: ExecutionMetadata,
    updateExecutionResult?: (idx: number, response: ExecutionResponse) => void,
    onActiveCellChange?: (before: number | null, after: number) => void,
    getOutputRef?: (idx: number) => OutputAreaRef | null,
  ) => Promise<ExecutionResponse>;
  interruptExecution: () => void;
  restart: (metadata: Metadata) => Promise<void>;
}

class PyodideWorkerClient {
  private readonly pyodideWorker: Worker;
  private readonly ffiImpl: PyTamaroFFI;
  private readonly syncBuffer: Int32Array;
  private readonly sharedResultLengthBuffer: SharedArrayBuffer;
  private readonly resultLengthBuffer: Int32Array;
  private readonly interruptBuffer: Uint8Array;

  private readonly activeExecutionInfoChangeListener: (
    info: ExecutionInProgressInfo | null,
  ) => void;

  private readonly pendingResults = new Map<string, ClientResult>();

  private activeCodeCell: number | null = null;
  private getOutputAreaRef: (idx: number) => OutputAreaRef | null = () => null;
  private getActiveOutputAreaRef = () =>
    this.activeCodeCell == null
      ? null
      : this.getOutputAreaRef(this.activeCodeCell);

  // Initialization deferred to the constructor so that when we restart the worker
  // we can "forcibly clear" the queue without waiting for promises that will
  // never be resolved (because the worker had been killed).
  // Unfortunately the PQueue class itself does not offer any proper way to
  // cancel "running events", so we have to let the GC do the dirty job for us.
  private executionQueue: PQueue;

  static init(
    ffi: PyTamaroFFI,
    activeExecutionInfoChangeListener: (
      info: ExecutionInProgressInfo | null,
    ) => void,
  ): Promise<PyodideWorkerClient> {
    const worker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), {
      type: 'module',
      name: 'Pyodide Worker',
    });
    return new Promise((resolve) => {
      const listener = (event: MessageEvent<WorkerMessage>) => {
        const { data } = event;
        if (data.type === Message.READY) {
          // Worker is ready!
          worker.removeEventListener('message', listener);
          resolve(
            new PyodideWorkerClient(
              ffi,
              worker,
              sharedSyncBuffer,
              sharedResultLengthBuffer,
              interruptBuffer,
              activeExecutionInfoChangeListener,
            ),
          );
        }
      };

      const sharedSyncBuffer = new SharedArrayBuffer(
        Int32Array.BYTES_PER_ELEMENT,
      );
      const sharedResultLengthBuffer = new SharedArrayBuffer(
        Int32Array.BYTES_PER_ELEMENT,
      );
      const interruptBuffer = new Uint8Array(
        new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT),
      );
      worker.addEventListener('message', listener);
      worker.postMessage({
        type: Message.INIT,
        syncBuffer: sharedSyncBuffer,
        resultLengthBuffer: sharedResultLengthBuffer,
        interruptBuffer: interruptBuffer,
      });
    });
  }

  constructor(
    ffi: PyTamaroFFI,
    worker: Worker,
    sharedSyncBuffer: SharedArrayBuffer,
    sharedResultLengthBuffer: SharedArrayBuffer,
    interruptBuffer: Uint8Array,
    activeExecutionInfoChangeListener: (
      info: ExecutionInProgressInfo | null,
    ) => void,
  ) {
    this.ffiImpl = ffi;
    this.sharedResultLengthBuffer = sharedResultLengthBuffer;
    this.interruptBuffer = interruptBuffer;
    this.resultLengthBuffer = new Int32Array(this.sharedResultLengthBuffer);
    this.executionQueue = new PQueue({ concurrency: 1 });
    this.syncBuffer = new Int32Array(sharedSyncBuffer);

    this.activeExecutionInfoChangeListener = activeExecutionInfoChangeListener;

    this.pyodideWorker = worker;
    worker.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
      const { data } = event;
      // In this listener, we only process execution requests (messages with an uuid).
      // Messages with the execution result are received by a specific listener in
      // sendExecutionRequestToWorkerAndWaitForResponse.
      if (!('uuid' in data)) {
        return;
      }
      const { uuid } = data;
      if (this.pendingResults.has(uuid)) {
        // If we have already received the executuion request message,
        // this should be a message with the request for the result.
        this.deliverPendingResult(uuid, data as ExecutionResultRequestMessage);
      } else {
        // Otherwise, this should be the execution request message.
        this.invokeProcedure(uuid, data as ExecutionRequestMessage);
      }
    });
  }

  private updateActiveExecutionInfo(
    activeExecutionInfo: ExecutionInProgressInfo | null,
  ) {
    this.activeCodeCell = activeExecutionInfo?.activeCellIdx ?? null;
    this.activeExecutionInfoChangeListener(activeExecutionInfo);
  }

  /**
   * Notify the worker that a result is ready in the shared buffer.
   * There are rare cases in which we might attempt to notify the worker
   * before it is waiting on the sync buffer. In that case, we retry
   * until the worker is successfully notified.
   * Log an error message every million unsuccessful attempts.
   */
  notifyWorkerUsingSyncBuffer() {
    let notified = false;
    let tries = 0;
    while (!notified) {
      const awoken = Atomics.notify(this.syncBuffer, 0);
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
  notifyWorkerResultReady(
    uuid: string,
    length: number,
    result: ClientResultValue,
  ) {
    const curr = this.pendingResults.get(uuid);
    if (curr === undefined) {
      // This guard is necessary due to potential concurrency issues
      return;
    }
    if (curr.status !== ResultStatus.Computing) {
      throw Error(
        `Trying to deliver notification of work completion multiple times for ${uuid}`,
      );
    }

    this.pendingResults.set(uuid, {
      status: ResultStatus.Ready,
      value: result,
    });
    this.resultLengthBuffer[0] = length;
    this.notifyWorkerUsingSyncBuffer();
  }
  notifyWorkerResultFailure(uuid: string) {
    const curr = this.pendingResults.get(uuid);
    if (curr == undefined) {
      // This guard is necessary due to potential concurrency issues
      return;
    }
    if (curr.status !== ResultStatus.Computing) {
      throw Error(
        `Trying to deliver notification of failure multiple times for ${uuid}`,
      );
    }

    this.pendingResults.set(uuid, { status: ResultStatus.Failure });
    this.resultLengthBuffer[0] = -1;
    this.notifyWorkerUsingSyncBuffer();
  }
  sendExecutionRequestToWorkerAndWaitForResponse(
    executionMetadata: ExecutionMetadata,
    files: RunPythonFile[],
    updateExecutionResult: (idx: number, response: ExecutionResponse) => void,
    onActiveCellChange: (
      before: number | null,
      after: number,
    ) => void = () => {},
  ): Promise<ExecutionResponse> {
    return new Promise<ExecutionResponse>((resolve) => {
      const resultListener = (event: MessageEvent<WorkerMessage>) => {
        if (
          event.data?.type === Message.PARTIAL_RESULT &&
          this.activeCodeCell !== null
        ) {
          updateExecutionResult(this.activeCodeCell, event.data.result);
        }
        if (event.data?.type === Message.RESULT) {
          const result = event.data.result;
          if (result.type === 'failure') {
            captureErrorWithSentry(event.data.pythonError, {
              pyodide_fatal_error: true,
            });
          }
          this.pyodideWorker.removeEventListener('message', resultListener);
          resolve(result);
        }
        if (event.data?.type === Message.SET_ACTIVE_CELL) {
          const oldIdx = this.activeCodeCell;
          const newIdx = event.data.idx;
          this.updateActiveExecutionInfo({
            executionUUID: executionMetadata.executionUUID,
            activeCellIdx: newIdx,
          });
          onActiveCellChange(oldIdx, newIdx);
        }
      };
      this.pyodideWorker.addEventListener('message', resultListener);
      this.pyodideWorker.postMessage({
        type: Message.RUN,
        executionMetadata,
        files,
      });
    }).finally(() => {
      this.updateActiveExecutionInfo(null);
    });
  }
  deliverPendingResult(uuid: string, data: ExecutionResultRequestMessage) {
    const { type } = data;
    const result = this.pendingResults.get(uuid);
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
    this.pendingResults.delete(uuid);
    this.notifyWorkerUsingSyncBuffer();
  }

  drawProcedure(
    uuid: string,
    data: ExecutionRequestMessage & { type: Message.DRAW },
  ) {
    const { specs, scalingFactor, debug } = data;
    this.ffiImpl
      .draw(specs, scalingFactor, debug)
      .then((result: string) => {
        const encoded = new Uint8Array(Buffer.from(result));
        this.notifyWorkerResultReady(uuid, encoded.byteLength, encoded);
      })
      .catch((err) => {
        captureErrorWithSentry(err, {
          pyodide_function: 'draw',
        });
        this.notifyWorkerResultFailure(uuid);
      });
  }

  saveProcedure(
    uuid: string,
    data: ExecutionRequestMessage & { type: Message.SAVE },
  ) {
    const { fileName, content } = data;
    fetch(content)
      .then((res) => res.blob())
      .then(URL.createObjectURL)
      .then((blobUrl) => {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        a.style.display = 'none';
        document.body.append(a);
        // Need to wrap into a setTimeout for Safari
        // Monaco has a global "click" listener that somehow utilizes the
        // navigator.clipboard API, which is known to be quirky in Safari.
        // The best known workaround seems to be wrapping the invocation of
        // whatever code calls navigator.clipboard into a setTimeout
        setTimeout(() => {
          a.click();
          this.notifyWorkerResultReady(uuid, 0, new Uint8Array(0));
        }, 0);
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
          a.remove();
        }, 1000);
      })
      .catch((err) => {
        captureErrorWithSentry(err, {
          pyodide_function: 'save',
        });
        this.notifyWorkerResultFailure(uuid);
      });
  }

  sizeProcedure(
    uuid: string,
    data: ExecutionRequestMessage & { type: Message.SIZE },
  ) {
    const { specs } = data;
    try {
      const result = this.ffiImpl.sizeWhenRendered(specs);
      this.notifyWorkerResultReady(
        uuid,
        Int32Array.BYTES_PER_ELEMENT * 2,
        result,
      );
    } catch (err) {
      captureErrorWithSentry(err, {
        pyodide_function: 'size',
      });
      this.notifyWorkerResultFailure(uuid);
    }
  }

  inputProcedure(
    uuid: string,
    data: ExecutionRequestMessage & { type: Message.INPUT },
  ) {
    const outputArea = this.getActiveOutputAreaRef();
    if (!outputArea) {
      return;
    }
    outputArea.activateInputField();
    outputArea
      .getInput()
      .then((value: string) => {
        storeDbEvent(EventName.CodeExecutionInput, data.executionMetadata, {
          executionUUID: data.executionMetadata.executionUUID,
          seq: data.seq,
          content: value,
        });
        const encoded = new Uint8Array(Buffer.from(value));
        this.notifyWorkerResultReady(uuid, encoded.byteLength, encoded);
      })
      .catch((err) => {
        captureErrorWithSentry(err, {
          pyodide_function: 'input',
        });
        this.notifyWorkerResultFailure(uuid);
      })
      .finally(() => {
        outputArea.deactivatePossibleInputField();
      });
  }

  invokeProcedure(uuid: string, data: ExecutionRequestMessage) {
    this.pendingResults.set(uuid, { status: ResultStatus.Computing });
    switch (data.type) {
      case Message.DRAW:
        this.drawProcedure(uuid, data);
        break;
      case Message.SAVE:
        this.saveProcedure(uuid, data);
        break;
      case Message.SIZE:
        this.sizeProcedure(uuid, data);
        break;
      case Message.INPUT:
        this.inputProcedure(uuid, data);
        break;
    }
  }

  interruptExecution() {
    this.interruptBuffer[0] = 2; // 2 for SIGINT
    this.getActiveOutputAreaRef()?.deactivatePossibleInputField();
    this.updateActiveExecutionInfo(null);
  }

  restartWorker(): Promise<PyodideWorkerClient> {
    this.interruptExecution();
    this.pendingResults.clear();
    this.pyodideWorker.terminate();
    return PyodideWorkerClient.init(
      this.ffiImpl,
      this.activeExecutionInfoChangeListener,
    );
  }

  async execute(
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: PythonFile[],
    executionMetadata: ExecutionMetadata,
    updateExecutionResult: (
      idx: number,
      response: ExecutionResponse,
    ) => void = () => {},
    onActiveCellChange: (
      before: number | null,
      after: number,
    ) => void = () => {},
    getOutputRef: (idx: number) => OutputAreaRef | null = () => null,
  ): Promise<ExecutionResponse> {
    const files = cellsToFiles(
      sources,
      idx,
      toolboxFunctions,
      extraPythonFiles,
    );
    return (await this.executionQueue.add(() => {
      // Update the info about the current active execution.
      // At the beginning, we don't have an active cell yet, but we want to set the executionUUID immediately anyway
      // so that clients (e.g., UI) can already know which executionUUID is currently active.
      // During execution, the active cell idx will be updated after receiving the special message from the worker.
      this.updateActiveExecutionInfo({
        executionUUID: executionMetadata.executionUUID,
        activeCellIdx: null,
      });
      // Set function to obtain output area ref for stdin
      this.getOutputAreaRef = getOutputRef;
      // Execute the code
      return this.sendExecutionRequestToWorkerAndWaitForResponse(
        executionMetadata,
        files,
        updateExecutionResult,
        onActiveCellChange,
      );
    })) as ExecutionResponse;
  }
}

export const ExecutorContext = createContext<IExecutor>({
  isReady: false,
  activeExecutionInfo: null,
  execute: async () =>
    new Promise((_, reject) =>
      reject(new Error('Pyodide Worker is not ready')),
    ),
  interruptExecution: () => {},
  restart: async () => {},
});

export function ExecutorProvider({ children }: { children: ReactNode }) {
  const { metadata } = useLocalProfile();
  const [isReady, setReady] = useState(false);
  const [activeExecutionInfo, setActiveExecutionInfo] =
    useState<ExecutionInProgressInfo | null>(null);
  const pyodideWorkerClientRef = useRef<PyodideWorkerClient | null>(null);

  const setPyodideWorkerClientRef = (client: PyodideWorkerClient) => {
    pyodideWorkerClientRef.current = client;
  };

  const restart = async () => {
    if (pyodideWorkerClientRef.current) {
      setReady(false);
      const newClient = await pyodideWorkerClientRef.current.restartWorker();
      setPyodideWorkerClientRef(newClient);
      setReady(true);
    }
  };

  const interruptExecution = () => {
    pyodideWorkerClientRef.current?.interruptExecution();
  };

  const execute = async (
    sources: string[],
    idx: number,
    toolboxFunctions: ToolboxFunction[],
    extraPythonFiles: PythonFile[],
    executionMetadata: ExecutionMetadata,
    updateExecutionResult?: (idx: number, response: ExecutionResponse) => void,
    onActiveCellChange?: (before: number | null, after: number) => void,
    getOutputRef?: (idx: number) => OutputAreaRef | null,
  ) => {
    if (!isReady || !pyodideWorkerClientRef.current) {
      throw new Error('Pyodide Worker is not ready');
    }
    return pyodideWorkerClientRef.current.execute(
      sources,
      idx,
      toolboxFunctions,
      extraPythonFiles,
      executionMetadata,
      updateExecutionResult,
      onActiveCellChange,
      getOutputRef,
    );
  };

  // TMP for transition period: mark immediately as ready if using SSE
  useEffect(() => {
    setReady(metadata.executionMode === 'sse' || isReady);
  }, [metadata, isReady]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof SharedArrayBuffer === 'undefined'
    ) {
      // Not in the browser,
      // or not in a browser that supports SharedArrayBuffer
      return;
    }
    initFfi()
      .then((ffi) => PyodideWorkerClient.init(ffi, setActiveExecutionInfo))
      .then((client) => {
        setPyodideWorkerClientRef(client);
        setReady(true);
      });
  }, []);

  return (
    <ExecutorContext
      value={{
        isReady,
        activeExecutionInfo,
        execute,
        interruptExecution,
        restart,
      }}
    >
      {children}
    </ExecutorContext>
  );
}
