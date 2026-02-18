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
  const superSurface = ck.MakeSWCanvasSurface(superCanvas);

  // ...and then we scale down to the wanted size to perform
  // anti-aliasing (SSAA).
  const baseCanvas = new OffscreenCanvas(width, height);
  const baseSurface = ck.MakeSWCanvasSurface(baseCanvas);

  if (!superSurface || !baseSurface) {
    throw new Error('Could not create CanvasKit surface');
  }

  return new Promise((resolve, reject) => {
    superSurface.drawOnce((ckSuperCanvas) => {
      ckSuperCanvas.scale(scalingFactor, scalingFactor);
      drawImage(ckSuperCanvas);

      // Now take a snapshot of the super-sampled canvas, and draw it scaled
      // down on the base canvas.
      const superSampledImage = superSurface.makeImageSnapshot();
      const superSampledImageWithMipmaps =
        superSampledImage.makeCopyWithDefaultMipmaps();

      baseSurface.drawOnce((ckBaseCanvas) => {
        // Shader to scale down with a linear filter
        const shader = superSampledImageWithMipmaps.makeShaderOptions(
          ck.TileMode.Clamp,
          ck.TileMode.Clamp,
          ck.FilterMode.Linear,
          ck.MipmapMode.Nearest,
          ck.Matrix.scaled(1 / scalingFactor, 1 / scalingFactor),
        );

        // Filter to ensure that the surrounding pixels are "transparent white"
        // instead of "transparent black", which generally improves the look
        // when the graphic is looked on a light background.
        const transparencyFixColorMatrix = [
          1, 0, 0, -1, 1, 0, 1, 0, -1, 1, 0, 0, 1, -1, 1, 0, 0, 0, 1, 0,
        ];
        const filter = ck.ColorFilter.MakeMatrix(transparencyFixColorMatrix);

        const paint = new ck.Paint();
        paint.setShader(shader);
        paint.setBlendMode(ck.BlendMode.Src);
        paint.setColorFilter(filter);

        // Draw downscaled version
        ckBaseCanvas.drawPaint(paint);

        // Cleanup WASM objects
        paint.delete();
        filter.delete();
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
