import { Canvas, CanvasKit, Paint, Rect } from '../../canvaskit-wasm/canvaskit';
import { Point } from './spec';

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
  graphicBounds: Rect,
  unitSize: number,
  darkPaint: Paint,
  lightPaint: Paint,
) {
  const baseX = graphicBounds[0];
  const baseY = graphicBounds[1];
  const width = Math.abs(graphicBounds[0] - graphicBounds[2]);
  const height = Math.abs(graphicBounds[1] - graphicBounds[3]);
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
      const dotX = graphicBounds[0] + width * ((x + 1) / 2);
      const dotY = graphicBounds[1] + height * ((y + 1) / 2);
      circle(ck, canvas, dotX, dotY, unitSize, darkPaint);
      circle(ck, canvas, dotX, dotY, (4 / 5) * unitSize, lightPaint);
    }
  }
}

export function addDebugInfo(
  ck: CanvasKit,
  graphicBounds: Rect,
  graphicPinPosition: Point,
  canvas: Canvas,
  size: number,
) {
  const whitePaint = new ck.Paint();
  whitePaint.setColor(ck.Color(0xeb, 0xeb, 0xeb, 1));
  whitePaint.setAntiAlias(true);
  const blackPaint = new ck.Paint();
  blackPaint.setColor(ck.Color(0x29, 0x29, 0x29, 1));
  blackPaint.setAntiAlias(true);
  const bluePaint = new ck.Paint();
  bluePaint.setColor(ck.Color(0x29, 0x62, 0xc1, 1));
  bluePaint.setAntiAlias(true);

  border(ck, canvas, graphicBounds, size, bluePaint, whitePaint);

  // Pin indicator
  const { x, y } = graphicPinPosition;
  pinIndicator(ck, canvas, x, y, whitePaint, 3);
  pinIndicator(ck, canvas, x, y, blackPaint);

  // Cleanup paints
  whitePaint.delete();
  blackPaint.delete();
  bluePaint.delete();
}
