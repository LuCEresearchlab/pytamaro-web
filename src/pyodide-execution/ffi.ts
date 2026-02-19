import CanvasKitInit from '../canvaskit-wasm/canvaskit';
import type {
  Canvas,
  CanvasKit,
  Typeface,
} from '../canvaskit-wasm/canvaskit.d.ts';
import { computeBoundsAndPin } from './graphic/bounds.ts';
import { addDebugInfo } from './graphic/debug.ts';
import { drawWithSuperSampling } from './graphic/drawWithSuperSampling.ts';
import { loadTypeFaces } from './graphic/fonts.ts';
import { renderOnCanvas } from './graphic/rendering.ts';
import { freeStack, specsToCommands } from './graphic/specsToCommands.ts';
import { canvasKitAssetUrl } from './graphic/utils.ts';
import { GraphicSpec, Sized } from './spec';

async function draw(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  specs: GraphicSpec[],
  scalingFactor: number,
  debug: boolean,
): Promise<string> {
  const instructions = specsToCommands(ck, typefaces, specs);
  const { bounds, pinPosition } = computeBoundsAndPin(instructions);
  const rawWidth = Math.abs(bounds[0] - bounds[2]);
  const rawHeight = Math.abs(bounds[1] - bounds[3]);

  // Extra space added for the debug visualization
  const extraSpace = debug ? Math.min(rawWidth, rawHeight, 10) / 2 : 0;

  const actualWidth = Math.round(rawWidth + extraSpace * 2);
  const actualHeight = Math.round(rawHeight + extraSpace * 2);

  const imageBlob = await drawWithSuperSampling(
    ck,
    actualWidth,
    actualHeight,
    scalingFactor,
    (ckCanvas: Canvas) => {
      // Align the graphic to the top-left of the canvas
      ckCanvas.translate(extraSpace - bounds[0], extraSpace - bounds[1]);
      // Draw the graphic (this consumes the instructions)
      renderOnCanvas(ckCanvas, instructions);
      // Optionally draw debug info
      if (debug) {
        addDebugInfo(ck, bounds, pinPosition, ckCanvas, extraSpace);
      }
    },
  );

  return new Promise<string>((resolve) => {
    // Extract as base64 PNG data URL
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Result = reader.result as string;
      resolve(base64Result);
    };
    reader.readAsDataURL(imageBlob);
  });
}

function sizeWhenRendered(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  specs: GraphicSpec[],
): Sized {
  if (!ck) {
    throw new Error('Worker not initialized yet');
  }

  const instructions = specsToCommands(ck, typefaces, specs);
  const { bounds } = computeBoundsAndPin(instructions);
  freeStack(instructions);

  return {
    width: Math.abs(bounds[0] - bounds[2]),
    height: Math.abs(bounds[1] - bounds[3]),
  };
}

export type PyTamaroFFI = {
  draw: (
    specs: GraphicSpec[],
    scaling_factor: number,
    debug: boolean,
  ) => Promise<string>;
  sizeWhenRendered: (specs: GraphicSpec[]) => Sized;
};

export default async function initFfi(): Promise<PyTamaroFFI> {
  const ck = await CanvasKitInit({
    locateFile: canvasKitAssetUrl,
  });
  const typefaces = await loadTypeFaces(ck);

  return {
    draw: (specs: GraphicSpec[], scaling_factor: number, debug: boolean) =>
      draw(ck, typefaces, specs, scaling_factor, debug),
    sizeWhenRendered: (specs: GraphicSpec[]) =>
      sizeWhenRendered(ck, typefaces, specs),
  };
}
