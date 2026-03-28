'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { useWebcam } from '@/hooks/useWebcam';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useAppStore } from '@/lib/store/app-store';
import { HandLandmarksOverlay } from './HandLandmarksOverlay';
import { DrawingCanvas } from './DrawingCanvas';

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

export function HandTracking() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: VIDEO_WIDTH, height: VIDEO_HEIGHT });
  const [results, setResults] = useState<HandLandmarkerResult | null>(null);

  const {
    setWebcamEnabled,
    setIsTracking,
    setCurrentGesture,
    setHands,
    setFps,
    mode,
    drawing,
    fps,
  } = useAppStore();

  const { videoRef, isReady: webcamReady, error: webcamError, start: startWebcam, stop: stopWebcam } = useWebcam({
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
  });

  const handleResults = useCallback((newResults: HandLandmarkerResult) => {
    setResults(newResults);
  }, []);

  const {
    isLoading: handTrackingLoading,
    isRunning: handTrackingRunning,
    error: handTrackingError,
    start: startHandTracking,
    stop: stopHandTracking,
    fps: trackingFps,
  } = useHandTracking({
    onResults: handleResults,
    onGesture: setCurrentGesture,
    onHandsDetected: setHands,
  });

  useEffect(() => {
    setFps(trackingFps);
  }, [trackingFps, setFps]);

  useEffect(() => {
    function updateDimensions() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    }
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
      stopHandTracking();
    };
  }, [startWebcam, stopWebcam, stopHandTracking]);

  useEffect(() => {
    if (webcamReady && !handTrackingLoading && !handTrackingRunning && videoRef.current) {
      startHandTracking(videoRef.current);
      setWebcamEnabled(true);
      setIsTracking(true);
    }
  }, [webcamReady, handTrackingLoading, handTrackingRunning, startHandTracking, setWebcamEnabled, setIsTracking, videoRef]);

  const error = webcamError || handTrackingError;
  const hasDrawing = drawing.strokes.length > 0 || drawing.currentStroke.length > 0;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden">
      {/* Status pill — top left */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8 }}>
        <div
          className="rounded-full"
          style={{
            width: 7,
            height: 7,
            background: mode === 'drawing' ? '#6EE7B7' : handTrackingRunning ? '#6EE7B7' : '#FCD34D',
            boxShadow: mode === 'drawing' ? '0 0 6px rgba(110,231,183,0.5)' : 'none',
          }}
        />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
          {mode === 'drawing' ? 'Drawing' :
           handTrackingLoading ? 'Loading...' :
           handTrackingRunning ? 'Ready' : 'Starting...'}
        </span>
      </div>

      {/* FPS — top right */}
      <div className="absolute top-4 right-4 z-20 px-3 py-1.5" style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontVariantNumeric: 'tabular-nums' }}>
          {fps} fps
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/90">
          <div className="text-center p-8">
            <p style={{ color: '#EF4444', fontSize: 16, marginBottom: 16 }}>{error}</p>
            <button
              onClick={startWebcam}
              style={{
                padding: '8px 24px',
                background: 'white',
                color: 'black',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
        autoPlay
      />

      {/* Drawing canvas */}
      <DrawingCanvas width={dimensions.width} height={dimensions.height} />

      {/* Hand skeleton */}
      <HandLandmarksOverlay
        results={results}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Instructions — when no hand detected */}
      {handTrackingRunning && !results?.landmarks?.length && !hasDrawing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="text-center"
            style={{
              padding: '32px 40px',
              background: 'rgba(0,0,0,0.65)',
              borderRadius: 16,
              maxWidth: 340,
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 22,
                fontWeight: 400,
                color: 'white',
                marginBottom: 24,
              }}
            >
              VisionFlow
            </h2>
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-center gap-4">
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', minWidth: 24 }}>01</span>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>Pinch to draw</p>
              </div>
              <div className="flex items-center gap-4">
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', minWidth: 24 }}>02</span>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>Two palms to clear</p>
              </div>
              <div className="flex items-center gap-4">
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', minWidth: 24 }}>03</span>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>Enter to submit</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stroke count */}
      {hasDrawing && (
        <div
          className="absolute bottom-4 left-4 z-20 px-3 py-1.5"
          style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8 }}
        >
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            {drawing.strokes.length + (drawing.currentStroke.length > 0 ? 1 : 0)} strokes
          </span>
        </div>
      )}
    </div>
  );
}
