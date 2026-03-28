import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './app-store';
import type { Point2D } from '@/types/hand-tracking';

describe('AppStore annotation state', () => {
  beforeEach(() => {
    useAppStore.setState({
      annotations: { strokes: [], currentStroke: [] },
      lastPeaceGestureTime: null,
    });
  });

  it('should have annotations initialized to empty', () => {
    const { annotations } = useAppStore.getState();
    expect(annotations.strokes).toEqual([]);
    expect(annotations.currentStroke).toEqual([]);
  });

  it('should add a point to current annotation stroke', () => {
    const point: Point2D = { x: 100, y: 200 };
    useAppStore.getState().addAnnotationPoint(point);

    const { annotations } = useAppStore.getState();
    expect(annotations.currentStroke).toHaveLength(1);
    expect(annotations.currentStroke[0]).toEqual({ x: 100, y: 200 });
  });

  it('should finish annotation stroke and move it to strokes array', () => {
    const p1: Point2D = { x: 10, y: 20 };
    const p2: Point2D = { x: 30, y: 40 };
    useAppStore.getState().addAnnotationPoint(p1);
    useAppStore.getState().addAnnotationPoint(p2);
    useAppStore.getState().finishAnnotationStroke();

    const { annotations } = useAppStore.getState();
    expect(annotations.strokes).toHaveLength(1);
    expect(annotations.strokes[0]).toEqual([p1, p2]);
    expect(annotations.currentStroke).toEqual([]);
  });

  it('should not add empty stroke to strokes array', () => {
    useAppStore.getState().finishAnnotationStroke();

    const { annotations } = useAppStore.getState();
    expect(annotations.strokes).toHaveLength(0);
  });

  it('should clear all annotations', () => {
    const p: Point2D = { x: 5, y: 5 };
    useAppStore.getState().addAnnotationPoint(p);
    useAppStore.getState().finishAnnotationStroke();
    useAppStore.getState().addAnnotationPoint(p);
    useAppStore.getState().clearAnnotations();

    const { annotations } = useAppStore.getState();
    expect(annotations.strokes).toEqual([]);
    expect(annotations.currentStroke).toEqual([]);
  });

  it('should have lastPeaceGestureTime initialized to null', () => {
    const { lastPeaceGestureTime } = useAppStore.getState();
    expect(lastPeaceGestureTime).toBeNull();
  });

  it('should update lastPeaceGestureTime', () => {
    const now = Date.now();
    useAppStore.getState().setLastPeaceGestureTime(now);
    expect(useAppStore.getState().lastPeaceGestureTime).toBe(now);
  });

  it('should clear lastPeaceGestureTime to null', () => {
    useAppStore.getState().setLastPeaceGestureTime(12345);
    useAppStore.getState().setLastPeaceGestureTime(null);
    expect(useAppStore.getState().lastPeaceGestureTime).toBeNull();
  });
});
