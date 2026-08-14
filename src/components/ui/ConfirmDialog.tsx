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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-[var(--pub-bg-panel)] border border-red-500/30 rounded-xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-red-400 mb-4 border-b border-red-500/10 pb-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-display text-lg font-bold uppercase tracking-wider text-red-500">
              {title}
            </h3>
            {subtitle && (
              <p className="font-body text-xs text-white/50 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="font-body text-sm text-gray-300 leading-relaxed mb-6">
          {message}
        </div>

        <div className="flex justify-end gap-2.5">
          <button
            id="confirm-dialog-cancel"
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-dialog-submit"
            type="button"
            onClick={onConfirm}
            className="h-10 px-5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 font-semibold text-sm transition-colors cursor-pointer shadow-lg"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

