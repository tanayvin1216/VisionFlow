'use client';

import dynamic from 'next/dynamic';
import { useAppStore } from '@/lib/store/app-store';
import { HandCursors } from './HandCursors';
import { AnnotationOverlay } from './AnnotationOverlay';

const ModelViewer = dynamic(
  () => import('./ModelViewer').then((m) => ({ default: m.ModelViewer })),
  { ssr: false },
);

export function ModelScene() {
  const interactionMode = useAppStore((state) => state.interactionMode);
  const isAnnotating = interactionMode === 'annotate';

  return (
    <div className="relative w-full h-full" style={{ background: '#080c14' }}>
      {/* 3D canvas fills the space */}
      <div className="absolute inset-0">
        <ModelViewer />
      </div>

      {/* Hand cursor overlay */}
      <HandCursors />

      {/* Annotation overlay — 2D canvas on top of 3D scene */}
      {isAnnotating && <AnnotationOverlay />}
    </div>
  );
}
