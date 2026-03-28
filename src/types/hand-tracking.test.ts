import { describe, it, expect } from 'vitest';
import type { GestureType, HandData, GestureState, Point2D } from './hand-tracking';

describe('GestureType', () => {
  it('should include grab gesture type', () => {
    const grabGesture: GestureType = 'grab';
    expect(grabGesture).toBe('grab');
  });

  it('should include peace gesture type', () => {
    const peaceGesture: GestureType = 'peace';
    expect(peaceGesture).toBe('peace');
  });

  it('should include existing gesture types', () => {
    const idle: GestureType = 'idle';
    const openPalm: GestureType = 'open_palm';
    const pointing: GestureType = 'pointing';
    const pinch: GestureType = 'pinch';
    expect(idle).toBe('idle');
    expect(openPalm).toBe('open_palm');
    expect(pointing).toBe('pointing');
    expect(pinch).toBe('pinch');
  });
});

describe('HandData interface', () => {
  it('should allow creating a HandData object with all required fields', () => {
    const gesture: GestureState = { type: 'pinch', confidence: 0.9 };
    const landmarks: Point2D[] = [{ x: 0.5, y: 0.5 }];
    const fingertipPosition: Point2D = { x: 0.3, y: 0.4 };

    const handData: HandData = {
      landmarks,
      gesture,
      fingertipPosition,
      handedness: 'Right',
    };

    expect(handData.handedness).toBe('Right');
    expect(handData.gesture.type).toBe('pinch');
    expect(handData.fingertipPosition).toEqual({ x: 0.3, y: 0.4 });
  });

  it('should allow fingertipPosition to be null', () => {
    const handData: HandData = {
      landmarks: [],
      gesture: { type: 'idle', confidence: 0 },
      fingertipPosition: null,
      handedness: 'Left',
    };

    expect(handData.fingertipPosition).toBeNull();
    expect(handData.handedness).toBe('Left');
  });
});
