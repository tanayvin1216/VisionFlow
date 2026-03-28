'use client';

import { useAppStore } from '@/lib/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';

const modeConfig = {
  idle: { label: 'Ready', color: '#9E9891' },
  drawing: { label: 'Drawing', color: '#6EE7B7' },
  submitting: { label: 'Submitting', color: '#FCD34D' },
  thinking: { label: 'Thinking', color: '#C4553D' },
  response: { label: 'Response', color: '#6EE7B7' },
  model: { label: 'Model', color: '#F59E0B' },
  annotate: { label: 'Annotate', color: '#2DD4BF' },
};

export function ModeIndicator() {
  const mode = useAppStore((state) => state.mode);
  const config = modeConfig[mode];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-4 py-2"
          style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8 }}
        >
          <motion.div
            className="rounded-full"
            style={{ width: 7, height: 7, background: config.color }}
            animate={mode === 'drawing' || mode === 'thinking' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.75)' }}>
            {config.label}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
