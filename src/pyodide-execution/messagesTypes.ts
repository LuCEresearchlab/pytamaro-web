import { ExecutionResponse } from '../codeExecution';
import { GraphicSpec } from './spec';

export enum Message {
  INIT = 'init',
  RUN = 'run',
  READY = 'ready',
  RESULT = 'result',
  DRAW = 'draw',
  SIZE = 'size',
  INPUT = 'input',
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
};
export type InitMessage = {
  type: Message.INIT;
  syncBuffer: SharedArrayBuffer;
  resultSizeBuffer: SharedArrayBuffer;
};

// Types for messages sent by the worker (to the client).
export type WorkerMessage =
  | ReadyMessage
  | ResultMessage
  | MainThreadExecutionMessage;
export type ReadyMessage = { type: Message.READY };
export type ResultMessage = { type: Message.RESULT; result: ExecutionResponse };
export type MainThreadExecutionMessage = { uuid: string } & (
  | ExecutionRequestMessage
  | ExecutionResultRequestMessage
);
export type ExecutionRequestMessage =
  | ({ type: Message.DRAW } & DrawRequestData)
  | ({ type: Message.SIZE } & SizeRequestData)
  | ({ type: Message.INPUT } & InputRequestData);
export type DrawRequestData = {
  graphic: GraphicSpec;
  debug: boolean;
};
export type SizeRequestData = {
  graphic: GraphicSpec;
};
export type InputRequestData = {
  message: string;
};
export type ExecutionResultRequestMessage = {
  type: Message.INPUT | Message.DRAW | Message.SIZE;
  resultBuffer: SharedArrayBuffer;
};
