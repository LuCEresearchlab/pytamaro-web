import { Canvas } from '../../canvaskit-wasm/canvaskit';
import {
  RenderInstruction,
  RenderInstructionType,
  cleanupAfterDraw,
  cleanupAfterEnd,
} from './instructions';
import { Stack } from './stack';

function runCommand(canvas: Canvas, command: RenderInstruction) {
  switch (command.type) {
    case RenderInstructionType.BEGIN:
      // Ignore, we don't care about this when drawing.
      break;
    case RenderInstructionType.END:
      cleanupAfterEnd(command);
      break;
    case RenderInstructionType.DRAW:
      canvas.drawPath(command.path, command.paint);
      cleanupAfterDraw(command);
      break;
    case RenderInstructionType.SAVE:
      canvas.save();
      break;
    case RenderInstructionType.RESTORE:
      canvas.restore();
      break;
    case RenderInstructionType.TRANSLATE:
      canvas.translate(command.dx, command.dy);
      break;
    case RenderInstructionType.TRANSFORM:
      canvas.concat(command.matrix);
      break;
  }
}

export function renderOnCanvas(
  canvas: Canvas,
  instructions: Stack<RenderInstruction>,
) {
  while (!instructions.isEmpty()) {
    runCommand(canvas, instructions.pop());
  }
}
