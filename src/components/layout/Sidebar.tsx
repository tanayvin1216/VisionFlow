'use client';

import { useAppStore } from '@/lib/store/app-store';
import type { InteractionMode } from '@/lib/store/app-store';

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 2.5l3 3L6 15H3v-3z" />
      <path d="M10.5 4.5l3 3" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1.5L15.5 5.25v7.5L9 16.5 2.5 12.75v-7.5z" />
      <path d="M9 8.75v7.75" />
      <path d="M9 8.75L2.5 5.25" />
      <path d="M9 8.75L15.5 5.25" />
    </svg>
  );
}

function MarkerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 15l2-7L13.5 1.5l3 3L10 13z" />
      <path d="M9.5 5.5l3 3" />
      <path d="M3 15l2.5-1.5" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h12a1 1 0 011 1v8a1 1 0 01-1 1H6l-3 3V4a1 1 0 011-1z" />
    </svg>
  );
}

function HandIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 11V6a2 2 0 00-4 0" />
      <path d="M14 10V4a2 2 0 00-4 0v7" />
      <path d="M10 10.5V6a2 2 0 00-4 0v8" />
      <path d="M18 11a2 2 0 014 0v3a8 8 0 01-8 8h-2a8 8 0 01-6-2.7" />
    </svg>
  );
}

interface NavItemConfig {
  mode: InteractionMode;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemConfig[] = [
  { mode: 'draw', label: 'Draw', shortcut: '1', icon: <PencilIcon /> },
  { mode: 'model', label: '3D Model', shortcut: '2', icon: <CubeIcon /> },
  { mode: 'annotate', label: 'Annotate', shortcut: '3', icon: <MarkerIcon /> },
];

export function Sidebar() {
  const interactionMode = useAppStore((s) => s.interactionMode);
  const setInteractionMode = useAppStore((s) => s.setInteractionMode);
  const clearDrawing = useAppStore((s) => s.clearDrawing);
  const toggleChat = useAppStore((s) => s.toggleChat);
  const chatOpen = useAppStore((s) => s.chatOpen);
  const fps = useAppStore((s) => s.fps);
  const drawing = useAppStore((s) => s.drawing);

  function handleModeSwitch(mode: InteractionMode) {
    if (mode === 'draw') {
      clearDrawing();
    }
    setInteractionMode(mode);
  }

  const strokeCount = drawing.strokes.length + (drawing.currentStroke.length > 0 ? 1 : 0);

  return (
    <aside
      className="h-full flex flex-col shrink-0 border-r"
      style={{
        width: 220,
        background: '#FFFFFF',
        borderColor: 'var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <span style={{ color: 'var(--text-secondary)' }}>
          <HandIcon />
        </span>
        <span
          style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 18,
            fontWeight: 500,
            color: 'var(--foreground)',
            letterSpacing: '-0.01em',
          }}
        >
          Flow
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--text-muted)',
            background: '#F5F1ED',
            padding: '2px 8px',
            borderRadius: 4,
            marginLeft: 2,
          }}
        >
          Beta
        </span>
      </div>

      {/* Mode navigation */}
      <nav className="px-3 mt-1 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ mode, label, shortcut, icon }) => {
          const isActive = interactionMode === mode;
          return (
            <button
              key={mode}
              onClick={() => handleModeSwitch(mode)}
              className="flex items-center gap-3 w-full text-left transition-colors"
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--foreground)' : 'var(--text-secondary)',
                background: isActive ? '#F5F1ED' : 'transparent',
              }}
              aria-pressed={isActive}
            >
              {icon}
              <span className="flex-1">{label}</span>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  opacity: isActive ? 1 : 0.6,
                }}
              >
                {shortcut}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Session stats card */}
      <div
        className="mx-4 mt-6 p-4"
        style={{
          background: '#FAF7F4',
          borderRadius: 12,
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 10 }}>
          Session
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center" style={{ fontSize: 12 }}>
            <span style={{ color: 'var(--text-secondary)' }}>FPS</span>
            <span style={{ fontWeight: 500, color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}>
              {fps}
            </span>
          </div>
          <div className="flex justify-between items-center" style={{ fontSize: 12 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Strokes</span>
            <span style={{ fontWeight: 500, color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}>
              {strokeCount}
            </span>
          </div>
          <div className="flex justify-between items-center" style={{ fontSize: 12 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Mode</span>
            <span style={{ fontWeight: 500, color: 'var(--foreground)' }}>
              {interactionMode.charAt(0).toUpperCase() + interactionMode.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom actions */}
      <div className="px-3 pb-5 flex flex-col gap-0.5">
        <button
          onClick={toggleChat}
          className="flex items-center gap-3 w-full text-left transition-colors"
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: chatOpen ? 500 : 400,
            color: chatOpen ? 'var(--foreground)' : 'var(--text-secondary)',
            background: chatOpen ? '#F5F1ED' : 'transparent',
          }}
        >
          <ChatIcon />
          <span>Chat</span>
        </button>
      </div>
    </aside>
  );
}
