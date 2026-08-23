'use client';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  subtitle = 'This action cannot be undone.',
  message,
  confirmLabel = 'Yes, Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useLockBodyScroll(isOpen, onCancel);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
      className="fixed inset-0 z-[1100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md bg-[var(--parchment-bg)] border border-[var(--parchment-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Signature Irish Clover Header Banner ── */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[var(--wood-dark)] to-[var(--wood-selection)] text-white border-b border-black/10 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="text-xl shrink-0 select-none text-amber-200" aria-hidden="true">☘️</span>
            <h3
              id="confirm-dialog-title"
              className="font-display font-bold text-base sm:text-lg tracking-wide text-white drop-shadow-xs truncate"
            >
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-lg text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer shadow-xs flex items-center justify-center active:scale-95 shrink-0"
            title="Close dialog"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Modal Body Content on Warm Parchment ── */}
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          {subtitle && (
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-lg shadow-2xs">
              <AlertTriangle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{subtitle}</span>
            </div>
          )}

          <div
            id="confirm-dialog-message"
            className="font-body text-sm text-[var(--foreground)] leading-relaxed"
          >
            {message}
          </div>

          {/* ── Responsive Action Buttons ── */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-2">
            <button
              id="confirm-dialog-cancel"
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto min-h-[42px] px-4 rounded-lg bg-[var(--pub-bg-alt)] hover:bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--sepia-text)] hover:text-[var(--foreground)] text-sm font-semibold transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-2xs"
            >
              {cancelLabel}
            </button>
            <button
              id="confirm-dialog-submit"
              type="button"
              onClick={onConfirm}
              className="w-full sm:w-auto min-h-[42px] px-5 rounded-lg bg-red-800 hover:bg-red-900 border border-red-700 text-white font-bold text-sm transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}


