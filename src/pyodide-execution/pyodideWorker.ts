import { TamaroJs } from './tamaro';

// @ts-expect-error importScripts is available in web workers
importScripts('https://cdn.jsdelivr.net/pyodide/v0.28.3/full/pyodide.js');
// @ts-expect-error pyodide is injected by the script above
const pyodideReadyPromise = loadPyodide();
let tamaroExecutor: TamaroJs | null = null;
addEventListener('message', async (event: MessageEvent) => {
  if (event.data?.type === 'init') {
    const pyodide = await pyodideReadyPromise;
    const offscreenCanvas = new OffscreenCanvas(1, 1);
    tamaroExecutor = await TamaroJs.init(pyodide, offscreenCanvas);
    self.postMessage({ type: 'ready' });
  } else {
    if (!tamaroExecutor) {
      throw new Error('Tamaro not initialized yet');
    }
    const { source } = event.data;
    self.postMessage(await tamaroExecutor.run(source));
  }
});
