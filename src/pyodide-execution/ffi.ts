import CanvasKitInit from '../canvaskit-wasm/canvaskit';
import type { CanvasKit, Typeface } from '../canvaskit-wasm/canvaskit.d.ts';
import { FONTS_FILENAME_PREFIX } from './fonts.ts';
import { computeBoundsAndPin } from './graphic/bounds.ts';
import { addDebugInfo } from './graphic/debug.ts';
import { renderOnCanvas } from './graphic/rendering.ts';
import { freeStack, specsToCommands } from './graphic/specs_to_commands.ts';
import { GraphicSpec, Sized } from './spec';

async function draw(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  canvas: OffscreenCanvas,
  specs: GraphicSpec[],
  scaling_factor: number,
  debug: boolean,
): Promise<string> {
  const instructions = specsToCommands(ck, typefaces, specs, true);
  const { bounds, pinPosition } = computeBoundsAndPin(instructions);
  const size = {
    width: Math.abs(bounds[0] - bounds[2]),
    height: Math.abs(bounds[1] - bounds[3]),
  };

  const extraSpace = debug ? Math.min(size.width, size.height, 10) / 2 : 0;

  const surfaceWidth = Math.round(size.width + extraSpace * 2);
  const surfaceHeight = Math.round(size.height + extraSpace * 2);

  // We to set the size before the CK surface is initialized.
  // We use the canvas as a super-sampled canvas,
  // and then we scale down to the wanted size to perform anti-aliasing (SSAA).
  const superSampledCanvas = canvas;
  superSampledCanvas.width = surfaceWidth * scaling_factor;
  superSampledCanvas.height = surfaceHeight * scaling_factor;

  const resizedCanvas = new OffscreenCanvas(surfaceWidth, surfaceHeight);

  const surface = ck.MakeSWCanvasSurface(canvas);
  const resizedSurface = ck.MakeSWCanvasSurface(resizedCanvas);
  if (!surface || !resizedSurface) {
    throw new Error('Could not create CanvasKit surface');
  }

  surface.drawOnce((ckCanvas) => {
    ckCanvas.scale(scaling_factor, scaling_factor);
    // Align the graphic to the top-left of the canvas
    ckCanvas.translate(extraSpace - bounds[0], extraSpace - bounds[1]);
    // Draw the graphic (this consumes the instructions)
    renderOnCanvas(ckCanvas, instructions);
    // Optionally draw debug info
    if (debug) {
      addDebugInfo(ck, bounds, pinPosition, ckCanvas, extraSpace);
    }
    // Now take a snapshot of the super-sampled canvas, and draw it scaled down on the resized canvas.
    const superSampledImage = surface.makeImageSnapshot();
    const superSampledImageWithMipmaps =
      superSampledImage.makeCopyWithDefaultMipmaps();
    resizedSurface.drawOnce((resizedCkCanvas) => {
      // Shader to scale down with a linear filter
      const shader = superSampledImageWithMipmaps.makeShaderOptions(
        ck.TileMode.Clamp,
        ck.TileMode.Clamp,
        ck.FilterMode.Linear,
        ck.MipmapMode.Nearest,
        ck.Matrix.scaled(1 / scaling_factor, 1 / scaling_factor),
      );
      const paint = new ck.Paint();
      paint.setBlendMode(ck.BlendMode.Src);
      paint.setShader(shader);
      // Filter to ensure that the surrounding pixels are "transparent white" instead of "transparent black",
      // which generally improves the look when the graphic is looked on a light background.
      const colorMatrix = [
        1, 0, 0, -1, 1, 0, 1, 0, -1, 1, 0, 0, 1, -1, 1, 0, 0, 0, 1, 0,
      ];
      const filter = ck.ColorFilter.MakeMatrix(colorMatrix);
      paint.setColorFilter(filter);
      resizedCkCanvas.drawPaint(paint);
      // Cleanup
      paint.delete();
      shader.delete();
      filter.delete();
      superSampledImage.delete();
      superSampledImageWithMipmaps.delete();
    });
  });
  return new Promise<string>((resolve) => {
    // Double requestAnimationFrame because there are two canvases to be drawn (the super-sampled one, and the resized one).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Extract as base64 PNG data URL
        resizedCanvas?.convertToBlob().then((blob) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64_result = reader.result as string;
            resolve(base64_result);
          };
          reader.readAsDataURL(blob);
        });
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
  const instructions = specsToCommands(ck, typefaces, specs);
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
  draw: (
    specs: GraphicSpec[],
    scaling_factor: number,
    debug: boolean,
  ) => Promise<string>;
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
    draw: (specs: GraphicSpec[], scaling_factor: number, debug: boolean) =>
      draw(ck, typefaces, canvas, specs, scaling_factor, debug),
    sizeWhenRendered: (specs: GraphicSpec[]) =>
      sizeWhenRendered(ck, typefaces, specs),
  };
}
