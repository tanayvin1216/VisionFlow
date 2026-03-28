'use client';

import { useAppStore } from '@/lib/store/app-store';
import type { InteractionMode } from '@/lib/store/app-store';

/* ── Wispr Flow logo — 5 rounded bars matching the actual brand logo ── */
function WisprFlowLogo() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1A1A1A">
      <rect x="0" y="6" width="3" height="12" rx="1.5" />
      <rect x="5" y="8" width="3" height="8" rx="1.5" />
      <rect x="10" y="2" width="3" height="20" rx="1.5" />
      <rect x="15" y="5" width="3" height="14" rx="1.5" />
      <rect x="20" y="7" width="3" height="10" rx="1.5" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="10.5" y="2" width="5.5" height="5.5" rx="1" />
      <rect x="2" y="10.5" width="5.5" height="5.5" rx="1" />
      <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1" />
    </svg>
  );
}

function CubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1.5L15.5 5.25v7.5L9 16.5 2.5 12.75v-7.5z" />
      <path d="M9 8.75v7.75" />
      <path d="M9 8.75L2.5 5.25" />
      <path d="M9 8.75L15.5 5.25" />
    </svg>
  );
}

function MarkerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 2.5l3 3L6 15H3v-3z" />
      <path d="M10.5 4.5l3 3" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h12a1 1 0 011 1v8a1 1 0 01-1 1H6l-3 3V4a1 1 0 011-1z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="2.5" />
      <path d="M14.7 11.1a1.2 1.2 0 00.2 1.3l.05.04a1.45 1.45 0 11-2.05 2.06l-.04-.05a1.2 1.2 0 00-1.3-.2 1.2 1.2 0 00-.73 1.1v.12a1.45 1.45 0 11-2.9 0v-.07a1.2 1.2 0 00-.79-1.1 1.2 1.2 0 00-1.3.2l-.04.05a1.45 1.45 0 11-2.06-2.06l.05-.04a1.2 1.2 0 00.2-1.3 1.2 1.2 0 00-1.1-.73h-.12a1.45 1.45 0 010-2.9h.07a1.2 1.2 0 001.1-.79 1.2 1.2 0 00-.2-1.3l-.05-.04A1.45 1.45 0 115.64 3.3l.04.05a1.2 1.2 0 001.3.2h.06a1.2 1.2 0 00.73-1.1v-.12a1.45 1.45 0 012.9 0v.07a1.2 1.2 0 00.73 1.1 1.2 1.2 0 001.3-.2l.04-.05a1.45 1.45 0 112.06 2.06l-.05.04a1.2 1.2 0 00-.2 1.3v.06a1.2 1.2 0 001.1.73h.12a1.45 1.45 0 010 2.9h-.07a1.2 1.2 0 00-1.1.73z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="7" />
      <path d="M6.8 6.8a2.2 2.2 0 014.3.7c0 1.5-2.2 2.1-2.2 2.1" />
      <circle cx="9" cy="13" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface NavItemConfig {
  mode: InteractionMode;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemConfig[] = [
  { mode: 'draw', label: 'Home', icon: <GridIcon /> },
  { mode: 'model', label: '3D Model', icon: <CubeIcon /> },
  { mode: 'annotate', label: 'Annotate', icon: <MarkerIcon /> },
];

export function Sidebar() {
  const interactionMode = useAppStore((s) => s.interactionMode);
  const setInteractionMode = useAppStore((s) => s.setInteractionMode);
  const clearDrawing = useAppStore((s) => s.clearDrawing);
  const toggleChat = useAppStore((s) => s.toggleChat);
  const chatOpen = useAppStore((s) => s.chatOpen);
  const fps = useAppStore((s) => s.fps);

  function handleModeSwitch(mode: InteractionMode) {
    if (mode === 'draw') {
      clearDrawing();
    }
    setInteractionMode(mode);
  }

  return (
    <aside
      className="h-full flex flex-col shrink-0"
      style={{
        width: 200,
        background: '#FFFFFF',
        borderRight: '1px solid #E8E4DF',
      }}
    >
      {/* Logo — Wispr Flow waveform + "Flow" in rounded sans-serif + badge */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-6">
        <WisprFlowLogo />
        <span
          style={{
            fontFamily: 'var(--font-dm-sans), system-ui, sans-serif',
            fontSize: 20,
            fontWeight: 700,
            color: '#1A1A1A',
            letterSpacing: '-0.02em',
          }}
        >
          Flow
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            color: '#6B6560',
            border: '1px solid #D9D4CF',
            padding: '1px 7px',
            borderRadius: 4,
            marginLeft: 2,
          }}
        >
          Pro Trial
        </span>
      </div>

      {/* Mode navigation */}
      <nav className="px-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ mode, label, icon }) => {
          const isActive = interactionMode === mode;
          return (
            <button
              key={mode}
              onClick={() => handleModeSwitch(mode)}
              className="flex items-center gap-3 w-full text-left"
              style={{
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? '#1A1A1A' : '#6B6560',
                background: isActive ? '#F5F0EB' : 'transparent',
                transition: 'background 0.15s ease, color 0.15s ease',
                cursor: 'pointer',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#FAF7F4';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
              aria-pressed={isActive}
            >
              {icon}
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Session info */}
      <div
        className="mx-4 mt-auto mb-4 px-4 py-4"
        style={{ borderTop: '1px solid #E8E4DF' }}
      >
        <p style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A', marginBottom: 4 }}>
          VisionFlow Session
        </p>
        <p style={{ fontSize: 12, color: '#6B6560', marginBottom: 8 }}>
          {fps} fps tracking
        </p>
        <div style={{ height: 3, background: '#E8E4DF', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(fps / 30 * 100, 100)}%`,
              background: '#7C5CFC',
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <p style={{ fontSize: 11, color: '#9E9891', lineHeight: 1.5 }}>
          Draw in the air with hand tracking and get AI analysis
        </p>
      </div>

      {/* Bottom nav */}
      <div className="px-3 pb-4 flex flex-col gap-0.5">
        <button
          onClick={toggleChat}
          className="flex items-center gap-3 w-full text-left"
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: chatOpen ? 500 : 400,
            color: chatOpen ? '#1A1A1A' : '#6B6560',
            background: chatOpen ? '#F5F0EB' : 'transparent',
            transition: 'background 0.15s ease, color 0.15s ease',
            cursor: 'pointer',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            if (!chatOpen) e.currentTarget.style.background = '#FAF7F4';
          }}
          onMouseLeave={(e) => {
            if (!chatOpen) e.currentTarget.style.background = 'transparent';
          }}
        >
          <ChatIcon />
          <span>Chat</span>
        </button>
        <div className="flex items-center gap-3 w-full" style={{ padding: '8px 12px', fontSize: 13, color: '#6B6560' }}>
          <SettingsIcon />
          <span>Settings</span>
        </div>
        <div className="flex items-center gap-3 w-full" style={{ padding: '8px 12px', fontSize: 13, color: '#6B6560' }}>
          <HelpIcon />
          <span>Help</span>
        </div>
      </div>
    </aside>
  );
}
