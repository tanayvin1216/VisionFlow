'use client';

import { useCallback, useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { captureDrawingAsImage } from '@/lib/canvas/capture';

interface UseSubmitFlowReturn {
  canvasImage: string | null;
  submit: (dimensions: { width: number; height: number }) => void;
  reset: () => void;
}

export function useSubmitFlow(): UseSubmitFlowReturn {
  const [canvasImage, setCanvasImage] = useState<string | null>(null);

  const {
    drawing,
    inputText,
    setMode,
    setInputText,
    setResponse,
    setIsLoading,
    clearDrawing,
  } = useAppStore();

  const submit = useCallback(
    async (dimensions: { width: number; height: number }) => {
      // Capture drawing
      const image = captureDrawingAsImage(drawing, dimensions.width, dimensions.height);
      setCanvasImage(image);

      // Start submit animation
      setMode('submitting');

      // Simulate sending to API (will be replaced with real Gemini call)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Transition to thinking
      setMode('thinking');
      setIsLoading(true);

      try {
        // Call Gemini API
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: image,
            prompt: inputText,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze drawing');
        }

        const data = await response.json();
        setResponse(data.response);
      } catch (error) {
        console.error('Error analyzing drawing:', error);
        setResponse(
          'Sorry, I could not analyze your drawing. Please make sure you have set up your Gemini API key.'
        );
      } finally {
        setIsLoading(false);
        setMode('response');
      }
    },
    [drawing, inputText, setMode, setIsLoading, setResponse]
  );

  const reset = useCallback(() => {
    setCanvasImage(null);
    setMode('idle');
    setInputText('');
    setResponse('');
    clearDrawing();
  }, [setMode, setInputText, setResponse, clearDrawing]);

  return { canvasImage, submit, reset };
}
