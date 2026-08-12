'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FileText, Trash2, X, AlertTriangle } from 'lucide-react';
import { Spirit } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { SpiritCard } from './SpiritCard';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpiritCollectionGridProps {
  title?: string;
  description?: string;
  spirits: Spirit[];
  selectedId: string | null;
  isLoading?: boolean;
  onSelect: (spirit: Spirit) => void;
  /** When provided, long-press select mode is enabled for bulk deletion */
  onDelete?: (id: string) => Promise<void>;
  /** Pass-through so the grid can close the mobile drawer after bulk delete */
  onAfterDelete?: () => void;
  /**
   * When false, selection mode is automatically exited.
   * Use this to reset state when the mobile drawer closes.
   */
  isVisible?: boolean;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpiritCollectionGrid({
  title,
  description,
  spirits,
  selectedId,
  isLoading = false,
  onSelect,
  onDelete,
  onAfterDelete,
  isVisible = true,
  className,
}: SpiritCollectionGridProps) {
  const { t, language } = useLanguage();

  // ── Long-press Select Mode ──────────────────────────────────────────────────
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressActive = useRef(false);

  // Auto-exit select mode when the container becomes hidden (e.g. drawer closes)
  useEffect(() => {
    if (!isVisible && isSelectMode) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSelectMode(false);
      setSelectedIds(new Set());
      longPressActive.current = false;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  }, [isVisible, isSelectMode]);

  const enterSelectMode = useCallback((spiritId: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(40);
    }
    setIsSelectMode(true);
    setSelectedIds(new Set([spiritId]));
  }, []);

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
    longPressActive.current = false;
  }, []);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleTouchStart = useCallback(
    (spiritId: string) => {
      if (!onDelete) return;
      if (isSelectMode) {
        longPressActive.current = false;
        return;
      }
      longPressActive.current = false;
      longPressTimer.current = setTimeout(() => {
        longPressActive.current = true;
        enterSelectMode(spiritId);
      }, 500);
    },
    [isSelectMode, enterSelectMode, onDelete],
  );

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    cancelLongPress();
    if (longPressActive.current) {
      longPressActive.current = false;
    }
  }, [cancelLongPress]);

  const handleCardClick = useCallback(
    (spirit: Spirit) => {
      if (longPressActive.current) {
        longPressActive.current = false;
        return;
      }
      if (isSelectMode) {
        toggleSelection(spirit.id);
        return;
      }
      onSelect(spirit);
    },
    [isSelectMode, toggleSelection, onSelect],
  );

  const handleBulkDelete = async () => {
    if (!onDelete) return;
    try {
      for (const id of selectedIds) {
        await onDelete(id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmBulkDelete(false);
      exitSelectMode();
      onAfterDelete?.();
    }
  };

  const canDelete = selectedIds.size > 0;

  return (
    <div className={cn('h-full flex flex-col gap-3.5 overflow-hidden', className)}>
      {/* Header: Centered title layout — right side switches between pill and action icons */}
      <div className="flex-shrink-0 flex flex-col justify-center px-1 pb-3 border-b border-white/10 relative">
        <div className="w-full flex items-center justify-center relative px-12">
          {/* Centered title — never shifts regardless of select mode */}
          <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-wide truncate text-center mx-auto max-w-[90%]">
            {title || t('collection')}
            {/* Inline selection count so the title area stays self-contained */}
            {isSelectMode && selectedIds.size > 0 && (
              <span className="text-xs font-body text-white/50 tabular-nums ml-1.5">
                ({selectedIds.size})
              </span>
            )}
          </h2>

          {/* Absolute right: pill (normal) → [Trash][X] (select mode) */}
          <div className="absolute right-0.5 flex items-center gap-1">
            {isSelectMode ? (
              <>
                <button
                  onClick={() => canDelete && setConfirmBulkDelete(true)}
                  disabled={!canDelete}
                  title={language === 'DE' ? 'Löschen' : 'Delete'}
                  className={cn(
                    'p-1.5 rounded-lg border transition-all cursor-pointer',
                    canDelete
                      ? 'bg-red-950/40 border-red-500/40 text-red-400 hover:bg-red-900/50'
                      : 'bg-transparent border-transparent text-white/15 cursor-not-allowed',
                  )}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={exitSelectMode}
                  title={language === 'DE' ? 'Abbrechen' : 'Cancel'}
                  className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div
                className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full shrink-0 select-none"
                title={`${spirits.length} notes`}
              >
                <FileText size={14} className="text-[#C59B27]" />
                <span className="font-bold font-mono text-xs text-white leading-none">{spirits.length}</span>
              </div>
            )}
          </div>
        </div>

        {description && (
          <p className="font-body text-xs text-white/50 italic mt-0.5 leading-normal max-w-[240px] text-center mx-auto break-words">
            {description}
          </p>
        )}

        {/* Hint text in select mode */}
        {isSelectMode && (
          <p className="text-center text-[11px] font-body text-[#C59B27]/60 mt-1.5 tracking-wide">
            {selectedIds.size === 0
              ? language === 'DE' ? 'Tippe auf eine Notiz zum Auswählen' : 'Tap a note to select it'
              : language === 'DE' ? `${selectedIds.size} ausgewählt` : `${selectedIds.size} selected`}
          </p>
        )}
      </div>

      {/* Full-screen dim overlay so selection mode is visually obvious */}
      {isSelectMode && (
        <div className="fixed inset-0 z-10 bg-black/25 pointer-events-none transition-opacity duration-300 animate-fade-in" />
      )}

      {/* Dynamic Scrollable Spirit Cards */}
      <div className="relative z-20 flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-2.5">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center select-none gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#C59B27]/20 border-t-[#C59B27] animate-spin" />
            <span className="text-xs text-white/40 font-display tracking-widest uppercase animate-pulse">
              {t('uncasking')}
            </span>
          </div>
        ) : spirits.length === 0 ? (
          <p className="text-center text-xs text-white/30 font-body py-10 italic">
            {t('noMatchingFilter')}
          </p>
        ) : (
          spirits.map((spirit) => (
            <div
              key={spirit.id}
              onTouchStart={() => handleTouchStart(spirit.id)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={cancelLongPress}
              onContextMenu={(e) => {
                if (!isSelectMode && onDelete) e.preventDefault();
              }}
            >
              <SpiritCard
                spirit={spirit}
                isSelected={spirit.id === selectedId}
                isSelectMode={isSelectMode}
                isSelectChecked={selectedIds.has(spirit.id)}
                onClick={() => handleCardClick(spirit)}
              />
            </div>
          ))
        )}
      </div>

      {/* ── Bulk Delete Confirmation Modal ── */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-[#224229] border border-red-500/30 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-4 border-b border-red-500/10 pb-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-bounce" />
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-red-500">
                Warning / Achtung!
              </h3>
            </div>
            <p className="font-body text-sm text-gray-300 leading-relaxed mb-6">
              {selectedIds.size === 1
                ? language === 'DE'
                  ? 'Diese Notiz wird permanent gelöscht.'
                  : 'This tasting note will be permanently deleted.'
                : language === 'DE'
                  ? `${selectedIds.size} Notizen werden permanent gelöscht.`
                  : `${selectedIds.size} tasting notes will be permanently deleted.`}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleBulkDelete}
                className="h-10 px-5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 font-semibold text-sm transition-colors cursor-pointer shadow-lg"
              >
                {language === 'DE' ? 'Löschen bestätigen' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
