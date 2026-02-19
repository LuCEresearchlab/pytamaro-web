import type { Canvas, CanvasKit } from '../../canvaskit-wasm/canvaskit';

export async function drawWithSuperSampling(
  ck: CanvasKit,
  width: number,
  height: number,
  scalingFactor: number,
  drawImage: (ckCanvas: Canvas) => void,
): Promise<Blob> {
  // We to set the size before the CK surface is initialized.
  // We use the superCanvas as a super-sampled canvas...
  const superCanvas = new OffscreenCanvas(
    width * scalingFactor,
    height * scalingFactor,
  );
  // Create a surface for the super-sampled canvas.
  // We want a *premultiplied* surface to avoid artifacts when downsampling
  // (see https://groups.google.com/g/skia-discuss/c/dA_zsIr_1aE/m/A7tuwGeCAwAJ).
  // Unfortunately, CanvasKit does not expose an API to directly create a SWCanvasSurface with premultiplied alpha,
  // so we create a disposable one just to be able to call .makeSurface() with the right options.
  const ckSuperSurface = ck.MakeSWCanvasSurface(superCanvas);
  const ckPremulSuperSurface = ckSuperSurface?.makeSurface({
    width: superCanvas.width,
    height: superCanvas.height,
    alphaType: ck.AlphaType.Premul,
    colorSpace: ck.ColorSpace.SRGB,
    colorType: ck.ColorType.RGBA_8888,
  });
  // (We won't use the *un*-premultiplied surface, so we can delete it immediately.)
  ckSuperSurface?.delete();

  // ...and then we scale down to the wanted size to perform
  // anti-aliasing (SSAA).
  const baseCanvas = new OffscreenCanvas(width, height);
  const ckBaseSurface = ck.MakeSWCanvasSurface(baseCanvas);

  if (!ckPremulSuperSurface || !ckBaseSurface) {
    throw new Error('Could not create CanvasKit surface');
  }

  return new Promise((resolve, reject) => {
    ckPremulSuperSurface.drawOnce((ckSuperCanvas) => {
      ckSuperCanvas.scale(scalingFactor, scalingFactor);
      drawImage(ckSuperCanvas);

      // Now take a snapshot of the super-sampled canvas, and draw it scaled
      // down on the base canvas.
      const superSampledImage = ckPremulSuperSurface.makeImageSnapshot();
      const superSampledImageWithMipmaps =
        superSampledImage.makeCopyWithDefaultMipmaps();

      ckBaseSurface.drawOnce((ckBaseCanvas) => {
        // Shader to scale down with a linear filter
        const shader = superSampledImageWithMipmaps.makeShaderOptions(
          ck.TileMode.Clamp,
          ck.TileMode.Clamp,
          ck.FilterMode.Linear,
          ck.MipmapMode.Nearest,
          ck.Matrix.scaled(1 / scalingFactor, 1 / scalingFactor),
        );

        const paint = new ck.Paint();
        paint.setShader(shader);
        paint.setBlendMode(ck.BlendMode.Src);

        // Draw downscaled version
        ckBaseCanvas.drawPaint(paint);

        // Cleanup WASM objects
        paint.delete();
        shader.delete();
        superSampledImageWithMipmaps.delete();
        superSampledImage.delete();
      });
    });

    // Double requestAnimationFrame because there are two canvases to be drawn
    // (the super-sampled one, and the base one).
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        baseCanvas?.convertToBlob().then(resolve).catch(reject);
      }),
    );
  });
}
