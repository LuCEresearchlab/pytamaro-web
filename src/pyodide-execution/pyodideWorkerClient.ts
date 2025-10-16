import PQueue from 'p-queue';
import { ExecutionResponse, cellsToFiles } from '../codeExecution';
import { ToolboxFunction } from '../localStorage/schema';
import { PythonFile } from '../schemas/activitySchema';
import { PyTamaroFFI } from './ffi';
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
let sharedResultSizeBuffer: SharedArrayBuffer | null = null;
let resultSizeBuffer: Int32Array | null = null;

const pendingResults = new Map<string, ClientResult>();

const executionQueue = new PQueue({ concurrency: 1 });

function sendExecutionRequestToWorkerAndWaitForResponse(
  files: RunPythonFile[],
): Promise<ExecutionResponse> {
  return new Promise<ExecutionResponse>((resolve) => {
    const resultListener = (event: MessageEvent<WorkerMessage>) => {
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
        const n = src.byteLength / Uint8Array.BYTES_PER_ELEMENT;
        for (let i = 0; i < n; i++) {
          Atomics.store(resultBuffer, i, Atomics.load(src, i));
        }
      }
      break;
    case Message.SIZE: {
      const src = toDeliver as Sized;
      const resultBuffer = new Int32Array(data.resultBuffer);
      Atomics.store(resultBuffer, 0, src.width);
      Atomics.store(resultBuffer, 1, src.height);
    }
  }
  pendingResults.delete(uuid);
  Atomics.notify(syncBuffer!, 0);
}

function invokeProcedure(uuid: string, data: ExecutionRequestMessage) {
  switch (data.type) {
    case Message.DRAW:
      {
        const { graphic, debug } = data;
        ffiImpl!.draw(graphic, debug).then((result: string) => {
          const encoded = new Uint8Array(Buffer.from(result));
          pendingResults.set(uuid, encoded);
          Atomics.store(resultSizeBuffer!, 0, encoded.byteLength);
          Atomics.notify(syncBuffer!, 0);
        });
      }
      break;
    case Message.SIZE:
      {
        const { graphic } = data;
        const result = ffiImpl!.sizeWhenRendered(graphic);
        pendingResults.set(uuid, result);
        Atomics.store(resultSizeBuffer!, 0, Int32Array.BYTES_PER_ELEMENT * 2);
        Atomics.notify(syncBuffer!, 0);
      }
      break;
    case Message.INPUT:
      {
        const { message } = data;
        const result = prompt(message) || '';
        const encoded = new Uint8Array(Buffer.from(result));
        pendingResults.set(uuid, encoded);
        Atomics.store(resultSizeBuffer!, 0, encoded.byteLength);
        Atomics.notify(syncBuffer!, 0);
      }
      break;
  }
}

export function initPyodide(ffi: PyTamaroFFI, onReady: () => void) {
  if (typeof window === 'undefined') {
    // Only in the browser
    return;
  }
  ffiImpl = ffi;
  sharedSyncBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
  syncBuffer = new Int32Array(sharedSyncBuffer);
  sharedResultSizeBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
  resultSizeBuffer = new Int32Array(sharedResultSizeBuffer);

  pyodideWorker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), {
    type: 'module',
    name: 'Pyodide Worker',
  });

  pyodideWorker.addEventListener(
    'message',
    (event: MessageEvent<WorkerMessage>) => {
      const { data } = event;
      if (data.type === Message.READY) {
        // Worker is ready!
        onReady();
        return;
      }
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
    },
  );

  pyodideWorker.postMessage({
    type: Message.INIT,
    syncBuffer: sharedSyncBuffer,
    resultSizeBuffer: sharedResultSizeBuffer,
  });
}

export default async function executeWithPyodide(
  sources: string[],
  idx: number,
  toolboxFunctions: ToolboxFunction[],
  extraPythonFiles: PythonFile[],
): Promise<ExecutionResponse> {
  const files = await cellsToFiles(
    sources,
    idx,
    toolboxFunctions,
    extraPythonFiles,
  );
  return (await executionQueue.add(() =>
    sendExecutionRequestToWorkerAndWaitForResponse(files),
  )) as ExecutionResponse;
}
