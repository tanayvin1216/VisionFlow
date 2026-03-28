'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store/app-store';
import type { ChatMessage } from '@/lib/store/app-store';

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
      style={{ borderBottom: '1px solid #E8E4DF' }}
    >
      <span
        className="shrink-0"
        style={{
          fontSize: 13,
          color: '#9E9891',
          minWidth: 72,
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
            className="max-w-[120px] mb-2"
            style={{ borderRadius: 8, border: '1px solid #E8E4DF' }}
          />
        )}
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: isUser ? '#1A1A1A' : '#6B6560',
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
    <div className="flex gap-4 px-5 py-4" style={{ borderBottom: '1px solid #E8E4DF' }}>
      <span className="shrink-0" style={{ fontSize: 13, color: '#9E9891', minWidth: 72 }}>
        &middot;&middot;&middot;
      </span>
      <div className="flex items-center gap-1.5">
        {[0, 0.2, 0.4].map((delay) => (
          <motion.span
            key={delay}
            className="inline-block rounded-full"
            style={{ width: 5, height: 5, background: '#9E9891' }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Inline chat panel — NOT fixed/overlay.
 * Renders as a flex column sibling that takes space from the layout.
 * The parent controls width animation.
 */
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
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [chatOpen]);

  return (
    <aside
      className="h-full flex flex-col shrink-0 overflow-hidden"
      style={{
        width: chatOpen ? 380 : 0,
        minWidth: chatOpen ? 380 : 0,
        background: '#FFFFFF',
        borderLeft: chatOpen ? '1px solid #E8E4DF' : 'none',
        transition: 'width 0.3s ease, min-width 0.3s ease, border-left 0.3s ease',
      }}
    >
      {/* Inner content — always rendered, hidden by overflow when width=0 */}
      <div className="flex flex-col h-full" style={{ width: 380 }}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid #E8E4DF' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 16,
              fontWeight: 500,
              color: '#1A1A1A',
            }}
          >
            Activity
          </span>
          <button
            onClick={handleClose}
            style={{
              color: '#9E9891',
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
            color: '#9E9891',
          }}
        >
          Today
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 && !isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <p style={{ fontSize: 13, color: '#9E9891' }}>No activity yet</p>
            </div>
          )}
          {messages.map((message: ChatMessage) => (
            <MessageEntry key={message.id} message={message} />
          ))}
          {isLoading && <LoadingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 px-5 py-4" style={{ borderTop: '1px solid #E8E4DF' }}>
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
                color: '#1A1A1A',
                background: '#FAF7F4',
                border: '1px solid #E8E4DF',
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
              className="shrink-0"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: '#1A1A1A',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
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
      </div>
    </aside>
  );
}
