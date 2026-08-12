import { useEffect } from 'react';

/**
 * useSwipeBack — Detects a left-edge → right swipe gesture and fires `onBack`.
 *
 * This hook implements the universal mobile "go back" gesture (left-edge swipe)
 * for SPA applications that manage their own view-state machine and do not rely
 * on the browser history stack.
 *
 * Works on both Android (native back gesture) and iOS PWA (no WKWebView history).
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

    /** Maximum px from the left edge to begin tracking a swipe. */
    const EDGE_ZONE_PX = 44; // ~1cm on a 96dpi screen; wide enough for thumb comfort

    /** Minimum horizontal displacement (px) to count as a deliberate swipe. */
    const MIN_SWIPE_X = 60;

    /** Maximum vertical drift (px) allowed — keeps it distinct from a scroll. */
    const MAX_DRIFT_Y = 80;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const handleTouchStart = (e: TouchEvent): void => {
      const touch = e.touches[0];
      if (touch.clientX <= EDGE_ZONE_PX) {
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
      const deltaX = touch.clientX - startX;
      const deltaY = Math.abs(touch.clientY - startY);

      if (deltaX >= MIN_SWIPE_X && deltaY <= MAX_DRIFT_Y) {
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
