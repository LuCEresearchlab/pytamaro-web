import {
  EmbindObject,
  InputMatrix,
  Paint,
  Path,
} from '../../canvaskit-wasm/canvaskit';
import { Point } from '../spec';
import { Stack } from './stack';

export type Command =
  | BeginCommand
  | EndCommand
  | DrawCommand
  | SaveCommand
  | RestoreCommand
  | TranslateCommand
  | TransformCommand;

export type BeginCommand = { type: 'BEGIN'; path: Path; pinPosition: Point };
export type EndCommand = { type: 'END'; toDelete?: EmbindObject<string>[] };
export type DrawCommand = { type: 'DRAW'; path: Path; paint: Paint };
export type SaveCommand = { type: 'SAVE' };
export type RestoreCommand = { type: 'RESTORE' };
export type TranslateCommand = { type: 'TRANSLATE'; dx: number; dy: number };
export type TransformCommand = { type: 'TRANSFORM'; matrix: InputMatrix };

export function extractBegin(chunk: Command[]): BeginCommand {
  const begin = chunk.shift();
  if (!begin || begin.type !== 'BEGIN') {
    throw new Error(`Inconsistent state. Expected BEGIN, got ${begin?.type}`);
  }
  return begin;
}

export function extractEnd(chunk: Command[]): EndCommand {
  const end = chunk.pop();
  if (!end || end.type !== 'END') {
    throw new Error(`Inconsistent state, expected END, got ${end?.type}`);
  }
  return end;
}

export function extractGraphicCommands(stack: Stack<Command>): Command[] {
  // Extract commands from a BEGIN to an END, representing the complete sequence of commands for a single graphic.
  let cmd = stack.pop();
  if (cmd.type !== 'BEGIN') {
    throw Error(`Inconsistent state, expected BEGIN, got ${cmd.type}`);
  }

  const chunk: Command[] = [];
  while (true) {
    chunk.push(cmd);
    if (cmd.type === 'END') {
      break;
    }
    cmd = stack.pop();
  }
  return chunk;
}

export function cleanupAfterDraw(drawCmd: DrawCommand) {
  drawCmd.path.delete();
  drawCmd.paint.delete();
}

export function cleanupAfterEnd(endCmd: EndCommand) {
  endCmd.toDelete
    ?.filter((obj) => !obj.isDeleted())
    ?.filter((obj) => obj.delete());
}
