import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './app-store';
import type { HandData } from '@/types/hand-tracking';

describe('AppStore gesture system upgrade', () => {
  beforeEach(() => {
    useAppStore.setState({
      mode: 'idle',
      hands: [],
      interactionMode: 'draw',
      currentGesture: { type: 'idle', confidence: 0 },
      fingertipPosition: null,
    });
  });

  it('should have hands array initialized to empty', () => {
    const { hands } = useAppStore.getState();
    expect(hands).toEqual([]);
  });

  it('should update hands via setHands', () => {
    const mockHandData: HandData = {
      landmarks: [{ x: 0.5, y: 0.5 }],
      gesture: { type: 'pinch', confidence: 0.9 },
      fingertipPosition: { x: 0.3, y: 0.4 },
      handedness: 'Right',
    };

    useAppStore.getState().setHands([mockHandData]);

    const { hands } = useAppStore.getState();
    expect(hands).toHaveLength(1);
    expect(hands[0].handedness).toBe('Right');
    expect(hands[0].gesture.type).toBe('pinch');
  });

  it('should derive fingertipPosition from first hand when setHands is called', () => {
    const mockHandData: HandData = {
      landmarks: [],
      gesture: { type: 'pinch', confidence: 0.9 },
      fingertipPosition: { x: 0.25, y: 0.75 },
      handedness: 'Right',
    };

    useAppStore.getState().setHands([mockHandData]);

    const { fingertipPosition } = useAppStore.getState();
    expect(fingertipPosition).toEqual({ x: 0.25, y: 0.75 });
  });

  it('should derive currentGesture from first hand when setHands is called', () => {
    const mockHandData: HandData = {
      landmarks: [],
      gesture: { type: 'peace', confidence: 0.85 },
      fingertipPosition: null,
      handedness: 'Left',
    };

    useAppStore.getState().setHands([mockHandData]);

    const { currentGesture } = useAppStore.getState();
    expect(currentGesture.type).toBe('peace');
    expect(currentGesture.confidence).toBe(0.85);
  });

  it('should set fingertipPosition to null when no hands detected', () => {
    useAppStore.getState().setHands([]);

    const { fingertipPosition, currentGesture } = useAppStore.getState();
    expect(fingertipPosition).toBeNull();
    expect(currentGesture.type).toBe('idle');
  });

  it('should have interactionMode initialized to draw', () => {
    const { interactionMode } = useAppStore.getState();
    expect(interactionMode).toBe('draw');
  });

  it('should update interactionMode via setInteractionMode', () => {
    useAppStore.getState().setInteractionMode('model');
    expect(useAppStore.getState().interactionMode).toBe('model');

    useAppStore.getState().setInteractionMode('annotate');
    expect(useAppStore.getState().interactionMode).toBe('annotate');
  });

  it('should support new AppMode values model and annotate', () => {
    useAppStore.getState().setMode('model');
    expect(useAppStore.getState().mode).toBe('model');

    useAppStore.getState().setMode('annotate');
    expect(useAppStore.getState().mode).toBe('annotate');
  });
});
