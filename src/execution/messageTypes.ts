import { MetadataForEvent } from '../localStorage/schema';
import { ExecutionResponse } from './codeExecution';
import { GraphicSpec } from './graphics/spec';

export enum MessageType {
  INIT = 'init',
  RUN = 'run',
  READY = 'ready',
  FINAL_RESULT = 'result',
  DRAW = 'draw',
  SAVE = 'save',
  SIZE = 'size',
  INPUT = 'input',
  PARTIAL_RESULT = 'partial_result',
  SET_ACTIVE_CELL = 'set_active_cell',
}

export type MessageData =
  | DrawRequestData
  | SizeRequestData
  | InputRequestData
  | SaveRequestData;

export interface ExecutionMetadata extends MetadataForEvent {
  executionUUID: string;
}

/* ==== Client -> Worker Messages ==== */

export type ExecutorClientMessage = InitMessage | RunMessage;

/**
 * Initialization message.
 */
export type InitMessage = {
  type: MessageType.INIT;
  syncBuffer: SharedArrayBuffer;
  resultLengthBuffer: SharedArrayBuffer;
  interruptBuffer: Uint8Array;
};

/**
 * "Request to execute python code" message.
 */
export type RunMessage = {
  type: MessageType.RUN;
  files: RunPythonFile[];
  executionMetadata: ExecutionMetadata;
};
export type RunPythonFile = {
  name: string;
  content: string;
};

/* ==== Worker -> Client Messages ==== */

export type ExecutorWorkerMessage =
  | ReadyMessage
  | ResultMessage
  | ClientExecutionMessage
  | SetActiveCellMessage;

/**
 * Message sent by the executor to signal that it can now accept requests
 * to execute python code.
 */
export type ReadyMessage = { type: MessageType.READY };
/**
 * Python execution result message.
 *
 * May be a "partial" result if the execution is not yet complete.
 */
export type ResultMessage = {
  type: MessageType.FINAL_RESULT | MessageType.PARTIAL_RESULT;
  executionMetadata: ExecutionMetadata;
  pythonError?: TransferablePythonError;
  result: ExecutionResponse;
};
export type TransferablePythonError = {
  columnNumber: number;
  lineNumber: number;
  fileName: string | undefined;
  message: string;
  name: string;
  isFatal: boolean;
  stack: string | undefined;
};

/**
 * Client-side execution messages.
 */
export type ClientExecutionMessage = { uuid: string } & (
  | ClientExecutionRequestMessage
  | ClientExecutionResultRequestMessage
);
/**
 * Message sent by the worker that asks the client to perform some work.
 *
 * The client replies by writing the size of its response on a shared array
 * buffer.
 */
export type ClientExecutionRequestMessage =
  | ({ type: MessageType.DRAW } & DrawRequestData)
  | ({ type: MessageType.SIZE } & SizeRequestData)
  | ({ type: MessageType.SAVE } & SaveRequestData)
  | ({ type: MessageType.INPUT } & InputRequestData);
export type DrawRequestData = {
  specs: GraphicSpec[];
  scalingFactor: number;
  debug: boolean;
};
export type SaveRequestData = {
  fileName: string;
  content: string;
};
export type SizeRequestData = {
  specs: GraphicSpec[];
};
export type InputRequestData = {
  executionMetadata: ExecutionMetadata;
  seq: number;
};
/**
 * Message sent by the worker that asks the client to write its the result of
 * an earlier "client-execution" into the given shared array buffer.
 */
export type ClientExecutionResultRequestMessage = {
  type:
    | MessageType.INPUT
    | MessageType.DRAW
    | MessageType.SIZE
    | MessageType.SAVE;
  resultBuffer: SharedArrayBuffer;
};
/**
 * Message that signals the change of active code cell.
 */
export type SetActiveCellMessage = {
  type: MessageType.SET_ACTIVE_CELL;
  idx: number;
};
