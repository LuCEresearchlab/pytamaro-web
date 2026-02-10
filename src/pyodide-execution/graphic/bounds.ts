import { Rect } from '../../canvaskit-wasm/canvaskit';
import { Point } from '../spec';
import { Command } from './commands';
import { Stack } from './stack';

export function computeBoundsAndPin(stack: Stack<Command>): {
  bounds: Rect;
  pinPosition: Point;
} {
  const latestBegin: Command | null = stack.findDeepestWhere(
    (cmd) => cmd.type === 'BEGIN',
  );
  if (latestBegin === null || latestBegin.type !== 'BEGIN') {
    throw new Error('Empty stack');
  }
  return {
    bounds: latestBegin.path.computeTightBounds(),
    pinPosition: latestBegin.pinPosition,
  };
}
