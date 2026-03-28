'use client';

import { useCallback, useState } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { captureDrawingAsImage } from '@/lib/canvas/capture';

interface UseSubmitFlowReturn {
  canvasImage: string | null;
  submit: (dimensions: { width: number; height: number }) => void;
  reset: () => void;
}

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function captureVisibleScene(): string | null {
  // Try to capture the Three.js canvas (3D scene)
  const threeCanvas = document.querySelector('canvas[data-engine]') as HTMLCanvasElement | null;
  if (!threeCanvas) return null;

  // Create composite canvas with 3D scene + annotation overlay
  const composite = document.createElement('canvas');
  composite.width = threeCanvas.width;
  composite.height = threeCanvas.height;
  const ctx = composite.getContext('2d');
  if (!ctx) return null;

  // Draw the 3D scene
  ctx.drawImage(threeCanvas, 0, 0, composite.width, composite.height);

  // Overlay annotation canvas if present
  const annotationCanvas = document.querySelector('canvas[style*="z-index: 30"]') as HTMLCanvasElement | null;
  if (annotationCanvas) {
    ctx.drawImage(annotationCanvas, 0, 0, composite.width, composite.height);
  }

  return composite.toDataURL('image/png');
}

export function useSubmitFlow(): UseSubmitFlowReturn {
  const [canvasImage, setCanvasImage] = useState<string | null>(null);

  const {
    drawing,
    inputText,
    interactionMode,
    setMode,
    setInputText,
    setResponse,
    setIsLoading,
    clearDrawing,
    addMessage,
    setChatOpen,
  } = useAppStore();

  const submit = useCallback(
    async (dimensions: { width: number; height: number }) => {
      // Capture the right content based on current mode
      const isModelMode = interactionMode === 'model' || interactionMode === 'annotate';
      const image = isModelMode
        ? captureVisibleScene()
        : captureDrawingAsImage(drawing, dimensions.width, dimensions.height);

      setCanvasImage(image);

      const prompt = inputText;

      // Open chat panel and show user message immediately
      setChatOpen(true);
      addMessage({
        id: generateMessageId(),
        role: 'user',
        content: prompt || '(no prompt)',
        timestamp: Date.now(),
        image,
      });

      // Clear input text after capturing it for the message
      setInputText('');

      setIsLoading(true);
      setMode('thinking');

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image, prompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze');
        }

        const data = await response.json();
        setResponse(data.response);
        addMessage({
          id: generateMessageId(),
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
        });
      } catch (error) {
        const errorText = 'Sorry, I could not analyze. Please check your API key.';
        console.error('Error analyzing:', error);
        setResponse(errorText);
        addMessage({
          id: generateMessageId(),
          role: 'assistant',
          content: errorText,
          timestamp: Date.now(),
        });
      } finally {
        setIsLoading(false);
        setMode('response');
      }
    },
    [drawing, inputText, interactionMode, setMode, setIsLoading, setResponse, addMessage, setChatOpen, setInputText]
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
