import { ExecutionResponse, cellsToFiles } from '../codeExecution';
import { ToolboxFunction } from '../localStorage/schema';
import { PythonFile } from '../schemas/activitySchema';

let pyodideWorker: Worker | null = null;

function sendExecutionRequestToWorkerAndWaitForResponse(python_source: string) {
  return new Promise<ExecutionResponse>((resolve) => {
    const listener = (event: MessageEvent) => {
      if (event.data?.type === 'ready') {
        // eslint-disable-next-line no-console
        console.log('Tamaro initialized');
      } else if (event.data?.type === 'result') {
        console.log('Received result from pyodide worker', event.data);
        pyodideWorker?.removeEventListener('message', listener);
        resolve(event.data.result);
      }
    };
    pyodideWorker?.addEventListener('message', listener);
    pyodideWorker?.postMessage({ type: 'run', source: python_source });
  });
}

export function initPyodide() {
  if (typeof Worker === 'undefined') {
    // Only in the browser
    return;
  }
  pyodideWorker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), {
    type: 'module',
  });
  pyodideWorker.postMessage({ type: 'init' });
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
  console.log('Executing with Pyodide', { source });
  return sendExecutionRequestToWorkerAndWaitForResponse(source);
}
