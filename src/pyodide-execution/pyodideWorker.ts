import { throttle } from 'lodash';
import { PyodideAPI } from 'pyodide';
import { PyProxy, PythonError } from 'pyodide/ffi';
import {
  INPUT_BEGIN,
  INPUT_END,
} from '../../components/input_output/IoMarkers';
import { joinLines } from '../sourceUtils';
import {
  DrawRequestData,
  ExecutionMetadata,
  InitMessage,
  InputRequestData,
  Message,
  ReadyMessage,
  ResultMessage,
  RunPythonFile,
  SizeRequestData,
  TransferablePythonError,
  WorkerClientMessage,
} from './messagesTypes';
import { GraphicSpec, Sized } from './spec';

let pyodide: PyodideAPI;

/* **** I/O **** */

let activeCellChangeListener: ((idx: number) => void) | null = null;

interface ReadOnlyExecutionOutput {
  getStdout(): string;
  getStderr(): string;
}

class ExecutionOutput implements ReadOnlyExecutionOutput {
  private stdout: string;
  private stderr: string;
  private readonly decoder: TextDecoder;

  constructor() {
    this.stdout = '';
    this.stderr = '';
    this.decoder = new TextDecoder('utf-8');
  }

  writeStdout(content: Uint8Array | string): number {
    this.stdout +=
      typeof content === 'string' ? content : this.decoder.decode(content);
    return content.length;
  }

  writeStderr(content: Uint8Array | string): number {
    this.stderr +=
      typeof content === 'string' ? content : this.decoder.decode(content);
    return content.length;
  }

  clear() {
    this.stdout = '';
    this.stderr = '';
  }

  getStdout(): string {
    return this.stdout;
  }

  getStderr(): string {
    return this.stderr;
  }
}

/**
 * @returns An instance of {@link ReadOnlyExecutionOutput} to be used to
 * get the output of the current active cell.
 */
function setupIO(
  pyodide: PyodideAPI,
  executionMetadata: ExecutionMetadata,
): ReadOnlyExecutionOutput {
  const out = new ExecutionOutput();

  const sendPartialResult = () => {
    self.postMessage({
      type: Message.PARTIAL_RESULT,
      executionMetadata,
      result: {
        type: 'success',
        completed: false,
        stdout: out.getStdout(),
        stderr: out.getStderr(),
      },
    });
  };
  // "Flush" the partial results for the currently active cell and then clear
  // out so we don't send previous outputs to the new cell
  activeCellChangeListener = () => {
    sendPartialResult();
    out.clear();
  };
  // Throttle the sending of partial results to avoid overloading react in the
  // frontend (e.g., when doing lots of `print('.')` in a sequence from python)
  const throttledSendPartialResult = throttle(sendPartialResult, 50);

  pyodide.setStdout({
    write: (buf) => {
      const written = out.writeStdout(buf);
      throttledSendPartialResult();
      return written;
    },
  });
  pyodide.setStderr({
    write: (buf) => {
      const written = out.writeStderr(buf);
      throttledSendPartialResult();
      return written;
    },
  });

  // Keep track of each occurrence of input so that in the events database we
  // can then reliably reconstruct the execution of a code cell, since network
  // requests may be received out of order by the db
  let inputSeqNumber = 0;
  pyodide.setStdin({
    stdin: () => {
      // Send partial result before blocking for input
      // (this signals that the output is up to date for the current execution,
      // even if there was no output before the input request)
      out.writeStdout('\u200B');
      sendPartialResult();
      const input = ffiInput(executionMetadata, inputSeqNumber);
      inputSeqNumber++;
      // Add back to stdout (including the <enter>) so that the user can see
      // what they typed
      out.writeStdout(INPUT_BEGIN + input + INPUT_END + '\n');
      sendPartialResult();
      return input;
    },
  });

  return out;
}

/* **** Memory Management **** */

const remainingPyProxies: PyProxy[] = [];

/**
 * Unwrap the result of a given function from pyodide FFI proxy to a plain
 * JS object.
 *
 * Since it is not clear when it's a good moment to get rid of those proxies
 * (freeing them too early may cause issues on the python side), we register
 * them into the remainingPyProxies array so that we may deallocate them once
 * the execution is over.
 */
function unProxy<T>(proxy: PyProxy): T {
  const pyproxies = remainingPyProxies;
  if (typeof proxy === 'object' && typeof proxy.toJs === 'function') {
    return proxy.toJs({ pyproxies });
  } else {
    return proxy as T;
  }
}

/**
 * Destroy all leftover proxies that we did not deallocate earlier.
 */
function destroyLeftoverProxies() {
  while (remainingPyProxies.length > 0) {
    // There does not seem to be a way for us to check whether a proxy has
    // already been deleted.
    // The pyodide API indicates that an error message will be logged in such
    // a situation.
    remainingPyProxies.pop()?.destroy();
  }
}

/* **** Client communication **** */

const decoder = new TextDecoder();
let syncBuffer: Int32Array;
let resultLengthBuffer: Int32Array;

function decodeSharedBuffer(sharedBuffer: SharedArrayBuffer): string {
  const len = sharedBuffer.byteLength;
  const sharedView = new Uint8Array(sharedBuffer);
  const tmpBuffer = new ArrayBuffer(len);
  const tmpView = new Uint8Array(tmpBuffer);
  tmpView.set(sharedView);
  return decoder.decode(tmpBuffer);
}

/**
 * Attempting to transfer a PythonError object in certain browsers (firefox)
 * makes the Worker.postMessage method fail (probably due to some component
 * of the original object referencing some wasm memory location).
 *
 * Create a transferable version of the original error with just the fields
 * that can be safely transferred.
 */
function getTransferableError(
  pythonError: PythonError,
): TransferablePythonError {
  return {
    // @ts-expect-error: Usage of field that is not part of the public API
    columnNumber: pythonError.columnNumber,
    // @ts-expect-error: Usage of field that is not part of the public API
    lineNumber: pythonError.lineNumber,
    // @ts-expect-error: Usage of field that is not part of the public API
    fileName: pythonError.fileName,
    message: pythonError.message,
    name: pythonError.name,
    // @ts-expect-error: Usage of field that is not part of the public API
    isFatal: pythonError.pyodide_fatal_error,
    stack: pythonError.stack,
  };
}

/* **** FFI **** */

function executeOnMainThread(
  type: Message,
  data: DrawRequestData | SizeRequestData | InputRequestData,
): SharedArrayBuffer | null {
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
  if (lenInBytes < 0) {
    // Execution failed on the client side
    return null;
  }
  const resultBuffer = new SharedArrayBuffer(lenInBytes);
  // Send the client the shared array buffer and wait for it to be filled in
  self.postMessage({
    type,
    uuid,
    resultBuffer,
  });
  Atomics.wait(syncBuffer, 0, 0);
  // Return the shared array buffer containing the result from the client
  return resultBuffer;
}

function ffiRenderGraphic(
  specs: GraphicSpec[],
  scaling_factor: number,
  debug: boolean,
): string | null {
  const res = executeOnMainThread(Message.DRAW, {
    specs,
    scaling_factor,
    debug,
  });
  if (res === null) {
    throw Error('Failed to render graphic');
  }
  return decodeSharedBuffer(res);
}

function ffiSizeWhenRendered(specs: GraphicSpec[]): Sized {
  const res = executeOnMainThread(Message.SIZE, { specs });
  if (res === null) {
    throw Error('Failed to compute graphic size');
  }
  const resultArray = new Float32Array(res);
  return {
    width: resultArray[0],
    height: resultArray[1],
  };
}

function ffiInput(executionMetadata: ExecutionMetadata, seq: number): string {
  const res = executeOnMainThread(Message.INPUT, {
    executionMetadata,
    seq,
  });
  if (res === null) {
    // Treat input failure as a normal python exception
    throw Error('Failed to obtain input string');
  }
  return decodeSharedBuffer(res);
}

function setActiveCell(idx: number): void {
  if (activeCellChangeListener) {
    activeCellChangeListener(idx);
  }
  self.postMessage({ type: Message.SET_ACTIVE_CELL, idx });
}

function installPytamaroFfi() {
  if (!pyodide) {
    return;
  }

  pyodide.registerJsModule('pytamaro_js_ffi', {
    render_graphic: (specs: PyProxy, scaling_factor: number, debug: boolean) =>
      ffiRenderGraphic(unProxy<GraphicSpec[]>(specs), scaling_factor, debug),
    graphic_size: (specs: PyProxy) =>
      ffiSizeWhenRendered(unProxy<GraphicSpec[]>(specs)),
    set_active_cell: setActiveCell,
  });
}

/* **** Init **** */

async function initPyodideAndDependencies() {
  // @ts-expect-error importScripts is available in web workers
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.2/full/pyodide.js');
  // @ts-expect-error loadPyodide is injected by the script above
  pyodide = await loadPyodide({
    checkAPIVersion: true,
  });
  if (!pyodide) {
    throw new Error('Failed to load Pyodide');
  }

  // Setup micropip
  await pyodide.loadPackage('micropip', {
    messageCallback: () => {},
  });
  const microPip = pyodide.pyimport('micropip');

  // Install python dependencies
  await microPip.install(
    `${location.origin}/pyodide/pytamaro-1.1.4-py3-none-any.whl`,
  );
}

async function initWorker(data: InitMessage): Promise<ReadyMessage> {
  // Initialize Pyodide with dependencies and the FFIs
  await initPyodideAndDependencies();
  installPytamaroFfi();

  // Setup main-thread execution infrastructure
  pyodide.setInterruptBuffer(data.interruptBuffer);
  syncBuffer = new Int32Array(data.syncBuffer);
  resultLengthBuffer = new Int32Array(data.resultLengthBuffer);

  return { type: Message.READY };
}

/* **** Code Execution **** */

/**
 * @returns The "entry point code" to run.
 */
function setupFS(pyodide: PyodideAPI, files: RunPythonFile[]): string {
  const fs = pyodide.FS;
  const basePath = '/run/py';

  fs.mkdirTree(basePath);

  let driverFile: RunPythonFile | null = null;
  for (const file of files) {
    if (file.name === 'driver.py') {
      driverFile = file;
    } else {
      fs.writeFile(`${basePath}/${file.name}`, file.content);
    }
  }

  if (driverFile == null) {
    return 'pass';
  }

  // CPython caches the modules that it loads, so we need to forcefully unload
  // all files that we have just written to ensure that the execution always
  // uses the proper up-to-date code.
  const modulesToClear = files
    .map((file) => file.name)
    .filter((name) => name.endsWith('.py') && name !== 'driver.py')
    .map((name) => name.replaceAll('/', '.').replace(/\.py$/, ''));

  return joinLines([
    // Clear cached modules
    'import sys',
    ...modulesToClear.flatMap((module) => [
      `if '${module}' in sys.modules:`,
      `  del sys.modules['${module}']`,
    ]),
    // Set max recursion depth.
    // Note: this might be problematic for non-desktop devices.
    // There are several limitations at play here, both from the JS and the
    // wasm worlds. It could be that we'll have to decrease this number in the
    // future. See: https://github.com/pyodide/pyodide/issues/5959
    'sys.setrecursionlimit(2000)',
    // Set CWD to $basePath
    'import os',
    `os.chdir('${basePath}')`,
    // Run code
    driverFile.content,
  ]);
}

async function run(
  files: RunPythonFile[],
  executionMetadata: ExecutionMetadata,
): Promise<ResultMessage> {
  destroyLeftoverProxies();

  if (!pyodide) {
    throw new Error('Pyodide not loaded');
  }

  const out = setupIO(pyodide, executionMetadata);
  const code = setupFS(pyodide, files);

  // New clean globals for each execution
  const ns = pyodide.toPy({});

  try {
    await pyodide.runPython(code, { globals: ns, filename: 'driver.py' });
    return {
      type: Message.RESULT,
      executionMetadata,
      result: {
        type: 'success',
        completed: true,
        stdout: out.getStdout(),
        stderr: out.getStderr(),
      },
    };
  } catch (err) {
    const pythonError = err as PythonError;
    const transferableError = getTransferableError(pythonError);
    const { isFatal } = transferableError;

    return {
      type: Message.RESULT,
      executionMetadata,
      pythonError: isFatal ? transferableError : undefined,
      result: {
        type: isFatal ? 'failure' : 'error',
        completed: true,
        stdout: out.getStdout(),
        stderr: out.getStderr() + pythonError,
      },
    };
  } finally {
    activeCellChangeListener = null;
    ns.destroy();
  }
}

/* **** Main **** */

addEventListener(
  'message',
  async (event: MessageEvent<WorkerClientMessage>) => {
    const { data } = event;
    if (!data) {
      return;
    }

    switch (data.type) {
      case Message.INIT:
        // Initialize the worker
        self.postMessage(await initWorker(data));
        break;
      case Message.RUN:
        // Run the provided Python code
        self.postMessage(await run(data.files, data.executionMetadata));
        break;
    }
  },
);
