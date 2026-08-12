import { useEffect } from 'react';

/**
 * useSwipeBack — Detects a right-edge → left swipe gesture and fires `onBack`.
 *
 * This hook implements the SPA "go back" gesture for custom view-state machines
 * that do not rely on the browser history stack. The mental model is:
 * "swipe the current screen away to the left, revealing the previous one beneath."
 *
 * Convention: start from the RIGHT edge, swipe LEFT → navigate back.
 * This is consistent across iOS and Android for in-app navigation (not browser history).
 *
 * Works on both Android and iOS PWA.
 *
 * Design principles:
 * - Single responsibility: gesture detection only, no navigation logic.
 * - Passive listeners: never blocks scrolling or other touch handlers.
 * - Zero coupling: caller owns the back-action semantics entirely.
 *
 * @param onBack - Callback fired when a valid back-swipe is detected.
 * @param enabled - When false, the listeners are removed. Use to disable on desktop/large screens.
 */
export function useSwipeBack(onBack: () => void, enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;

    /** Maximum px from the RIGHT edge to begin tracking a swipe. */
    const EDGE_ZONE_PX = 44; // ~1cm on a 96dpi screen; wide enough for thumb comfort

    /** Minimum horizontal displacement (px) to the left to count as a deliberate back-swipe. */
    const MIN_SWIPE_X = 60;

    /** Maximum vertical drift (px) allowed — keeps it distinct from a scroll. */
    const MAX_DRIFT_Y = 80;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const handleTouchStart = (e: TouchEvent): void => {
      const touch = e.touches[0];
      const screenWidth = window.innerWidth;
      // Track only touches that begin within EDGE_ZONE_PX of the RIGHT edge
      if (touch.clientX >= screenWidth - EDGE_ZONE_PX) {
        startX = touch.clientX;
        startY = touch.clientY;
        tracking = true;
      } else {
        tracking = false;
      }
    };

    const handleTouchEnd = (e: TouchEvent): void => {
      if (!tracking) return;
      tracking = false;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX; // negative = swiped left
      const deltaY = Math.abs(touch.clientY - startY);

      // Must swipe LEFT (negative deltaX) by at least MIN_SWIPE_X
      if (deltaX <= -MIN_SWIPE_X && deltaY <= MAX_DRIFT_Y) {
        onBack();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onBack, enabled]);
}
