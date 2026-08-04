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
        className="bg-[#F5EEDC] border border-[#C59B27] rounded-lg p-6 max-w-md w-full shadow-2xl flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-700 flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#1A120B]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#5c3d22] font-body mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="text-xs text-[#1A120B] font-body leading-relaxed">
          {message}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#D4C3A3]">
          <button
            id="confirm-dialog-cancel"
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded text-xs font-body font-medium text-[#5c3d22] hover:bg-[#1A120B]/10 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-dialog-submit"
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded text-xs font-body font-semibold bg-red-800 text-white hover:bg-red-900 transition-colors cursor-pointer shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
