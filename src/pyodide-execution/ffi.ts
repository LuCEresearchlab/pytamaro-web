import CanvasKitInit from '../canvaskit-wasm/canvaskit';
import type { CanvasKit, Typeface } from '../canvaskit-wasm/canvaskit.d.ts';
import { FONTS_FILENAME_PREFIX } from './fonts.ts';
import { computeBoundsAndPin } from './graphic/bounds.ts';
import { addDebugInfo } from './graphic/debug.ts';
import { renderOnCanvas } from './graphic/rendering.ts';
import { freeStack, processSpecs } from './graphic/specs_processing.ts';
import { GraphicSpec, Sized } from './spec';

async function draw(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  canvas: OffscreenCanvas,
  specs: GraphicSpec[],
  debug: boolean,
): Promise<string> {
  const instructions = processSpecs(ck, typefaces, specs, true);

  const { bounds, pinPosition } = computeBoundsAndPin(instructions);
  const size = {
    width: Math.abs(bounds[0] - bounds[2]),
    height: Math.abs(bounds[1] - bounds[3]),
  };

  const extraSpace = debug ? Math.min(size.width, size.height, 10) / 2 : 0;

  // Need to set the size before the CK surface is initialized
  // eslint-disable-next-line no-param-reassign
  canvas.width = Math.round(size.width + extraSpace * 2);
  // eslint-disable-next-line no-param-reassign
  canvas.height = Math.round(size.height + extraSpace * 2);

  const surface = ck.MakeSWCanvasSurface(canvas);
  surface?.drawOnce((ckCanvas) => {
    // Align the graphic to the top-left of the canvas
    ckCanvas.translate(extraSpace - bounds[0], extraSpace - bounds[1]);
    // Draw the graphic (this consumes the instructions)
    renderOnCanvas(ckCanvas, instructions);
    // Optionally draw debug info
    if (debug) {
      addDebugInfo(ck, bounds, pinPosition, ckCanvas, extraSpace);
    }
  });

  return new Promise<string>((resolve) => {
    requestAnimationFrame(() => {
      canvas?.convertToBlob().then((blob) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64_result = reader.result as string;
          resolve(base64_result);
        };
        reader.readAsDataURL(blob);
      });
    });
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
  const instructions = processSpecs(ck, typefaces, specs);
  const { bounds } = computeBoundsAndPin(instructions);
  freeStack(instructions);

  return {
    width: Math.abs(bounds[0] - bounds[2]),
    height: Math.abs(bounds[1] - bounds[3]),
  };
}

function assetUrl(path: string): string {
  return `${location.origin}/canvaskit/${path}`;
}

export type PyTamaroFFI = {
  draw: (specs: GraphicSpec[], debug: boolean) => Promise<string>;
  sizeWhenRendered: (specs: GraphicSpec[]) => Sized;
};

export default async function initFfi(): Promise<PyTamaroFFI> {
  const ck = await CanvasKitInit({
    locateFile: assetUrl,
  });
  const typefaces: Map<string, Typeface> = new Map();
  for (const name of FONTS_FILENAME_PREFIX) {
    const typeface = ck.Typeface.MakeTypefaceFromData(
      await fetch(assetUrl(`fonts/${name}-Regular.ttf`)).then((res) =>
        res.arrayBuffer(),
      ),
    );
    if (typeface != null) {
      typefaces.set(typeface.getFamilyName(), typeface);
    }
  }
  const canvas = new OffscreenCanvas(1, 1);

  return {
    draw: (specs: GraphicSpec[], debug: boolean) =>
      draw(ck, typefaces, canvas, specs, debug),
    sizeWhenRendered: (specs: GraphicSpec[]) =>
      sizeWhenRendered(ck, typefaces, specs),
  };
}
