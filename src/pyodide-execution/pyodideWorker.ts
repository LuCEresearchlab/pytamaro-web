import { PyodideAPI } from 'pyodide';
import { PyProxy, PythonError } from 'pyodide/ffi';
import { GraphicSpec, Sized } from './spec';

let ctlBuffer: Int32Array;
let sizeBuffer: Int32Array;
let pyodide: PyodideAPI;

const stillPyProxies: PyProxy[] = [];

function decodeSharedBuffer(sharedBuffer: SharedArrayBuffer): string {
  const decoder = new TextDecoder();
  const len = sharedBuffer.byteLength;
  const sharedView = new Uint8Array(sharedBuffer);
  const tmpBuffer = new ArrayBuffer(len);
  const tmpView = new Uint8Array(tmpBuffer);
  tmpView.set(sharedView);
  return decoder.decode(tmpBuffer);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mainThreadProcedure(type: string, data: any): SharedArrayBuffer {
  const uuid = crypto.randomUUID();
  // Perform procedure on the main thread
  self.postMessage({
    ...data,
    type,
    uuid,
  });
  Atomics.wait(ctlBuffer, 0, 0);
  // Read size of result and create shared array buffer to transfer it
  const sizeInBytes = Atomics.load(sizeBuffer, 0);
  const resultBuffer = new SharedArrayBuffer(sizeInBytes);
  self.postMessage({
    type,
    uuid,
    resultBuffer,
  });
  Atomics.wait(ctlBuffer, 0, 0);
  return resultBuffer;
}

async function loadPyodideWithPytamaro() {
  // @ts-expect-error importScripts is available in web workers
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.28.3/full/pyodide.js');
  // @ts-expect-error pyodide is injected by the script above
  const pyodideReadyPromise = loadPyodide();
  pyodide = await pyodideReadyPromise;
  if (!pyodide) {
    throw new Error('Failed to load Pyodide');
  }
  await pyodide.loadPackage('micropip');
  const microPip = pyodide.pyimport('micropip');
  await microPip.install(assetUrl('pytamaro-1.1.4-py3-none-any.whl'));
}

async function run(code: string) {
  destroyLeftoverProxies();

  if (!pyodide) {
    throw new Error('Pyodide not loaded');
  }

  const ns = pyodide.toPy({});
  let stdout = '';
  let stderr = '';
  const decoder = new TextDecoder('utf-8');
  pyodide.setStdout({
    write: (buf) => {
      stdout += decoder.decode(buf);
      return buf.length;
    },
  });
  pyodide.setStderr({
    write: (buf) => {
      stderr += decoder.decode(buf);
      return buf.length;
    },
  });
  try {
    await pyodide.runPython(code, { globals: ns });
    return {
      type: 'result',
      result: {
        type: 'success',
        stdout,
        stderr,
      },
    };
  } catch (err) {
    const pythonError = err as PythonError;
    stderr += pythonError;
    return {
      type: 'result',
      result: {
        type: 'error',
        stdout,
        stderr,
      },
    };
  } finally {
    ns.destroy();
  }
}

function ffiRenderGraphic(graphic: GraphicSpec, debug: boolean): string {
  const res = mainThreadProcedure('draw', { graphic, debug });
  return decodeSharedBuffer(res);
}

function ffiRenderedSize(graphic: GraphicSpec): Sized {
  const res = mainThreadProcedure('size', { graphic });
  const resultArray = new Int32Array(res);
  return {
    width: resultArray[0],
    height: resultArray[1],
  };
}

function installPytamaroFfi() {
  pyodide?.registerJsModule('pytamaro_ffi', {
    show_graphic: (graphic: PyProxy, debug: boolean) =>
      ffiRenderGraphic(unProxy<GraphicSpec>(() => graphic)(), debug),
    rendered_height: (graphic: PyProxy) =>
      ffiRenderedSize(unProxy<GraphicSpec>(() => graphic)()).height,
    rendered_width: (graphic: PyProxy) =>
      ffiRenderedSize(unProxy<GraphicSpec>(() => graphic)()).width,
  });
}

/**
 * Unwrap the result of a given function from pyodide FFI proxy to a plain
 * JS object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unProxy<T>(fn: (...args: any) => PyProxy): (...args: any) => T {
  const pyproxies = stillPyProxies;
  return function (...args) {
    const result = fn(...args);
    if (typeof result === 'object' && typeof result.toJs === 'function') {
      return result.toJs({
        pyproxies,
        dict_converter: Object.fromEntries,
      });
    } else {
      return result;
    }
  };
}

function destroyLeftoverProxies() {
  while (stillPyProxies.length > 0) {
    stillPyProxies.pop()?.destroy();
  }
}

function assetUrl(path: string): string {
  return `${location.origin}/pyodide/${path}`;
}

// The worker listens for messages from the main thread
addEventListener('message', async (event: MessageEvent) => {
  const { data } = event;
  if (!data) {
    return;
  }

  switch (data.type) {
    case 'init':
      {
        // Initialize Pyodide with PyTamaro and CanvasKit
        await loadPyodideWithPytamaro();
        installPytamaroFfi();

        ctlBuffer = new Int32Array(data.ctlBuffer);
        sizeBuffer = new Int32Array(data.sizeBuffer);

        self.postMessage({ type: 'ready' });
      }
      break;
    case 'run':
      {
        // Run the provided Python code
        const { source } = event.data;
        self.postMessage(await run(source));
      }
      break;
  }
});
