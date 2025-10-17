import { PyodideAPI } from 'pyodide';
import { PyProxy, PythonError } from 'pyodide/ffi';
import {
  DrawRequestData,
  Message,
  ResultMessage,
  RunPythonFile,
  SizeRequestData,
  WorkerClientMessage,
} from './messagesTypes';
import { GraphicSpec, Sized } from './spec';

let syncBuffer: Int32Array;
let resultSizeBuffer: Int32Array;
let pyodide: PyodideAPI;

const remainingPyProxies: PyProxy[] = [];

function decodeSharedBuffer(sharedBuffer: SharedArrayBuffer): string {
  const decoder = new TextDecoder();
  const len = sharedBuffer.byteLength;
  const sharedView = new Uint8Array(sharedBuffer);
  const tmpBuffer = new ArrayBuffer(len);
  const tmpView = new Uint8Array(tmpBuffer);
  tmpView.set(sharedView);
  return decoder.decode(tmpBuffer);
}

function executeOnMainThread(
  type: Message,
  data: DrawRequestData | SizeRequestData,
): SharedArrayBuffer {
  const uuid = crypto.randomUUID();
  // Perform procedure on the main thread
  self.postMessage({
    ...data,
    type,
    uuid,
  });
  Atomics.wait(syncBuffer, 0, 0);
  // Read size of result and create shared array buffer to transfer it
  const sizeInBytes = Atomics.load(resultSizeBuffer, 0);
  const resultBuffer = new SharedArrayBuffer(sizeInBytes);
  self.postMessage({
    type,
    uuid,
    resultBuffer,
  });
  Atomics.wait(syncBuffer, 0, 0);
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

async function run(files: RunPythonFile[]): Promise<ResultMessage> {
  destroyLeftoverProxies();

  if (!pyodide) {
    throw new Error('Pyodide not loaded');
  }

  // Setup outputs
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

  // Setup FileSystem
  const fs = pyodide.FS;
  const basePath = '/tmp/run';
  fs.mkdirTree(basePath);
  files.forEach((file) => {
    fs.writeFile(`${basePath}/${file.name}`, file.content);
  });

  const driverCode = files.filter((f) => f.name === 'driver.py')[0].content;

  const ns = pyodide.toPy({});
  try {
    await pyodide.runPython(
      // Set working directory and then run the driver
      `import os\nos.chdir('${basePath}')\n${driverCode}`,
      { globals: ns },
    );
    return {
      type: Message.RESULT,
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
      type: Message.RESULT,
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
  const res = executeOnMainThread(Message.DRAW, { graphic, debug });
  return decodeSharedBuffer(res);
}

function ffiSizeWhenRendered(graphic: GraphicSpec): Sized {
  const res = executeOnMainThread(Message.SIZE, { graphic });
  const resultArray = new Int32Array(res);
  return {
    width: resultArray[0],
    height: resultArray[1],
  };
}

function installPytamaroFfi() {
  pyodide?.registerJsModule('pytamaro_js_ffi', {
    render_graphic: (graphic: PyProxy, debug: boolean) =>
      ffiRenderGraphic(unProxy<GraphicSpec>(() => graphic)(), debug),
    graphic_size: (graphic: PyProxy) =>
      ffiSizeWhenRendered(unProxy<GraphicSpec>(() => graphic)()),
  });
}

/**
 * Unwrap the result of a given function from pyodide FFI proxy to a plain
 * JS object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unProxy<T>(fn: (...args: any) => PyProxy): (...args: any) => T {
  const pyproxies = remainingPyProxies;
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
  while (remainingPyProxies.length > 0) {
    remainingPyProxies.pop()?.destroy();
  }
}

function assetUrl(path: string): string {
  return `${location.origin}/pyodide/${path}`;
}

// The worker listens for messages from the main thread
addEventListener(
  'message',
  async (event: MessageEvent<WorkerClientMessage>) => {
    const { data } = event;
    if (!data) {
      return;
    }

    switch (data.type) {
      case Message.INIT:
        {
          // Initialize Pyodide with PyTamaro and CanvasKit
          await loadPyodideWithPytamaro();
          installPytamaroFfi();

          syncBuffer = new Int32Array(data.syncBuffer);
          resultSizeBuffer = new Int32Array(data.resultSizeBuffer);

          self.postMessage({ type: Message.READY });
        }
        break;
      case Message.RUN:
        {
          // Run the provided Python code
          self.postMessage(await run(data.files));
        }
        break;
    }
  },
);
