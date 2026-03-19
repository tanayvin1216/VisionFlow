'use client';

import { useAppStore } from '@/lib/store/app-store';
import { motion, AnimatePresence } from 'framer-motion';

const modeConfig = {
  idle: {
    label: 'Ready',
    color: 'bg-gray-500',
    textColor: 'text-gray-400',
  },
  drawing: {
    label: 'Drawing',
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
  },
  submitting: {
    label: 'Submitting',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
  },
  thinking: {
    label: 'Thinking',
    color: 'bg-purple-500',
    textColor: 'text-purple-400',
  },
  response: {
    label: 'Response',
    color: 'bg-green-500',
    textColor: 'text-green-400',
  },
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
          className="flex items-center gap-2 px-4 py-2 bg-black/60 rounded-full backdrop-blur-sm"
        >
          <motion.div
            className={`w-2 h-2 rounded-full ${config.color}`}
            animate={mode === 'drawing' || mode === 'thinking' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <span className={`text-sm font-medium ${config.textColor}`}>
            {config.label}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
