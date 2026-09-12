import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLayoutPreference } from '../useLayoutPreference';

const STORAGE_KEY = 'av-overview-layout';

describe('useLayoutPreference Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('defaults to "list" when localStorage is empty', () => {
    const { result } = renderHook(() => useLayoutPreference());
    expect(result.current.layout).toBe('list');
  });

  it('initializes to "grid" when localStorage contains "grid"', () => {
    localStorage.setItem(STORAGE_KEY, 'grid');
    const { result } = renderHook(() => useLayoutPreference());
    expect(result.current.layout).toBe('grid');
  });

  it('initializes to "list" when localStorage contains "list"', () => {
    localStorage.setItem(STORAGE_KEY, 'list');
    const { result } = renderHook(() => useLayoutPreference());
    expect(result.current.layout).toBe('list');
  });

  it('sanitizes obsolete "table" value from localStorage to "list"', () => {
    localStorage.setItem(STORAGE_KEY, 'table');
    const { result } = renderHook(() => useLayoutPreference());
    expect(result.current.layout).toBe('list');
  });

  it('sanitizes arbitrary invalid/corrupted localStorage values to "list"', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid-layout-mode');
    const { result } = renderHook(() => useLayoutPreference());
    expect(result.current.layout).toBe('list');

    localStorage.setItem(STORAGE_KEY, '');
    const { result: emptyResult } = renderHook(() => useLayoutPreference());
    expect(emptyResult.current.layout).toBe('list');
  });

  it('updates state and persists to localStorage when calling setLayout', () => {
    const { result } = renderHook(() => useLayoutPreference());

    expect(result.current.layout).toBe('list');

    act(() => {
      result.current.setLayout('grid');
    });

    expect(result.current.layout).toBe('grid');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('grid');

    act(() => {
      result.current.setLayout('list');
    });

    expect(result.current.layout).toBe('list');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('list');
  });

  it('defaults journalLayout to "manuscript" and handles updates', () => {
    const { result } = renderHook(() => useLayoutPreference());
    expect(result.current.journalLayout).toBe('manuscript');

    act(() => {
      result.current.setJournalLayout('bookshelf');
    });

    expect(result.current.journalLayout).toBe('bookshelf');
    expect(localStorage.getItem('av-journal-layout')).toBe('bookshelf');

    act(() => {
      result.current.setJournalLayout('manuscript');
    });

    expect(result.current.journalLayout).toBe('manuscript');
    expect(localStorage.getItem('av-journal-layout')).toBe('manuscript');
  });

  it('initializes journalLayout from localStorage and sanitizes invalid values', () => {
    localStorage.setItem('av-journal-layout', 'bookshelf');
    const { result: bookshelfResult } = renderHook(() => useLayoutPreference());
    expect(bookshelfResult.current.journalLayout).toBe('bookshelf');

    localStorage.setItem('av-journal-layout', 'invalid-mode');
    const { result: fallbackResult } = renderHook(() => useLayoutPreference());
    expect(fallbackResult.current.journalLayout).toBe('manuscript');
  });
});
