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
      className="h-full flex flex-col shrink-0"
      style={{
        width: 230,
        background: '#1C1917',
        borderRight: '1px solid #2E2A26',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <span style={{ color: '#A8978A' }}>
          <HandIcon />
        </span>
        <span
          style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 19,
            fontWeight: 500,
            color: '#F5F0EB',
            letterSpacing: '-0.01em',
          }}
        >
          Flow
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#8A7E74',
            background: '#2E2A26',
            padding: '2px 7px',
            borderRadius: 4,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Beta
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#2E2A26', margin: '0 20px' }} />

      {/* Mode navigation */}
      <nav className="px-3 mt-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ mode, label, shortcut, icon }) => {
          const isActive = interactionMode === mode;
          return (
            <button
              key={mode}
              onClick={() => handleModeSwitch(mode)}
              className="flex items-center gap-3 w-full text-left"
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#F5F0EB' : '#8A7E74',
                background: isActive ? '#2E2A26' : 'transparent',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#252220';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
              aria-pressed={isActive}
            >
              {icon}
              <span className="flex-1">{label}</span>
              <span
                style={{
                  fontSize: 11,
                  color: isActive ? '#A8978A' : '#5C544D',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {shortcut}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Session stats */}
      <div
        className="mx-4 mt-6 p-4"
        style={{
          background: '#252220',
          borderRadius: 10,
          border: '1px solid #2E2A26',
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 600, color: '#A8978A', marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Session
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center" style={{ fontSize: 13 }}>
            <span style={{ color: '#6B6360' }}>FPS</span>
            <span style={{ fontWeight: 500, color: '#D4CBC3', fontVariantNumeric: 'tabular-nums' }}>
              {fps}
            </span>
          </div>
          <div className="flex justify-between items-center" style={{ fontSize: 13 }}>
            <span style={{ color: '#6B6360' }}>Strokes</span>
            <span style={{ fontWeight: 500, color: '#D4CBC3', fontVariantNumeric: 'tabular-nums' }}>
              {strokeCount}
            </span>
          </div>
          <div className="flex justify-between items-center" style={{ fontSize: 13 }}>
            <span style={{ color: '#6B6360' }}>Mode</span>
            <span style={{ fontWeight: 500, color: '#D4CBC3' }}>
              {interactionMode.charAt(0).toUpperCase() + interactionMode.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom actions */}
      <div className="px-3 pb-5">
        <div style={{ height: 1, background: '#2E2A26', marginBottom: 12, marginLeft: 8, marginRight: 8 }} />
        <button
          onClick={toggleChat}
          className="flex items-center gap-3 w-full text-left"
          style={{
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: chatOpen ? 500 : 400,
            color: chatOpen ? '#F5F0EB' : '#8A7E74',
            background: chatOpen ? '#2E2A26' : 'transparent',
            transition: 'background 0.15s ease, color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (!chatOpen) e.currentTarget.style.background = '#252220';
          }}
          onMouseLeave={(e) => {
            if (!chatOpen) e.currentTarget.style.background = 'transparent';
          }}
        >
          <ChatIcon />
          <span>Chat</span>
        </button>
      </div>
    </aside>
  );
}
