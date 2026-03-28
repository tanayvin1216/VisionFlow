'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store/app-store';

interface SubmitOverlayProps {
  canvasImage: string | null;
  onComplete: () => void;
}

export function SubmitOverlay({ canvasImage, onComplete }: SubmitOverlayProps) {
  const { mode, inputText, response, isLoading } = useAppStore();
  const textboxRef = useRef<HTMLDivElement>(null);

  const isActive = mode === 'submitting' || mode === 'thinking' || mode === 'response';

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex flex-col items-center justify-center"
      >
        {/* Warm background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
          style={{ background: 'var(--background)' }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-2xl px-8 flex flex-col items-center">
          {/* Drawing image */}
          {canvasImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-8"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={canvasImage}
                alt="Your drawing"
                className="max-w-full"
                style={{
                  maxHeight: 240,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  filter: 'invert(1)',
                }}
              />
            </motion.div>
          )}

          {/* Prompt card */}
          <motion.div
            ref={textboxRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5, type: 'spring', stiffness: 100 }}
            className="w-full"
          >
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 14,
                padding: '24px 28px',
                border: '1px solid var(--border)',
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: 'var(--foreground)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {inputText || 'No prompt provided'}
              </p>
            </div>

            {/* Sending indicator */}
            {mode === 'submitting' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-2 mt-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="rounded-full"
                  style={{ width: 6, height: 6, background: 'var(--accent-warm, #C4553D)' }}
                />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Sending to AI...
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* AI Response */}
          <AnimatePresence>
            {(mode === 'thinking' || mode === 'response') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full mt-5"
              >
                <div
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 14,
                    padding: '24px 28px',
                    border: '1px solid var(--border)',
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="rounded-full"
                        style={{
                          width: 18,
                          height: 18,
                          border: '2px solid var(--border)',
                          borderTopColor: 'var(--foreground)',
                        }}
                      />
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                        Analyzing your drawing...
                      </span>
                    </div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        fontSize: 16,
                        lineHeight: 1.7,
                        color: 'var(--foreground)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {response}
                    </motion.p>
                  )}
                </div>

                {/* New drawing button */}
                {mode === 'response' && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-end mt-5"
                  >
                    <button
                      onClick={onComplete}
                      style={{
                        padding: '10px 24px',
                        background: 'var(--foreground)',
                        color: 'var(--surface)',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      New Drawing
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
