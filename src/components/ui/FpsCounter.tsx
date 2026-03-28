'use client';

import { useAppStore } from '@/lib/store/app-store';

export function FpsCounter() {
  const fps = useAppStore((state) => state.fps);

  return (
    <div
      className="absolute top-4 right-4 z-20 px-3 py-1.5"
      style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8 }}
    >
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontVariantNumeric: 'tabular-nums' }}>
        {fps} FPS
      </span>
    </div>
  );
}
