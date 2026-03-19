'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';

interface HandLandmarksOverlayProps {
  results: HandLandmarkerResult | null;
  width: number;
  height: number;
}

// Hand connections for drawing skeleton
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17], // Palm
];

export function HandLandmarksOverlay({
  results,
  width,
  height,
}: HandLandmarksOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawLandmarks = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!results || !results.landmarks || results.landmarks.length === 0) {
      return;
    }

    // Draw each hand
    for (const landmarks of results.landmarks) {
      // Draw connections (skeleton)
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;

      for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];

        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
      }

      // Draw landmarks (points)
      for (let i = 0; i < landmarks.length; i++) {
        const landmark = landmarks[i];
        const x = landmark.x * width;
        const y = landmark.y * height;

        // Fingertips are larger and highlighted
        const isFingertip = [4, 8, 12, 16, 20].includes(i);
        const radius = isFingertip ? 8 : 4;
        const color = isFingertip ? '#ffffff' : '#3b82f6';

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // Add glow effect to index fingertip
        if (i === 8) {
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }
    }
  }, [results, width, height]);

  useEffect(() => {
    drawLandmarks();
  }, [drawLandmarks]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ transform: 'scaleX(-1)' }}
    />
  );
}
