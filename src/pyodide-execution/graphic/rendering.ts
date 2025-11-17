import { Canvas } from '../../canvaskit-wasm/canvaskit';
import { Command } from './commands';
import { Stack } from './stack';

function runCommand(canvas: Canvas, command: Command) {
  switch (command.type) {
    case 'BEGIN':
      // Ignore, we don't care about  this when drawing.
      break;
    case 'END':
      command.toDelete
        ?.filter((obj) => !obj.isDeleted())
        ?.filter((obj) => obj.delete());
      break;
    case 'DRAW':
      canvas.drawPath(command.path, command.paint);
      // Deallocate EmbindObjects manually
      command.path.delete();
      command.paint.delete();
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
