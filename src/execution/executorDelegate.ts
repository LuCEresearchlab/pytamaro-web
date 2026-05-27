import CanvasKitInit, {
  Canvas,
  CanvasKit,
  Typeface,
} from '../canvaskit-wasm/canvaskit';
import { addDebugInfo } from './graphics/debug';
import { loadTypeFaces } from './graphics/fonts';
import { renderOnCanvas } from './graphics/rendering';
import { Sized } from './graphics/spec';
import { specsToInstructions } from './graphics/specsToInstructions';
import { drawWithSuperSampling } from './graphics/superSampling';
import { canvasKitAssetUrl, computeBoundsAndPin } from './graphics/utils';
import {
  DrawRequestData,
  DrawSvgRequestData,
  SaveRequestData,
  SizeRequestData,
} from './messageTypes';

export class ExecutorDelegate {
  private readonly ck: CanvasKit;
  private readonly typefaces: Map<string, Typeface>;

  static async init(): Promise<ExecutorDelegate> {
    const ck = await CanvasKitInit({
      locateFile: canvasKitAssetUrl,
    });
    const typefaces = await loadTypeFaces(ck);
    return new ExecutorDelegate(ck, typefaces);
  }

  private constructor(ck: CanvasKit, typefaces: Map<string, Typeface>) {
    this.ck = ck;
    this.typefaces = typefaces;
  }

  private async drawGraphic(
    data: DrawRequestData | DrawSvgRequestData,
    drawOnCanvas: (
      width: number,
      height: number,
      drawImage: (canvas: Canvas) => void,
    ) => Promise<string> | string,
  ): Promise<string> {
    // Use a disposable stack to make sure all wasm objects are properly
    // deallocated once we exit from this method (regardless of whether the code
    // crashed or succeeded).
    using disposableStack = new DisposableStack();
    const instructions = specsToInstructions(
      this.ck,
      this.typefaces,
      disposableStack,
      data.specs,
    );
    const { bounds, pinPosition } = computeBoundsAndPin(instructions);
    const rawWidth = Math.abs(bounds[0] - bounds[2]);
    const rawHeight = Math.abs(bounds[1] - bounds[3]);

    // Extra space added for the debug visualization
    const extraSpace = data.debug ? Math.min(rawWidth, rawHeight, 10) / 2 : 0;

    const renderedWidth = Math.round(rawWidth + extraSpace * 2);
    const renderedHeight = Math.round(rawHeight + extraSpace * 2);

    const drawImage = (canvas: Canvas) => {
      // Align the graphic to the top-left of the canvas
      canvas.translate(extraSpace - bounds[0], extraSpace - bounds[1]);
      // Draw the graphic (this consumes the instructions)
      renderOnCanvas(canvas, instructions);
      // Optionally draw debug info
      if (data.debug) {
        addDebugInfo(this.ck, bounds, pinPosition, canvas, extraSpace);
      }
    };

    return await drawOnCanvas(renderedWidth, renderedHeight, drawImage);
  }

  async drawRasterGraphic(data: DrawRequestData): Promise<string> {
    return this.drawGraphic(
      data,
      async (renderedWidth, renderedHeight, drawImage) => {
        const imageBlob = await drawWithSuperSampling(
          this.ck,
          renderedWidth,
          renderedHeight,
          data.scalingFactor,
          drawImage,
        );
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageBlob);
        });
      },
    );
  }

  async drawSvgGraphic(data: DrawSvgRequestData): Promise<string> {
    return this.drawGraphic(data, (width, height, drawImage) => {
      const svgCanvas = new this.ck.SimpleSVGCanvas();
      try {
        const canvas = svgCanvas.beginDrawing(width, height);
        drawImage(canvas);
        return svgCanvas.endDrawing();
      } finally {
        svgCanvas.delete();
      }
    });
  }

  sizeOfGraphic(data: SizeRequestData): Sized {
    // Use a disposable stack to make sure all wasm objects are properly
    // deallocated once we exit from this method (regardless of whether the code
    // crashed or succeeded).
    using disposableStack = new DisposableStack();
    const instructions = specsToInstructions(
      this.ck,
      this.typefaces,
      disposableStack,
      data.specs,
    );
    const { bounds } = computeBoundsAndPin(instructions);

    return {
      width: Math.abs(bounds[0] - bounds[2]),
      height: Math.abs(bounds[1] - bounds[3]),
    };
  }

  async saveAsFile(data: SaveRequestData): Promise<void> {
    return fetch(data.contentUri)
      .then((res: Response) => res.blob())
      .then(URL.createObjectURL)
      .then((blobUrl: string) => {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = data.fileName;
        a.style.display = 'none';
        document.body.append(a);
        return new Promise((resolve) => {
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            a.remove();
          }, 1000);
          // Need to wrap into a setTimeout for Safari
          // Monaco has a global "click" listener that somehow utilizes the
          // navigator.clipboard API, which is known to be quirky in Safari.
          // The best known workaround seems to be wrapping the invocation of
          // whatever code calls navigator.clipboard into a setTimeout
          setTimeout(() => {
            a.click();
            resolve();
          }, 0);
        });
      });
  }
}
