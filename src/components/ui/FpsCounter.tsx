'use client';

import { useAppStore } from '@/lib/store/app-store';

export function FpsCounter() {
  const fps = useAppStore((state) => state.fps);

  return (
    <div className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-black/50 rounded-lg">
      <span className="text-sm font-mono text-white/80">
        {fps} FPS
      </span>
    </div>
  );
}
