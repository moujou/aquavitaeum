'use client';

import { useEffect, useCallback } from 'react';

/**
 * Custom hook to safely lock document.body scrolling when an overlay/modal is open,
 * compensate for desktop scrollbar width to prevent layout shifts, and optionally
 * handle Escape key dismissal.
 */
export function useLockBodyScroll(isOpen: boolean, onEscape?: () => void) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    },
    [onEscape],
  );

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    if (onEscape) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      if (onEscape) {
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isOpen, handleKeyDown, onEscape]);
}
