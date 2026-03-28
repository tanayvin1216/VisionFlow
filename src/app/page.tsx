'use client';

import { useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { HandTracking } from '@/components/canvas';
import { InvisibleTextbox } from '@/components/textbox';
import { ChatPanel } from '@/components/chat';
import { Sidebar, InfoModal } from '@/components/layout';
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
    <div className="flex h-screen" style={{ background: '#FAF7F4' }}>
      <Sidebar />

      {/* Main content — flex-1 so it shrinks when chat opens */}
      <main
        className="flex-1 flex flex-col overflow-hidden"
        style={{ transition: 'flex 0.3s ease' }}
      >
        {/* Scrollable inner content */}
        <div className="flex-1 overflow-y-auto">
          <div style={{ padding: '20px 40px 24px', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

            {/* Header */}
            <div className="flex items-baseline justify-between mb-4 shrink-0">
              <h1
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: 28,
                  fontWeight: 400,
                  color: '#1A1A1A',
                }}
              >
                Welcome back, Tanay
              </h1>
              <div className="flex items-center gap-5" style={{ fontSize: 13, color: '#6B6560' }}>
                <span>
                  <span style={{ marginRight: 4 }}>&#128293;</span>
                  {fps} fps
                </span>
                <span>
                  <span style={{ marginRight: 4 }}>&#9997;&#65039;</span>
                  {interactionMode === 'draw' ? 'Draw' : interactionMode === 'model' ? '3D Model' : 'Annotate'}
                </span>
                <span>
                  <span style={{ marginRight: 4 }}>&#127942;</span>
                  {mode === 'idle' ? 'Ready' : mode === 'drawing' ? 'Drawing' : mode}
                </span>
              </div>
            </div>

            {/* Webcam/Canvas — takes all remaining vertical space */}
            <div
              ref={containerRef}
              className="relative overflow-hidden shrink-0"
              style={{
                borderRadius: 14,
                background: '#0A0A0A',
                flex: '1 1 0',
                minHeight: 520,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div className={`absolute inset-0 ${isModelOrAnnotate ? 'opacity-0 pointer-events-none' : ''}`}>
                <HandTracking />
              </div>

              {isModelOrAnnotate && (
                <div className="absolute inset-0">
                  <ModelScene />
                </div>
              )}

              {mode === 'idle' && !chatOpen && isDrawMode && (
                <div className="absolute bottom-4 left-5 z-20" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  <kbd style={{ color: 'rgba(255,255,255,0.55)' }}>Enter</kbd>{' '}to submit
                </div>
              )}

              {interactionMode === 'model' && (
                <div className="absolute bottom-4 left-5 z-20" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  grab to rotate &middot; two hands to zoom + pan
                </div>
              )}

              {interactionMode === 'annotate' && (
                <div className="absolute bottom-4 left-5 z-20" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                  pinch to draw &middot; two hands to clear
                </div>
              )}
            </div>

            {/* TODAY activity log — below the canvas */}
            <div className="shrink-0 mt-4 pb-6">
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#9E9891',
                  marginBottom: 10,
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
        </div>
      </main>

      {/* Invisible textbox for voice input */}
      {!chatOpen && <InvisibleTextbox onSubmit={handleSubmit} />}

      {/* Chat panel — inline, pushes main content when open */}
      <ChatPanel />

      {/* Info/tutorial modal */}
      <InfoModal />
    </div>
  );
}
