import PQueue from 'p-queue';
import { ExecutionResponse, cellsToFiles } from '../codeExecution';
import { ToolboxFunction } from '../localStorage/schema';
import { PythonFile } from '../schemas/activitySchema';
import { Sized } from './spec';
import { PyTamaroFFI } from './ffi';

type ClientResult =
  | Uint8Array // render_graphic
  | Sized; // rendered_size

let pyodideWorker: Worker | null = null;
let ffiImpl: PyTamaroFFI | null = null;

const pendingResults = new Map<string, ClientResult>();

const sharedCtlBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
const ctlBuffer = new Int32Array(sharedCtlBuffer);
const sharedSizeBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
const sizeBuffer = new Int32Array(sharedSizeBuffer);

const executionQueue = new PQueue({ concurrency: 1 });

function sendExecutionRequestToWorkerAndWaitForResponse(python_source: string) {
  return new Promise<ExecutionResponse>((resolve) => {
    const listener = (event: MessageEvent) => {
      if (event.data?.type === 'result') {
        pyodideWorker?.removeEventListener('message', listener);
        resolve(event.data.result);
      }
    };
    pyodideWorker?.addEventListener('message', listener);
    pyodideWorker?.postMessage({
      type: 'run',
      source: python_source,
    });
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deliverPendingResult(uuid: string, data: any) {
  const { type } = data;
  const toDeliver = pendingResults.get(uuid);
  switch (type) {
    case 'draw':
    case 'input':
      {
        const src = toDeliver as Uint8Array;
        const resultBuffer = new Uint8Array(data.resultBuffer);
        const n = src.byteLength / Uint8Array.BYTES_PER_ELEMENT;
        let i = 0;
        while (i < n) {
          Atomics.store(resultBuffer, i, Atomics.load(src, i));
          i += 1;
        }
      }
      break;
    case 'size': {
      const src = toDeliver as Sized;
      const resultBuffer = new Int32Array(data.resultBuffer);
      Atomics.store(resultBuffer, 0, src.width);
      Atomics.store(resultBuffer, 1, src.height);
    }
  }
  pendingResults.delete(uuid);
  Atomics.notify(ctlBuffer, 0);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function invokeProcedure(uuid: string, data: any) {
  switch (data.type) {
    case 'draw':
      {
        const { graphic, debug } = data;
        ffiImpl!.draw(graphic, debug).then((result: string) => {
          const encoded = new Uint8Array(Buffer.from(result));
          pendingResults.set(uuid, encoded);
          Atomics.store(sizeBuffer, 0, encoded.byteLength);
          Atomics.notify(ctlBuffer, 0);
        });
      }
      break;
    case 'size':
      {
        const { graphic } = data;
        const result = ffiImpl!.renderedSize(graphic);
        pendingResults.set(uuid, result);
        Atomics.store(sizeBuffer, 0, Int32Array.BYTES_PER_ELEMENT * 2);
        Atomics.notify(ctlBuffer, 0);
      }
      break;
    case 'input':
      {
        const { message } = data;
        const result = prompt(message) || '';
        const encoded = new Uint8Array(Buffer.from(result));
        pendingResults.set(uuid, encoded);
        Atomics.store(sizeBuffer, 0, encoded.byteLength);
        Atomics.notify(ctlBuffer, 0);
      }
      break;
  }
}

export function initPyodide(ffi: PyTamaroFFI) {
  if (typeof Worker === 'undefined') {
    // Only in the browser
    return;
  }
  ffiImpl = ffi;
  pyodideWorker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), {
    type: 'module',
    name: 'Pyodide Worker',
  });

  pyodideWorker.addEventListener('message', (event: MessageEvent) => {
    const { data } = event;
    if (!data) {
      return;
    }

    const { uuid } = data;
    if (pendingResults.has(uuid)) {
      deliverPendingResult(uuid, data);
    } else {
      invokeProcedure(uuid, data);
    }
  });

  pyodideWorker.postMessage({
    type: 'init',
    ctlBuffer: sharedCtlBuffer,
    sizeBuffer: sharedSizeBuffer,
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
  const source = files.find((f) => f.name === 'cell.py')?.content || '';
  return (await executionQueue.add(() =>
    sendExecutionRequestToWorkerAndWaitForResponse(source),
  )) as ExecutionResponse;
}
