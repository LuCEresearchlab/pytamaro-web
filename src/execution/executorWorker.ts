import throttle from 'lodash/throttle';
import { PyodideAPI } from 'pyodide';
import { PyProxy, PythonError } from 'pyodide/ffi';
import { INPUT_BEGIN, INPUT_END } from '../ioMarkers';
import { joinLines } from '../sourceUtils';
import { ExecutionResponse } from './codeExecution';
import { GraphicSpec, Sized } from './graphics/spec';
import {
  ExecutionMetadata,
  ExecutorClientMessage,
  InitMessage,
  MessageData,
  MessageType,
  ResultMessage,
  RunPythonFile,
  TransferablePythonError,
} from './messageTypes';
import { PYODIDE_VERSION, PYTAMARO_VERSION } from './versions';

const EXEC_BASE_PATH = '/run/py';
const DRIVER_FILE_NAME = 'driver.py';

type ThisWorker = typeof globalThis;
type OnActiveCodeCellChangeListener = (idx: number) => void;

interface ReadOnlyExecutionOutput {
  getStdout(): string;
  getStderr(): string;
}

/**
 * Attempting to transfer a PythonError object in certain browsers (firefox)
 * makes the Worker.postMessage method fail (probably due to some component
 * of the original object referencing some wasm memory location).
 *
 * Create a transferable version of the original error with just the fields
 * that can be safely transferred.
 */
const getTransferableError: (
  pythonError: PythonError,
) => TransferablePythonError = (pythonError) => ({
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
});

class ExecutionOutput implements ReadOnlyExecutionOutput {
  private readonly decoder: TextDecoder;
  private stdout: string;
  private stderr: string;

  constructor(decoder: TextDecoder) {
    this.decoder = decoder;
    this.stdout = '';
    this.stderr = '';
  }

  getStdout(): string {
    return this.stdout;
  }

  getStderr(): string {
    return this.stderr;
  }

  /**
   * Append to STDOUT
   *
   * @returns The length of the appended content
   */
  writeStdout(content: Uint8Array<ArrayBufferLike> | string): number {
    this.stdout +=
      typeof content === 'string' ? content : this.decoder.decode(content);
    return content.length;
  }

  /**
   * Append to STDERR
   *
   * @returns The length of the appended content
   */
  writeStderr(content: Uint8Array<ArrayBufferLike> | string): number {
    this.stderr +=
      typeof content === 'string' ? content : this.decoder.decode(content);
    return content.length;
  }

  /**
   * Clear all output streams
   */
  clear() {
    this.stdout = '';
    this.stderr = '';
  }
}

class WorkerExecutor {
  private readonly worker: ThisWorker;
  private readonly pyodide: PyodideAPI;

  private readonly remainingPyProxies: PyProxy[];

  private readonly decoder: TextDecoder;
  private readonly syncBuffer: Int32Array;
  private readonly resultLengthBuffer: Int32Array;

  private activeCellChanged: OnActiveCodeCellChangeListener | null;

  static async init(
    worker: ThisWorker,
    data: InitMessage,
  ): Promise<WorkerExecutor> {
    // @ts-expect-error importScripts is available in web workers
    importScripts(
      `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`,
    );
    // @ts-expect-error loadPyodide is injected by the script above
    const pyodide: PyodideAPI | undefined = await loadPyodide({
      checkAPIVersion: true,
    });
    if (!pyodide) {
      throw new Error('Failed to load Pyodide');
    }

    // Python dependencies
    await pyodide.loadPackage('micropip', {
      messageCallback: () => {},
    });
    const microPip = pyodide.pyimport('micropip');
    await microPip.install(
      `${location.origin}/pyodide/pytamaro-${PYTAMARO_VERSION}-py3-none-any.whl`,
    );
    microPip.destroy();

    // Interrupt buffer to halt the execution from the client
    pyodide.setInterruptBuffer(data.interruptBuffer);

    return new WorkerExecutor(
      worker,
      pyodide,
      new Int32Array(data.syncBuffer),
      new Int32Array(data.resultLengthBuffer),
    );
  }

  private constructor(
    worker: ThisWorker,
    pyodide: PyodideAPI,
    syncBuffer: Int32Array,
    resultLengthBuffer: Int32Array,
  ) {
    this.worker = worker;
    this.pyodide = pyodide;

    this.remainingPyProxies = [];

    this.decoder = new TextDecoder('utf-8');
    this.syncBuffer = syncBuffer;
    this.resultLengthBuffer = resultLengthBuffer;

    this.activeCellChanged = null;

    this.pyodide.registerJsModule('pytamaro_js_ffi', {
      js_graphic_size: (specs: PyProxy) =>
        this.ffSizeOnClient(this.unProxy<GraphicSpec[]>(specs)),
      js_render_graphic: (
        specs: PyProxy,
        scalingFactor: number,
        debug: boolean,
      ) =>
        this.ffRenderGraphicOnClient(
          this.unProxy<GraphicSpec[]>(specs),
          scalingFactor,
          debug,
        ),
      js_svg_graphic: (specs: PyProxy, debug: boolean) =>
        this.ffSvgGraphicOnClient(this.unProxy<GraphicSpec[]>(specs), debug),
      js_save: (fileName: string, content: string) =>
        this.ffSaveOnClient(fileName, content),
      set_active_cell: (idx: number) => this.ffSetActiveCell(idx),
    });
  }

  /* ==== Code Execution ==== */

  async run(
    executionMetadata: ExecutionMetadata,
    files: RunPythonFile[],
  ): Promise<ResultMessage> {
    this.destroyLeftoverProxies();

    const out = this.executionSetupIO(executionMetadata);
    const driverCode = this.executionSetupEnvironment(files);

    // New empty globals
    const globals = this.pyodide.toPy({});

    try {
      await this.pyodide.runPython(driverCode, {
        globals,
        filename: DRIVER_FILE_NAME,
      });

      return {
        type: MessageType.FINAL_RESULT,
        executionMetadata,
        result: {
          type: 'success',
          completed: true,
          stdout: out.getStdout(),
          stderr: out.getStderr(),
        },
      };
    } catch (err) {
      // Handle unhandled python exceptions
      const pythonError = err as PythonError;
      const transferableError = getTransferableError(pythonError);
      const { isFatal } = transferableError;

      return {
        type: MessageType.FINAL_RESULT,
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
      // Cleanup
      this.activeCellChanged = null;
      globals.destroy();
    }
  }

  /**
   * Set up the execution environment.
   *
   * @returns The entry point code (a.k.a. the "driver") to run.
   */
  private executionSetupEnvironment(files: RunPythonFile[]): string {
    const fs = this.pyodide.FS;
    fs.mkdirTree(EXEC_BASE_PATH);

    let driverFile: RunPythonFile | null = null;
    for (const file of files) {
      if (file.name === DRIVER_FILE_NAME) {
        driverFile = file;
      } else {
        fs.writeFile(`${EXEC_BASE_PATH}/${file.name}`, file.content);
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
      .filter((name) => name.endsWith('.py') && name !== DRIVER_FILE_NAME)
      .map((name) => name.replaceAll('/', '.').replace(/\.py$/, ''));

    return joinLines([
      // Clear cached modules
      'import sys',
      ...modulesToClear.flatMap((module) => [
        `if '${module}' in sys.modules: `,
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
      `os.chdir('${EXEC_BASE_PATH}')`,
      // Run code
      driverFile.content,
    ]);
  }

  /**
   * @returns An instance of {@link ReadOnlyExecutionOutput} to be used to
   * get the output of the currently active code cell.
   */
  private executionSetupIO(
    executionMetadata: ExecutionMetadata,
  ): ReadOnlyExecutionOutput {
    const out = new ExecutionOutput(this.decoder);

    const sendPartialResult = () =>
      this.worker.postMessage({
        type: MessageType.PARTIAL_RESULT,
        executionMetadata,
        result: {
          type: 'success',
          completed: false,
          stdout: out.getStdout(),
          stderr: out.getStderr(),
        },
      });

    // Hook into cell change
    this.activeCellChanged = () => {
      // "Flush" the partial results for the currently active cell and then
      // clear out so we don't send previous outputs to the new cell
      sendPartialResult();
      out.clear();
    };

    // Throttle the sending of partial results to avoid overloading react in the
    // frontend (e.g., when doing lots of `print('.')` in a sequence from python)
    const throttledSendPartialResult = throttle(sendPartialResult, 50);
    const throttledWrite = (
      writeFn: (buf: Uint8Array<ArrayBufferLike>) => number,
    ): {
      write: (buf: Uint8Array<ArrayBufferLike>) => number;
    } => ({
      write: (buf) => {
        const written = writeFn(buf);
        throttledSendPartialResult();
        return written;
      },
    });

    // Keep track of each occurrence of input so that in the events database we
    // can then reliably reconstruct the execution of a code cell, since network
    // requests may be received out of order by the db
    let inputSeqNumber = 0;
    const stdin = () => {
      // Send partial result before blocking for input
      // (this signals that the output is up to date for the current execution,
      // even if there was no output before the input request)
      out.writeStdout('\u200B');
      // Not throttled: we want this to happen right now!
      sendPartialResult();
      const input = this.ffInputOnClient(executionMetadata, inputSeqNumber++);
      // Add back to stdout (including the <enter>) so that the user can see
      // what they typed
      out.writeStdout(INPUT_BEGIN + input + INPUT_END + '\n');
      sendPartialResult();
      return '' + input;
    };

    // Hook into Pyodide
    this.pyodide.setStdout(throttledWrite(out.writeStdout.bind(out)));
    this.pyodide.setStderr(throttledWrite(out.writeStderr.bind(out)));
    this.pyodide.setStdin({ stdin });

    return out;
  }

  /* ==== Memory Management ==== */

  /**
   * Unwrap the result of a given function from pyodide FFI proxy to a plain
   * JS object.
   *
   * Since it is not clear when it's a good moment to get rid of those proxies
   * (freeing them too early may cause issues on the python side), we register
   * them into the remainingPyProxies array so that we may deallocate them once
   * the execution is over.
   */
  private unProxy<T>(proxy: PyProxy): T {
    if (typeof proxy === 'object' && typeof proxy.toJs === 'function') {
      return proxy.toJs({ pyproxies: this.remainingPyProxies });
    } else {
      return proxy as T;
    }
  }

  /**
   * Destroy all leftover proxies that we did not deallocate earlier.
   */
  private destroyLeftoverProxies() {
    while (this.remainingPyProxies.length > 0) {
      // There does not seem to be a way for us to check whether a proxy has
      // already been deleted.
      // The pyodide API indicates that an error message will be logged in such
      // a situation.
      this.remainingPyProxies.pop()?.destroy();
    }
  }

  /* ==== Foreign Functions ==== */

  /**
   * @returns Text input'ed by the user from the main thread
   */
  private ffInputOnClient(
    executionMetadata: ExecutionMetadata,
    seq: number,
  ): string {
    const res = this.executeFFOnClient(MessageType.INPUT, {
      executionMetadata,
      seq,
    });
    if (res === null) {
      // Treat input failure as a normal python exception
      throw Error('Failed to obtain input string');
    }
    return this.decodeSharedBuffer(res);
  }

  /**
   * @returns The base64 of the graphic, rendered on the main thread
   */
  private ffRenderGraphicOnClient(
    specs: GraphicSpec[],
    scalingFactor: number,
    debug: boolean,
  ): string {
    const res = this.executeFFOnClient(MessageType.DRAW, {
      specs,
      scalingFactor,
      debug,
    });
    if (res == null) {
      // Treat render failure as a normal python exception
      throw new Error('Failed to render graphic');
    }
    return this.decodeSharedBuffer(res);
  }

  /**
   * @returns The SVG string of the graphic, computed with canvaskit on the main thread
   */
  private ffSvgGraphicOnClient(specs: GraphicSpec[], debug: boolean): string {
    const res = this.executeFFOnClient(MessageType.DRAW_SVG, {
      specs,
      debug,
    });
    if (res == null) {
      // Treat render failure as a normal python exception
      throw new Error('Failed to compute SVG of a graphic');
    }
    return this.decodeSharedBuffer(res);
  }

  private ffSaveOnClient(fileName: string, content: string): void {
    this.executeFFOnClient(MessageType.SAVE, {
      fileName,
      contentUri: content,
    });
  }

  private ffSetActiveCell(idx: number): void {
    if (this.activeCellChanged !== null) {
      this.activeCellChanged(idx);
    }
    self.postMessage({ type: MessageType.SET_ACTIVE_CELL, idx });
  }

  private ffSizeOnClient(specs: GraphicSpec[]): Sized {
    const res = this.executeFFOnClient(MessageType.SIZE, { specs });
    if (res == null) {
      // Treat size computation failure as a normal python exception
      throw new Error('Failed to compute graphic size');
    }
    const sizes = new Float32Array(res);
    return { width: sizes[0], height: sizes[1] };
  }

  private executeFFOnClient(
    type: MessageType,
    data: MessageData,
  ): SharedArrayBuffer | null {
    const uuid = crypto.randomUUID();
    this.worker.postMessage({
      ...data,
      type,
      uuid,
    });

    // Wait on syncBuffer but check every 50ms for interrupts
    let receivedResultLength = false;
    while (!receivedResultLength) {
      if (Atomics.wait(this.syncBuffer, 0, 0, 50) === 'ok') {
        receivedResultLength = true;
      }
      this.pyodide.checkInterrupt();
    }

    // Read length of result and create shared array buffer to transfer it
    const lenInBytes = this.resultLengthBuffer[0];
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
    Atomics.wait(this.syncBuffer, 0, 0);
    // Return the shared array buffer containing the result from the client
    return resultBuffer;
  }

  private decodeSharedBuffer(sharedBuffer: SharedArrayBuffer): string {
    // We cannot directly use the shared buffer, so we need to copy its contents
    // to a temporary buffer first
    const sharedView = new Uint8Array(sharedBuffer);
    const tmpBuffer = new ArrayBuffer(sharedBuffer.byteLength);
    const tmpView = new Uint8Array(tmpBuffer);
    tmpView.set(sharedView);
    return this.decoder.decode(tmpBuffer);
  }

  /* ==== Worker Messages ==== */
  private sendResult(
    executionMetadata: ExecutionMetadata,
    partial: boolean,
    result: ExecutionResponse,
    error?: TransferablePythonError,
  ) {
    this.worker.postMessage({
      type: partial ? MessageType.PARTIAL_RESULT : MessageType.FINAL_RESULT,
      executionMetadata,
      result,
      error,
    });
  }
}

/* ==== Worker ==== */

let executor: WorkerExecutor | null = null;
addEventListener(
  'message',
  async (event: MessageEvent<ExecutorClientMessage>) => {
    const { data } = event;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!data) {
      return;
    }

    switch (data.type) {
      case MessageType.INIT:
        executor = await WorkerExecutor.init(self, data);
        self.postMessage({ type: MessageType.READY });
        break;
      case MessageType.RUN:
        if (executor !== null) {
          self.postMessage(
            await executor.run(data.executionMetadata, data.files),
          );
        }
        break;
    }
  },
);
