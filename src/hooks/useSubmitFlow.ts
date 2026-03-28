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
    addMessage,
    setChatOpen,
  } = useAppStore();

  const submit = useCallback(
    async (dimensions: { width: number; height: number }) => {
      const image = captureDrawingAsImage(drawing, dimensions.width, dimensions.height);
      setCanvasImage(image);

      // Open chat panel and show user message immediately
      setChatOpen(true);
      addMessage({
        id: generateMessageId(),
        role: 'user',
        content: inputText || '(no prompt)',
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
          body: JSON.stringify({ image, prompt: inputText }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze drawing');
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
        const errorText = 'Sorry, I could not analyze your drawing. Please make sure you have set up your Gemini API key.';
        console.error('Error analyzing drawing:', error);
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
    [drawing, inputText, setMode, setIsLoading, setResponse, addMessage, setChatOpen]
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
