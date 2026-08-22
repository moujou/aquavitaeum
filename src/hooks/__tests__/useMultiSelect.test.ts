import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMultiSelect } from '../useMultiSelect';

describe('useMultiSelect Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with select mode inactive and empty selection', () => {
    const { result } = renderHook(() => useMultiSelect());
    expect(result.current.isSelectMode).toBe(false);
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.confirmBulkDelete).toBe(false);
  });

  it('enters select mode and notifies callback', () => {
    const onSelectModeChange = vi.fn();
    const { result } = renderHook(() => useMultiSelect(onSelectModeChange));

    act(() => {
      result.current.enterSelectMode('item-1');
    });

    expect(result.current.isSelectMode).toBe(true);
    expect(result.current.selectedIds.has('item-1')).toBe(true);
    expect(onSelectModeChange).toHaveBeenCalledWith(true);
  });

  it('toggles selection of items', () => {
    const { result } = renderHook(() => useMultiSelect());

    act(() => {
      result.current.enterSelectMode();
      result.current.toggleSelection('item-1');
    });
    expect(result.current.selectedIds.has('item-1')).toBe(true);

    act(() => {
      result.current.toggleSelection('item-2');
    });
    expect(result.current.selectedIds.has('item-2')).toBe(true);
    expect(result.current.selectedIds.size).toBe(2);

    act(() => {
      result.current.toggleSelection('item-1');
    });
    expect(result.current.selectedIds.has('item-1')).toBe(false);
    expect(result.current.selectedIds.size).toBe(1);
  });

  it('exits select mode and clears state', () => {
    const onSelectModeChange = vi.fn();
    const { result } = renderHook(() => useMultiSelect(onSelectModeChange));

    act(() => {
      result.current.enterSelectMode('item-1');
      result.current.setConfirmBulkDelete(true);
      result.current.exitSelectMode();
    });

    expect(result.current.isSelectMode).toBe(false);
    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.confirmBulkDelete).toBe(false);
    expect(onSelectModeChange).toHaveBeenCalledWith(false);
  });

  it('triggers enterSelectMode via touch start after 500ms long press', () => {
    const { result } = renderHook(() => useMultiSelect());
    const mockEvent = {} as React.TouchEvent;

    act(() => {
      result.current.handleTouchStart(mockEvent, 'touch-item-1');
    });
    expect(result.current.isSelectMode).toBe(false);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.isSelectMode).toBe(true);
    expect(result.current.selectedIds.has('touch-item-1')).toBe(true);
  });

  it('cancels long press timer on cancelLongPress', () => {
    const { result } = renderHook(() => useMultiSelect());
    const mockEvent = {} as React.TouchEvent;

    act(() => {
      result.current.handleTouchStart(mockEvent, 'touch-item-1');
      result.current.cancelLongPress();
      vi.advanceTimersByTime(500);
    });

    expect(result.current.isSelectMode).toBe(false);
  });

  it('executes handleBulkDelete and iterates over selected items', async () => {
    const { result } = renderHook(() => useMultiSelect());
    const onDelete = vi.fn().mockResolvedValue(undefined);

    act(() => {
      result.current.enterSelectMode();
      result.current.toggleSelection('item-A');
      result.current.toggleSelection('item-B');
    });

    await act(async () => {
      await result.current.handleBulkDelete(onDelete);
    });

    expect(onDelete).toHaveBeenCalledWith('item-A');
    expect(onDelete).toHaveBeenCalledWith('item-B');
    expect(result.current.isSelectMode).toBe(false);
  });
});
