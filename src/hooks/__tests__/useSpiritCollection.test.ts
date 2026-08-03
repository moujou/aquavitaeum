import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpiritCollection } from '../useSpiritCollection';
import { MOCK_SPIRITS } from '@/data/mock-spirits';

describe('useSpiritCollection Hook', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url === '/api/spirits') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ spirits: MOCK_SPIRITS }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with mock spirits dataset and sets activeSpirit to first spirit', () => {
    const { result } = renderHook(() => useSpiritCollection(MOCK_SPIRITS));

    expect(result.current.spirits.length).toBe(MOCK_SPIRITS.length);
    expect(result.current.selectedId).toBe(MOCK_SPIRITS[0].id);
    expect(result.current.activeSpirit.id).toBe(MOCK_SPIRITS[0].id);
  });

  it('selects a spirit by id correctly', () => {
    const { result } = renderHook(() => useSpiritCollection(MOCK_SPIRITS));
    const targetId = MOCK_SPIRITS[1].id;

    act(() => {
      result.current.selectSpirit(targetId);
    });

    expect(result.current.selectedId).toBe(targetId);
    expect(result.current.activeSpirit.id).toBe(targetId);
  });

  it('creates a new blank spirit note', () => {
    const { result } = renderHook(() => useSpiritCollection(MOCK_SPIRITS));
    const initialLength = result.current.spirits.length;

    act(() => {
      result.current.handleNewNote();
    });

    expect(result.current.spirits.length).toBe(initialLength + 1);
    expect(result.current.selectedId).toMatch(/^new-/);
  });

  it('saves an updated spirit note', () => {
    const { result } = renderHook(() => useSpiritCollection(MOCK_SPIRITS));
    const updatedSpirit = { ...MOCK_SPIRITS[0], name: 'Updated Laphroaig Name' };

    act(() => {
      result.current.handleSave(updatedSpirit);
    });

    expect(result.current.activeSpirit.name).toBe('Updated Laphroaig Name');
  });

  it('deletes a spirit note and auto-selects remaining spirit', () => {
    const { result } = renderHook(() => useSpiritCollection(MOCK_SPIRITS));
    const idToDelete = MOCK_SPIRITS[0].id;
    const nextExpectedId = MOCK_SPIRITS[1].id;

    act(() => {
      result.current.handleDelete(idToDelete);
    });

    expect(result.current.spirits.some((s) => s.id === idToDelete)).toBe(false);
    expect(result.current.selectedId).toBe(nextExpectedId);
  });

  it('filters spirits by search query including German translated attributes (e.g. Ölig, Bernstein, Torf)', () => {
    const { result } = renderHook(() => useSpiritCollection(MOCK_SPIRITS));

    // Search by distillery
    act(() => {
      result.current.setSearch('Lagavulin');
    });
    expect(result.current.filteredSpirits.length).toBe(1);
    expect(result.current.filteredSpirits[0].distillery).toBe('Lagavulin');

    // Multilingual search by German translated glance term "Ölig" (Oily)
    act(() => {
      result.current.setSearch('Ölig');
    });
    expect(result.current.filteredSpirits.some((s) => s.id === 'laphroaig-10')).toBe(true);

    // Multilingual search by German translated colour term "Bernstein" (Amber)
    act(() => {
      result.current.setSearch('Bernstein');
    });
    expect(result.current.filteredSpirits.some((s) => s.id === 'lagavulin-16')).toBe(true);
  });
});
