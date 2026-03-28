'use client';

import { useRef } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { normalizedToScreenPixels, lerpValue } from './model-utils';

interface SmoothedPosition {
  x: number;
  y: number;
}

const LERP_FACTOR = 0.25;
const CURSOR_SIZE = 40;

export function HandCursors() {
  const hands = useAppStore((state) => state.hands);
  const smoothed = useRef<SmoothedPosition[]>([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);

  const positions = hands.map((hand, i) => {
    const raw = hand.fingertipPosition;
    if (!raw) return null;

    const prev = smoothed.current[i] ?? { x: raw.x, y: raw.y };
    const next: SmoothedPosition = {
      x: lerpValue(prev.x, raw.x, LERP_FACTOR),
      y: lerpValue(prev.y, raw.y, LERP_FACTOR),
    };
    smoothed.current[i] = next;
    return next;
  });

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 20 }}
      aria-hidden="true"
    >
      {positions.map((pos, i) => {
        if (!pos) return null;
        const screen = normalizedToScreenPixels(pos, window.innerWidth, window.innerHeight);
        const half = CURSOR_SIZE / 2;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: screen.x - half,
              top: screen.y - half,
              width: CURSOR_SIZE,
              height: CURSOR_SIZE,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(59,130,246,0.55) 0%, rgba(59,130,246,0.15) 60%, transparent 100%)',
              boxShadow: '0 0 12px 2px rgba(59,130,246,0.25)',
              transition: 'left 0.05s linear, top 0.05s linear',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'rgba(147,197,253,0.9)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
