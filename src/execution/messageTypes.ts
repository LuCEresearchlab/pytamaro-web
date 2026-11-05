import { MetadataForEvent } from '../localStorage/schema';
import { ExecutionResponse } from './codeExecution';
import { GraphicSpec } from './graphics/spec';

export enum MessageType {
  INIT = 'init',
  RUN = 'run',
  READY = 'ready',
  FINAL_RESULT = 'result',
  DRAW = 'draw',
  DRAW_SVG = 'draw_svg',
  SAVE = 'save',
  SIZE = 'size',
  INPUT = 'input',
  PARTIAL_RESULT = 'partial_result',
  SET_ACTIVE_CELL = 'set_active_cell',
  INSTALL_LIBRARIES = 'install_libraries',
  LIBRARIES_INSTALLED = 'libraries_installed',
}

export type MessageData =
  | DrawRequestData
  | DrawSvgRequestData
  | SizeRequestData
  | InputRequestData
  | SaveRequestData;

export interface ExecutionMetadata extends MetadataForEvent {
  executionUUID: string;
}

/* ==== Client -> Worker Messages ==== */

export type ExecutorClientMessage =
  | InitMessage
  | RunMessage
  | InstallLibrariesMessage;

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
  /**
   * Names of the files that belong to the IDE workspace. When present, the
   * worker reports which of them were created, modified, or deleted during the
   * execution.
   */
  workspaceFiles?: string[];
};
export type RunPythonFile = {
  name: string;
  content: string | Uint8Array;
};

/**
 * "Install additional Python libraries" message.
 */
export type InstallLibrariesMessage = {
  type: MessageType.INSTALL_LIBRARIES;
  uuid: string;
  libraries: string[];
};
/**
 * A file of the IDE workspace whose content changed during an execution.
 */
export type WorkspaceFileChange = {
  name: string;
  content: Uint8Array;
};
/**
 * The changes made by an execution to the files of the IDE workspace.
 */
export type WorkspaceChanges = {
  changed: WorkspaceFileChange[];
  deleted: string[];
};

/* ==== Worker -> Client Messages ==== */

export type ExecutorWorkerMessage =
  | ReadyMessage
  | ResultMessage
  | ClientExecutionMessage
  | SetActiveCellMessage
  | LibrariesInstalledMessage;

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
  /** Present when the run asked the worker to report workspace changes. */
  workspaceChanges?: WorkspaceChanges;
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
  | ({ type: MessageType.INPUT } & InputRequestData)
  | ({ type: MessageType.DRAW_SVG } & DrawSvgRequestData);
export type DrawRequestData = {
  specs: GraphicSpec[];
  scalingFactor: number;
  debug: boolean;
};
export type DrawSvgRequestData = {
  specs: GraphicSpec[];
  debug: boolean;
};
export type SaveRequestData = {
  fileName: string;
  contentUri: string;
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
    | MessageType.DRAW_SVG
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

/**
 * Message that signals the outcome of an "install additional Python libraries"
 * request.
 */
export type LibrariesInstalledMessage = {
  type: MessageType.LIBRARIES_INSTALLED;
  uuid: string;
  error?: string;
};
