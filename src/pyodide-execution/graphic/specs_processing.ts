import type {
  CanvasKit,
  EmbindObject,
  Path,
  Rect,
  Typeface,
} from '../../canvaskit-wasm/canvaskit';
import {
  CircularSectorSpec,
  Color,
  ComposeSpec,
  EllipseSpec,
  GraphicSpec,
  PinSpec,
  Point,
  RectangleSpec,
  RotateSpec,
  TextSpec,
  TriangleSpec,
} from '../spec.ts';
import { Command } from './commands.ts';
import { Stack } from './stack.ts';

/* **** Utils **** */

/**
 * Convert (pin) point from relative (-1..1) to absolute coordinates.
 */
function relToAbsPoint(relPoint: Point, bounds: Rect): Point {
  const { x: relX, y: relY } = relPoint;
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

function extractBegin(chunk: Command[]): {
  type: 'BEGIN';
  path: Path;
  pinPosition: Point;
} {
  const begin = chunk.shift();
  if (!begin || begin.type !== 'BEGIN') {
    throw new Error(`Inconsistent state. Expected BEGIN, got ${begin?.type}`);
  }
  return begin;
}

function extractEnd(chunk: Command[]): {
  type: 'END';
  toDelete?: EmbindObject<string>[];
} {
  const end = chunk.pop();
  if (!end || end.type !== 'END') {
    throw new Error(`Inconsistent state, expected END, got ${end?.type}`);
  }
  return end;
}

/* **** Specs Processing **** */

function processEmpty(ck: CanvasKit, store: (commands: Command[]) => void) {
  const emptyPath = new ck.Path();
  store([
    { type: 'BEGIN', path: emptyPath, pinPosition: { x: 0, y: 0 } },
    { type: 'END', toDelete: [emptyPath] },
  ]);
}

function processPrimitive(
  ck: CanvasKit,
  store: (commands: Command[]) => void,
  path: Path,
  color: Color,
  pinPoint?: Point,
) {
  const paint = new ck.Paint();
  paint.setColor(ck.Color(color.red, color.green, color.blue, color.alpha));
  const bounds = path.computeTightBounds();
  const pinPosition = pinPoint || {
    x: Math.abs(bounds[0] - bounds[2]) / 2,
    y: Math.abs(bounds[1] - bounds[3]) / 2,
  };
  store([
    { type: 'BEGIN', path, pinPosition },
    { type: 'DRAW', path, paint },
    { type: 'END' },
  ]);
}

function processRectangle(
  ck: CanvasKit,
  store: (commands: Command[]) => void,
  spec: RectangleSpec,
) {
  const path = new ck.Path().addRect(
    ck.XYWHRect(0, 0, spec.width, spec.height),
  );
  processPrimitive(ck, store, path, spec.color);
}

function processEllipse(
  ck: CanvasKit,
  store: (commands: Command[]) => void,
  spec: EllipseSpec,
) {
  const path = new ck.Path().addOval(
    ck.XYWHRect(0, 0, spec.width, spec.height),
  );
  processPrimitive(ck, store, path, spec.color);
}

function processCircularSector(
  ck: CanvasKit,
  store: (commands: Command[]) => void,
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
  processPrimitive(ck, store, path, spec.color, pinPoint);
}

function processTriangle(
  ck: CanvasKit,
  store: (commands: Command[]) => void,
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
  processPrimitive(ck, store, path, spec.color, centroid);
}

function processText(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  store: (commands: Command[]) => void,
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
  paint.setColor(
    ck.Color(
      spec.color.red,
      spec.color.green,
      spec.color.blue,
      spec.color.alpha,
    ),
  );
  paint.setAntiAlias(true);

  store([
    { type: 'BEGIN', path, pinPosition: { x: 0, y: 0 } },
    { type: 'DRAW', path, paint },
    { type: 'END' },
  ]);
}

function processCompose(
  ck: CanvasKit,
  fetch: () => Command[],
  store: (commands: Command[]) => void,
  spec: ComposeSpec,
) {
  const fgChunk = fetch();
  const fgBegin = extractBegin(fgChunk);
  const fgEnd = extractEnd(fgChunk);
  const { path: fgPath, pinPosition: fgPin } = fgBegin;
  const fgPinPosition = spec.foreground_pin
    ? relToAbsPoint(spec.foreground_pin, fgPath.computeTightBounds())
    : fgPin;

  const bgChunk = fetch();
  const bgBegin = extractBegin(bgChunk);
  const bgEnd = extractEnd(bgChunk);
  const { path: bgPath, pinPosition: bgPin } = bgBegin;
  const bgPinPosition = spec.background_pin
    ? relToAbsPoint(spec.background_pin, bgPath.computeTightBounds())
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

  const pinPosition = spec.own_pin
    ? relToAbsPoint(spec.own_pin, path.computeTightBounds())
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

  store([
    { type: 'BEGIN', path, pinPosition },
    { type: 'SAVE' },
    ...bgChunk,
    { type: 'TRANSLATE', dx, dy },
    ...fgChunk,
    { type: 'RESTORE' },
    { type: 'END', toDelete },
  ]);
}

function processPin(
  fetch: () => Command[],
  store: (commands: Command[]) => void,
  spec: PinSpec,
) {
  const childChunk = fetch();
  const childBegin = extractBegin(childChunk);
  const childEnd = extractEnd(childChunk);

  const { path } = childBegin;
  const pinPosition = relToAbsPoint(
    spec.pinning_point,
    path.computeTightBounds(),
  );

  store([
    { type: 'BEGIN', path, pinPosition },
    ...childChunk,
    { type: 'END', toDelete: childEnd.toDelete },
  ]);
}

function processRotate(
  ck: CanvasKit,
  fetch: () => Command[],
  store: (commands: Command[]) => void,
  spec: RotateSpec,
) {
  const childChunk = fetch();
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

  store([
    { type: 'BEGIN', path: rotatedPath, pinPosition },
    { type: 'SAVE' },
    { type: 'TRANSFORM', matrix: rotMatrix },
    ...childChunk,
    { type: 'RESTORE' },
    { type: 'END', toDelete },
  ]);
}

function process(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  fetch: () => Command[],
  store: (commands: Command[]) => void,
  spec: GraphicSpec,
) {
  switch (spec.type) {
    case 'Empty':
      processEmpty(ck, store);
      break;
    case 'Rectangle':
      processRectangle(ck, store, spec);
      break;
    case 'Ellipse':
      processEllipse(ck, store, spec);
      break;
    case 'CircularSector':
      processCircularSector(ck, store, spec);
      break;
    case 'Triangle':
      processTriangle(ck, store, spec);
      break;
    case 'Text':
      processText(ck, typefaces, store, spec);
      break;
    case 'Compose':
      processCompose(ck, fetch, store, spec);
      break;
    case 'Pin':
      processPin(fetch, store, spec);
      break;
    case 'Rotate':
      processRotate(ck, fetch, store, spec);
      break;
  }
}

function ckHeapSize(ck: CanvasKit): number {
  // @ts-expect-error: 2339 (not part of the public CK API)
  return ck.HEAPF32.length;
}

export function processSpecs(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  specs: GraphicSpec[],
  debugAllocations: boolean = false,
): Stack<Command> {
  const stack: Stack<Command> = new Stack();

  const fetch = () => {
    let cmd = stack.pop();
    if (cmd.type !== 'BEGIN') {
      throw Error(`Inconsistent state, expected BEGIN, got ${cmd.type}`);
    }

    const chunk: Command[] = [];
    while (true) {
      chunk.push(cmd);
      if (cmd.type === 'END') {
        break;
      }
      cmd = stack.pop();
    }
    return chunk;
  };

  const store = (commands: Command[]) => {
    let i = commands.length - 1;
    while (i >= 0) {
      stack.push(commands[i]);
      i -= 1;
    }
  };

  let lastCkHeapSize = ckHeapSize(ck);

  // Build a sequence of commands that can be executed linearly on the same
  // canvas object to draw the complete graphic. This may involve popping and
  // pushing commands from the stack so that they are executed in the right
  // order (e.g. when doing compositions).
  for (const spec of specs) {
    process(ck, typefaces, fetch, store, spec);

    if (debugAllocations) {
      const afterSpecSize = ckHeapSize(ck);
      if (lastCkHeapSize != afterSpecSize) {
        // eslint-disable-next-line no-console
        console.warn(
          `CK heap size increased by ${afterSpecSize - lastCkHeapSize} after`,
          spec,
        );
        lastCkHeapSize = afterSpecSize;
      }
    }
  }

  return stack;
}

export function freeStack(stack: Stack<Command>) {
  while (!stack.isEmpty()) {
    const cmd = stack.pop();
    switch (cmd.type) {
      case 'DRAW':
        cmd.path.delete();
        cmd.paint.delete();
        break;
      case 'END':
        cmd.toDelete
          ?.filter((obj) => !obj.isDeleted())
          ?.forEach((obj) => obj.delete());
        break;
    }
  }
}
