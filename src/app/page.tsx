'use client';

import { useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { HandTracking } from '@/components/canvas';
import { InvisibleTextbox } from '@/components/textbox';
import { ChatPanel } from '@/components/chat';
import { Sidebar } from '@/components/layout';
import { useSubmitFlow } from '@/hooks/useSubmitFlow';
import { usePeaceGestureSwitch } from '@/hooks/usePeaceGestureSwitch';
import { useAppStore } from '@/lib/store/app-store';

const ModelScene = dynamic(
  () => import('@/components/model').then((m) => ({ default: m.ModelScene })),
  { ssr: false },
);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvasImage, submit, reset } = useSubmitFlow();
  const mode = useAppStore((state) => state.mode);
  const chatOpen = useAppStore((state) => state.chatOpen);
  const interactionMode = useAppStore((state) => state.interactionMode);
  const setInteractionMode = useAppStore((state) => state.setInteractionMode);
  const clearDrawing = useAppStore((state) => state.clearDrawing);

  usePeaceGestureSwitch();

  useEffect(() => {
    function handleKeySwitch(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === '1') {
        setInteractionMode('draw');
        clearDrawing();
      } else if (e.key === '2') {
        setInteractionMode('model');
      } else if (e.key === '3') {
        setInteractionMode('annotate');
      }
    }
    window.addEventListener('keydown', handleKeySwitch);
    return () => window.removeEventListener('keydown', handleKeySwitch);
  }, [setInteractionMode, clearDrawing]);

  const handleSubmit = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    submit({ width: rect.width, height: rect.height });
  }, [submit]);

  useEffect(() => {
    function handleCustomSubmit() {
      handleSubmit();
    }
    window.addEventListener('visionflow:submit', handleCustomSubmit);
    return () => window.removeEventListener('visionflow:submit', handleCustomSubmit);
  }, [handleSubmit]);

  const isDrawMode = interactionMode === 'draw';
  const isModelOrAnnotate = interactionMode === 'model' || interactionMode === 'annotate';

  void canvasImage;
  void reset;

  return (
    <div className="flex h-screen" style={{ background: 'var(--background)' }}>
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden p-5 gap-4">
        {/* Header */}
        <div className="flex items-baseline justify-between shrink-0">
          <h1
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 28,
              fontWeight: 400,
              color: 'var(--foreground)',
              letterSpacing: '-0.01em',
            }}
          >
            Welcome back, Tanay
          </h1>
          <div className="flex items-center gap-5" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <span>
              <span style={{ color: '#C4553D', marginRight: 4 }}>&#9679;</span>
              {interactionMode === 'draw' ? 'Draw' : interactionMode === 'model' ? '3D Model' : 'Annotate'}
            </span>
            <span>
              <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>&#9650;</span>
              {mode === 'idle' ? 'Ready' : mode === 'drawing' ? 'Drawing' : mode}
            </span>
          </div>
        </div>

        {/* Canvas viewport */}
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative"
          style={{
            borderRadius: 16,
            background: '#0A0A0A',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)',
          }}
        >
          {/* Hand tracking — always mounted */}
          <div
            className={`absolute inset-0 ${isModelOrAnnotate ? 'opacity-0 pointer-events-none' : ''}`}
          >
            <HandTracking />
          </div>

          {/* 3D model scene */}
          {isModelOrAnnotate && (
            <div className="absolute inset-0">
              <ModelScene />
            </div>
          )}

          {/* Contextual hints - bottom of canvas card */}
          {mode === 'idle' && !chatOpen && isDrawMode && (
            <div
              className="absolute bottom-4 left-5 z-20"
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}
            >
              <kbd style={{ color: 'rgba(255,255,255,0.55)' }}>Enter</kbd>
              {' '}to submit
            </div>
          )}

          {interactionMode === 'model' && (
            <div
              className="absolute bottom-4 left-5 z-20"
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}
            >
              grab to rotate &middot; two hands to zoom + pan
            </div>
          )}

          {interactionMode === 'annotate' && (
            <div
              className="absolute bottom-4 left-5 z-20"
              style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}
            >
              pinch to draw &middot; two hands to clear
            </div>
          )}
        </div>
      </main>

      {/* Invisible textbox for voice input — outside canvas so it works in all modes */}
      {!chatOpen && <InvisibleTextbox onSubmit={handleSubmit} />}

      {/* Chat panel */}
      <ChatPanel />
    </div>
  );
}
