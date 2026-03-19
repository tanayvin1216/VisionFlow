'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import type { Point2D } from '@/types/hand-tracking';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

export function DrawingCanvas({ width, height }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPointRef = useRef<Point2D | null>(null);
  const isDrawingRef = useRef(false);

  const {
    currentGesture,
    fingertipPosition,
    drawing,
    addPointToCurrentStroke,
    finishCurrentStroke,
    clearDrawing,
    setMode,
  } = useAppStore();

  // Convert normalized coordinates to canvas coordinates
  const toCanvasCoords = useCallback(
    (point: Point2D): Point2D => ({
      x: (1 - point.x) * width, // Mirror X for natural drawing
      y: point.y * height,
    }),
    [width, height]
  );

  // Handle gesture changes
  useEffect(() => {
    const isPinching = currentGesture.type === 'pinch';
    const isOpenPalm = currentGesture.type === 'open_palm';

    // Start drawing on pinch
    if (isPinching && !isDrawingRef.current) {
      isDrawingRef.current = true;
      setMode('drawing');
      lastPointRef.current = null;
    }

    // Stop drawing when not pinching
    if (!isPinching && isDrawingRef.current) {
      isDrawingRef.current = false;
      finishCurrentStroke();
      setMode('idle');
    }

    // Clear on open palm (held for a moment)
    if (isOpenPalm && currentGesture.confidence > 0.7) {
      clearDrawing();
    }
  }, [currentGesture, finishCurrentStroke, clearDrawing, setMode]);

  // Add points while drawing
  useEffect(() => {
    if (!isDrawingRef.current || !fingertipPosition) return;

    const canvasPoint = toCanvasCoords(fingertipPosition);

    // Only add point if it's far enough from the last point (reduces jitter)
    if (lastPointRef.current) {
      const distance = Math.sqrt(
        Math.pow(canvasPoint.x - lastPointRef.current.x, 2) +
          Math.pow(canvasPoint.y - lastPointRef.current.y, 2)
      );
      if (distance < 3) return; // Minimum distance threshold
    }

    addPointToCurrentStroke(canvasPoint);
    lastPointRef.current = canvasPoint;
  }, [fingertipPosition, addPointToCurrentStroke, toCanvasCoords]);

  // Draw all strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set drawing style
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw completed strokes
    for (const stroke of drawing.strokes) {
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

    // Draw current stroke
    if (drawing.currentStroke.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(drawing.currentStroke[0].x, drawing.currentStroke[0].y);

      for (let i = 1; i < drawing.currentStroke.length - 1; i++) {
        const xc = (drawing.currentStroke[i].x + drawing.currentStroke[i + 1].x) / 2;
        const yc = (drawing.currentStroke[i].y + drawing.currentStroke[i + 1].y) / 2;
        ctx.quadraticCurveTo(
          drawing.currentStroke[i].x,
          drawing.currentStroke[i].y,
          xc,
          yc
        );
      }

      const last = drawing.currentStroke[drawing.currentStroke.length - 1];
      ctx.lineTo(last.x, last.y);

      // Add glow effect for current stroke
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [drawing, width, height]);

  // Draw cursor at fingertip position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fingertipPosition) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const point = toCanvasCoords(fingertipPosition);

    // Draw cursor circle
    ctx.beginPath();
    ctx.arc(point.x, point.y, isDrawingRef.current ? 8 : 5, 0, 2 * Math.PI);
    ctx.fillStyle = isDrawingRef.current ? '#3b82f6' : 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    // Draw outer ring when drawing
    if (isDrawingRef.current) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 12, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [fingertipPosition, toCanvasCoords]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none z-10"
    />
  );
}
