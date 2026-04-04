import type { Canvas, CanvasKit, Image } from '../../canvaskit-wasm/canvaskit';
import { disposeOfEmBindObject, disposeOfSurface } from './memory';

export async function drawWithSuperSampling(
  ck: CanvasKit,
  width: number,
  height: number,
  scalingFactor: number,
  drawImage: (ckCanvas: Canvas) => void,
): Promise<Blob> {
  // Track all wasm objects using this disposable stack so that we will be
  // able to deallocate the memory automatically once we exit from this method,
  // even in case of crashes
  using ds = new DisposableStack();

  // We to set the size before the CK surface is initialized.
  // We use the superCanvas as a super-sampled canvas...
  // [continued before declaration of baseCanvas]
  const superCanvas = new OffscreenCanvas(
    width * scalingFactor,
    height * scalingFactor,
  );
  // Create a surface for the super-sampled canvas.
  // We want a *premultiplied* surface to avoid artifacts when downsampling
  // (see https://groups.google.com/g/skia-discuss/c/dA_zsIr_1aE/m/A7tuwGeCAwAJ).
  // Unfortunately, CanvasKit does not expose an API to directly create a
  // SWCanvasSurface with premultiplied alpha,
  // so we create a disposable one just to be able to call .makeSurface() with
  // the right options.
  const ckSuperSurface = ds.adopt(
    ck.MakeSWCanvasSurface(superCanvas),
    disposeOfSurface,
  );
  const ckPremulSuperSurface = ds.adopt(
    ckSuperSurface?.makeSurface({
      width: superCanvas.width,
      height: superCanvas.height,
      alphaType: ck.AlphaType.Premul,
      colorSpace: ck.ColorSpace.SRGB,
      colorType: ck.ColorType.RGBA_8888,
    }),
    disposeOfSurface,
  );
  // (We won't use the *un*-premultiplied surface, so we can delete it
  // immediately since it's potentially expensive to keep it unused in memory.)
  ckSuperSurface?.dispose();

  // [continues from declaration of superCanvas]
  // ...and then we scale down to the wanted size to perform
  // anti-aliasing (SSAA).
  const baseCanvas = new OffscreenCanvas(width, height);
  const ckBaseSurface = ds.adopt(
    ck.MakeSWCanvasSurface(baseCanvas),
    disposeOfSurface,
  );

  if (!ckPremulSuperSurface || !ckBaseSurface) {
    throw new Error('Could not create CanvasKit surface');
  }

  // Safety: getCanvas() does not move the ownership of the canvas to the caller,
  // so we must not track this object in the disposable stack (otherwise it would cause a double free,
  // because the surface does not check whether its canvas has already been deleted before attempting to do so).
  const ckSuperCanvas = ckPremulSuperSurface.getCanvas();
  ckSuperCanvas.scale(scalingFactor, scalingFactor);
  drawImage(ckSuperCanvas);
  ckPremulSuperSurface.flush();

  // Now take a snapshot of the super-sampled canvas, and draw it scaled
  // down on the base canvas.
  const superSampledImage: Image = ds.adopt(
    ckPremulSuperSurface.makeImageSnapshot(),
    disposeOfEmBindObject,
  );
  const superSampledImageWithMipmaps = ds.adopt(
    superSampledImage.makeCopyWithDefaultMipmaps(),
    disposeOfEmBindObject,
  );
  // Shader to scale down with a linear filter
  const shader = ds.adopt(
    superSampledImageWithMipmaps.makeShaderOptions(
      ck.TileMode.Clamp,
      ck.TileMode.Clamp,
      ck.FilterMode.Linear,
      ck.MipmapMode.Nearest,
      ck.Matrix.scaled(1 / scalingFactor, 1 / scalingFactor),
    ),
    disposeOfEmBindObject,
  );
  const paint = ds.adopt(new ck.Paint(), disposeOfEmBindObject);
  paint.setShader(shader);
  paint.setBlendMode(ck.BlendMode.Src);

  // Safety: getCanvas() does not move the ownership of the canvas to the caller,
  // so we must not track this object in the disposable stack (otherwise it would cause a double free,
  // because the surface does not check whether its canvas has already been deleted before attempting to do so).
  const ckBaseCanvas = ckBaseSurface.getCanvas();
  // Draw downscaled version
  ckBaseCanvas.drawPaint(paint);
  ckBaseSurface.flush();

  return await baseCanvas.convertToBlob();
}
