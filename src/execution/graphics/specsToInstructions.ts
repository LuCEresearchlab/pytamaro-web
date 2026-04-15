import type {
  CanvasKit,
  Color,
  EmbindObject,
  Font,
  Paint,
  Path,
  Rect,
  Typeface,
} from '../../canvaskit-wasm/canvaskit';
import {
  extractBegin,
  extractEnd,
  extractGraphicInstructions,
  RenderInstruction,
  RenderInstructionType,
} from './instructions.ts';
import { disposeOfEmBindObject } from './memory.ts';
import {
  CircularSectorSpec,
  ComposeSpec,
  EllipseSpec,
  EncodedColor,
  EncodedPoint,
  GraphicSpec,
  PinSpec,
  Point,
  RectangleSpec,
  RotateSpec,
  TextSpec,
  TriangleSpec,
} from './spec.ts';
import { Stack } from './stack.ts';

type CkFactory = {
  font: (fontName: string, size: number) => Font;
  glyphPath: (font: Font, glyphID: number) => Path | null;
  paint: () => Paint;
  path: () => Path;
};

/* **** Utils **** */

function clampUint8Bit(n: number): number {
  return Math.round(Math.max(0, Math.min(n, 255)));
}

/**
 * Scalar dot product between two array of numbers.
 *
 * Note: a and b need to have equal length
 */
function dotProduct(a: number[], b: number[]) {
  const n = Math.min(a.length, b.length);
  let acc = 0;
  for (let i = 0; i < n; i++) {
    acc += a[i] * b[i];
  }
  return acc;
}

/**
 * Return a matrix representing a rotation by n radians.
 *
 * px, py define say which point the rotation should be around.
 */
function rotatedMatrix(radians: number, px: number, py: number): number[] {
  const sinV = Math.sin(radians);
  const cosV = Math.cos(radians);
  return [
    cosV,
    -sinV,
    dotProduct([sinV, 1 - cosV], [py, px]),
    sinV,
    cosV,
    dotProduct([-sinV, 1 - cosV], [px, py]),
    0,
    0,
    1,
  ];
}

const DECODING_VIEW = new DataView(new ArrayBuffer(8));

function decodeColor(colorValueFromSpec: EncodedColor): Color {
  // ARGB format
  DECODING_VIEW.setBigUint64(
    0,
    typeof colorValueFromSpec === 'number'
      ? BigInt(colorValueFromSpec)
      : colorValueFromSpec,
    false /* big endian */,
  );
  // We're only using 4 bytes of the 8 bytes in the dataview.
  // Our result starts from byte offset 4.
  const alpha = DECODING_VIEW.getUint8(4);
  const red = DECODING_VIEW.getUint8(5);
  const green = DECODING_VIEW.getUint8(6);
  const blue = DECODING_VIEW.getUint8(7);

  return Float32Array.of(
    clampUint8Bit(red) / 255,
    clampUint8Bit(green) / 255,
    clampUint8Bit(blue) / 255,
    alpha / 255,
  );
}

function decodePoint(pointValueFromSpec: EncodedPoint): Point {
  // 32-bit per coordinate, first x, then y.
  // Each coordinate is a float in the range -1..1, encoded as an unsigned int.
  DECODING_VIEW.setBigUint64(
    0,
    typeof pointValueFromSpec === 'number'
      ? BigInt(pointValueFromSpec)
      : pointValueFromSpec,
    false /* big endian */,
  );
  const x = DECODING_VIEW.getFloat32(0, false /* big endian */);
  const y = DECODING_VIEW.getFloat32(4, false /* big endian */);
  return { x, y };
}

/**
 * Convert (pin) point from relative (-1..1) to absolute coordinates.
 */
function relToAbsPoint(relPoint: EncodedPoint, bounds: Rect): Point {
  const { x: relX, y: relY } = decodePoint(relPoint);
  const absX =
    relX === -1
      ? bounds[0]
      : relX === 0
        ? (bounds[0] + bounds[2]) / 2
        : relX === 1
          ? bounds[2]
          : null;
  const absY =
    relY === -1
      ? bounds[3]
      : relY === 0
        ? (bounds[3] + bounds[1]) / 2
        : relY === 1
          ? bounds[1]
          : null;
  if (absX === null || absY === null) {
    throw new Error(`Invalid point ${relPoint}`);
  }
  return { x: absX, y: absY };
}

/* **** Specs Processing **** */

function addInstructionsForEmpty(
  ckFactory: CkFactory,
  stack: Stack<RenderInstruction>,
) {
  const emptyPath = ckFactory.path();
  stack.pushInOrder([
    {
      type: RenderInstructionType.BEGIN,
      path: emptyPath,
      pinPosition: { x: 0, y: 0 },
      bounds: new Float32Array([0, 0, 0, 0]),
    },
    { type: RenderInstructionType.END },
  ]);
}

function addInstructionsForPrimitive(
  ckFactory: CkFactory,
  stack: Stack<RenderInstruction>,
  path: Path,
  color: EncodedColor,
  pinPoint?: Point,
) {
  const decodedColor = decodeColor(color);
  const bounds = path.computeTightBounds();
  const pinPosition = pinPoint || {
    x: Math.abs(bounds[0] - bounds[2]) / 2,
    y: Math.abs(bounds[1] - bounds[3]) / 2,
  };
  // Optimization: do not emit a DRAW instruction for fully transparent primitives.
  // They do not affect the final graphic, but are rather common in PyTamaro code to simulate relative positioning.
  // We still need to compute the path to determine the bounds and pin position.
  if (decodedColor[3] === 0) {
    stack.pushInOrder([
      { type: RenderInstructionType.BEGIN, path, pinPosition, bounds },
      // `path` would be deallocated automatically after a DRAW instruction,
      // but since we're skipping that, we need to manually mark it for deletion.
      { type: RenderInstructionType.END },
    ]);
  } else {
    const paint = ckFactory.paint();
    paint.setColor(decodedColor);
    stack.pushInOrder([
      { type: RenderInstructionType.BEGIN, path, pinPosition, bounds },
      { type: RenderInstructionType.DRAW, path, paint },
      { type: RenderInstructionType.END },
    ]);
  }
}

function addInstructionsForRectangle(
  ckFactory: CkFactory,
  stack: Stack<RenderInstruction>,
  spec: RectangleSpec,
) {
  const rect: Rect = Float32Array.of(0, 0, spec.width, spec.height);
  const path: Path = ckFactory.path().addRect(rect);
  addInstructionsForPrimitive(ckFactory, stack, path, spec.color);
}

function addInstructionsForEllipse(
  ckFactory: CkFactory,
  stack: Stack<RenderInstruction>,
  spec: EllipseSpec,
) {
  const rect: Rect = Float32Array.of(0, 0, spec.width, spec.height);
  const path: Path = ckFactory.path().addOval(rect);
  addInstructionsForPrimitive(ckFactory, stack, path, spec.color);
}

function addInstructionsForCircularSector(
  ckFactory: CkFactory,
  stack: Stack<RenderInstruction>,
  spec: CircularSectorSpec,
) {
  const radius = spec.radius;
  const diameter = radius * 2;
  const rect: Rect = Float32Array.of(0, 0, diameter, diameter);
  const path: Path =
    spec.angle == 360
      ? ckFactory.path().addOval(rect)
      : ckFactory
          .path()
          .moveTo(radius, radius)
          .arcToOval(rect, 0, -spec.angle, false)
          .close();

  const pinPoint: Point = { x: radius, y: radius };
  addInstructionsForPrimitive(ckFactory, stack, path, spec.color, pinPoint);
}

function addInstructionsForTriangle(
  ckFactory: CkFactory,
  stack: Stack<RenderInstruction>,
  spec: TriangleSpec,
) {
  const thirdPoint: Point = {
    x: spec.side2 * Math.cos((spec.angle / -180) * Math.PI),
    y: spec.side2 * Math.sin((spec.angle / -180) * Math.PI),
  };
  const centroid: Point = {
    x: (spec.side1 + thirdPoint.x) / 3,
    y: thirdPoint.y / 3,
  };
  const path: Path = ckFactory
    .path()
    .moveTo(0, 0)
    .lineTo(spec.side1, 0)
    .lineTo(thirdPoint.x, thirdPoint.y)
    .close();
  addInstructionsForPrimitive(ckFactory, stack, path, spec.color, centroid);
}

function addInstructionsForText(
  ckFactory: CkFactory,
  stack: Stack<RenderInstruction>,
  spec: TextSpec,
) {
  const font = ckFactory.font(spec.font_name, spec.text_size);
  const glyphIDs = font.getGlyphIDs(spec.text);
  const offsets = font.getXPos(glyphIDs);
  const path = ckFactory.path();
  for (let i = 0; i < glyphIDs.length; i++) {
    const glyphID = glyphIDs[i];
    const offset = offsets[i];
    const glyphPath = ckFactory.glyphPath(font, glyphID);
    if (glyphPath !== null) {
      glyphPath.offset(offset, 0);
      path.addPath(glyphPath);
      // We no longer need the glyph path, so we can immediately delete it.
      glyphPath.delete();
    }
  }

  // Compute the bounding box of the text, whose width is determined by
  // summing the glyph widths instead of relying on the path's tight bounds.
  // This is to account for leading and trailing glyphs with no outline
  // (e.g. spaces).
  const pathBounds = path.computeTightBounds();
  const textWidth = font.measureText(spec.text);
  // We no longer need the font, so we can immediately delete it.
  font.delete();
  const textBounds: Rect = Float32Array.of(
    0,
    pathBounds[1],
    textWidth,
    pathBounds[3],
  );

  const paint = ckFactory.paint();
  paint.setColor(decodeColor(spec.color));
  paint.setAntiAlias(true);

  stack.pushInOrder([
    {
      type: RenderInstructionType.BEGIN,
      path,
      pinPosition: { x: 0, y: 0 },
      bounds: textBounds,
    },
    { type: RenderInstructionType.DRAW, path, paint },
    { type: RenderInstructionType.END },
  ]);
}

function addInstructionsForCompose(
  ckFactory: CkFactory,
  stack: Stack<RenderInstruction>,
  spec: ComposeSpec,
) {
  const fgChunk = extractGraphicInstructions(stack);
  const fgBegin = extractBegin(fgChunk);
  extractEnd(fgChunk);
  const { path: fgPath, pinPosition: fgPin, bounds: fgBounds } = fgBegin;
  const fgPinPosition =
    spec.fg_pin !== undefined ? relToAbsPoint(spec.fg_pin, fgBounds) : fgPin;

  const bgChunk = extractGraphicInstructions(stack);
  const bgBegin = extractBegin(bgChunk);
  extractEnd(bgChunk);
  const { path: bgPath, pinPosition: bgPin, bounds: bgBounds } = bgBegin;
  const bgPinPosition =
    spec.bg_pin !== undefined ? relToAbsPoint(spec.bg_pin, bgBounds) : bgPin;

  const fgOffsetMatrix = [
    1,
    0,
    bgPinPosition.x - fgPinPosition.x,
    0,
    1,
    bgPinPosition.y - fgPinPosition.y,
    0,
    0,
    1,
  ];
  const path = ckFactory
    .path()
    .addPath(bgPath)!
    .addPath(fgPath, fgOffsetMatrix, true)!;

  const bounds = path.computeTightBounds();

  const pinPosition = spec.pin
    ? relToAbsPoint(spec.pin, bounds)
    : bgPinPosition;

  const dx = bgPinPosition.x - fgPinPosition.x;
  const dy = bgPinPosition.y - fgPinPosition.y;

  stack.pushInOrder([
    { type: RenderInstructionType.BEGIN, path, pinPosition, bounds },
    { type: RenderInstructionType.SAVE },
    ...bgChunk,
    { type: RenderInstructionType.TRANSLATE, dx, dy },
    ...fgChunk,
    { type: RenderInstructionType.RESTORE },
    { type: RenderInstructionType.END },
  ]);
}

function addInstructionsForPin(stack: Stack<RenderInstruction>, spec: PinSpec) {
  const childChunk = extractGraphicInstructions(stack);
  const childBegin = extractBegin(childChunk);
  extractEnd(childChunk);

  const { path, bounds } = childBegin;
  const pinPosition = relToAbsPoint(spec.pin, path.computeTightBounds());

  stack.pushInOrder([
    { type: RenderInstructionType.BEGIN, path, pinPosition, bounds },
    ...childChunk,
    { type: RenderInstructionType.END },
  ]);
}

function addInstructionsForRotate(
  ckFactory: CkFactory,
  stack: Stack<RenderInstruction>,
  spec: RotateSpec,
) {
  const childChunk = extractGraphicInstructions(stack);
  const childBegin = extractBegin(childChunk);
  extractEnd(childChunk);

  const { path, pinPosition } = childBegin;

  const rotMatrix = rotatedMatrix(
    (-spec.angle / 180) * Math.PI,
    pinPosition.x,
    pinPosition.y,
  );

  // We must use the actual path of the child unlike in other graphics with
  // child(ren) because the bounds are affected by rotation
  const rotatedPath = ckFactory.path().addPath(path)!.transform(rotMatrix);
  const rotatedBounds = rotatedPath.computeTightBounds();

  stack.pushInOrder([
    {
      type: RenderInstructionType.BEGIN,
      path: rotatedPath,
      pinPosition,
      bounds: rotatedBounds,
    },
    { type: RenderInstructionType.SAVE },
    { type: RenderInstructionType.TRANSFORM, matrix: rotMatrix },
    ...childChunk,
    { type: RenderInstructionType.RESTORE },
    { type: RenderInstructionType.END },
  ]);
}

function addInstructionsFromSpec(
  ckFactory: CkFactory,
  stack: Stack<RenderInstruction>,
  spec: GraphicSpec,
) {
  switch (spec.t) {
    case 'Empty':
      addInstructionsForEmpty(ckFactory, stack);
      break;
    case 'Rectangle':
      addInstructionsForRectangle(ckFactory, stack, spec);
      break;
    case 'Ellipse':
      addInstructionsForEllipse(ckFactory, stack, spec);
      break;
    case 'CircularSector':
      addInstructionsForCircularSector(ckFactory, stack, spec);
      break;
    case 'Triangle':
      addInstructionsForTriangle(ckFactory, stack, spec);
      break;
    case 'Text':
      addInstructionsForText(ckFactory, stack, spec);
      break;
    case 'Compose':
      addInstructionsForCompose(ckFactory, stack, spec);
      break;
    case 'Pin':
      addInstructionsForPin(stack, spec);
      break;
    case 'Rotate':
      addInstructionsForRotate(ckFactory, stack, spec);
      break;
  }
}

export function specsToInstructions(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  disposableStack: DisposableStack,
  specs: GraphicSpec[],
): Stack<RenderInstruction> {
  const stack: Stack<RenderInstruction> = new Stack();

  const makeEmBindObject: <T extends EmbindObject<string>>(
    init: (ck: CanvasKit) => T,
  ) => T = (init) => disposableStack.adopt(init(ck), disposeOfEmBindObject);

  // This factory allow us to proxy all instantiation of CK "wasm objects" that
  // need to be freed manually once the rendering has been completed.
  // We delegate the task of freeing them to the DisposableStack given as a parameter to this function.
  const ckFactory: CkFactory = {
    font: (fontName, size) =>
      makeEmBindObject((ck) => {
        // Fallback to the 'Fira Sans' typeface
        const typeface = typefaces.get(fontName) || typefaces.get('Fira Sans')!;
        return new ck.Font(typeface, size);
      }),
    glyphPath: (font, glyphID) => {
      const path = font.getPath(glyphID);
      if (path === null) {
        return null;
      }
      return makeEmBindObject(() => path);
    },
    path: () => makeEmBindObject((ck) => new ck.Path()),
    paint: () => makeEmBindObject((ck) => new ck.Paint()),
  };

  // Build a sequence of instructions that can be executed linearly on the same
  // canvas object to render the complete graphic. This may involve popping and
  // pushing instructions from the stack so that they are executed in the right
  // order (e.g. when doing compositions).
  for (const spec of specs) {
    addInstructionsFromSpec(ckFactory, stack, spec);
  }
  return stack;
}
