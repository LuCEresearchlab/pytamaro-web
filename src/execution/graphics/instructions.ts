import {
  EmbindObject,
  InputMatrix,
  Paint,
  Path,
  Rect,
} from '../../canvaskit-wasm/canvaskit';
import { Point } from './spec';
import { Stack } from './stack';

export enum RenderInstructionType {
  BEGIN = 'begin',
  END = 'end',
  DRAW = 'draw',
  SAVE = 'save',
  RESTORE = 'restore',
  TRANSLATE = 'translate',
  TRANSFORM = 'transform',
}

export type RenderInstruction =
  | BeginInstruction
  | EndInstruction
  | DrawInstruction
  | SaveInstruction
  | RestoreInstruction
  | TranslateInstruction
  | TransformInstruction;

export type BeginInstruction = {
  type: RenderInstructionType.BEGIN;
  path: Path;
  pinPosition: Point;
  alternativeBounds?: Rect; // optional bounds to use instead of the path's tight bounds
};
export type EndInstruction = {
  type: RenderInstructionType.END;
  toDelete?: EmbindObject<string>[];
};
export type DrawInstruction = {
  type: RenderInstructionType.DRAW;
  path: Path;
  paint: Paint;
};
export type SaveInstruction = { type: RenderInstructionType.SAVE };
export type RestoreInstruction = { type: RenderInstructionType.RESTORE };
export type TranslateInstruction = {
  type: RenderInstructionType.TRANSLATE;
  dx: number;
  dy: number;
};
export type TransformInstruction = {
  type: RenderInstructionType.TRANSFORM;
  matrix: InputMatrix;
};

export function extractBegin(chunk: RenderInstruction[]): BeginInstruction {
  const begin = chunk.shift();
  if (!begin || begin.type !== RenderInstructionType.BEGIN) {
    throw new Error(`Inconsistent state. Expected BEGIN, got ${begin?.type}`);
  }
  return begin;
}

export function extractEnd(chunk: RenderInstruction[]): EndInstruction {
  const end = chunk.pop();
  if (!end || end.type !== RenderInstructionType.END) {
    throw new Error(`Inconsistent state, expected END, got ${end?.type}`);
  }
  return end;
}

export function extractGraphicInstructions(
  stack: Stack<RenderInstruction>,
): RenderInstruction[] {
  // Extract instructions from a BEGIN to an END, representing the complete
  // sequence of instructions for a single graphic.
  let cmd = stack.pop();
  if (cmd.type !== RenderInstructionType.BEGIN) {
    throw Error(`Inconsistent state, expected BEGIN, got ${cmd.type}`);
  }

  const chunk: RenderInstruction[] = [];
  while (true) {
    chunk.push(cmd);
    if (cmd.type === RenderInstructionType.END) {
      break;
    }
    cmd = stack.pop();
  }
  return chunk;
}

export function cleanupAfterDraw(drawCmd: DrawInstruction) {
  drawCmd.path.delete();
  drawCmd.paint.delete();
}

export function cleanupAfterEnd(endCmd: EndInstruction) {
  endCmd.toDelete
    ?.filter((obj) => !obj.isDeleted())
    ?.filter((obj) => obj.delete());
}
