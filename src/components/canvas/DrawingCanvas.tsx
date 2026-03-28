'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import type { Point2D } from '@/types/hand-tracking';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

// Simple smoothing filter
class SmoothingFilter {
  private history: Point2D[] = [];
  private maxHistory = 5;

  filter(point: Point2D): Point2D {
    this.history.push(point);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Weighted average (more recent = higher weight)
    let totalWeight = 0;
    let x = 0;
    let y = 0;

    for (let i = 0; i < this.history.length; i++) {
      const weight = i + 1;
      x += this.history[i].x * weight;
      y += this.history[i].y * weight;
      totalWeight += weight;
    }

    return { x: x / totalWeight, y: y / totalWeight };
  }

  reset() {
    this.history = [];
  }
}

export function DrawingCanvas({ width, height }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterRef = useRef(new SmoothingFilter());
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point2D | null>(null);
  const palmHoldRef = useRef<number | null>(null);

  const {
    currentGesture,
    fingertipPosition,
    drawing,
    addPointToCurrentStroke,
    finishCurrentStroke,
    clearDrawing,
    setMode,
    mode,
  } = useAppStore();

  // Convert to canvas coords (mirrored)
  const toCanvas = useCallback(
    (p: Point2D): Point2D => ({
      x: (1 - p.x) * width,
      y: p.y * height,
    }),
    [width, height]
  );

  // Handle drawing state
  useEffect(() => {
    const isPinching = currentGesture.type === 'pinch';
    const isOpenPalm = currentGesture.type === 'open_palm';

    // START drawing when pinching
    if (isPinching && !isDrawingRef.current) {
      isDrawingRef.current = true;
      filterRef.current.reset();
      lastPointRef.current = null;
      setMode('drawing');
    }

    // STOP drawing when not pinching
    if (!isPinching && isDrawingRef.current) {
      isDrawingRef.current = false;
      finishCurrentStroke();
      if (mode === 'drawing') setMode('idle');
    }

    // CLEAR on palm hold (800ms)
    if (isOpenPalm) {
      if (!palmHoldRef.current) {
        palmHoldRef.current = Date.now();
      } else if (Date.now() - palmHoldRef.current > 800) {
        clearDrawing();
        palmHoldRef.current = null;
      }
    } else {
      palmHoldRef.current = null;
    }
  }, [currentGesture, finishCurrentStroke, clearDrawing, setMode, mode]);

  // Add points while drawing
  useEffect(() => {
    if (!isDrawingRef.current || !fingertipPosition) return;

    const raw = toCanvas(fingertipPosition);
    const smooth = filterRef.current.filter(raw);

    // Min distance between points
    if (lastPointRef.current) {
      const dist = Math.hypot(
        smooth.x - lastPointRef.current.x,
        smooth.y - lastPointRef.current.y
      );
      if (dist < 2) return;
    }

    addPointToCurrentStroke(smooth);
    lastPointRef.current = smooth;
  }, [fingertipPosition, toCanvas, addPointToCurrentStroke]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Completed strokes - white
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    drawing.strokes.forEach((s) => drawSmoothLine(ctx, s));

    // Current stroke - white with blue glow
    if (drawing.currentStroke.length > 1) {
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 5;
      drawSmoothLine(ctx, drawing.currentStroke);
      ctx.shadowBlur = 0;
    }

    // Cursor
    if (fingertipPosition) {
      const p = toCanvas(fingertipPosition);
      const active = isDrawingRef.current;

      if (active) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, active ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#3b82f6' : 'rgba(255,255,255,0.5)';
      ctx.fill();
    }
  }, [drawing, fingertipPosition, width, height, toCanvas]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
}

function drawSmoothLine(ctx: CanvasRenderingContext2D, points: Point2D[]) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    ctx.lineTo(points[1].x, points[1].y);
  } else {
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  ctx.stroke();
}
