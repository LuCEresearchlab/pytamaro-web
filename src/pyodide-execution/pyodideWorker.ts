import CanvasKitInit, { CanvasKit, FontMgr } from 'canvaskit-wasm';
import { PyodideAPI } from 'pyodide';
import { PyProxy, PythonError } from 'pyodide/ffi';
import { fromSpec } from './graphics';
import { GraphicSpec, Sized } from './spec';

// The worker listens for messages from the main thread
addEventListener('message', async (event: MessageEvent) => {
  if (event.data?.type === 'init') {
    // Initialize Pyodide with PyTamaro and CanvasKit
    await loadPyodideWithPytamaro();
    await loadCanvasKit();
    installPytamaroFfi();
    self.postMessage({ type: 'ready' });
  } else {
    // Run the provided Python code
    const { source } = event.data;
    self.postMessage(await run(source));
  }
});

const stillPyProxies: PyProxy[] = [];
let pyodide: PyodideAPI | null = null;
let ck: CanvasKit | null = null;
let fontMgr: FontMgr | null = null;
let canvas: OffscreenCanvas | null = null;

async function loadPyodideWithPytamaro() {
  // @ts-expect-error importScripts is available in web workers
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.28.3/full/pyodide.js');
  // @ts-expect-error pyodide is injected by the script above
  const pyodideReadyPromise = loadPyodide();
  pyodide = await pyodideReadyPromise;
  if (!pyodide) {
    throw new Error('Failed to load Pyodide');
  }
  await pyodide.loadPackage('micropip');
  const microPip = pyodide.pyimport('micropip');
  await microPip.install(assetUrl('pytamaro_headless-0.7.3-py3-none-any.whl'));
}

async function loadCanvasKit() {
  ck = await CanvasKitInit({
    locateFile: (file: string): string =>
      `https://unpkg.com/canvaskit-wasm@0.40.0/bin/${file}`,
  });
  canvas = new OffscreenCanvas(1, 1);
  fontMgr = await loadFontMgr(ck);
}

async function run(code: string) {
  destroyLeftoverProxies();

  if (!pyodide) {
    throw new Error('Pyodide not loaded');
  }

  const ns = pyodide.toPy({});
  let stdout = '';
  let stderr = '';
  const decoder = new TextDecoder('utf-8');
  pyodide.setStdout({
    write: (buf) => {
      stdout += decoder.decode(buf);
      return buf.length;
    },
  });
  pyodide.setStderr({
    write: (buf) => {
      stderr += decoder.decode(buf);
      return buf.length;
    },
  });
  try {
    await pyodide.runPythonAsync(code, { globals: ns });
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
    stderr += pythonError;
    return {
      type: 'result',
      result: {
        type: 'error',
        stdout,
        stderr,
      },
    };
  } finally {
    ns.destroy();
  }
}

function assetUrl(path: string): string {
  return `${location.origin}/pyodide/${path}`;
}

async function loadFontMgr(ck: CanvasKit): Promise<FontMgr> {
  const fonts = await Promise.all(
    ['NotoSerif', 'NotoSansMono', 'NotoSans'].map((f) =>
      fetch(assetUrl(`font/${f}-Regular.ttf`)).then((res) => res.arrayBuffer()),
    ),
  );
  return ck.FontMgr.FromData(...fonts)!;
}

function installPytamaroFfi() {
  pyodide?.registerJsModule('pytamaro_renderer', {
    render_image: (graphic: GraphicSpec, debug: boolean) =>
      draw(unProxy<GraphicSpec>(() => graphic)(), debug),
    render_animation: () => {},
    run_interact: () => {},
    rendered_height: (graphic: GraphicSpec) =>
      renderedSize(unProxy<GraphicSpec>(() => graphic)()).height,
    rendered_width: (graphic: GraphicSpec) =>
      renderedSize(unProxy<GraphicSpec>(() => graphic)()).width,
  });
}

async function draw(spec: GraphicSpec, debug: boolean): Promise<string> {
  if (!ck || !fontMgr || !canvas) {
    throw new Error('Worker not initialized yet');
  }
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
  canvas.width = graphic.size.width;
  canvas.height = graphic.size.height;

  const surface = ck.MakeSWCanvasSurface(canvas);
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
      canvas?.convertToBlob().then((b) => {
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

function renderedSize(spec: GraphicSpec): Sized {
  if (!ck || !fontMgr) {
    throw new Error('Worker not initialized yet');
  }
  const graphic = fromSpec(ck, fontMgr, spec);
  const size = { ...graphic.size };
  graphic.destroy();
  return size;
}

/**
 * Unwrap the result of a given function from pyodide FFI proxy to a plain
 * JS object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unProxy<T>(fn: (...args: any) => any): (...args: any) => T {
  const pyproxies = stillPyProxies;
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

function destroyLeftoverProxies() {
  while (stillPyProxies.length > 0) {
    stillPyProxies.pop()?.destroy();
  }
}
