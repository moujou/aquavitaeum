import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpiritCollection } from '../useSpiritCollection';
import { MOCK_SPIRITS } from '@/data/mock-spirits';

describe('useSpiritCollection Hook', () => {
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

  it('filters spirits by search query', () => {
    const { result } = renderHook(() => useSpiritCollection(MOCK_SPIRITS));

    act(() => {
      result.current.setSearch('Lagavulin');
    });

    expect(result.current.filteredSpirits.length).toBe(1);
    expect(result.current.filteredSpirits[0].distillery).toBe('Lagavulin');
  });
});
