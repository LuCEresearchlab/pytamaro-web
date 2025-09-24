/* !!! Integration notes !!!
 * unwrapProxy fn should be used outside of interaction too.
 * Create a canvas for each show_graphic, show_animate and interact invocation
 */
import CanvasKitInit, { CanvasKit, FontMgr } from 'canvaskit-wasm';
import type { PyodideAPI } from 'pyodide';
import type { PyProxy, PythonError } from 'pyodide/ffi';
import { fromSpec } from './graphics';
import { GraphicSpec, Sized } from './spec';

function assetUrl(path: string): string {
  return `${location.origin}/pyodide/${path}`;
}

export class TamaroJs {
  private readonly stillPyProxies: PyProxy[];
  private readonly pyodide: PyodideAPI;
  private readonly ck: CanvasKit;
  private readonly fontMgr: FontMgr;
  private readonly canvas: OffscreenCanvas;

  private constructor(
    pyodide: PyodideAPI,
    ck: CanvasKit,
    fontMgr: FontMgr,
    canvas: OffscreenCanvas,
  ) {
    this.stillPyProxies = [];
    this.pyodide = pyodide;
    this.ck = ck;
    this.fontMgr = fontMgr;
    this.canvas = canvas;

    this.installPytamaroFfi();
  }

  static async init(
    pyodide: PyodideAPI,
    canvas: OffscreenCanvas,
  ): Promise<TamaroJs> {
    // const pyodide = await globalThis.loadPyodide({
    //   indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.28.3/full/',
    // });
    // // Install PyTamaro
    await pyodide.loadPackage('micropip');
    const microPip = pyodide.pyimport('micropip');
    await microPip.install(
      assetUrl('pytamaro_headless-0.7.3-py3-none-any.whl'),
    );

    // CanvasKit
    const ck: CanvasKit = await CanvasKitInit({
      locateFile: (file: string): string =>
        `https://unpkg.com/canvaskit-wasm@0.40.0/bin/${file}`,
    });
    const fontMgr = await TamaroJs.loadFontMgr(ck);
    return new TamaroJs(pyodide, ck, fontMgr, canvas);
  }

  async run(code: string) {
    this.destroy();

    // Create new empty namespace
    const ns = this.pyodide.toPy({});
    let stdout = '';
    let stderr = '';
    const decoder = new TextDecoder('utf-8');
    this.pyodide.setStdout({
      write: (buf) => {
        stdout += decoder.decode(buf);
        return buf.length;
      },
    });
    this.pyodide.setStderr({
      write: (buf) => {
        stderr += decoder.decode(buf);
        return buf.length;
      },
    });
    try {
      await this.pyodide.runPythonAsync(code, { globals: ns });
      return {
        type: 'result',
        result: {
          type: 'success',
          stdout,
          stderr,
        },
      };
    } catch (err) {
      const pythonError = err as PythonError;
      stderr += pythonError.type;
      return {
        type: 'result',
        result: {
          type: 'error',
          stdout,
          stderr,
        },
      };
    } finally {
      // Cleanup execution-specific namespace
      ns.destroy();
    }
  }

  destroy() {
    while (this.stillPyProxies.length > 0) {
      this.stillPyProxies.pop()?.destroy();
    }
  }

  private installPytamaroFfi(): void {
    this.pyodide.registerJsModule('pytamaro_renderer', {
      render_image: (graphic: GraphicSpec, debug: boolean) =>
        this.draw(this.unProxy<GraphicSpec>(() => graphic)(), debug),
      render_animation: () => {},
      run_interact: () => {},
      rendered_height: (graphic: GraphicSpec) =>
        this.renderedSize(this.unProxy<GraphicSpec>(() => graphic)()).height,
      rendered_width: (graphic: GraphicSpec) =>
        this.renderedSize(this.unProxy<GraphicSpec>(() => graphic)()).width,
    });
  }

  private async draw(spec: GraphicSpec, debug: boolean): Promise<string> {
    const graphic = fromSpec(this.ck, this.fontMgr, spec);
    // Debug
    let debugPaint = undefined;
    if (debug) {
      debugPaint = new this.ck.Paint();
      debugPaint.setAntiAlias(true);
      debugPaint.setStrokeWidth(5);
      debugPaint.setStyle(this.ck.PaintStyle.Stroke);
    }

    // Need to set the size before the CK surface is initialized
    this.canvas.width = graphic.size.width;
    this.canvas.height = graphic.size.height;

    const surface = this.ck.MakeSWCanvasSurface(this.canvas);
    surface?.drawOnce((ckCanvas) => {
      // ckCanvas.clear(this.ck.TRANSPARENT);
      // Align the graphic to the top-left of the canvas
      ckCanvas.translate(
        -Math.min(graphic.bounds[0], 0),
        -Math.min(graphic.bounds[1], 0),
      );
      graphic.draw(ckCanvas, debugPaint);
      // Immediately destroy the graphic object
      graphic.destroy();
    });
    return new Promise<string>((resolve) => {
      requestAnimationFrame(() => {
        this.canvas.convertToBlob().then((b) => {
          const reader = new FileReader();
          reader.readAsDataURL(b);
          reader.onloadend = async () => {
            const base64_result = reader.result as string;
            resolve(base64_result);
          };
        });
      });
    });
  }

  private renderedSize(spec: GraphicSpec): Sized {
    const graphic = fromSpec(this.ck, this.fontMgr, spec);
    const size = { ...graphic.size };
    graphic.destroy();
    return size;
  }

  /**
   * Unwrap the result of a given function from pyodide FFI proxy to a plain
   * JS object.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private unProxy<T>(fn: (...args: any) => any): (...args: any) => T {
    const pyproxies = this.stillPyProxies;
    return function (...args) {
      const result = fn(...args);
      if (typeof result === 'object' && typeof result.toJs === 'function') {
        return result.toJs({
          pyproxies,
          dict_converter: Object.fromEntries,
        });
      } else {
        return result;
      }
    };
  }

  private static async loadFontMgr(ck: CanvasKit): Promise<FontMgr> {
    const fonts = await Promise.all(
      ['NotoSerif', 'NotoSansMono', 'NotoSans'].map((f) =>
        fetch(assetUrl(`font/${f}-Regular.ttf`)).then((res) =>
          res.arrayBuffer(),
        ),
      ),
    );
    return ck.FontMgr.FromData(...fonts)!;
  }
}
