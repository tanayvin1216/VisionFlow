'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { GestureState, Point2D, HandData } from '@/types/hand-tracking';
import { LANDMARK_INDICES } from '@/types/hand-tracking';

interface UseHandTrackingOptions {
  onResults?: (results: HandLandmarkerResult) => void;
  onGesture?: (gesture: GestureState) => void;
  onHandsDetected?: (hands: HandData[]) => void;
}

interface UseHandTrackingReturn {
  isLoading: boolean;
  isRunning: boolean;
  error: string | null;
  start: (videoElement: HTMLVideoElement) => void;
  stop: () => void;
  fps: number;
}

function computePinchMidpoint(
  landmarks: NormalizedLandmark[]
): Point2D {
  const thumbTip = landmarks[LANDMARK_INDICES.THUMB_TIP];
  const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
  return {
    x: (thumbTip.x + indexTip.x) / 2,
    y: (thumbTip.y + indexTip.y) / 2,
  };
}

function computeFingertipPosition(
  landmarks: NormalizedLandmark[],
  gesture: GestureState
): Point2D {
  if (gesture.type === 'pinch') {
    return computePinchMidpoint(landmarks);
  }
  const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
  return { x: indexTip.x, y: indexTip.y };
}

// Hysteresis: once pinching, require larger distance to release
const PINCH_ENTER_THRESHOLD = 0.07;
const PINCH_EXIT_THRESHOLD = 0.10;
let wasPinching = false;

function detectGesture(landmarks: NormalizedLandmark[]): GestureState {
  if (landmarks.length === 0) {
    wasPinching = false;
    return { type: 'idle', confidence: 0 };
  }

  const thumbTip = landmarks[LANDMARK_INDICES.THUMB_TIP];
  const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
  const indexPip = landmarks[LANDMARK_INDICES.INDEX_PIP];
  const indexMcp = landmarks[LANDMARK_INDICES.INDEX_MCP];
  const middleTip = landmarks[LANDMARK_INDICES.MIDDLE_TIP];
  const middleMcp = landmarks[LANDMARK_INDICES.MIDDLE_MCP];
  const middlePip = landmarks[LANDMARK_INDICES.MIDDLE_PIP];
  const ringTip = landmarks[LANDMARK_INDICES.RING_TIP];
  const ringMcp = landmarks[LANDMARK_INDICES.RING_MCP];
  const pinkyTip = landmarks[LANDMARK_INDICES.PINKY_TIP];
  const pinkyMcp = landmarks[LANDMARK_INDICES.PINKY_MCP];

  const thumbIndexDist = Math.hypot(
    thumbTip.x - indexTip.x,
    thumbTip.y - indexTip.y
  );

  const indexExtended = indexTip.y < indexPip.y && indexTip.y < indexMcp.y;
  const middleExtended = middleTip.y < middleMcp.y;
  const middleCurled = middleTip.y > middleMcp.y;
  const ringCurled = ringTip.y > ringMcp.y;
  const pinkyCurled = pinkyTip.y > pinkyMcp.y;

  const allExtended =
    indexTip.y < indexMcp.y &&
    middleTip.y < middleMcp.y &&
    ringTip.y < ringMcp.y &&
    pinkyTip.y < pinkyMcp.y;

  const allCurled = !indexExtended && middleCurled && ringCurled && pinkyCurled;

  // Open palm FIRST — if all fingers are clearly extended, it's never a pinch
  // (thumb-index can appear close in 2D projection even with open hand)
  if (allExtended) {
    wasPinching = false;
    return { type: 'open_palm', confidence: 0.9 };
  }

  // Pinch with hysteresis — but only if fingers aren't all extended
  const pinchThreshold = wasPinching ? PINCH_EXIT_THRESHOLD : PINCH_ENTER_THRESHOLD;
  if (thumbIndexDist < pinchThreshold && !middleExtended) {
    wasPinching = true;
    return { type: 'pinch', confidence: 0.95 };
  }
  wasPinching = false;

  // Peace: index + middle extended, ring + pinky curled
  if (indexExtended && middleExtended && ringCurled && pinkyCurled) {
    return { type: 'peace', confidence: 0.9 };
  }

  // Pointing: index extended, others curled
  if (indexExtended && middleCurled && ringCurled && pinkyCurled) {
    return { type: 'pointing', confidence: 0.95 };
  }

  // Grab: all fingers curled
  if (allCurled) {
    return { type: 'grab', confidence: 0.85 };
  }

  return { type: 'idle', confidence: 0.5 };
}

function buildHandData(
  landmarks: NormalizedLandmark[],
  handedness: 'Left' | 'Right'
): HandData {
  const gesture = detectGesture(landmarks);
  const fingertipPosition = computeFingertipPosition(landmarks, gesture);
  const point2DLandmarks: Point2D[] = landmarks.map((l) => ({
    x: l.x,
    y: l.y,
  }));

  return { landmarks: point2DLandmarks, gesture, fingertipPosition, handedness };
}

function parseHandedness(
  handednessResult: { categoryName: string; score: number }[]
): 'Left' | 'Right' {
  const category = handednessResult[0]?.categoryName;
  return category === 'Left' ? 'Left' : 'Right';
}

export function useHandTracking(
  options: UseHandTrackingOptions = {}
): UseHandTrackingReturn {
  const { onResults, onGesture, onHandsDetected } = options;

  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  const onResultsRef = useRef(onResults);
  const onGestureRef = useRef(onGesture);
  const onHandsDetectedRef = useRef(onHandsDetected);

  useEffect(() => {
    onResultsRef.current = onResults;
    onGestureRef.current = onGesture;
    onHandsDetectedRef.current = onHandsDetected;
  }, [onResults, onGesture, onHandsDetected]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  // Initialize MediaPipe
  useEffect(() => {
    let mounted = true;

    async function initializeHandLandmarker() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (mounted) {
          handLandmarkerRef.current = handLandmarker;
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load');
          setIsLoading(false);
        }
      }
    }

    initializeHandLandmarker();

    return () => {
      mounted = false;
      handLandmarkerRef.current?.close();
    };
  }, []);

  // Detection loop - 60fps target
  useEffect(() => {
    function detect() {
      if (!isRunningRef.current) return;

      const video = videoElementRef.current;
      const handLandmarker = handLandmarkerRef.current;

      if (!handLandmarker || !video || video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const now = performance.now();

      if (now - lastTimeRef.current < 16) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      frameCountRef.current++;
      if (now - fpsTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        fpsTimeRef.current = now;
      }

      try {
        const results = handLandmarker.detectForVideo(video, now);
        onResultsRef.current?.(results);

        if (results.landmarks && results.landmarks.length > 0) {
          const detectedHands: HandData[] = results.landmarks.map(
            (landmarks, index) => {
              const handednessData = results.handedness[index];
              const handedness = handednessData
                ? parseHandedness(handednessData)
                : 'Right';
              return buildHandData(landmarks, handedness);
            }
          );

          onHandsDetectedRef.current?.(detectedHands);

          const primaryGesture = detectedHands[0]?.gesture ?? {
            type: 'idle' as const,
            confidence: 0,
          };
          onGestureRef.current?.(primaryGesture);
        } else {
          onHandsDetectedRef.current?.([]);
          onGestureRef.current?.({ type: 'idle', confidence: 0 });
        }
      } catch {
        // Silent fail on detection errors
      }

      lastTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(detect);
    }

    if (isRunning) detect();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning]);

  const start = useCallback((videoElement: HTMLVideoElement) => {
    if (isRunningRef.current) return;
    videoElementRef.current = videoElement;
    isRunningRef.current = true;
    setIsRunning(true);
    fpsTimeRef.current = performance.now();
    frameCountRef.current = 0;
  }, []);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsRunning(false);
    setFps(0);
  }, []);

  return { isLoading, isRunning, error, start, stop, fps };
}
