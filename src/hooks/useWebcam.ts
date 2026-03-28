'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface UseWebcamOptions {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
}

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isReady: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

export function useWebcam(options: UseWebcamOptions = {}): UseWebcamReturn {
  const { width = 1280, height = 720, facingMode = 'user' } = options;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    try {
      setError(null);
      console.log('Requesting webcam access...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: width },
          height: { ideal: height },
          facingMode,
        },
        audio: false,
      });

      console.log('Webcam stream obtained:', stream.getVideoTracks()[0].getSettings());
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current;
          if (!video) {
            reject(new Error('Video element not found'));
            return;
          }

          const onLoadedMetadata = () => {
            console.log('Video metadata loaded:', video.videoWidth, 'x', video.videoHeight);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            resolve();
          };

          const onError = () => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Video failed to load'));
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);

          // If already loaded
          if (video.readyState >= 1) {
            onLoadedMetadata();
          }
        });

        await videoRef.current.play();
        console.log('Video playing');
        setIsReady(true);
      } else {
        console.error('Video ref not available');
        setError('Video element not initialized');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to access webcam';
      setError(message);
      console.error('Webcam error:', err);
    }
  }, [width, height, facingMode]);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsReady(false);
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { videoRef, isReady, error, start, stop };
}
