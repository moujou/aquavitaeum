'use client';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

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
  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-red-700 dark:text-red-400 mb-4 border-b border-red-500/20 pb-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-600" />
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-red-800 dark:text-red-400">
              {title}
            </h3>
            {subtitle && (
              <p className="font-body text-xs text-[var(--sepia-muted)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="font-body text-sm text-[var(--foreground)] leading-relaxed mb-6">
          {message}
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            id="confirm-dialog-cancel"
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-lg bg-[var(--pub-bg-alt)] hover:bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:text-[var(--foreground)] text-sm font-semibold transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-dialog-submit"
            type="button"
            onClick={onConfirm}
            className="h-10 px-5 rounded-lg bg-red-800 hover:bg-red-900 border border-red-700 text-white font-semibold text-sm transition-colors cursor-pointer shadow-md"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

