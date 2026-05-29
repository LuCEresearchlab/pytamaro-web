import * as Sentry from '@sentry/nextjs';
import PQueue from 'p-queue';
import { OutputAreaRef } from '../../components/input_output/OutputArea';
import logAnalyticsEvent, { AnalyticsEventName } from '../analyticsEvent';
import { ToolboxFunction } from '../localStorage/schema';
import { PythonFile } from '../schemas/activitySchema';
import { EventName, storeDbEvent } from '../storeDbEvent';
import { cellsToFiles, ExecutionResponse } from './codeExecution';
import { ExecutorDelegate } from './executorDelegate';
import { Sized } from './graphics/spec';
import {
  ClientExecutionRequestMessage,
  ClientExecutionResultRequestMessage,
  DrawRequestData,
  DrawSvgRequestData,
  ExecutionMetadata,
  ExecutorWorkerMessage,
  InputRequestData,
  MessageType,
  SaveRequestData,
  SizeRequestData,
} from './messageTypes';

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

/**
 * Information about the execution in progress.
 */
interface ActiveExecutionInfo {
  executionUUID: string;
  activeCellIdx: number | null;
}

/**
 * Information about the state of the executor for the client.
 */
export type ExecutorState =
  | { type: 'loading' }
  | { type: 'available' }
  | ActiveExecutorState;
export type ActiveExecutorState = { type: 'executing' } & ActiveExecutionInfo;

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

/**
 * Handles the communication between:
 * 1. the worker and the UI, and
 * 2. the worker and the executor delegate
 */
export class ExecutorClient {
  private readonly delegate: ExecutorDelegate;

  private readonly executorWorker: Worker;
  private readonly setExecutorState: (newState: ExecutorState) => void;

  private readonly syncBuffer: Int32Array;
  private readonly resultLengthBuffer: Int32Array;
  private readonly interruptBuffer: Uint8Array;

  private readonly pendingResults: Map<string, ClientResult>;

  private readonly executionQueue: PQueue;

  private activeCodeCell: number | null;
  private getOutputAreaRef: (idx: number) => OutputAreaRef | null;

  static async init(
    delegate: ExecutorDelegate,
    setExecutorState: (newState: ExecutorState) => void,
  ): Promise<ExecutorClient> {
    setExecutorState({ type: 'loading' });

    const worker = new Worker(new URL('./executorWorker.ts', import.meta.url), {
      type: 'module',
      name: 'Executor Worker',
    });
    const sharedSyncBuffer = new SharedArrayBuffer(
      Int32Array.BYTES_PER_ELEMENT,
    );
    const sharedResultLengthBuffer = new SharedArrayBuffer(
      Int32Array.BYTES_PER_ELEMENT,
    );
    const interruptBuffer = new Uint8Array(
      new SharedArrayBuffer(Uint8Array.BYTES_PER_ELEMENT),
    );

    return new Promise((resolve) => {
      const onReadyListener = (event: MessageEvent<ExecutorWorkerMessage>) => {
        const { data } = event;
        if (data.type !== MessageType.READY) {
          // Ignore
          return;
        }
        worker.removeEventListener('message', onReadyListener);
        const client = new ExecutorClient(
          worker,
          delegate,
          sharedSyncBuffer,
          sharedResultLengthBuffer,
          interruptBuffer,
          setExecutorState,
        );
        setExecutorState({ type: 'available' });
        resolve(client);
      };

      worker.addEventListener('message', onReadyListener);
      worker.postMessage({
        type: MessageType.INIT,
        syncBuffer: sharedSyncBuffer,
        resultLengthBuffer: sharedResultLengthBuffer,
        interruptBuffer: interruptBuffer,
      });
    });
  }

  private constructor(
    executorWorker: Worker,
    delegate: ExecutorDelegate,
    sharedSyncBuffer: SharedArrayBuffer,
    sharedResultLengthBuffer: SharedArrayBuffer,
    interruptBuffer: Uint8Array,
    setExecutorState: (newState: ExecutorState) => void,
  ) {
    this.executorWorker = executorWorker;
    this.delegate = delegate;
    this.pendingResults = new Map();

    this.syncBuffer = new Int32Array(sharedSyncBuffer);
    this.resultLengthBuffer = new Int32Array(sharedResultLengthBuffer);
    this.interruptBuffer = interruptBuffer;

    this.executionQueue = new PQueue({ concurrency: 1 });

    this.activeCodeCell = null;
    this.setExecutorState = (newState: ExecutorState) => {
      this.activeCodeCell =
        newState.type === 'executing' ? newState.activeCellIdx : null;
      setExecutorState(newState);
    };
    this.getOutputAreaRef = () => null;

    this.executorWorker.addEventListener(
      'message',
      (event: MessageEvent<ExecutorWorkerMessage>) =>
        this.handleWorkerMessage(event.data),
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

    const execution = async () => {
      // Reset active code cell in between runs
      this.setExecutorState({ type: 'available' });
      // Set function to obtain output area ref for stdin
      this.getOutputAreaRef = getOutputRef;
      // Execute the code
      return new Promise<ExecutionResponse>((resolve) => {
        const resultsListener = (
          event: MessageEvent<ExecutorWorkerMessage>,
        ) => {
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          if (!event.data) {
            return;
          }
          const { type } = event.data;

          if (
            type === MessageType.PARTIAL_RESULT &&
            this.activeCodeCell !== null
          ) {
            // Partial results for the active code cell
            updateExecutionResult(this.activeCodeCell, event.data.result);
          } else if (type === MessageType.SET_ACTIVE_CELL) {
            // Active cell change
            const oldIdx = this.activeCodeCell;
            const { idx: newIdx } = event.data;
            this.setExecutorState({
              type: 'executing',
              executionUUID: executionMetadata.executionUUID,
              activeCellIdx: newIdx,
            });
            onActiveCellChange(oldIdx, newIdx);
          } else if (type === MessageType.FINAL_RESULT) {
            // Final execution result
            const { result } = event.data;
            if (result.type === 'failure') {
              captureErrorWithSentry(event.data.pythonError, {
                fatalError: true,
              });
            }

            // Unsubscribe from further messages
            this.executorWorker.removeEventListener('message', resultsListener);
            resolve(result);
          }
        };

        this.executorWorker.addEventListener('message', resultsListener);
        this.executorWorker.postMessage({
          type: MessageType.RUN,
          executionMetadata,
          files,
        });
      }).finally(() => {
        this.setExecutorState({ type: 'available' });
      });
    };

    return (await this.executionQueue.add(execution)) as ExecutionResponse;
  }

  interruptExecution(): void {
    this.interruptBuffer[0] = 2; // 2 for SIGINT
    this.getActiveOutputAreaRef()?.deactivatePossibleInputField();
    this.setExecutorState({ type: 'available' });
  }

  async restartWorker(): Promise<ExecutorClient> {
    this.setExecutorState({ type: 'loading' });
    this.interruptExecution();
    this.pendingResults.clear();
    this.executorWorker.terminate();
    return ExecutorClient.init(this.delegate, this.setExecutorState);
  }

  private getActiveOutputAreaRef(): OutputAreaRef | null {
    return this.activeCodeCell === null
      ? null
      : this.getOutputAreaRef(this.activeCodeCell);
  }

  private handleWorkerMessage(message: ExecutorWorkerMessage): void {
    // In this listener, we only process execution requests (messages with an uuid).
    // Messages with the execution result are received by a specific listener in
    // sendExecutionRequestToWorkerAndWaitForResponse.
    if (!('uuid' in message)) {
      return;
    }
    const { uuid } = message;
    if (this.pendingResults.has(uuid)) {
      // If we have already received the executuion request message,
      // this should be a message with the request for the result.
      this.deliverPendingResult(
        uuid,
        message as ClientExecutionResultRequestMessage,
      );
    } else {
      // Otherwise, this should be the execution request message.
      this.handleClientExecutionRequest(
        uuid,
        message as ClientExecutionRequestMessage,
      );
    }
  }

  private notifyWorkerResultReady(
    uuid: string,
    resultLength: number,
    result: ClientResultValue,
  ): void {
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
    this.resultLengthBuffer[0] = resultLength;
    this.notifyWorkerUsingSyncBuffer();
  }

  private notifyWorkerResultFailure(uuid: string): void {
    const curr = this.pendingResults.get(uuid);
    if (curr === undefined) {
      // This guard is necessary due to potential concurrency issues
      return;
    }

    if (curr.status !== ResultStatus.Computing) {
      throw Error(
        `Trying to deliver notification of failure multiple times for ${uuid}`,
      );
    }

    this.pendingResults.set(uuid, { status: ResultStatus.Failure });
    // -1 is the special "failure" value
    this.resultLengthBuffer[0] = -1;
    this.notifyWorkerUsingSyncBuffer();
  }

  /**
   * Notify the worker that a result is ready in the shared buffer.
   * There are rare cases in which we might attempt to notify the worker
   * before it is waiting on the sync buffer. In that case, we retry
   * until the worker is successfully notified.
   * Log an error message every million unsuccessful attempts.
   */
  private notifyWorkerUsingSyncBuffer() {
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

  private deliverPendingResult(
    uuid: string,
    data: ClientExecutionResultRequestMessage,
  ) {
    const { type } = data;
    const result = this.pendingResults.get(uuid);
    if (result === undefined || result.status !== ResultStatus.Ready) {
      // This guard is necessary due to potential concurrency issues
      return;
    }

    const toDeliver = result.value;
    switch (type) {
      case MessageType.DRAW:
      case MessageType.DRAW_SVG:
      case MessageType.INPUT:
        {
          const src = toDeliver as Uint8Array;
          const resultBuffer = new Uint8Array(data.resultBuffer);
          resultBuffer.set(src);
        }
        break;
      case MessageType.SIZE:
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

  private handleClientExecutionRequest(
    uuid: string,
    request: ClientExecutionRequestMessage,
  ): void {
    this.pendingResults.set(uuid, { status: ResultStatus.Computing });
    switch (request.type) {
      case MessageType.DRAW:
        this.handleDelegatedDraw(uuid, request);
        break;
      case MessageType.DRAW_SVG:
        this.handleDelegatedDrawSvg(uuid, request);
        break;
      case MessageType.INPUT:
        this.handleDelegatedInput(uuid, request);
        break;
      case MessageType.SAVE:
        this.handleDelegatedSave(uuid, request);
        break;
      case MessageType.SIZE:
        this.handleDelegatedSize(uuid, request);
        break;
    }
  }

  private handleDelegatedDraw(uuid: string, data: DrawRequestData): void {
    this.delegate
      .drawRasterGraphic(data)
      .then((result) => {
        const encoded = new Uint8Array(Buffer.from(result));
        this.notifyWorkerResultReady(uuid, encoded.byteLength, encoded);
      })
      .catch((err) => {
        captureErrorWithSentry(err, { procedure: 'draw' });
        this.notifyWorkerResultFailure(uuid);
      });
  }

  private handleDelegatedDrawSvg(uuid: string, data: DrawSvgRequestData): void {
    this.delegate
      .drawSvgGraphic(data)
      .then((result) => {
        const encoded = new Uint8Array(Buffer.from(result));
        this.notifyWorkerResultReady(uuid, encoded.byteLength, encoded);
      })
      .catch((err) => {
        captureErrorWithSentry(err, { procedure: 'draw_svg' });
        this.notifyWorkerResultFailure(uuid);
      });
  }

  private handleDelegatedInput(uuid: string, data: InputRequestData): void {
    const outputArea = this.getActiveOutputAreaRef();
    if (outputArea === null) {
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
        logAnalyticsEvent(AnalyticsEventName.CodeExecutionInput, {});
        const encoded = new Uint8Array(Buffer.from(value));
        this.notifyWorkerResultReady(uuid, encoded.byteLength, encoded);
      })
      .catch((err) => {
        captureErrorWithSentry(err, { procedure: 'input' });
        this.notifyWorkerResultFailure(uuid);
      })
      .finally(outputArea.deactivatePossibleInputField);
  }

  private handleDelegatedSave(uuid: string, data: SaveRequestData): void {
    this.delegate
      .saveAsFile(data)
      .then(() => this.notifyWorkerResultReady(uuid, 0, new Uint8Array(0)))
      .catch((err) => {
        captureErrorWithSentry(err, { procedure: 'save' });
        this.notifyWorkerResultFailure(uuid);
      });
  }

  private handleDelegatedSize(uuid: string, data: SizeRequestData): void {
    try {
      const encodedSize = this.delegate.sizeOfGraphic(data);
      this.notifyWorkerResultReady(
        uuid,
        Float32Array.BYTES_PER_ELEMENT * 2,
        encodedSize,
      );
    } catch (err) {
      captureErrorWithSentry(err, { procedure: 'size' });
      this.notifyWorkerResultFailure(uuid);
    }
  }
}
