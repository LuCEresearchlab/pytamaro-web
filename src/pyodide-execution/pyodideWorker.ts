import { PyodideAPI } from 'pyodide';
import { PyProxy, PythonError } from 'pyodide/ffi';
import {
  INPUT_BEGIN,
  INPUT_END,
} from '../../components/input_output/InputArea';
import { joinLines } from '../sourceUtils';
import {
  DrawRequestData,
  InputRequestData,
  Message,
  ResultMessage,
  RunPythonFile,
  SizeRequestData,
  WorkerClientMessage,
} from './messagesTypes';
import { GraphicSpec, Sized } from './spec';

let syncBuffer: Int32Array;
let resultLengthBuffer: Int32Array;
let pyodide: PyodideAPI;

const decoder = new TextDecoder();
const remainingPyProxies: PyProxy[] = [];

function decodeSharedBuffer(sharedBuffer: SharedArrayBuffer): string {
  const len = sharedBuffer.byteLength;
  const sharedView = new Uint8Array(sharedBuffer);
  const tmpBuffer = new ArrayBuffer(len);
  const tmpView = new Uint8Array(tmpBuffer);
  tmpView.set(sharedView);
  return decoder.decode(tmpBuffer);
}

function executeOnMainThread(
  type: Message,
  data: DrawRequestData | SizeRequestData | InputRequestData,
): SharedArrayBuffer {
  const uuid = crypto.randomUUID();
  // Perform procedure on the main thread
  self.postMessage({
    ...data,
    type,
    uuid,
  });
  // Wait on syncBuffer but check every 50ms for interrupts
  let receivedResultLength = false;
  while (!receivedResultLength) {
    if (Atomics.wait(syncBuffer, 0, 0, 50) === 'ok') {
      receivedResultLength = true;
    }
    pyodide.checkInterrupt();
  }
  // Read length of result and create shared array buffer to transfer it
  const lenInBytes = resultLengthBuffer[0];
  const resultBuffer = new SharedArrayBuffer(lenInBytes);
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
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.0/full/pyodide.js');
  // @ts-expect-error pyodide is injected by the script above
  const pyodideReadyPromise = loadPyodide({
    checkAPIVersion: true,
  });
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

  const sendPartialResult = () => {
    self.postMessage({
      type: Message.PARTIAL_RESULT,
      result: { type: 'success', completed: false, stdout, stderr },
    });
  };

  pyodide.setStdin({
    stdin: () => {
      // Send partial result before blocking for input
      // (this signals that the output is up to date for the current execution,
      // even if there was no output before the input request)
      sendPartialResult();
      const input = ffiInput();
      // Add back to stdout (including the <enter>) so that the user can see what they typed
      stdout += INPUT_BEGIN + input + INPUT_END + '\n';
      sendPartialResult();
      return input;
    },
  });
  pyodide.setStdout({
    write: (buf) => {
      stdout += decoder.decode(buf);
      sendPartialResult();
      return buf.length;
    },
  });
  pyodide.setStderr({
    write: (buf) => {
      stderr += decoder.decode(buf);
      sendPartialResult();
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
  const modulesToClear = files
    .map((file) => file.name)
    .filter((name) => name.endsWith('.py'))
    .map((name) => name.replaceAll('/', '.').replace(/\.py$/, ''));

  const driverCode = files.filter((f) => f.name === 'driver.py')[0].content;

  const ns = pyodide.toPy({});
  try {
    await pyodide.runPython(
      joinLines([
        // Clear cached modules
        'import sys',
        ...modulesToClear.flatMap((module) => [
          `if '${module}' in sys.modules:`,
          `  del sys.modules['${module}']`,
        ]),
        // Set max recursion depth
        'sys.setrecursionlimit(2000)',
        // Set CWD to $basePath
        'import os',
        `os.chdir('${basePath}')`,
        // Run code
        driverCode,
      ]),
      { globals: ns },
    );
    return {
      type: Message.RESULT,
      result: {
        type: 'success',
        completed: true,
        stdout,
        stderr,
      },
    };
  } catch (err) {
    const pythonError = err as PythonError;

    // eslint-disable-next-line no-console
    console.error(pythonError);

    stderr += pythonError;
    return {
      type: Message.RESULT,
      result: {
        type: 'error',
        completed: true,
        stdout,
        stderr,
      },
    };
  } finally {
    ns.destroy();
  }
}

function ffiRenderGraphic(specs: GraphicSpec[], debug: boolean): string {
  const res = executeOnMainThread(Message.DRAW, { specs, debug });
  return decodeSharedBuffer(res);
}

function ffiSizeWhenRendered(specs: GraphicSpec[]): Sized {
  const res = executeOnMainThread(Message.SIZE, { specs });
  const resultArray = new Float32Array(res);
  return {
    width: resultArray[0],
    height: resultArray[1],
  };
}

function ffiInput(): string {
  const res = executeOnMainThread(Message.INPUT, {});
  return decodeSharedBuffer(res);
}

function installPytamaroFfi() {
  pyodide?.registerJsModule('pytamaro_js_ffi', {
    render_graphic: (specs: PyProxy, debug: boolean) =>
      ffiRenderGraphic(unProxy<GraphicSpec[]>(() => specs)(), debug),
    graphic_size: (specs: PyProxy) =>
      ffiSizeWhenRendered(unProxy<GraphicSpec[]>(() => specs)()),
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
      return result.toJs({ pyproxies });
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
          pyodide.setInterruptBuffer(data.interruptBuffer);

          syncBuffer = new Int32Array(data.syncBuffer);
          resultLengthBuffer = new Int32Array(data.resultLengthBuffer);

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
