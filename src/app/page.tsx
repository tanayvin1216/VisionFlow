'use client';

import { useRef, useCallback } from 'react';
import { HandTracking } from '@/components/canvas';
import { InvisibleTextbox, SubmitOverlay } from '@/components/textbox';
import { useSubmitFlow } from '@/hooks/useSubmitFlow';
import { useAppStore } from '@/lib/store/app-store';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvasImage, submit, reset } = useSubmitFlow();
  const mode = useAppStore((state) => state.mode);

  const handleSubmit = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    submit({ width: rect.width, height: rect.height });
  }, [submit]);

  const isOverlayActive = mode === 'submitting' || mode === 'thinking' || mode === 'response';

  return (
    <main ref={containerRef} className="w-screen h-screen overflow-hidden bg-black relative">
      {/* Hand tracking and drawing - hide when overlay is active */}
      <div className={isOverlayActive ? 'opacity-0 pointer-events-none' : ''}>
        <HandTracking />
      </div>

      {/* Invisible textbox for voice input */}
      <InvisibleTextbox onSubmit={handleSubmit} />

      {/* Submit overlay with animation */}
      <SubmitOverlay canvasImage={canvasImage} onComplete={reset} />

      {/* Keyboard shortcut hint */}
      {mode === 'idle' && (
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-black/50 rounded-lg backdrop-blur-sm">
          <span className="text-sm text-white/60">
            Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/80 font-mono text-xs">Enter</kbd> to submit
          </span>
        </div>
      )}
    </main>
  );
}
