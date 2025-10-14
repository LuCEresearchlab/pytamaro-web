import type {
  Canvas,
  CanvasKit,
  FontMgr,
  Paint,
  Paragraph,
  Path,
  Rect,
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
  fontMgr: FontMgr,
  spec: GraphicSpec,
): Graphic {
  switch (spec.type) {
    case 'empty':
      return new Empty(ck);
    case 'rectangle':
      return new Rectangle(ck, spec);
    case 'ellipse':
      return new Ellipse(ck, spec);
    case 'circular_sector':
      return new CircularSector(ck, spec);
    case 'triangle':
      return new Triangle(ck, spec);
    case 'text':
      return new Text(ck, fontMgr, spec);
    case 'compose':
      return new Compose(ck, fontMgr, spec);
    case 'pin':
      return new Pin(ck, fontMgr, spec);
    case 'rotate':
      return new Rotate(ck, fontMgr, spec);
  }
}

function coloredPaint(ck: CanvasKit, color: Color, antiAlias: boolean): Paint {
  const paint = new ck.Paint();
  paint.setColor(
    ck.Color4f(
      color.red / 255,
      color.green / 255,
      color.blue / 255,
      color.alpha,
    ),
  );
  paint.setAntiAlias(antiAlias);
  return paint;
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

  draw(canvas: Canvas, debugPaint?: Paint): void {
    if (debugPaint) {
      debugPaint.setColor([0.94, 0.06, 0.06, 1]);
      canvas.drawRect(this.bounds, debugPaint);
      const pinSize = Math.min(this.size.width, this.size.height, 100) / 10;
      debugPaint.setColor([0.98, 0.78, 0, 1]);
      canvas.drawCircle(
        this.pinPosition.x,
        this.pinPosition.y,
        pinSize,
        debugPaint,
      );
    }
  }

  destroy(): void {
    this.path.delete();
  }
}

class Empty extends Graphic {
  constructor(ck: CanvasKit) {
    super(new ck.Path(), ck.XYWHRect(0, 0, 0, 0), { x: 0, y: 0 });
  }
}

abstract class Primitive extends Graphic {
  private readonly fillPaint: Paint;
  private readonly strokePaint: Paint;

  constructor(ck: CanvasKit, path: Path, color: Color, pinPosition?: Point) {
    const bounds = path.computeTightBounds();
    const pinPoint = pinPosition || {
      x: Math.abs(bounds[0] - bounds[2]) / 2,
      y: Math.abs(bounds[1] - bounds[3]) / 2,
    };
    super(path, bounds, pinPoint);

    this.fillPaint = coloredPaint(ck, color, false);
    this.strokePaint = coloredPaint(ck, color, true);
  }

  draw(canvas: Canvas, debugPaint?: Paint): void {
    canvas.drawPath(this.path, this.fillPaint);
    // TODO: double check this guy
    canvas.drawPath(this.path, this.strokePaint);
    super.draw(canvas, debugPaint);
  }

  destroy(): void {
    this.fillPaint.delete();
    this.strokePaint.delete();
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
    const rect = ck.LTRBRect(
      -spec.radius,
      -spec.radius,
      spec.radius,
      spec.radius,
    );
    const path =
      spec.angle == 0
        ? new ck.Path()
        : spec.angle === 360
          ? new ck.Path().addOval(rect)
          : new ck.Path()
              .moveTo(0, 0)
              .arcToOval(rect, 0, -spec.angle, false)
              .close();
    const pin = {
      x: spec.radius,
      y: spec.radius,
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
  private readonly p: Paragraph;

  constructor(ck: CanvasKit, fontMgr: FontMgr, spec: TextSpec) {
    const paragraphStyle = new ck.ParagraphStyle({
      textAlign: ck.TextAlign.Left,
      textStyle: {
        color: ck.Color4f(
          spec.color.red / 255,
          spec.color.green / 255,
          spec.color.blue / 255,
          spec.color.alpha,
        ),
        fontFamilies: [spec.font_name, 'Fira Sans'],
        fontSize: spec.text_size,
      },
    });
    const builder = ck.ParagraphBuilder.Make(paragraphStyle, fontMgr);
    builder.addText(spec.text);
    const p = builder.build();
    // Destroy builder object, we don't need it anymore
    builder.delete();

    p.layout(Number.MAX_VALUE);
    const isEmpty = spec.text.length > 0;
    const pinPosition = isEmpty
      ? { x: 0, y: 0 }
      : { x: 0, y: p.getAlphabeticBaseline() };
    const bounds = isEmpty
      ? ck.XYWHRect(0, 0, p.getMaxIntrinsicWidth(), p.getHeight())
      : ck.XYWHRect(0, 0, 0, 0);
    // Stub path for bounds computations
    const boundsPath = new ck.Path().addRect(bounds);
    super(boundsPath, bounds, pinPosition);

    this.p = p;
  }

  draw(canvas: Canvas, debugPaint?: Paint): void {
    canvas.drawParagraph(this.p, 0, 0);
    super.draw(canvas, debugPaint);
  }

  destroy(): void {
    this.p.delete();
    super.destroy();
  }
}

class Compose extends Graphic {
  private readonly foreground: Graphic;
  private readonly background: Graphic;

  constructor(ck: CanvasKit, fontMgr: FontMgr, spec: ComposeSpec) {
    const foreground = fromSpec(ck, fontMgr, spec.foreground);
    const background = fromSpec(ck, fontMgr, spec.background);

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

    // Stub path for bounds
    const boundsPath = new ck.Path()
      .addRect(background.bounds)
      .addPath(new ck.Path().addRect(foreground.bounds), fgOffsetMatrix, true)!;
    super(boundsPath, boundsPath?.computeTightBounds(), bgPin);
    this.background = background;
    this.foreground = foreground;
  }

  draw(canvas: Canvas, debugPaint?: Paint): void {
    canvas.save();
    this.background.draw(canvas);
    canvas.translate(
      this.background.pinPosition.x - this.foreground.pinPosition.x,
      this.background.pinPosition.y - this.foreground.pinPosition.y,
    );
    this.foreground.draw(canvas);
    canvas.restore();
    super.draw(canvas, debugPaint);
  }

  destroy(): void {
    this.foreground.destroy();
    this.background.destroy();
    super.destroy();
  }
}

class Pin extends Graphic {
  private readonly graphic: Graphic;

  constructor(ck: CanvasKit, fontMgr: FontMgr, spec: PinSpec) {
    const graphic = fromSpec(ck, fontMgr, spec.graphic);
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

  draw(canvas: Canvas, debugPaint?: Paint): void {
    this.graphic.draw(canvas);
    super.draw(canvas, debugPaint);
  }

  destroy(): void {
    super.destroy();
  }
}

class Rotate extends Graphic {
  private readonly graphic: Graphic;
  private readonly rotMatrix: number[];

  constructor(ck: CanvasKit, fontMgr: FontMgr, spec: RotateSpec) {
    const graphic = fromSpec(ck, fontMgr, spec.graphic);
    const rotMatrix = ck.Matrix.rotated(
      (spec.angle / -180) * Math.PI,
      graphic.pinPosition.x,
      graphic.pinPosition.y,
    );
    // We must use the actual path of the child unlike in other graphics with
    // child(ren) because the bounds are affected by rotation
    const boundsPath = new ck.Path()
      .addPath(graphic.path)!
      .transform(rotMatrix);
    // Preserve the child's pin position since it's the origin point for the
    // rotation
    super(boundsPath, boundsPath.computeTightBounds(), graphic.pinPosition);
    this.graphic = graphic;
    this.rotMatrix = rotMatrix;
  }

  draw(canvas: Canvas, debugPaint?: Paint): void {
    canvas.save();
    canvas.concat(this.rotMatrix);
    this.graphic.draw(canvas);
    canvas.restore();
    super.draw(canvas, debugPaint);
  }

  destroy(): void {
    this.graphic.destroy();
    super.destroy();
  }
}
