import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHistoryNavigation, HistoryStatePayload } from '../useHistoryNavigation';

describe('useHistoryNavigation', () => {
  const originalState = window.history.state;

  beforeEach(() => {
    // Reset history state before each test
    window.history.replaceState(null, '');
  });

  afterEach(() => {
    window.history.replaceState(originalState, '');
    vi.restoreAllMocks();
  });

  it('initializes root overview history with replaceState', () => {
    const onPopState = vi.fn();
    const { result } = renderHook(() =>
      useHistoryNavigation({ onPopState })
    );

    act(() => {
      result.current.initRootHistory('overview');
    });

    expect(window.history.state).toEqual({
      aquaVitaeum: true,
      view: 'overview',
      journalId: null,
      spiritId: null,
    });
  });

  it('seeds breadcrumb hierarchy when initializing on journal-landing', () => {
    const onPopState = vi.fn();
    const { result } = renderHook(() =>
      useHistoryNavigation({ onPopState })
    );

    act(() => {
      result.current.initRootHistory('journal-landing', 'journal-123');
    });

    expect(window.history.state).toEqual({
      aquaVitaeum: true,
      view: 'journal-landing',
      journalId: 'journal-123',
    });
  });

  it('seeds breadcrumb hierarchy when initializing on journal-detail', () => {
    const onPopState = vi.fn();
    const { result } = renderHook(() =>
      useHistoryNavigation({ onPopState })
    );

    act(() => {
      result.current.initRootHistory('journal-detail', 'journal-123', 'spirit-456');
    });

    expect(window.history.state).toEqual({
      aquaVitaeum: true,
      view: 'journal-detail',
      journalId: 'journal-123',
      spiritId: 'spirit-456',
    });
  });

  it('pushes new history state via pushView', () => {
    const onPopState = vi.fn();
    const { result } = renderHook(() =>
      useHistoryNavigation({ onPopState })
    );

    act(() => {
      result.current.pushView('journal-landing', { journalId: 'j-1' });
    });

    expect(window.history.state).toEqual({
      aquaVitaeum: true,
      view: 'journal-landing',
      journalId: 'j-1',
      spiritId: null,
      fromView: undefined,
    });
  });

  it('replaces history state via replaceView', () => {
    const onPopState = vi.fn();
    const { result } = renderHook(() =>
      useHistoryNavigation({ onPopState })
    );

    act(() => {
      result.current.replaceView('profile', { fromView: 'overview' });
    });

    expect(window.history.state).toEqual({
      aquaVitaeum: true,
      view: 'profile',
      journalId: null,
      spiritId: null,
      fromView: 'overview',
    });
  });

  it('invokes onPopState when window popstate event is dispatched', () => {
    const onPopState = vi.fn();
    renderHook(() =>
      useHistoryNavigation({ onPopState })
    );

    const payload: HistoryStatePayload = {
      aquaVitaeum: true,
      view: 'journal-landing',
      journalId: 'journal-99',
    };

    act(() => {
      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: payload,
        })
      );
    });

    expect(onPopState).toHaveBeenCalledWith(payload);
  });

  it('falls back to overview on unhandled or null popstate event', () => {
    const onPopState = vi.fn();
    renderHook(() =>
      useHistoryNavigation({ onPopState })
    );

    act(() => {
      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: null,
        })
      );
    });

    expect(onPopState).toHaveBeenCalledWith({
      aquaVitaeum: true,
      view: 'overview',
      journalId: null,
      spiritId: null,
    });
  });

  it('calls window.history.back on navigateBack', () => {
    const onPopState = vi.fn();
    const backSpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    // Set an active aquaVitaeum state so navigateBack knows it is in app history
    window.history.replaceState({ aquaVitaeum: true, view: 'journal-detail' }, '');

    const { result } = renderHook(() =>
      useHistoryNavigation({ onPopState })
    );

    act(() => {
      result.current.navigateBack();
    });

    expect(backSpy).toHaveBeenCalledTimes(1);
  });

  it('executes fallbackBack if history.state is not an aquaVitaeum state', () => {
    const onPopState = vi.fn();
    const fallbackBack = vi.fn();
    window.history.replaceState(null, '');

    const { result } = renderHook(() =>
      useHistoryNavigation({ onPopState, fallbackBack })
    );

    act(() => {
      result.current.navigateBack();
    });

    expect(fallbackBack).toHaveBeenCalledTimes(1);
  });
});
