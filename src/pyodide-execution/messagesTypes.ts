import { ExecutionResponse } from '../codeExecution';
import { MetadataForEvent } from '../localStorage/schema';
import { GraphicSpec } from './spec';

export enum Message {
  INIT = 'init',
  RUN = 'run',
  READY = 'ready',
  RESULT = 'result',
  DRAW = 'draw',
  SAVE = 'save',
  SIZE = 'size',
  INPUT = 'input',
  PARTIAL_RESULT = 'partial_result',
  SET_ACTIVE_CELL = 'set_active_cell',
}

// Types for messages sent by the client (to the worker).
export type WorkerClientMessage = InitMessage | RunMessage;
export type RunPythonFile = {
  name: string;
  content: string;
};
export type RunMessage = {
  type: Message.RUN;
  files: RunPythonFile[];
  executionMetadata: ExecutionMetadata;
};
export type InitMessage = {
  type: Message.INIT;
  syncBuffer: SharedArrayBuffer;
  resultLengthBuffer: SharedArrayBuffer;
  interruptBuffer: Uint8Array;
};

// Types for messages sent by the worker (to the client).
export type WorkerMessage =
  | ReadyMessage
  | ResultMessage
  | MainThreadExecutionMessage
  | SetActiveCellMessage;
export type ReadyMessage = { type: Message.READY };
export type ResultMessage = {
  type: Message.RESULT | Message.PARTIAL_RESULT;
  executionMetadata: ExecutionMetadata;
  pythonError?: TransferablePythonError;
  result: ExecutionResponse;
};
export type MainThreadExecutionMessage = { uuid: string } & (
  | ExecutionRequestMessage
  | ExecutionResultRequestMessage
);
export type SetActiveCellMessage = {
  type: Message.SET_ACTIVE_CELL;
  idx: number;
};
export type ExecutionRequestMessage =
  | ({ type: Message.DRAW } & DrawRequestData)
  | ({ type: Message.SIZE } & SizeRequestData)
  | ({ type: Message.SAVE } & SaveRequestData)
  | ({ type: Message.INPUT } & InputRequestData);
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
export type ExecutionResultRequestMessage = {
  type: Message.INPUT | Message.DRAW | Message.SIZE | Message.SAVE;
  resultBuffer: SharedArrayBuffer;
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

export interface ExecutionMetadata extends MetadataForEvent {
  executionUUID: string;
}
