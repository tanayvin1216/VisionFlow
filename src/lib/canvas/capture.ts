import type { Point2D } from '@/types/hand-tracking';

interface DrawingState {
  strokes: Point2D[][];
  currentStroke: Point2D[];
}

export function captureDrawingAsImage(
  drawing: DrawingState,
  width: number,
  height: number
): string | null {
  const allStrokes = [...drawing.strokes];
  if (drawing.currentStroke.length > 0) {
    allStrokes.push(drawing.currentStroke);
  }

  if (allStrokes.length === 0) {
    return null;
  }

  // Create an offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw strokes in black
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const stroke of allStrokes) {
    if (stroke.length < 2) continue;

    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);

    // Use quadratic curves for smooth lines
    for (let i = 1; i < stroke.length - 1; i++) {
      const xc = (stroke[i].x + stroke[i + 1].x) / 2;
      const yc = (stroke[i].y + stroke[i + 1].y) / 2;
      ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, xc, yc);
    }

    // Last point
    if (stroke.length > 1) {
      const last = stroke[stroke.length - 1];
      ctx.lineTo(last.x, last.y);
    }

    ctx.stroke();
  }

  return canvas.toDataURL('image/png');
}

export function getDrawingBounds(
  drawing: DrawingState
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const allStrokes = [...drawing.strokes];
  if (drawing.currentStroke.length > 0) {
    allStrokes.push(drawing.currentStroke);
  }

  if (allStrokes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const stroke of allStrokes) {
    for (const point of stroke) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }

  return { minX, minY, maxX, maxY };
}
