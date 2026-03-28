'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store/app-store';

const PEACE_HOLD_DURATION_MS = 500;

export function usePeaceGestureSwitch() {
  const hands = useAppStore((state) => state.hands);
  const interactionMode = useAppStore((state) => state.interactionMode);
  const setInteractionMode = useAppStore((state) => state.setInteractionMode);
  const lastPeaceGestureTime = useAppStore((state) => state.lastPeaceGestureTime);
  const setLastPeaceGestureTime = useAppStore((state) => state.setLastPeaceGestureTime);

  const primaryGesture = hands[0]?.gesture ?? null;
  const isPeace = primaryGesture?.type === 'peace';

  useEffect(() => {
    if (!isPeace) {
      setLastPeaceGestureTime(null);
      return;
    }

    if (lastPeaceGestureTime === null) {
      setLastPeaceGestureTime(Date.now());
      return;
    }

    const elapsed = Date.now() - lastPeaceGestureTime;
    if (elapsed < PEACE_HOLD_DURATION_MS) return;

    // Switch modes on peace hold
    if (interactionMode === 'draw') {
      setInteractionMode('model');
    } else if (interactionMode === 'model') {
      setInteractionMode('annotate');
    } else if (interactionMode === 'annotate') {
      setInteractionMode('model');
    }

    // Reset so user has to release and re-hold to switch again
    setLastPeaceGestureTime(null);
  }, [isPeace, lastPeaceGestureTime, interactionMode, setInteractionMode, setLastPeaceGestureTime]);
}
