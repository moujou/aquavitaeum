'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownActionItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface PageActionsDropdownProps {
  items: DropdownActionItem[];
  className?: string;
  title?: string;
}

export function PageActionsDropdown({
  items,
  className,
  title = 'Aktionen',
}: PageActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={menuRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={title}
        className={cn(
          'w-9 h-9 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] hover:bg-[var(--pub-bg-alt)] text-[var(--sepia-text)] hover:text-[var(--foreground)] flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer',
          isOpen && 'bg-[var(--pub-bg-alt)] border-[var(--forest-green)]/40 text-[var(--forest-green)] ring-2 ring-[var(--forest-green)]/20'
        )}
      >
        <Settings size={18} className={cn('transition-transform duration-300', isOpen && 'rotate-90 text-[var(--forest-green)]')} />
      </button>

      {/* Floating Parchment Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] shadow-xl rounded-xl p-1.5 z-50 animate-fade-in flex flex-col gap-0.5 select-none">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
              className={cn(
                'flex items-center gap-2.5 w-full px-3 py-2 text-xs font-display font-semibold rounded-lg transition-colors text-left cursor-pointer active:scale-[0.99]',
                item.destructive
                  ? 'text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-800'
                  : 'text-[var(--foreground)] hover:bg-[var(--pub-bg-alt)] hover:text-[var(--forest-green)]',
                item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-inherit'
              )}
            >
              <span className="shrink-0 text-[var(--sepia-muted)]">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
