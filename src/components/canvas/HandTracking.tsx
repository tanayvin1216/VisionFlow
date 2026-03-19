'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { HandLandmarkerResult } from '@mediapipe/tasks-vision';
import { useWebcam } from '@/hooks/useWebcam';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useAppStore } from '@/lib/store/app-store';
import { HandLandmarksOverlay } from './HandLandmarksOverlay';
import { DrawingCanvas } from './DrawingCanvas';
import { FpsCounter } from '../ui/FpsCounter';
import { ModeIndicator } from '../ui/ModeIndicator';

const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

export function HandTracking() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: VIDEO_WIDTH, height: VIDEO_HEIGHT });
  const [results, setResults] = useState<HandLandmarkerResult | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  const {
    setWebcamEnabled,
    setIsTracking,
    setCurrentGesture,
    setFingertipPosition,
    setFps,
    mode,
    drawing,
  } = useAppStore();

  const { videoRef, isReady: webcamReady, error: webcamError, start: startWebcam, stop: stopWebcam } = useWebcam({
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
  });

  const handleResults = useCallback((newResults: HandLandmarkerResult) => {
    setResults(newResults);
    // Hide instructions once we detect a hand
    if (newResults.landmarks && newResults.landmarks.length > 0) {
      setShowInstructions(false);
    }
  }, []);

  const {
    isLoading: handTrackingLoading,
    isRunning: handTrackingRunning,
    error: handTrackingError,
    start: startHandTracking,
    stop: stopHandTracking,
    fps,
  } = useHandTracking({
    onResults: handleResults,
    onGesture: setCurrentGesture,
    onFingertip: setFingertipPosition,
  });

  // Update FPS in store
  useEffect(() => {
    setFps(fps);
  }, [fps, setFps]);

  // Update dimensions on resize
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

  // Start webcam automatically
  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
      stopHandTracking();
    };
  }, [startWebcam, stopWebcam, stopHandTracking]);

  // Start hand tracking when webcam is ready
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
      {/* Mode indicator */}
      <ModeIndicator />

      {/* Status indicators */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {handTrackingLoading && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-sm text-white/80">Loading hand tracking...</span>
          </div>
        )}
        {handTrackingRunning && !handTrackingLoading && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 rounded-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-sm text-white/80">Tracking active</span>
          </div>
        )}
        {mode === 'drawing' && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/30 rounded-lg backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm text-white">Drawing...</span>
          </div>
        )}
      </div>

      {/* FPS Counter */}
      <FpsCounter />

      {/* Error display */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/80">
          <div className="text-center p-6 max-w-md">
            <div className="text-red-500 text-xl mb-2">Error</div>
            <p className="text-white/80">{error}</p>
            <button
              onClick={() => {
                startWebcam();
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Video feed (mirrored) */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
        playsInline
        muted
      />

      {/* Drawing canvas */}
      <DrawingCanvas width={dimensions.width} height={dimensions.height} />

      {/* Hand landmarks overlay */}
      <HandLandmarksOverlay
        results={results}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* Instructions overlay */}
      {showInstructions && handTrackingRunning && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="text-center p-8 bg-black/70 rounded-2xl backdrop-blur-sm max-w-md">
            <h2 className="text-2xl font-semibold text-white mb-4">VisionFlow</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-lg">
                  <span className="text-lg">👌</span>
                </div>
                <p className="text-white/80 text-sm">
                  <strong className="text-white">Pinch</strong> to draw in the air
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-lg">
                  <span className="text-lg">✋</span>
                </div>
                <p className="text-white/80 text-sm">
                  <strong className="text-white">Open palm</strong> to clear drawing
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500/20 rounded-lg">
                  <span className="text-lg">⌨️</span>
                </div>
                <p className="text-white/80 text-sm">
                  <strong className="text-white">Enter</strong> to submit for analysis
                </p>
              </div>
            </div>
            <p className="text-white/50 text-xs mt-4">Show your hand to begin</p>
          </div>
        </div>
      )}

      {/* Waiting for webcam */}
      {!handTrackingRunning && !handTrackingLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center p-6 bg-black/50 rounded-xl backdrop-blur-sm">
            <h2 className="text-xl text-white mb-2">VisionFlow</h2>
            <p className="text-white/70">Initializing webcam...</p>
          </div>
        </div>
      )}

      {/* Drawing count indicator */}
      {hasDrawing && (
        <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 bg-black/50 rounded-lg backdrop-blur-sm">
          <span className="text-sm text-white/80">
            {drawing.strokes.length} stroke{drawing.strokes.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
