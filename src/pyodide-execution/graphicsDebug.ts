import { Canvas, CanvasKit, Paint } from '../canvaskit-wasm/canvaskit';
import { Graphic } from './graphics';

function circle(
  ck: CanvasKit,
  canvas: Canvas,
  x: number,
  y: number,
  radius: number,
  paint: Paint,
) {
  const diameter = radius * 2;
  canvas.drawOval(
    ck.XYWHRect(x - radius, y - radius, diameter, diameter),
    paint,
  );
}

function rectangle(
  ck: CanvasKit,
  canvas: Canvas,
  x: number,
  y: number,
  width: number,
  height: number,
  paint: Paint,
) {
  canvas.drawRect(
    ck.XYWHRect(x - width / 2, y - height / 2, width, height),
    paint,
  );
}

function pinIndicator(
  ck: CanvasKit,
  canvas: Canvas,
  x: number,
  y: number,
  paint: Paint,
  padding: number = 0,
) {
  rectangle(ck, canvas, x, y, 15 + padding, 1 + padding, paint);
  rectangle(ck, canvas, x, y, 1 + padding, 15 + padding, paint);
  circle(ck, canvas, x, y, (8 + padding) / 2, paint);
}

function border(
  ck: CanvasKit,
  canvas: Canvas,
  graphic: Graphic,
  unitSize: number,
  darkPaint: Paint,
  lightPaint: Paint,
) {
  const baseX = graphic.bounds[0];
  const baseY = graphic.bounds[1];
  const { width, height } = graphic.size;
  // Border rectangle
  darkPaint.setStyle(ck.PaintStyle.Stroke);
  rectangle(
    ck,
    canvas,
    baseX + width / 2,
    baseY + height / 2,
    width,
    height,
    darkPaint,
  );

  // Border dots
  darkPaint.setStyle(ck.PaintStyle.Fill);
  for (let x = -1; x < 2; x++) {
    for (let y = -1; y < 2; y++) {
      const dotX = graphic.bounds[0] + graphic.size.width * ((x + 1) / 2);
      const dotY = graphic.bounds[1] + graphic.size.height * ((y + 1) / 2);
      circle(ck, canvas, dotX, dotY, unitSize, darkPaint);
      circle(ck, canvas, dotX, dotY, (4 / 5) * unitSize, lightPaint);
    }
  }
}

export function addDebugInfo(
  ck: CanvasKit,
  graphic: Graphic,
  canvas: Canvas,
  size: number,
) {
  graphic.draw(canvas);

  const whitePaint = new ck.Paint();
  whitePaint.setColor(ck.Color4f(0xeb / 255, 0xeb / 255, 0xeb / 255, 1));
  whitePaint.setAntiAlias(true);
  const blackPaint = new ck.Paint();
  blackPaint.setColor(ck.Color4f(0x29 / 255, 0x29 / 255, 0x29 / 255, 1));
  blackPaint.setAntiAlias(true);
  const bluePaint = new ck.Paint();
  bluePaint.setColor(ck.Color4f(0x29 / 255, 0x62 / 255, 0xc1 / 255, 1));
  bluePaint.setAntiAlias(true);

  border(ck, canvas, graphic, size, bluePaint, whitePaint);

  // Pin indicator
  const { x, y } = graphic.pinPosition;
  pinIndicator(ck, canvas, x, y, whitePaint, 3);
  pinIndicator(ck, canvas, x, y, blackPaint);
}
