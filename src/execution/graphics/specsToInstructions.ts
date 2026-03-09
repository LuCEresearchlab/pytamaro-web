import type {
  CanvasKit,
  Color,
  EmbindObject,
  Path,
  Rect,
  Typeface,
} from '../../canvaskit-wasm/canvaskit';
import {
  cleanupAfterDraw,
  cleanupAfterEnd,
  extractBegin,
  extractEnd,
  extractGraphicInstructions,
  RenderInstruction,
  RenderInstructionType,
} from './instructions.ts';
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

/* **** Utils **** */

const decodingView = new DataView(new ArrayBuffer(8));

function decodeColor(
  ck: CanvasKit,
  color_value_from_spec: EncodedColor,
): Color {
  // ARGB format
  decodingView.setBigUint64(
    0,
    typeof color_value_from_spec === 'number'
      ? BigInt(color_value_from_spec)
      : color_value_from_spec,
    false /* big endian */,
  );
  // We're only using 4 bytes of the 8 bytes in the dataview.
  // Our result starts from byte offset 4.
  const alpha = decodingView.getUint8(4);
  const red = decodingView.getUint8(5);
  const green = decodingView.getUint8(6);
  const blue = decodingView.getUint8(7);
  return ck.Color(red, green, blue, alpha / 255);
}

function decodePoint(point_value_from_spec: EncodedPoint): Point {
  // 32-bit per coordinate, first x, then y.
  // Each coordinate is a float in the range -1..1, encoded as an unsigned int.
  decodingView.setBigUint64(
    0,
    typeof point_value_from_spec === 'number'
      ? BigInt(point_value_from_spec)
      : point_value_from_spec,
    false /* big endian */,
  );
  const x = decodingView.getFloat32(0, false /* big endian */);
  const y = decodingView.getFloat32(4, false /* big endian */);
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
  ck: CanvasKit,
  stack: Stack<RenderInstruction>,
) {
  const emptyPath = new ck.Path();
  stack.pushInOrder([
    {
      type: RenderInstructionType.BEGIN,
      path: emptyPath,
      pinPosition: { x: 0, y: 0 },
    },
    { type: RenderInstructionType.END, toDelete: [emptyPath] },
  ]);
}

function addInstructionsForPrimitive(
  ck: CanvasKit,
  stack: Stack<RenderInstruction>,
  path: Path,
  color: EncodedColor,
  pinPoint?: Point,
) {
  const paint = new ck.Paint();
  paint.setColor(decodeColor(ck, color));
  const bounds = path.computeTightBounds();
  const pinPosition = pinPoint || {
    x: Math.abs(bounds[0] - bounds[2]) / 2,
    y: Math.abs(bounds[1] - bounds[3]) / 2,
  };
  stack.pushInOrder([
    { type: RenderInstructionType.BEGIN, path, pinPosition },
    { type: RenderInstructionType.DRAW, path, paint },
    { type: RenderInstructionType.END },
  ]);
}

function addInstructionsForRectangle(
  ck: CanvasKit,
  stack: Stack<RenderInstruction>,
  spec: RectangleSpec,
) {
  const path = new ck.Path().addRect(
    ck.XYWHRect(0, 0, spec.width, spec.height),
  );
  addInstructionsForPrimitive(ck, stack, path, spec.color);
}

function addInstructionsForEllipse(
  ck: CanvasKit,
  stack: Stack<RenderInstruction>,
  spec: EllipseSpec,
) {
  const path = new ck.Path().addOval(
    ck.XYWHRect(0, 0, spec.width, spec.height),
  );
  addInstructionsForPrimitive(ck, stack, path, spec.color);
}

function addInstructionsForCircularSector(
  ck: CanvasKit,
  stack: Stack<RenderInstruction>,
  spec: CircularSectorSpec,
) {
  const radius = spec.radius;
  const diameter = radius * 2;
  const rect = ck.XYWHRect(0, 0, diameter, diameter);
  const path =
    spec.angle == 360
      ? new ck.Path().addOval(rect)
      : new ck.Path()
          .moveTo(radius, radius)
          .arcToOval(rect, 0, -spec.angle, false)
          .close();
  const pinPoint = { x: radius, y: radius };
  addInstructionsForPrimitive(ck, stack, path, spec.color, pinPoint);
}

function addinstructionsForTriangle(
  ck: CanvasKit,
  stack: Stack<RenderInstruction>,
  spec: TriangleSpec,
) {
  const thirdPoint = {
    x: spec.side2 * Math.cos((spec.angle / -180) * Math.PI),
    y: spec.side2 * Math.sin((spec.angle / -180) * Math.PI),
  };
  const centroid = {
    x: (spec.side1 + thirdPoint.x) / 3,
    y: thirdPoint.y / 3,
  };
  const path = new ck.Path()
    .moveTo(0, 0)
    .lineTo(spec.side1, 0)
    .lineTo(thirdPoint.x, thirdPoint.y)
    .close();
  addInstructionsForPrimitive(ck, stack, path, spec.color, centroid);
}

function addInstructionsForText(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  stack: Stack<RenderInstruction>,
  spec: TextSpec,
) {
  // Fallback to Fira Sans
  const typeface = typefaces.get(spec.font_name) || typefaces.get('Fira Sans')!;
  const font = new ck.Font(typeface, spec.text_size);
  const glyphIDs = font.getGlyphIDs(spec.text);
  const offsets = font.getXPos(glyphIDs);
  const path = new ck.Path();
  for (let i = 0; i < glyphIDs.length; i++) {
    const glyphID = glyphIDs[i];
    const offset = offsets[i];
    const glyphPath = font.getPath(glyphID);
    if (glyphPath != null) {
      glyphPath.offset(offset, 0);
      path.addPath(glyphPath);
      glyphPath.delete();
    }
  }

  // Do NOT delete the typeface: it is shared across graphics.
  // Delete only the font, which is unique for each graphic.
  font.delete();

  const paint = new ck.Paint();
  paint.setColor(decodeColor(ck, spec.color));
  paint.setAntiAlias(true);

  stack.pushInOrder([
    { type: RenderInstructionType.BEGIN, path, pinPosition: { x: 0, y: 0 } },
    { type: RenderInstructionType.DRAW, path, paint },
    { type: RenderInstructionType.END },
  ]);
}

function addInstructionsForCompose(
  ck: CanvasKit,
  stack: Stack<RenderInstruction>,
  spec: ComposeSpec,
) {
  const fgChunk = extractGraphicInstructions(stack);
  const fgBegin = extractBegin(fgChunk);
  const fgEnd = extractEnd(fgChunk);
  const { path: fgPath, pinPosition: fgPin } = fgBegin;
  const fgPinPosition =
    spec.fg_pin !== undefined
      ? relToAbsPoint(spec.fg_pin, fgPath.computeTightBounds())
      : fgPin;

  const bgChunk = extractGraphicInstructions(stack);
  const bgBegin = extractBegin(bgChunk);
  const bgEnd = extractEnd(bgChunk);
  const { path: bgPath, pinPosition: bgPin } = bgBegin;
  const bgPinPosition =
    spec.bg_pin !== undefined
      ? relToAbsPoint(spec.bg_pin, bgPath.computeTightBounds())
      : bgPin;

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
  const path = new ck.Path()
    .addPath(bgPath)!
    .addPath(fgPath, fgOffsetMatrix, true)!;

  const pinPosition = spec.pin
    ? relToAbsPoint(spec.pin, path.computeTightBounds())
    : bgPinPosition;

  const dx = bgPinPosition.x - fgPinPosition.x;
  const dy = bgPinPosition.y - fgPinPosition.y;

  const toDelete: EmbindObject<string>[] = [path];
  if (fgEnd.toDelete) {
    toDelete.push(...fgEnd.toDelete);
  }
  if (bgEnd.toDelete) {
    toDelete.push(...bgEnd.toDelete);
  }

  stack.pushInOrder([
    { type: RenderInstructionType.BEGIN, path, pinPosition },
    { type: RenderInstructionType.SAVE },
    ...bgChunk,
    { type: RenderInstructionType.TRANSLATE, dx, dy },
    ...fgChunk,
    { type: RenderInstructionType.RESTORE },
    { type: RenderInstructionType.END, toDelete },
  ]);
}

function addInstructionsForPin(stack: Stack<RenderInstruction>, spec: PinSpec) {
  const childChunk = extractGraphicInstructions(stack);
  const childBegin = extractBegin(childChunk);
  const childEnd = extractEnd(childChunk);

  const { path } = childBegin;
  const pinPosition = relToAbsPoint(spec.pin, path.computeTightBounds());

  stack.pushInOrder([
    { type: RenderInstructionType.BEGIN, path, pinPosition },
    ...childChunk,
    { type: RenderInstructionType.END, toDelete: childEnd.toDelete },
  ]);
}

function addinstructionsForRotate(
  ck: CanvasKit,
  stack: Stack<RenderInstruction>,
  spec: RotateSpec,
) {
  const childChunk = extractGraphicInstructions(stack);
  const childBegin = extractBegin(childChunk);
  const childEnd = extractEnd(childChunk);

  const { path, pinPosition } = childBegin;

  const rotMatrix = ck.Matrix.rotated(
    (-spec.angle / 180) * Math.PI,
    pinPosition.x,
    pinPosition.y,
  );

  // We must use the actual path of the child unlike in other graphics with
  // child(ren) because the bounds are affected by rotation
  const rotatedPath = new ck.Path().addPath(path)!.transform(rotMatrix);

  const toDelete = childEnd.toDelete
    ? childEnd.toDelete.concat([rotatedPath])
    : [rotatedPath];

  stack.pushInOrder([
    { type: RenderInstructionType.BEGIN, path: rotatedPath, pinPosition },
    { type: RenderInstructionType.SAVE },
    { type: RenderInstructionType.TRANSFORM, matrix: rotMatrix },
    ...childChunk,
    { type: RenderInstructionType.RESTORE },
    { type: RenderInstructionType.END, toDelete },
  ]);
}

function addinstructionsFromSpec(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  stack: Stack<RenderInstruction>,
  spec: GraphicSpec,
) {
  switch (spec.t) {
    case 'Empty':
      addInstructionsForEmpty(ck, stack);
      break;
    case 'Rectangle':
      addInstructionsForRectangle(ck, stack, spec);
      break;
    case 'Ellipse':
      addInstructionsForEllipse(ck, stack, spec);
      break;
    case 'CircularSector':
      addInstructionsForCircularSector(ck, stack, spec);
      break;
    case 'Triangle':
      addinstructionsForTriangle(ck, stack, spec);
      break;
    case 'Text':
      addInstructionsForText(ck, typefaces, stack, spec);
      break;
    case 'Compose':
      addInstructionsForCompose(ck, stack, spec);
      break;
    case 'Pin':
      addInstructionsForPin(stack, spec);
      break;
    case 'Rotate':
      addinstructionsForRotate(ck, stack, spec);
      break;
  }
}

export function specsToInstructions(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  specs: GraphicSpec[],
): Stack<RenderInstruction> {
  const stack: Stack<RenderInstruction> = new Stack();

  // Build a sequence of instructions that can be executed linearly on the same
  // canvas object to render the complete graphic. This may involve popping and
  // pushing instructions from the stack so that they are executed in the right
  // order (e.g. when doing compositions).
  for (const spec of specs) {
    addinstructionsFromSpec(ck, typefaces, stack, spec);
  }

  return stack;
}

export function freeStack(stack: Stack<RenderInstruction>) {
  while (!stack.isEmpty()) {
    const cmd = stack.pop();
    switch (cmd.type) {
      case RenderInstructionType.DRAW:
        cleanupAfterDraw(cmd);
        break;
      case RenderInstructionType.END:
        cleanupAfterEnd(cmd);
        break;
    }
  }
}
