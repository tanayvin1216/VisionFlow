import type { Point2D } from '@/types/hand-tracking';

export function computeHandDistance(a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function computeMidpoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function lerpValue(current: number, target: number, factor: number): number {
  return current + (target - current) * factor;
}

export function normalizedToScreenPixels(
  point: Point2D,
  screenWidth: number,
  screenHeight: number,
): Point2D {
  // Mirror X axis to match webcam mirroring
  return {
    x: (1 - point.x) * screenWidth,
    y: point.y * screenHeight,
  };
}
