'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/app-store';
import type { ChatMessage } from '@/lib/store/app-store';

const PANEL_SPRING = { type: 'spring' as const, stiffness: 300, damping: 35, mass: 0.8 };

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function MessageEntry({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className="flex gap-4 px-5 py-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <span
        className="shrink-0"
        style={{
          fontSize: 13,
          color: 'var(--text-muted)',
          minWidth: 76,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatTime(message.timestamp)}
      </span>
      <div className="flex-1 min-w-0">
        {message.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.image}
            alt="Drawing"
            className="max-w-[140px] mb-2"
            style={{
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}
          />
        )}
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: isUser ? 'var(--foreground)' : 'var(--text-secondary)',
          }}
        >
          {message.content}
        </p>
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div
      className="flex gap-4 px-5 py-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <span
        className="shrink-0"
        style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 76 }}
      >
        &middot;&middot;&middot;
      </span>
      <div className="flex items-center gap-1.5">
        <motion.span
          className="inline-block rounded-full"
          style={{ width: 5, height: 5, background: 'var(--text-muted)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="inline-block rounded-full"
          style={{ width: 5, height: 5, background: 'var(--text-muted)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="inline-block rounded-full"
          style={{ width: 5, height: 5, background: 'var(--text-muted)' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  );
}

export function ChatPanel() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    chatOpen,
    setChatOpen,
    messages,
    inputText,
    setInputText,
    isLoading,
  } = useAppStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleClose = useCallback(() => {
    setChatOpen(false);
  }, [setChatOpen]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);
    },
    [setInputText]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('visionflow:submit'));
      }
    },
    []
  );

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [chatOpen]);

  return (
    <AnimatePresence>
      {chatOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            style={{ pointerEvents: 'none' }}
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={PANEL_SPRING}
            className="fixed top-0 right-0 h-full z-40 flex flex-col"
            style={{
              width: 'min(420px, 100vw)',
              background: 'var(--surface)',
              borderLeft: '1px solid var(--border)',
              pointerEvents: 'auto',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--foreground)',
                }}
              >
                Activity
              </span>
              <button
                onClick={handleClose}
                className="transition-colors"
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 20,
                  lineHeight: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 4,
                }}
                aria-label="Close chat"
              >
                &times;
              </button>
            </div>

            {/* Section label */}
            <div
              className="px-5 pt-4 pb-2"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                color: 'var(--text-muted)',
              }}
            >
              Today
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto flex flex-col">
              {messages.length === 0 && !isLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    No activity yet
                  </p>
                </div>
              )}
              {messages.map((message: ChatMessage) => (
                <MessageEntry key={message.id} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="shrink-0 px-5 py-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className="flex gap-3 items-end">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your drawing..."
                  rows={1}
                  className="flex-1 resize-none focus:outline-none"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: 'var(--foreground)',
                    background: '#FAF7F4',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    minHeight: 40,
                    maxHeight: 120,
                  }}
                  onInput={(e) => {
                    const target = e.currentTarget;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                  }}
                />
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('visionflow:submit'))}
                  className="shrink-0 transition-colors"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'var(--foreground)',
                    color: 'var(--surface)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                  }}
                  aria-label="Send message"
                  disabled={isLoading}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
