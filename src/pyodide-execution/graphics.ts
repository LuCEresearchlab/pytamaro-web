import type {
  Canvas,
  CanvasKit,
  Paint,
  Path,
  Rect,
  Typeface,
} from '../canvaskit-wasm/canvaskit.d.ts';
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
  Sized,
  TextSpec,
  TriangleSpec,
} from './spec';

export function fromSpec(
  ck: CanvasKit,
  typefaces: Map<string, Typeface>,
  spec: GraphicSpec,
): Graphic {
  switch (spec.type) {
    case 'Empty':
      return new Empty(ck);
    case 'Rectangle':
      return new Rectangle(ck, spec);
    case 'Ellipse':
      return new Ellipse(ck, spec);
    case 'CircularSector':
      return new CircularSector(ck, spec);
    case 'Triangle':
      return new Triangle(ck, spec);
    case 'Text':
      return new Text(ck, typefaces, spec);
    case 'Compose':
      return new Compose(ck, typefaces, spec);
    case 'Pin':
      return new Pin(ck, typefaces, spec);
    case 'Rotate':
      return new Rotate(ck, typefaces, spec);
    case 'Beside':
      return new SimpleCompose(
        ck,
        typefaces,
        spec.left_graphic,
        spec.right_graphic,
        { x: 1, y: 0 },
        { x: -1, y: 0 },
      );
    case 'Above':
      return new SimpleCompose(
        ck,
        typefaces,
        spec.top_graphic,
        spec.bottom_graphic,
        { x: 0, y: -1 },
        { x: 0, y: 1 },
      );
    case 'Overlay':
      return new SimpleCompose(
        ck,
        typefaces,
        spec.front_graphic,
        spec.back_graphic,
        { x: 0, y: 0 },
        { x: 0, y: 0 },
      );
  }
}

export abstract class Graphic {
  readonly pinPosition: Point;
  readonly path: Path;
  readonly bounds: Rect;
  readonly size: Sized;

  protected constructor(path: Path, bounds: Rect, pinPosition: Point) {
    this.path = path;
    this.bounds = bounds;
    this.pinPosition = pinPosition;
    this.size = {
      width: Math.abs(bounds[0] - bounds[2]),
      height: Math.abs(bounds[1] - bounds[3]),
    };
  }

  abstract draw(canvas: Canvas): void;

  destroy(): void {
    this.path.delete();
  }
}

class Empty extends Graphic {
  constructor(ck: CanvasKit) {
    super(new ck.Path(), ck.XYWHRect(0, 0, 0, 0), { x: 0, y: 0 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override draw(canvas: Canvas): void {
    // Do nothing
  }
}

abstract class Primitive extends Graphic {
  private readonly paint: Paint;

  constructor(ck: CanvasKit, path: Path, color: Color, pinPosition?: Point) {
    const bounds = path.computeTightBounds();
    const pinPoint = pinPosition || {
      x: Math.abs(bounds[0] - bounds[2]) / 2,
      y: Math.abs(bounds[1] - bounds[3]) / 2,
    };
    super(path, bounds, pinPoint);

    const paint = new ck.Paint();
    paint.setColor(
      ck.Color4f(
        color.red / 255,
        color.green / 255,
        color.blue / 255,
        color.alpha,
      ),
    );
    this.paint = paint;
  }

  override draw(canvas: Canvas): void {
    canvas.drawPath(this.path, this.paint);
  }

  override destroy(): void {
    this.paint.delete();
    super.destroy();
  }
}

class Rectangle extends Primitive {
  constructor(ck: CanvasKit, spec: RectangleSpec) {
    super(
      ck,
      new ck.Path().addRect(ck.XYWHRect(0, 0, spec.width, spec.height)),
      spec.color,
    );
  }
}

class Ellipse extends Primitive {
  constructor(ck: CanvasKit, spec: EllipseSpec) {
    super(
      ck,
      new ck.Path().addOval(ck.XYWHRect(0, 0, spec.width, spec.height)),
      spec.color,
    );
  }
}

class CircularSector extends Primitive {
  constructor(ck: CanvasKit, spec: CircularSectorSpec) {
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
    const pin = {
      x: radius,
      y: radius,
    };
    super(ck, path, spec.color, pin);
  }
}

class Triangle extends Primitive {
  constructor(ck: CanvasKit, spec: TriangleSpec) {
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
    super(ck, path, spec.color, centroid);
  }
}

class Text extends Graphic {
  private readonly paint: Paint;

  constructor(ck: CanvasKit, typefaces: Map<string, Typeface>, spec: TextSpec) {
    const typeface = // Fallback to Fira Sans
      typefaces.get(spec.font_name) || typefaces.get('Fira Sans')!;
    const font = new ck.Font(typeface, spec.text_size);
    const glyphIDs = font.getGlyphIDs(spec.text);
    const offsets = font.getXPos(glyphIDs);
    const textPath = new ck.Path();
    for (let i = 0; i < glyphIDs.length; i++) {
      const glyphID = glyphIDs[i];
      const offset = offsets[i];
      const glyphPath = font.getPath(glyphID);
      if (glyphPath != null) {
        glyphPath.offset(offset, 0);
        textPath.addPath(glyphPath);
      }
    }

    const paint = new ck.Paint();
    paint.setAntiAlias(true);
    paint.setColor(
      ck.Color4f(
        spec.color.red / 255,
        spec.color.green / 255,
        spec.color.blue / 255,
        spec.color.alpha,
      ),
    );
    super(textPath, textPath.computeTightBounds(), { x: 0, y: 0 });
    this.paint = paint;
  }

  override draw(canvas: Canvas): void {
    canvas.drawPath(this.path, this.paint);
  }
}

class Compose extends Graphic {
  private readonly foreground: Graphic;
  private readonly background: Graphic;

  constructor(
    ck: CanvasKit,
    typefaces: Map<string, Typeface>,
    spec: ComposeSpec,
  ) {
    const foreground = fromSpec(ck, typefaces, spec.foreground);
    const background = fromSpec(ck, typefaces, spec.background);

    const fgPin = foreground.pinPosition;
    const bgPin = background.pinPosition;
    const fgOffsetMatrix = [
      1,
      0,
      bgPin.x - fgPin.x,
      0,
      1,
      bgPin.y - fgPin.y,
      0,
      0,
      1,
    ];

    const composedPath = new ck.Path()
      .addPath(background.path)!
      .addPath(foreground.path, fgOffsetMatrix, true)!;
    super(composedPath, composedPath?.computeTightBounds(), bgPin);
    this.background = background;
    this.foreground = foreground;
  }

  override draw(canvas: Canvas): void {
    canvas.save();
    this.background.draw(canvas);
    canvas.translate(
      this.background.pinPosition.x - this.foreground.pinPosition.x,
      this.background.pinPosition.y - this.foreground.pinPosition.y,
    );
    this.foreground.draw(canvas);
    canvas.restore();
  }

  override destroy(): void {
    this.foreground.destroy();
    this.background.destroy();
    super.destroy();
  }
}

class Pin extends Graphic {
  private readonly graphic: Graphic;

  constructor(ck: CanvasKit, typefaces: Map<string, Typeface>, spec: PinSpec) {
    const graphic = fromSpec(ck, typefaces, spec.graphic);
    const {
      pinning_point: { x: pinX, y: pinY },
    } = spec;
    const bounds = graphic.bounds;
    const x =
      pinX === -1
        ? bounds[0]
        : pinX === 0
          ? (bounds[0] + bounds[2]) / 2
          : pinX === 1
            ? bounds[2]
            : null;
    const y =
      pinY === -1
        ? bounds[3]
        : pinY === 0
          ? (bounds[1] + bounds[3]) / 2
          : pinY === 1
            ? bounds[1]
            : null;
    if (x === null || y === null) {
      throw new Error(`Invalid pin point ${spec.pinning_point}`);
    }

    super(graphic.path, bounds, { x, y });
    this.graphic = graphic;
  }

  override draw(canvas: Canvas): void {
    this.graphic.draw(canvas);
  }

  override destroy(): void {
    super.destroy();
  }
}

class Rotate extends Graphic {
  private readonly graphic: Graphic;
  private readonly rotMatrix: number[];

  constructor(
    ck: CanvasKit,
    typefaces: Map<string, Typeface>,
    spec: RotateSpec,
  ) {
    const graphic = fromSpec(ck, typefaces, spec.graphic);
    const rotMatrix = ck.Matrix.rotated(
      (-spec.angle / 180) * Math.PI,
      graphic.pinPosition.x,
      graphic.pinPosition.y,
    );
    // We must use the actual path of the child unlike in other graphics with
    // child(ren) because the bounds are affected by rotation
    const rotatedPath = new ck.Path()
      .addPath(graphic.path)!
      .transform(rotMatrix);
    // Preserve the child's pin position since it's the origin point for the
    // rotation
    super(rotatedPath, rotatedPath.computeTightBounds(), graphic.pinPosition);
    this.graphic = graphic;
    this.rotMatrix = rotMatrix;
  }

  override draw(canvas: Canvas): void {
    canvas.save();
    canvas.concat(this.rotMatrix);
    this.graphic.draw(canvas);
    canvas.restore();
  }

  override destroy(): void {
    this.graphic.destroy();
    super.destroy();
  }
}

class SimpleCompose extends Graphic {
  private readonly graphic: Graphic;

  constructor(
    ck: CanvasKit,
    typefaces: Map<string, Typeface>,
    firstGraphic: GraphicSpec,
    secondGraphic: GraphicSpec,
    firstPoint: Point,
    secondPoint: Point,
  ) {
    const firstPin: PinSpec = {
      pinning_point: firstPoint,
      graphic: firstGraphic,
      type: 'Pin',
    };
    const secondPin: PinSpec = {
      pinning_point: secondPoint,
      graphic: secondGraphic,
      type: 'Pin',
    };
    const composed: ComposeSpec = {
      foreground: firstPin,
      background: secondPin,
      type: 'Compose',
    };
    const composedCenter: PinSpec = {
      pinning_point: { x: 0, y: 0 },
      graphic: composed,
      type: 'Pin',
    };
    const graphic = fromSpec(ck, typefaces, composedCenter);
    super(graphic.path, graphic.bounds, graphic.pinPosition);
    this.graphic = graphic;
  }

  override draw(canvas: Canvas): void {
    this.graphic.draw(canvas);
  }

  override destroy(): void {
    this.graphic.destroy();
  }
}
