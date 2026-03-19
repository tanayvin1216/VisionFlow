'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/lib/store/app-store';

interface InvisibleTextboxProps {
  onSubmit: () => void;
}

export function InvisibleTextbox({ onSubmit }: InvisibleTextboxProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { inputText, setInputText, mode } = useAppStore();

  // Keep the textbox always focused
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // Focus on mount
    input.focus();

    // Refocus when clicking anywhere
    function handleClick() {
      inputRef.current?.focus();
    }

    // Refocus when window gains focus
    function handleFocus() {
      inputRef.current?.focus();
    }

    document.addEventListener('click', handleClick);
    window.addEventListener('focus', handleFocus);

    // Periodically check focus (fallback)
    const interval = setInterval(() => {
      if (document.activeElement !== input && mode !== 'submitting' && mode !== 'thinking') {
        input.focus();
      }
    }, 500);

    return () => {
      document.removeEventListener('click', handleClick);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [mode]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit();
      }
    },
    [onSubmit]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputText(e.target.value);
    },
    [setInputText]
  );

  return (
    <textarea
      ref={inputRef}
      value={inputText}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="fixed -top-full -left-full w-px h-px opacity-0 pointer-events-none"
      aria-hidden="true"
      tabIndex={-1}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
    />
  );
}
