'use client';

import { useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { HandTracking } from '@/components/canvas';
import { InvisibleTextbox } from '@/components/textbox';
import { ChatPanel } from '@/components/chat';
import { useSubmitFlow } from '@/hooks/useSubmitFlow';
import { usePeaceGestureSwitch } from '@/hooks/usePeaceGestureSwitch';
import { useAppStore } from '@/lib/store/app-store';
import type { InteractionMode } from '@/lib/store/app-store';

const ModelScene = dynamic(
  () => import('@/components/model').then((m) => ({ default: m.ModelScene })),
  { ssr: false },
);

const MODE_LABELS: Record<InteractionMode, string> = {
  draw: '1 DRAW',
  model: '2 3D',
  annotate: '3 ANNOTATE',
};

const ALL_MODES: InteractionMode[] = ['draw', 'model', 'annotate'];

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvasImage, submit, reset } = useSubmitFlow();
  const mode = useAppStore((state) => state.mode);
  const toggleChat = useAppStore((state) => state.toggleChat);
  const chatOpen = useAppStore((state) => state.chatOpen);
  const interactionMode = useAppStore((state) => state.interactionMode);
  const setInteractionMode = useAppStore((state) => state.setInteractionMode);

  const clearDrawing = useAppStore((state) => state.clearDrawing);
  const clearAnnotations = useAppStore((state) => state.clearAnnotations);

  // Peace gesture switches between model ↔ annotate (and draw → model)
  usePeaceGestureSwitch();

  // Keyboard shortcuts: 1 = Draw (clears canvas), 2 = 3D Model, 3 = Annotate
  useEffect(() => {
    function handleKeySwitch(e: KeyboardEvent) {
      // Skip if user is typing in an input/textarea
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
  }, [setInteractionMode, clearDrawing, clearAnnotations]);

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

  // canvasImage is consumed by the chat submit flow — suppress unused warning
  void canvasImage;
  void reset;

  return (
    <main ref={containerRef} className="w-screen h-screen overflow-hidden bg-black relative">
      {/* Hand tracking — always mounted so MediaPipe keeps running.
          Hidden visually in model/annotate mode but NOT unmounted. */}
      <div
        className={`absolute inset-0 ${isModelOrAnnotate ? 'opacity-0 pointer-events-none' : ''}`}
      >
        <HandTracking />
      </div>

      {/* 3D model scene — shown in model and annotate modes */}
      {isModelOrAnnotate && (
        <div className="absolute inset-0">
          <ModelScene />
        </div>
      )}

      {/* Mode switcher — bottom bar, industrial/minimal */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
        style={{
          borderTop: '1px solid #1a1a2e',
          background: '#07070d',
        }}
      >
        {ALL_MODES.map((m) => {
          const isActive = interactionMode === m;
          return (
            <button
              key={m}
              onClick={() => setInteractionMode(m)}
              style={{
                background: 'transparent',
                border: 'none',
                borderTop: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                color: isActive ? '#93c5fd' : '#404058',
                fontFamily: 'monospace',
                fontSize: '10px',
                letterSpacing: '0.14em',
                padding: '10px 24px',
                cursor: 'pointer',
                transition: 'color 0.1s ease, border-top-color 0.1s ease',
              }}
              aria-pressed={isActive}
              aria-label={`Switch to ${MODE_LABELS[m]} mode`}
            >
              {MODE_LABELS[m]}
            </button>
          );
        })}
      </div>

      {/* Mode indicator — top-left status */}
      <div
        className="fixed top-5 left-5 z-50"
        style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.12em' }}
      >
        <span style={{ color: '#1e3a5f', marginRight: 6 }}>MODE</span>
        <span style={{ color: '#3b82f6' }}>{MODE_LABELS[interactionMode]}</span>
      </div>

      {/* Invisible textbox for voice input — only in draw mode */}
      {!chatOpen && isDrawMode && <InvisibleTextbox onSubmit={handleSubmit} />}

      {/* Chat panel — available in all modes */}
      <ChatPanel />

      {/* Toggle chat button */}
      <button
        onClick={toggleChat}
        className="fixed top-5 right-5 z-50 transition-colors"
        style={{
          background: chatOpen ? '#1e1e2e' : '#111116',
          border: '1px solid #1e1e2e',
          color: chatOpen ? '#6a8fc5' : '#404058',
          fontFamily: 'monospace',
          fontSize: '11px',
          letterSpacing: '0.08em',
          padding: '6px 12px',
          cursor: 'pointer',
        }}
        aria-label="Toggle chat panel"
      >
        {chatOpen ? 'CLOSE' : 'CHAT'}
      </button>

      {/* Contextual hint at bottom-left */}
      {mode === 'idle' && !chatOpen && isDrawMode && (
        <div
          className="absolute bottom-12 left-5 z-20"
          style={{ fontFamily: 'monospace', fontSize: '11px', color: '#303044' }}
        >
          <kbd style={{ color: '#404058' }}>Enter</kbd>
          {' '}to submit · chat panel for history
        </div>
      )}

      {interactionMode === 'model' && (
        <div
          className="absolute bottom-12 left-5 z-20"
          style={{ fontFamily: 'monospace', fontSize: '11px', color: '#303044' }}
        >
          grab · rotate &nbsp;|&nbsp; two hands · zoom + pan
        </div>
      )}

      {interactionMode === 'annotate' && (
        <div
          className="absolute bottom-12 left-5 z-20"
          style={{ fontFamily: 'monospace', fontSize: '11px', color: '#303044' }}
        >
          pinch · draw &nbsp;|&nbsp; open palm 0.8s · clear
        </div>
      )}
    </main>
  );
}
