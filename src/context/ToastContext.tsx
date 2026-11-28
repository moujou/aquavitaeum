'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'info' | 'error';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  activeToast: ToastItem | null;
  showToast: (message: string, type?: ToastType, durationMs?: number) => void;
  dismissToast: () => void;
}

const NOOP_TOAST_CONTEXT: ToastContextValue = {
  activeToast: null,
  showToast: () => {},
  dismissToast: () => {},
};

const ToastContext = createContext<ToastContextValue>(NOOP_TOAST_CONTEXT);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [activeToast, setActiveToast] = useState<ToastItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const counterRef = useRef(0);

  const clearTimers = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (unmountTimerRef.current) {
      clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }
  }, []);

  const dismissToast = useCallback(() => {
    clearTimers();
    setIsClosing(false);
    setActiveToast(null);
  }, [clearTimers]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', durationMs?: number) => {
      if (!message.trim()) return;
      clearTimers();

      counterRef.current += 1;
      const nextId = counterRef.current;
      setIsClosing(false);
      setActiveToast({ id: nextId, message: message.trim(), type });

      const totalDuration = durationMs ?? (type === 'error' ? 4000 : 2600);
      const exitAnimationMs = 280;

      closeTimerRef.current = setTimeout(() => {
        setIsClosing(true);
      }, totalDuration - exitAnimationMs);

      unmountTimerRef.current = setTimeout(() => {
        setActiveToast((prev) => (prev?.id === nextId ? null : prev));
        setIsClosing(false);
      }, totalDuration);
    },
    [clearTimers]
  );

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return (
    <ToastContext.Provider value={{ activeToast, showToast, dismissToast }}>
      {children}
      {activeToast && (
        <div
          role="status"
          aria-live="polite"
          data-testid="app-toast-viewport"
          className="fixed bottom-20 lg:bottom-8 left-1/2 -translate-x-1/2 z-[1200] pointer-events-none px-4 w-full max-w-md flex justify-center"
        >
          <div
            key={activeToast.id}
            onClick={dismissToast}
            data-testid="app-toast-pill"
            className={cn(
              'pointer-events-auto cursor-pointer select-none rounded-full px-4.5 py-2.5 border flex items-center gap-2.5 text-xs sm:text-sm font-body font-semibold max-w-full',
              isClosing ? 'animate-toast-out' : 'animate-toast-in',
              activeToast.type === 'error'
                ? 'bg-red-700 border-red-400/50 text-white shadow-[0_12px_32px_rgba(0,0,0,0.45)]'
                : 'bg-[var(--fab-bg)] border-[var(--fab-border)] text-[var(--fab-text)] shadow-[0_12px_32px_rgba(0,0,0,0.42),0_4px_14px_rgba(35,115,71,0.35)]'
            )}
          >
            {activeToast.type === 'error' ? (
              <AlertCircle size={16} className="text-white shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-[var(--fab-text)] shrink-0" />
            )}
            <span className="truncate">{activeToast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
