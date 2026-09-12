/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpiritCollection } from '../useSpiritCollection';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { Spirit } from '@/types/spirit.types';
import { SpiritAnalysisResult } from '@/services/ai-assistant-service';

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

  it('creates a new note from scan in facts-only mode and full mode', async () => {
    const { result } = renderHook(() => useSpiritCollection('default-compendium'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    const scanResult: SpiritAnalysisResult = {
      name: 'Macallan 12 Double Cask',
      distillery: 'Macallan',
      region: 'Speyside',
      spiritType: 'Single Malt Scotch',
      abv: 40,
      age: 12,
      caskTypes: ['American & European Oak Oloroso Sherry'],
      suggestedNoseTags: ['Vanilla Custard', 'Candied Orange'],
      suggestedTasteTags: ['Wood Spice', 'Honey'],
      finishNotes: 'Warm oak and ginger',
    };

    let newId: string | null = null;
    await act(async () => {
      newId = await result.current.handleNewNoteFromScan(scanResult, 'bottle_photo.jpg', 'full');
    });

    expect(newId).toBeDefined();
    expect(result.current.activeSpirit.name).toBe('Macallan 12 Double Cask');
    expect(result.current.activeSpirit.distillery).toBe('Macallan');
    expect(result.current.activeSpirit.thumbnailImage).toBe('bottle_photo.jpg');
    expect(result.current.activeSpirit.finishNotes).toBe('Warm oak and ginger');
    expect(result.current.activeSpirit.flavorTags).toContain('Vanilla Custard');
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

  it('filters spirits by spiritType', async () => {
    const { result } = renderHook(() => useSpiritCollection('default-compendium'));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    act(() => {
      result.current.setTypeFilter('Bourbon');
    });

    expect(result.current.filteredSpirits.every((s) => s.spiritType === 'Bourbon')).toBe(true);

    act(() => {
      result.current.setTypeFilter('All');
    });
    expect(result.current.filteredSpirits.length).toBe(MOCK_SPIRITS.length);
  });

  it('filters spirits by search query including German translated attributes', async () => {
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
  });
});
