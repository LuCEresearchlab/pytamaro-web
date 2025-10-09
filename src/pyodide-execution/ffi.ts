import CanvasKitInit from '../canvaskit-wasm/canvaskit';
import type { CanvasKit, FontMgr } from '../canvaskit-wasm/canvaskit.d.ts';
import { fromSpec } from './graphics';
import { GraphicSpec, Sized } from './spec';

async function draw(
  ck: CanvasKit,
  fontMgr: FontMgr,
  canvas: OffscreenCanvas,
  spec: GraphicSpec,
  debug: boolean,
): Promise<string> {
  const graphic = fromSpec(ck, fontMgr, spec);

  // Debug
  let debugPaint = undefined;
  if (debug) {
    debugPaint = new ck.Paint();
    debugPaint.setAntiAlias(true);
    debugPaint.setStrokeWidth(5);
    debugPaint.setStyle(ck.PaintStyle.Stroke);
  }

  // Need to set the size before the CK surface is initialized
  // eslint-disable-next-line no-param-reassign
  canvas.width = graphic.size.width;
  // eslint-disable-next-line no-param-reassign
  canvas.height = graphic.size.height;

  const surface = ck.MakeSWCanvasSurface(canvas);
  surface?.drawOnce((ckCanvas) => {
    // ckCanvas.clear(this.ck.TRANSPARENT);
    // Align the graphic to the top-left of the canvas
    ckCanvas.translate(-graphic.bounds[0], -Math.min(graphic.bounds[1], 0));
    graphic.draw(ckCanvas, debugPaint);
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
  fontMgr: FontMgr,
  spec: GraphicSpec,
): Sized {
  if (!ck || !fontMgr) {
    throw new Error('Worker not initialized yet');
  }
  const graphic = fromSpec(ck, fontMgr, spec);
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
  const fontMgr = ck.FontMgr.FromData(
    ...(await Promise.all(
      ['NotoSerif', 'NotoSansMono', 'NotoSans'].map((f) =>
        fetch(assetUrl(`font/${f}-Regular.ttf`)).then((res) =>
          res.arrayBuffer(),
        ),
      ),
    )),
  )!;
  const canvas = new OffscreenCanvas(1, 1);

  return {
    draw: (specs: GraphicSpec, debug: boolean) =>
      draw(ck, fontMgr, canvas, specs, debug),
    sizeWhenRendered: (specs: GraphicSpec) =>
      sizeWhenRendered(ck, fontMgr, specs),
  };
}
