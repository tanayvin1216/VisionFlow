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
        {/* White background overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-white"
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-3xl px-8 flex flex-col items-center">
          {/* Drawing image */}
          {canvasImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mb-8"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={canvasImage}
                alt="Your drawing"
                className="max-w-full max-h-64 rounded-lg shadow-lg"
                style={{ filter: 'invert(1)' }}
              />
            </motion.div>
          )}

          {/* Textbox reveal - using animation delay instead of state */}
          <motion.div
            ref={textboxRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5, type: 'spring', stiffness: 100 }}
            className="w-full"
          >
            <div className="bg-gray-100 rounded-xl p-6 shadow-sm">
              <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                {inputText || 'No prompt provided'}
              </p>
            </div>

            {/* Submit indicator */}
            {mode === 'submitting' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-2 mt-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                <span className="text-gray-500 text-sm">Sending to AI...</span>
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
                className="w-full mt-6"
              >
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                      <span className="text-blue-600">Analyzing your drawing...</span>
                    </div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap"
                    >
                      {response}
                    </motion.p>
                  )}
                </div>

                {/* New drawing button */}
                {mode === 'response' && !isLoading && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={onComplete}
                    className="mt-6 mx-auto block px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                  >
                    New Drawing
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
