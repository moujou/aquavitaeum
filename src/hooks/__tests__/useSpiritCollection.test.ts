/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpiritCollection } from '../useSpiritCollection';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { Spirit } from '@/types/spirit.types';

let mockDatabaseStore: Spirit[] = [];

vi.mock('@/lib/db', () => {
  return {
    db: {
      spirits: {
        where: vi.fn().mockImplementation((field) => {
          return {
            equals: vi.fn().mockImplementation((value) => {
              return {
                toArray: vi.fn().mockImplementation(async () => {
                  return mockDatabaseStore.filter((s: any) => s[field] === value);
                }),
              };
            }),
          };
        }),
        toArray: vi.fn().mockImplementation(async () => mockDatabaseStore),
        clear: vi.fn().mockImplementation(async () => {
          mockDatabaseStore = [];
        }),
        bulkPut: vi.fn().mockImplementation(async (items) => {
          mockDatabaseStore = [...items];
        }),
        add: vi.fn().mockImplementation(async (item) => {
          mockDatabaseStore.push(item);
        }),
        put: vi.fn().mockImplementation(async (item) => {
          const idx = mockDatabaseStore.findIndex((s) => s.id === item.id);
          if (idx !== -1) {
            mockDatabaseStore[idx] = item;
          } else {
            mockDatabaseStore.push(item);
          }
        }),
        delete: vi.fn().mockImplementation(async (id) => {
          mockDatabaseStore = mockDatabaseStore.filter((s) => s.id !== id);
        }),
      },
    },
  };
});

describe('useSpiritCollection Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('aqua-vitaeum-seeded', 'true');
    mockDatabaseStore = [...MOCK_SPIRITS];
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('initializes with mock spirits dataset and sets activeSpirit to first spirit', async () => {
    const { result } = renderHook(() => useSpiritCollection('default-compendium'));

    // Wait for effect to load spirits
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const sortedSpirits = [...MOCK_SPIRITS].sort((a, b) => b.dateTasted.localeCompare(a.dateTasted));

    expect(result.current.spirits.length).toBe(MOCK_SPIRITS.length);
    expect(result.current.selectedId).toBe(sortedSpirits[0].id);
    expect(result.current.activeSpirit.id).toBe(sortedSpirits[0].id);
  });

  it('selects a spirit by id correctly', async () => {
    const { result } = renderHook(() => useSpiritCollection('default-compendium'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const targetId = MOCK_SPIRITS[1].id;

    act(() => {
      result.current.selectSpirit(targetId);
    });

    expect(result.current.selectedId).toBe(targetId);
    expect(result.current.activeSpirit.id).toBe(targetId);
  });

  it('creates a new blank spirit note', async () => {
    const { result } = renderHook(() => useSpiritCollection('default-compendium'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const initialLength = result.current.spirits.length;

    await act(async () => {
      await result.current.handleNewNote();
    });

    expect(result.current.spirits.length).toBe(initialLength + 1);
    expect(result.current.selectedId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('saves an updated spirit note', async () => {
    const { result } = renderHook(() => useSpiritCollection('default-compendium'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const updatedSpirit = { ...MOCK_SPIRITS[0], name: 'Updated Laphroaig Name' };

    await act(async () => {
      await result.current.handleSave(updatedSpirit);
    });

    expect(result.current.activeSpirit.name).toBe('Updated Laphroaig Name');
  });

  it('deletes a spirit note and auto-selects remaining spirit', async () => {
    const { result } = renderHook(() => useSpiritCollection('default-compendium'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const sortedSpirits = [...MOCK_SPIRITS].sort((a, b) => b.dateTasted.localeCompare(a.dateTasted));
    const idToDelete = sortedSpirits[0].id;
    const nextExpectedId = sortedSpirits[1].id;

    await act(async () => {
      await result.current.handleDelete(idToDelete);
    });

    expect(result.current.spirits.some((s) => s.id === idToDelete)).toBe(false);
    expect(result.current.selectedId).toBe(nextExpectedId);
  });

  it('deletes the last spirit note and sets selectedId to null', async () => {
    mockDatabaseStore = [MOCK_SPIRITS[0]];
    const { result } = renderHook(() => useSpiritCollection('default-compendium'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    await act(async () => {
      await result.current.handleDelete(MOCK_SPIRITS[0].id);
    });

    expect(result.current.spirits.length).toBe(0);
    expect(result.current.selectedId).toBeNull();
  });

  it('filters spirits by search query including German translated attributes (e.g. Ölig, Bernstein, Torf)', async () => {
    const { result } = renderHook(() => useSpiritCollection('default-compendium'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

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
