import { Canvas } from '../../canvaskit-wasm/canvaskit';
import { cleanupAfterDraw, cleanupAfterEnd, Command } from './commands';
import { Stack } from './stack';

function runCommand(canvas: Canvas, command: Command) {
  switch (command.type) {
    case 'BEGIN':
      // Ignore, we don't care about this when drawing.
      break;
    case 'END':
      cleanupAfterEnd(command);
      break;
    case 'DRAW':
      canvas.drawPath(command.path, command.paint);
      cleanupAfterDraw(command);
      break;
    case 'SAVE':
      canvas.save();
      break;
    case 'RESTORE':
      canvas.restore();
      break;
    case 'TRANSLATE':
      canvas.translate(command.dx, command.dy);
      break;
    case 'TRANSFORM':
      canvas.concat(command.matrix);
      break;
  }
}

export function renderOnCanvas(canvas: Canvas, instructions: Stack<Command>) {
  while (!instructions.isEmpty()) {
    runCommand(canvas, instructions.pop());
  }
}
