import { describe, it, expect } from 'vitest';

// Test that utility functions used in hand model controls work correctly.
// These pure functions are extracted so they can be unit tested without R3F context.

import {
  computeHandDistance,
  computeMidpoint,
  lerpValue,
  normalizedToScreenPixels,
} from './model-utils';

describe('computeHandDistance', () => {
  it('should return 0 for identical points', () => {
    expect(computeHandDistance({ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 })).toBe(0);
  });

  it('should return correct distance between two points', () => {
    const dist = computeHandDistance({ x: 0, y: 0 }, { x: 0.3, y: 0.4 });
    expect(dist).toBeCloseTo(0.5);
  });
});

describe('computeMidpoint', () => {
  it('should return midpoint between two positions', () => {
    const mid = computeMidpoint({ x: 0.2, y: 0.4 }, { x: 0.6, y: 0.8 });
    expect(mid.x).toBeCloseTo(0.4);
    expect(mid.y).toBeCloseTo(0.6);
  });
});

describe('lerpValue', () => {
  it('should return current value when factor is 0', () => {
    expect(lerpValue(0, 10, 0)).toBe(0);
  });

  it('should return target value when factor is 1', () => {
    expect(lerpValue(0, 10, 1)).toBe(10);
  });

  it('should interpolate halfway at factor 0.5', () => {
    expect(lerpValue(0, 10, 0.5)).toBe(5);
  });
});

describe('normalizedToScreenPixels', () => {
  it('should map 0,0 normalized to 0,0 screen', () => {
    const result = normalizedToScreenPixels({ x: 0, y: 0 }, 1920, 1080);
    expect(result.x).toBe(1920); // x is mirrored: (1 - 0) * 1920
    expect(result.y).toBe(0);
  });

  it('should mirror X axis for webcam display', () => {
    // normalized x=1.0 maps to screen x=0 (fully mirrored)
    const result = normalizedToScreenPixels({ x: 1, y: 0 }, 1920, 1080);
    expect(result.x).toBe(0);
  });

  it('should map center point correctly', () => {
    const result = normalizedToScreenPixels({ x: 0.5, y: 0.5 }, 1000, 500);
    expect(result.x).toBe(500);
    expect(result.y).toBe(250);
  });
});
