import { Rect } from '../../canvaskit-wasm/canvaskit';
import { RenderInstruction, RenderInstructionType } from './instructions';
import { Point } from './spec';
import { Stack } from './stack';

export function canvasKitAssetUrl(path: string): string {
  return `${location.origin}/canvaskit/${path}`;
}

export function computeBoundsAndPin(instructions: Stack<RenderInstruction>): {
  bounds: Rect;
  pinPosition: Point;
} {
  const latestBegin = instructions.findDeepestWhere(
    (cmd) => cmd.type === RenderInstructionType.BEGIN,
  );
  if (
    latestBegin === null ||
    latestBegin.type !== RenderInstructionType.BEGIN
  ) {
    throw new Error('Empty stack');
  }
  return {
    bounds:
      latestBegin.alternativeBounds ?? latestBegin.path.computeTightBounds(),
    pinPosition: latestBegin.pinPosition,
  };
}
