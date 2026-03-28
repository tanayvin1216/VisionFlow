'use client';

import { useRef } from 'react';
import { useAppStore } from '@/lib/store/app-store';
import { normalizedToScreenPixels, lerpValue } from './model-utils';
import type { Point2D } from '@/types/hand-tracking';

interface CursorState {
  x: number;
  y: number;
  lastSeen: number;
  isPinching: boolean;
}

const LERP_FACTOR = 0.35;
const CURSOR_SIZE = 40;
const CURSOR_PERSIST_MS = 300;

export function HandCursors() {
  const hands = useAppStore((state) => state.hands);
  const cursors = useRef<CursorState[]>([
    { x: 0, y: 0, lastSeen: 0, isPinching: false },
    { x: 0, y: 0, lastSeen: 0, isPinching: false },
  ]);

  const now = Date.now();

  // Update cursors from detected hands
  hands.forEach((hand, i) => {
    if (i > 1) return;
    const raw = hand.fingertipPosition;
    if (!raw) return;

    const prev = cursors.current[i];
    cursors.current[i] = {
      x: lerpValue(prev.x, raw.x, LERP_FACTOR),
      y: lerpValue(prev.y, raw.y, LERP_FACTOR),
      lastSeen: now,
      isPinching: hand.gesture.type === 'pinch',
    };
  });

  // Render cursors that were seen recently (persist after hand drops)
  const visibleCursors: { screen: Point2D; isPinching: boolean; opacity: number }[] = [];

  for (let i = 0; i < 2; i++) {
    const cursor = cursors.current[i];
    const age = now - cursor.lastSeen;
    if (cursor.lastSeen === 0 || age > CURSOR_PERSIST_MS) continue;

    const opacity = age < 50 ? 1 : 1 - (age / CURSOR_PERSIST_MS);
    const screen = normalizedToScreenPixels(cursor, window.innerWidth, window.innerHeight);
    visibleCursors.push({ screen, isPinching: cursor.isPinching, opacity });
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 20 }}
      aria-hidden="true"
    >
      {visibleCursors.map((cursor, i) => {
        const half = CURSOR_SIZE / 2;
        const pinchScale = cursor.isPinching ? 1.3 : 1;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cursor.screen.x - half,
              top: cursor.screen.y - half,
              width: CURSOR_SIZE,
              height: CURSOR_SIZE,
              borderRadius: '50%',
              opacity: cursor.opacity,
              transform: `scale(${pinchScale})`,
              background: cursor.isPinching
                ? 'radial-gradient(circle, rgba(59,130,246,0.7) 0%, rgba(59,130,246,0.2) 60%, transparent 100%)'
                : 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(59,130,246,0.1) 60%, transparent 100%)',
              boxShadow: cursor.isPinching
                ? '0 0 16px 4px rgba(59,130,246,0.4)'
                : '0 0 8px 2px rgba(59,130,246,0.15)',
              transition: 'opacity 0.15s ease, transform 0.1s ease',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: cursor.isPinching ? 10 : 6,
                height: cursor.isPinching ? 10 : 6,
                borderRadius: '50%',
                background: cursor.isPinching
                  ? 'rgba(147,197,253,1)'
                  : 'rgba(147,197,253,0.7)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
