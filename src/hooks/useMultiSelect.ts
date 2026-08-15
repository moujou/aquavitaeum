'use client';

import { useState, useRef, useCallback } from 'react';

/**
 * Shared multi-select logic for long-press bulk-delete UX.
 * Used by JournalsOverview and JournalLandingPage to ensure
 * identical behaviour and a single source of truth.
 */
export interface MultiSelectReturn {
  isSelectMode: boolean;
  selectedIds: Set<string>;
  confirmBulkDelete: boolean;
  setConfirmBulkDelete: (v: boolean) => void;
  enterSelectMode: (id: string) => void;
  exitSelectMode: () => void;
  toggleSelection: (id: string) => void;
  handleTouchStart: (e: React.TouchEvent, id: string) => void;
  cancelLongPress: () => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  /** Pass the caller-specific delete function; iterates selectedIds and cleans up state. */
  handleBulkDelete: (onDelete: (id: string) => Promise<void>) => Promise<void>;
}

export function useMultiSelect(onSelectModeChange?: (active: boolean) => void): MultiSelectReturn {
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressActive = useRef(false);

  const enterSelectMode = useCallback((id: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(40);
    }
    setIsSelectMode(true);
    setSelectedIds(new Set([id]));
    onSelectModeChange?.(true);
  }, [onSelectModeChange]);

  const exitSelectMode = useCallback(() => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
    setConfirmBulkDelete(false);
    longPressActive.current = false;
    onSelectModeChange?.(false);
  }, [onSelectModeChange]);

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
    (e: React.TouchEvent, id: string) => {
      if (isSelectMode) {
        // Already in select mode: a tap will toggle via onClick; just ensure ref is clear.
        longPressActive.current = false;
        return;
      }
      longPressActive.current = false;
      longPressTimer.current = setTimeout(() => {
        longPressActive.current = true;
        enterSelectMode(id);
      }, 500);
    },
    [isSelectMode, enterSelectMode],
  );

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      cancelLongPress();
      if (longPressActive.current) {
        // Long-press just fired — swallow the synthetic click and reset the flag.
        e.preventDefault();
        longPressActive.current = false;
      }
    },
    [cancelLongPress],
  );

  const handleBulkDelete = useCallback(
    async (onDelete: (id: string) => Promise<void>) => {
      try {
        for (const id of selectedIds) {
          await onDelete(id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setConfirmBulkDelete(false);
        exitSelectMode();
      }
    },
    [selectedIds, exitSelectMode],
  );

  return {
    isSelectMode,
    selectedIds,
    confirmBulkDelete,
    setConfirmBulkDelete,
    enterSelectMode,
    exitSelectMode,
    toggleSelection,
    handleTouchStart,
    cancelLongPress,
    handleTouchEnd,
    handleBulkDelete,
  };
}
