import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSwipeBack } from '../useSwipeBack';

// ─── Touch API Polyfill ───────────────────────────────────────────────────────
// JSDOM does not implement the Touch constructor. We define a minimal polyfill
// that mirrors the properties useSwipeBack reads: identifier, target, clientX, clientY.

if (typeof globalThis.Touch === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).Touch = class Touch {
    identifier: number;
    target: EventTarget;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
    screenX: number;
    screenY: number;
    radiusX: number;
    radiusY: number;
    rotationAngle: number;
    force: number;

    constructor(init: {
      identifier: number;
      target: EventTarget;
      clientX?: number;
      clientY?: number;
      pageX?: number;
      pageY?: number;
      radiusX?: number;
      radiusY?: number;
      rotationAngle?: number;
      force?: number;
    }) {
      this.identifier = init.identifier;
      this.target = init.target;
      this.clientX = init.clientX ?? 0;
      this.clientY = init.clientY ?? 0;
      this.pageX = init.pageX ?? this.clientX;
      this.pageY = init.pageY ?? this.clientY;
      this.screenX = this.clientX;
      this.screenY = this.clientY;
      this.radiusX = init.radiusX ?? 1;
      this.radiusY = init.radiusY ?? 1;
      this.rotationAngle = init.rotationAngle ?? 0;
      this.force = init.force ?? 1;
    }
  };
}

// ─── Touch Event helpers ──────────────────────────────────────────────────────

/**
 * Creates a Touch object. JSDOM partially supports the Touch constructor.
 * We attach to document.body as the target.
 */
function makeTouch(id: number, x: number, y: number): Touch {
  return new Touch({
    identifier: id,
    target: document.body,
    clientX: x,
    clientY: y,
    pageX: x,
    pageY: y,
    radiusX: 1,
    radiusY: 1,
    rotationAngle: 0,
    force: 1,
  });
}

/**
 * Dispatches a touchstart then touchend pair on document, simulating a full
 * swipe gesture from (startX, startY) to (endX, endY).
 */
function swipe(startX: number, startY: number, endX: number, endY: number): void {
  const startTouch = makeTouch(1, startX, startY);
  const endTouch = makeTouch(1, endX, endY);

  document.dispatchEvent(
    new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [startTouch],
      changedTouches: [startTouch],
    }),
  );

  document.dispatchEvent(
    new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      touches: [],
      changedTouches: [endTouch],
    }),
  );
}

/**
 * Dispatches only a touchstart (no corresponding touchend).
 * Used to test that touchend without prior tracking is a no-op.
 */
function touchStart(x: number, y: number): void {
  const t = makeTouch(1, x, y);
  document.dispatchEvent(
    new TouchEvent('touchstart', {
      bubbles: true,
      cancelable: true,
      touches: [t],
      changedTouches: [t],
    }),
  );
}

/**
 * Dispatches only a touchend (without a prior tracked touchstart).
 */
function touchEnd(x: number, y: number): void {
  const t = makeTouch(1, x, y);
  document.dispatchEvent(
    new TouchEvent('touchend', {
      bubbles: true,
      cancelable: true,
      touches: [],
      changedTouches: [t],
    }),
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useSwipeBack Hook — Gesture Detection', () => {
  let onBack: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    onBack = vi.fn<() => void>();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Branch 1: enabled=false ──────────────────────────────────────────────

  it('does NOT fire onBack when enabled=false, even for a valid right-edge swipe', () => {
    const { unmount } = renderHook(() => useSwipeBack(onBack, false));

    swipe(990, 300, 890, 300); // valid right-edge leftward gesture — but hook is disabled

    expect(onBack).not.toHaveBeenCalled();
    unmount();
  });

  // ── Branch 2: Valid swipe — fires onBack ─────────────────────────────────

  it('fires onBack for a clean right-edge leftward swipe (dx=-100, dy=0)', () => {
    const { unmount } = renderHook(() => useSwipeBack(onBack));

    // JSDOM window.innerWidth = 1024; right edge zone: x >= 980
    swipe(990, 300, 890, 300); // starts at x=990 (inside 44px zone), moves -100px left

    expect(onBack).toHaveBeenCalledTimes(1);
    unmount();
  });

  // ── Branch 3: Valid swipe with acceptable vertical drift ─────────────────

  it('fires onBack when |dx|≥60 and vertical drift is within MAX_DRIFT_Y=80', () => {
    const { unmount } = renderHook(() => useSwipeBack(onBack));

    swipe(990, 300, 920, 370); // dx=-70, dy=70 — both within limits

    expect(onBack).toHaveBeenCalledTimes(1);
    unmount();
  });

  // ── Branch 4: Swipe too short — does NOT fire ────────────────────────────

  it('does NOT fire onBack when horizontal swipe is below MIN_SWIPE_X=60 (|dx|=40)', () => {
    const { unmount } = renderHook(() => useSwipeBack(onBack));

    swipe(990, 300, 950, 300); // starts in right-edge zone, but dx=-40 — below 60px threshold

    expect(onBack).not.toHaveBeenCalled();
    unmount();
  });

  // ── Branch 5: Excessive vertical drift — does NOT fire ───────────────────

  it('does NOT fire onBack when vertical drift exceeds MAX_DRIFT_Y=80 (dy=100)', () => {
    const { unmount } = renderHook(() => useSwipeBack(onBack));

    swipe(990, 300, 920, 400); // dx=-70 (valid), dy=100 (too much drift — likely a scroll)

    expect(onBack).not.toHaveBeenCalled();
    unmount();
  });

  // ── Branch 6: Touch starts outside edge zone — does NOT track ────────────

  it('does NOT fire onBack when touch starts outside EDGE_ZONE_PX=44 from right (startX=500)', () => {
    const { unmount } = renderHook(() => useSwipeBack(onBack));

    swipe(500, 300, 400, 300); // starts at x=500 — far from the right edge (needs x≥980)

    expect(onBack).not.toHaveBeenCalled();
    unmount();
  });

  // ── Branch 7: Touchend without prior tracked touchstart — no-op ──────────

  it('does NOT fire onBack on touchend when no touchstart was tracked (non-right-edge origin)', () => {
    const { unmount } = renderHook(() => useSwipeBack(onBack));

    // Touch started well outside the right-edge zone — tracking=false
    touchStart(200, 300);
    // Even a long leftward swipe end does not trigger
    touchEnd(100, 300);

    expect(onBack).not.toHaveBeenCalled();
    unmount();
  });

  // ── Branch 8: Cleanup — listeners removed on unmount ────────────────────

  it('removes touchstart and touchend listeners from document on unmount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const removeSpy = vi.spyOn(document, 'removeEventListener');

    const { unmount } = renderHook(() => useSwipeBack(onBack));

    // Listeners should have been added
    expect(addSpy).toHaveBeenCalledWith('touchstart', expect.any(Function), expect.objectContaining({ passive: true }));
    expect(addSpy).toHaveBeenCalledWith('touchend', expect.any(Function), expect.objectContaining({ passive: true }));

    unmount();

    // Listeners should have been removed
    expect(removeSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
  });
});
