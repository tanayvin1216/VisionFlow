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
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
        {/* Status */}
        <div className="flex items-center gap-2 px-3 py-2 bg-black/60 rounded-lg backdrop-blur-sm">
          <div className={`w-2 h-2 rounded-full ${
            mode === 'drawing' ? 'bg-blue-500 animate-pulse' :
            handTrackingRunning ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          <span className="text-sm text-white/90 font-medium">
            {mode === 'drawing' ? 'Drawing' :
             handTrackingLoading ? 'Loading...' :
             handTrackingRunning ? 'Ready' : 'Starting...'}
          </span>
        </div>

        {/* FPS */}
        <div className="px-3 py-2 bg-black/60 rounded-lg backdrop-blur-sm">
          <span className="text-sm font-mono text-white/70">{fps} fps</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/90">
          <div className="text-center p-8">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button
              onClick={startWebcam}
              className="px-6 py-2 bg-white text-black rounded-full font-medium hover:bg-gray-200"
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

      {/* Hand skeleton (subtle) */}
      <HandLandmarksOverlay
        results={results}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Instructions - only when no hand detected and not drawing */}
      {handTrackingRunning && !results?.landmarks?.length && !hasDrawing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8 bg-black/70 rounded-2xl backdrop-blur max-w-sm">
            <h2 className="text-2xl font-semibold text-white mb-6">VisionFlow</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-4">
                <span className="text-2xl">🤏</span>
                <p className="text-white/80">Pinch to draw</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">✋</span>
                <p className="text-white/80">Open palm to clear</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl">⏎</span>
                <p className="text-white/80">Enter to submit</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stroke count */}
      {hasDrawing && (
        <div className="absolute bottom-4 left-4 z-20 px-3 py-2 bg-black/60 rounded-lg backdrop-blur-sm">
          <span className="text-sm text-white/70">
            {drawing.strokes.length + (drawing.currentStroke.length > 0 ? 1 : 0)} strokes
          </span>
        </div>
      )}
    </div>
  );
}
