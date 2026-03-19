'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { GestureState, Point2D } from '@/types/hand-tracking';
import { LANDMARK_INDICES } from '@/types/hand-tracking';

interface UseHandTrackingOptions {
  onResults?: (results: HandLandmarkerResult) => void;
  onGesture?: (gesture: GestureState) => void;
  onFingertip?: (position: Point2D | null) => void;
}

interface UseHandTrackingReturn {
  isLoading: boolean;
  isRunning: boolean;
  error: string | null;
  start: (videoElement: HTMLVideoElement) => void;
  stop: () => void;
  fps: number;
}

export function useHandTracking(
  options: UseHandTrackingOptions = {}
): UseHandTrackingReturn {
  const { onResults, onGesture, onFingertip } = options;

  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  // Store callbacks in refs to avoid stale closures
  const onResultsRef = useRef(onResults);
  const onGestureRef = useRef(onGesture);
  const onFingertipRef = useRef(onFingertip);

  useEffect(() => {
    onResultsRef.current = onResults;
    onGestureRef.current = onGesture;
    onFingertipRef.current = onFingertip;
  }, [onResults, onGesture, onFingertip]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fps, setFps] = useState(0);

  // Detect gesture from landmarks
  const detectGesture = useCallback(
    (landmarks: NormalizedLandmark[]): GestureState => {
      if (landmarks.length === 0) {
        return { type: 'idle', confidence: 0 };
      }

      const thumbTip = landmarks[LANDMARK_INDICES.THUMB_TIP];
      const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
      const middleTip = landmarks[LANDMARK_INDICES.MIDDLE_TIP];
      const ringTip = landmarks[LANDMARK_INDICES.RING_TIP];
      const pinkyTip = landmarks[LANDMARK_INDICES.PINKY_TIP];

      // Calculate pinch distance (thumb to index)
      const pinchDistance = Math.sqrt(
        Math.pow(thumbTip.x - indexTip.x, 2) +
          Math.pow(thumbTip.y - indexTip.y, 2)
      );

      // Pinch gesture - thumb and index finger close together
      if (pinchDistance < 0.05) {
        return { type: 'pinch', confidence: 1 - pinchDistance / 0.05 };
      }

      // Open palm - all fingers extended (tips above MCP joints)
      const indexMcp = landmarks[LANDMARK_INDICES.INDEX_MCP];
      const middleMcp = landmarks[LANDMARK_INDICES.MIDDLE_MCP];
      const ringMcp = landmarks[LANDMARK_INDICES.RING_MCP];
      const pinkyMcp = landmarks[LANDMARK_INDICES.PINKY_MCP];

      const fingersExtended =
        indexTip.y < indexMcp.y &&
        middleTip.y < middleMcp.y &&
        ringTip.y < ringMcp.y &&
        pinkyTip.y < pinkyMcp.y;

      if (fingersExtended) {
        return { type: 'open_palm', confidence: 0.8 };
      }

      // Pointing - only index finger extended
      const onlyIndexExtended =
        indexTip.y < indexMcp.y &&
        middleTip.y > middleMcp.y &&
        ringTip.y > ringMcp.y &&
        pinkyTip.y > pinkyMcp.y;

      if (onlyIndexExtended) {
        return { type: 'pointing', confidence: 0.9 };
      }

      return { type: 'idle', confidence: 0.5 };
    },
    []
  );

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
          numHands: 1,
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
          const message =
            err instanceof Error ? err.message : 'Failed to initialize hand tracking';
          setError(message);
          setIsLoading(false);
        }
      }
    }

    initializeHandLandmarker();

    return () => {
      mounted = false;
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
    };
  }, []);

  // Detection loop using regular function with refs
  useEffect(() => {
    function detect() {
      if (!isRunningRef.current) return;

      const videoElement = videoElementRef.current;

      if (
        !handLandmarkerRef.current ||
        !videoElement ||
        videoElement.readyState < 2
      ) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const now = performance.now();

      // Only process if enough time has passed (target ~30fps for performance)
      if (now - lastTimeRef.current < 33) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      // FPS calculation
      frameCountRef.current++;
      if (now - fpsTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        fpsTimeRef.current = now;
      }

      try {
        const results = handLandmarkerRef.current.detectForVideo(
          videoElement,
          now
        );

        if (onResultsRef.current) {
          onResultsRef.current(results);
        }

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];

          // Detect gesture
          const gesture = detectGesture(landmarks);
          if (onGestureRef.current) {
            onGestureRef.current(gesture);
          }

          // Get fingertip position (index finger tip)
          const indexTip = landmarks[LANDMARK_INDICES.INDEX_TIP];
          if (onFingertipRef.current) {
            onFingertipRef.current({
              x: indexTip.x,
              y: indexTip.y,
            });
          }
        } else {
          if (onGestureRef.current) {
            onGestureRef.current({ type: 'idle', confidence: 0 });
          }
          if (onFingertipRef.current) {
            onFingertipRef.current(null);
          }
        }
      } catch (err) {
        console.error('Hand tracking error:', err);
      }

      lastTimeRef.current = now;
      animationFrameRef.current = requestAnimationFrame(detect);
    }

    if (isRunning) {
      detect();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, detectGesture]);

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
