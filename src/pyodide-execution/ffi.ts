import CanvasKitInit from '../canvaskit-wasm/canvaskit';
import type { CanvasKit, Typeface } from '../canvaskit-wasm/canvaskit.d.ts';
import { FONTS_FILENAME_PREFIX } from './fonts.ts';
import { fromSpec } from './graphics';
import { addDebugInfo } from './graphicsDebug.ts';
import { GraphicSpec, Sized } from './spec';

async function draw(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  canvas: OffscreenCanvas,
  spec: GraphicSpec,
  debug: boolean,
): Promise<string> {
  const graphic = fromSpec(ck, typefaces, spec);
  const extraSpace = debug
    ? Math.min(graphic.size.width, graphic.size.height, 10) / 2
    : 0;

  // Need to set the size before the CK surface is initialized
  // eslint-disable-next-line no-param-reassign
  canvas.width = Math.round(graphic.size.width + extraSpace * 2);
  // eslint-disable-next-line no-param-reassign
  canvas.height = Math.round(graphic.size.height + extraSpace * 2);

  const surface = ck.MakeSWCanvasSurface(canvas);
  surface?.drawOnce((ckCanvas) => {
    // Align the graphic to the top-left of the canvas
    ckCanvas.translate(
      extraSpace - graphic.bounds[0],
      extraSpace - graphic.bounds[1],
    );
    // Draw the graphic
    graphic.draw(ckCanvas);
    if (debug) {
      addDebugInfo(ck, graphic, ckCanvas, extraSpace);
    }

    // Immediately destroy the graphic object
    graphic.destroy();
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
  spec: GraphicSpec,
): Sized {
  if (!ck) {
    throw new Error('Worker not initialized yet');
  }
  const graphic = fromSpec(ck, typefaces, spec);
  const size = { ...graphic.size };
  graphic.destroy();
  return size;
}

function assetUrl(path: string): string {
  return `${location.origin}/canvaskit/${path}`;
}

export type PyTamaroFFI = {
  draw: (specs: GraphicSpec, debug: boolean) => Promise<string>;
  sizeWhenRendered: (specs: GraphicSpec) => Sized;
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
    draw: (specs: GraphicSpec, debug: boolean) =>
      draw(ck, typefaces, canvas, specs, debug),
    sizeWhenRendered: (specs: GraphicSpec) =>
      sizeWhenRendered(ck, typefaces, specs),
  };
}
