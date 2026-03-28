'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/app-store';
import type { ChatMessage } from '@/lib/store/app-store';

const PANEL_SPRING = { type: 'spring' as const, stiffness: 300, damping: 35, mass: 0.8 };

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
      {message.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={message.image}
          alt="Drawing"
          className="max-w-[160px] border border-[#2a2a3a] mb-1"
          style={{ imageRendering: 'pixelated' }}
        />
      )}
      <div
        className={`max-w-[85%] px-3 py-2 ${
          isUser ? 'bg-[#1e1e2e] text-white' : 'bg-[#16161e] text-[#c0c0d0]'
        }`}
        style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.5' }}
      >
        {message.content}
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex items-start">
      <div
        className="bg-[#16161e] text-[#4a6fa5] px-3 py-2"
        style={{ fontFamily: 'monospace', fontSize: '13px' }}
      >
        <span className="inline-flex gap-1">
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          >
            _
          </motion.span>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          >
            _
          </motion.span>
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          >
            _
          </motion.span>
        </span>
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

  // Auto-scroll to bottom on new messages
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
        // Submit is handled externally via the global submit flow
        // Dispatch a custom event that page.tsx can listen to
        window.dispatchEvent(new CustomEvent('visionflow:submit'));
      }
    },
    []
  );

  // Focus input when panel opens
  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [chatOpen]);

  return (
    <AnimatePresence>
      {chatOpen && (
        <>
          {/* Non-blocking backdrop — allows canvas interaction */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30"
            style={{ pointerEvents: 'none' }}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={PANEL_SPRING}
            className="fixed top-0 right-0 h-full z-40 flex flex-col"
            style={{
              width: 'min(400px, 100vw)',
              background: '#111116',
              borderLeft: '1px solid #1e1e2e',
              pointerEvents: 'auto',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: '1px solid #1e1e2e' }}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  color: '#4a6fa5',
                  textTransform: 'uppercase',
                }}
              >
                VisionFlow
              </span>
              <button
                onClick={handleClose}
                className="text-[#505068] hover:text-[#c0c0d0] transition-colors"
                style={{ fontFamily: 'monospace', fontSize: '16px', lineHeight: 1 }}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.length === 0 && !isLoading && (
                <p
                  className="text-center"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#303044',
                    marginTop: '40px',
                  }}
                >
                  no messages yet
                </p>
              )}
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && <LoadingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="shrink-0 px-4 py-3"
              style={{ borderTop: '1px solid #1e1e2e' }}
            >
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your drawing..."
                  rows={1}
                  className="flex-1 bg-[#0d0d10] text-white placeholder-[#303044] px-3 py-2 resize-none focus:outline-none"
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    border: '1px solid #1e1e2e',
                    minHeight: '36px',
                    maxHeight: '120px',
                  }}
                  onInput={(e) => {
                    const target = e.currentTarget;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                  }}
                />
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('visionflow:submit'))}
                  className="text-[#4a6fa5] hover:text-[#6a8fc5] transition-colors shrink-0 pb-2"
                  style={{ fontFamily: 'monospace', fontSize: '18px', lineHeight: 1 }}
                  aria-label="Send message"
                  disabled={isLoading}
                >
                  ▶
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
