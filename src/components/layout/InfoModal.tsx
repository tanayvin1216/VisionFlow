'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/app-store';

type Section = 'gestures' | 'modes' | 'voice' | 'shortcuts';

interface NavItem {
  id: Section;
  label: string;
  icon: React.ReactNode;
}

function HandGestureIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7.5V4.5a1.5 1.5 0 00-3 0" />
      <path d="M9 7V3a1.5 1.5 0 00-3 0v5" />
      <path d="M6 7V4.5a1.5 1.5 0 00-3 0v6" />
      <path d="M12 7.5a1.5 1.5 0 013 0v2a6 6 0 01-6 6H8a6 6 0 01-4.5-2" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1L1 5l7 4 7-4z" />
      <path d="M1 8l7 4 7-4" />
      <path d="M1 11l7 4 7-4" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5.5" y="1" width="5" height="8" rx="2.5" />
      <path d="M3 7.5a5 5 0 0010 0" />
      <path d="M8 12.5V15" />
    </svg>
  );
}

function KeyboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="14" height="10" rx="1.5" />
      <path d="M4 6.5h1M7.5 6.5h1M11 6.5h1M4 9.5h1M6 9.5h4M11 9.5h1" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { id: 'gestures', label: 'Gestures', icon: <HandGestureIcon /> },
  { id: 'modes', label: 'Modes', icon: <LayersIcon /> },
  { id: 'voice', label: 'Voice Input', icon: <MicIcon /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <KeyboardIcon /> },
];

interface InfoRowProps {
  title: string;
  description: string;
  badge?: string;
}

function InfoRow({ title, description, badge }: InfoRowProps) {
  return (
    <div
      className="flex items-center justify-between py-4"
      style={{ borderBottom: '1px solid #E8E4DF' }}
    >
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: '#1A1A1A', marginBottom: 2 }}>{title}</p>
        <p style={{ fontSize: 13, color: '#6B6560' }}>{description}</p>
      </div>
      {badge && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: '#6B6560',
            background: '#F5F0EB',
            padding: '6px 16px',
            borderRadius: 6,
            border: '1px solid #E8E4DF',
            whiteSpace: 'nowrap',
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function GesturesContent() {
  return (
    <>
      <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 22, fontWeight: 400, color: '#1A1A1A', marginBottom: 24 }}>
        Gestures
      </h2>
      <InfoRow title="Pinch to Draw" description="Bring thumb and index finger together to start drawing" badge="Draw Mode" />
      <InfoRow title="Open Palm to Clear" description="Show open palm for 0.8 seconds to clear the canvas" badge="Draw Mode" />
      <InfoRow title="Two Hands Zoom" description="Use both hands to pinch-zoom and pan the 3D model" badge="3D Mode" />
      <InfoRow title="Pinch Annotate" description="Pinch to draw annotations over the 3D model" badge="Annotate" />
    </>
  );
}

function ModesContent() {
  return (
    <>
      <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 22, fontWeight: 400, color: '#1A1A1A', marginBottom: 24 }}>
        Modes
      </h2>
      <InfoRow title="Draw" description="Draw in the air with hand tracking. Your drawings appear on the webcam feed." badge="Press 1" />
      <InfoRow title="3D Model" description="Interact with a 3D Influenza A virion model. Grab, rotate, zoom with gestures." badge="Press 2" />
      <InfoRow title="Annotate" description="Draw 2D annotations directly on top of the 3D model scene." badge="Press 3" />
      <InfoRow title="Submit for Analysis" description="Press Enter to send your drawing + prompt to AI for multimodal analysis." badge="Enter" />
    </>
  );
}

function VoiceContent() {
  return (
    <>
      <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 22, fontWeight: 400, color: '#1A1A1A', marginBottom: 24 }}>
        Voice Input
      </h2>
      <InfoRow title="Whispr Flow Integration" description="VisionFlow captures transcription from Whispr Flow via an invisible text field." badge="Automatic" />
      <InfoRow title="How It Works" description="Just speak naturally. Whispr Flow transcribes to the focused input, VisionFlow captures it." badge="Hands-free" />
      <InfoRow title="Submit by Voice" description="After speaking your prompt, press Enter to submit for AI analysis." badge="Enter" />
      <InfoRow title="Chat Panel" description="Open the chat panel for full conversation history with the AI assistant." badge="Sidebar" />
    </>
  );
}

function ShortcutsContent() {
  return (
    <>
      <h2 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 22, fontWeight: 400, color: '#1A1A1A', marginBottom: 24 }}>
        Shortcuts
      </h2>
      <InfoRow title="Switch to Draw" description="Activates draw mode and clears the canvas" badge="1" />
      <InfoRow title="Switch to 3D Model" description="Activates 3D model interaction mode" badge="2" />
      <InfoRow title="Switch to Annotate" description="Activates annotation overlay on 3D model" badge="3" />
      <InfoRow title="Submit" description="Send current drawing + text prompt to AI for analysis" badge="Enter" />
    </>
  );
}

const SECTION_CONTENT: Record<Section, () => React.JSX.Element> = {
  gestures: GesturesContent,
  modes: ModesContent,
  voice: VoiceContent,
  shortcuts: ShortcutsContent,
};

export function InfoModal() {
  const { infoOpen, setInfoOpen } = useAppStore();
  const [activeSection, setActiveSection] = useState<Section>('gestures');

  const handleClose = useCallback(() => {
    setInfoOpen(false);
  }, [setInfoOpen]);

  const ContentComponent = SECTION_CONTENT[activeSection];

  return (
    <AnimatePresence>
      {infoOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={handleClose}
          />

          {/* Modal card — centered via flexbox on a full-screen container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="flex"
              style={{
                width: 'min(720px, 90vw)',
                height: 'min(480px, 80vh)',
                background: '#FFFFFF',
                borderRadius: 14,
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)',
                overflow: 'hidden',
                pointerEvents: 'auto',
              }}
            >
            {/* Left nav */}
            <div
              className="shrink-0 flex flex-col py-5"
              style={{
                width: 180,
                borderRight: '1px solid #E8E4DF',
                background: '#FAF7F4',
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#9E9891',
                  padding: '0 16px',
                  marginBottom: 8,
                }}
              >
                Guide
              </p>
              <nav className="flex flex-col gap-0.5 px-2">
                {NAV_ITEMS.map(({ id, label, icon }) => {
                  const isActive = activeSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveSection(id)}
                      className="flex items-center gap-2.5 w-full text-left"
                      style={{
                        padding: '8px 12px',
                        borderRadius: 7,
                        fontSize: 13,
                        fontWeight: isActive ? 500 : 400,
                        color: isActive ? '#1A1A1A' : '#6B6560',
                        background: isActive ? '#FFFFFF' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.12s ease',
                      }}
                    >
                      {icon}
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="flex-1" />

              <p style={{ fontSize: 11, color: '#9E9891', padding: '0 16px' }}>
                VisionFlow v0.1.0
              </p>
            </div>

            {/* Right content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <ContentComponent />
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9E9891',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close info"
            >
              &times;
            </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
