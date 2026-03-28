'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { normalizedToScreenPixels } from './model-utils';
import type { Point2D } from '@/types/hand-tracking';

class SmoothingFilter {
  private history: Point2D[] = [];
  private readonly maxHistory = 3;

  filter(point: Point2D): Point2D {
    this.history.push(point);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

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

export function AnnotationOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const filterRef = useRef(new SmoothingFilter());
  const isAnnotatingRef = useRef(false);
  const lastPointRef = useRef<Point2D | null>(null);
  const palmHoldRef = useRef<number | null>(null);

  const hands = useAppStore((state) => state.hands);
  const annotations = useAppStore((state) => state.annotations);
  const addAnnotationPoint = useAppStore((state) => state.addAnnotationPoint);
  const finishAnnotationStroke = useAppStore((state) => state.finishAnnotationStroke);
  const clearAnnotations = useAppStore((state) => state.clearAnnotations);

  const primaryHand = hands[0] ?? null;
  const gesture = primaryHand?.gesture ?? null;
  const fingertipPosition = primaryHand?.fingertipPosition ?? null;

  const toCanvas = useCallback((p: Point2D): Point2D => {
    const canvas = canvasRef.current;
    if (!canvas) return p;
    return normalizedToScreenPixels(p, canvas.width, canvas.height);
  }, []);

  // Handle annotation gesture state
  useEffect(() => {
    const isPinching = gesture?.type === 'pinch';
    const isOpenPalm = gesture?.type === 'open_palm';

    if (isPinching && !isAnnotatingRef.current) {
      isAnnotatingRef.current = true;
      filterRef.current.reset();
      lastPointRef.current = null;
    }

    if (!isPinching && isAnnotatingRef.current) {
      isAnnotatingRef.current = false;
      finishAnnotationStroke();
    }

    if (isOpenPalm) {
      if (!palmHoldRef.current) {
        palmHoldRef.current = Date.now();
      } else if (Date.now() - palmHoldRef.current > 800) {
        clearAnnotations();
        palmHoldRef.current = null;
      }
    } else {
      palmHoldRef.current = null;
    }
  }, [gesture, finishAnnotationStroke, clearAnnotations]);

  // Add annotation points while drawing
  useEffect(() => {
    if (!isAnnotatingRef.current || !fingertipPosition) return;

    const raw = toCanvas(fingertipPosition);
    const smooth = filterRef.current.filter(raw);

    if (lastPointRef.current) {
      const dist = Math.hypot(
        smooth.x - lastPointRef.current.x,
        smooth.y - lastPointRef.current.y,
      );
      if (dist < 2) return;
    }

    addAnnotationPoint(smooth);
    lastPointRef.current = smooth;
  }, [fingertipPosition, toCanvas, addAnnotationPoint]);

  // Render annotation strokes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Completed annotation strokes — white with blue glow
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    annotations.strokes.forEach((s) => drawSmoothLine(ctx, s));

    // Current annotation stroke — white with brighter blue glow
    if (annotations.currentStroke.length > 1) {
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      drawSmoothLine(ctx, annotations.currentStroke);
    }
    ctx.shadowBlur = 0;

    // Cursor
    if (fingertipPosition) {
      const p = toCanvas(fingertipPosition);
      const active = isAnnotatingRef.current;

      if (active) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, active ? 5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#3b82f6' : 'rgba(255,255,255,0.4)';
      ctx.fill();
    }
  }, [annotations, fingertipPosition, toCanvas]);

  return (
    <canvas
      ref={canvasRef}
      width={typeof window !== 'undefined' ? window.innerWidth : 1920}
      height={typeof window !== 'undefined' ? window.innerHeight : 1080}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 30 }}
    />
  );
}
