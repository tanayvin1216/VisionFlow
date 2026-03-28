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
import type { ChatMessage } from '@/lib/store/app-store';

const ModelScene = dynamic(
  () => import('@/components/model').then((m) => ({ default: m.ModelScene })),
  { ssr: false },
);

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function ActivityEntry({ message }: { message: ChatMessage }) {
  return (
    <div
      className="flex gap-5 px-6 py-4"
      style={{ borderBottom: '1px solid #E8E4DF' }}
    >
      <span
        style={{
          fontSize: 14,
          color: '#9E9891',
          minWidth: 80,
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}
      >
        {formatTime(message.timestamp)}
      </span>
      <p style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.5 }}>
        {message.content}
      </p>
    </div>
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvasImage, submit, reset } = useSubmitFlow();
  const mode = useAppStore((state) => state.mode);
  const chatOpen = useAppStore((state) => state.chatOpen);
  const interactionMode = useAppStore((state) => state.interactionMode);
  const setInteractionMode = useAppStore((state) => state.setInteractionMode);
  const clearDrawing = useAppStore((state) => state.clearDrawing);
  const messages = useAppStore((state) => state.messages);
  const fps = useAppStore((state) => state.fps);

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

      <main className="flex-1 overflow-y-auto">
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 48px' }}>

          {/* Header — "Welcome back," + stats (matches Wispr Flow) */}
          <div className="flex items-baseline justify-between mb-8">
            <h1
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 30,
                fontWeight: 400,
                color: '#1A1A1A',
              }}
            >
              Welcome back, Tanay
            </h1>
            <div className="flex items-center gap-6" style={{ fontSize: 13, color: '#6B6560' }}>
              <span>
                <span style={{ marginRight: 5 }}>&#128293;</span>
                {fps} fps
              </span>
              <span>
                <span style={{ marginRight: 5 }}>&#9997;&#65039;</span>
                {interactionMode === 'draw' ? 'Draw' : interactionMode === 'model' ? '3D Model' : 'Annotate'}
              </span>
              <span>
                <span style={{ marginRight: 5 }}>&#127942;</span>
                {mode === 'idle' ? 'Ready' : mode === 'drawing' ? 'Drawing' : mode}
              </span>
            </div>
          </div>

          {/* Webcam/Canvas card */}
          <div
            ref={containerRef}
            className="relative overflow-hidden mb-8"
            style={{
              borderRadius: 14,
              background: '#0A0A0A',
              height: 'min(460px, 50vh)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}
          >
            <div
              className={`absolute inset-0 ${isModelOrAnnotate ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <HandTracking />
            </div>

            {isModelOrAnnotate && (
              <div className="absolute inset-0">
                <ModelScene />
              </div>
            )}

            {/* Contextual hints */}
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

          {/* TODAY activity log — matches Wispr Flow's activity list */}
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#9E9891',
                marginBottom: 12,
              }}
            >
              Today
            </p>

            <div
              style={{
                background: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E8E4DF',
                overflow: 'hidden',
              }}
            >
              {messages.length === 0 ? (
                <div className="px-6 py-5" style={{ color: '#9E9891', fontSize: 14 }}>
                  No activity yet — draw something and hit Enter
                </div>
              ) : (
                messages.map((msg: ChatMessage) => (
                  <ActivityEntry key={msg.id} message={msg} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Invisible textbox for voice input — outside canvas so it works in all modes */}
      {!chatOpen && <InvisibleTextbox onSubmit={handleSubmit} />}

      {/* Chat panel slide-over */}
      <ChatPanel />
    </div>
  );
}
