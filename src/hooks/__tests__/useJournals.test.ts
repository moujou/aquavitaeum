/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useJournals } from '../useJournals';
import { Journal, Spirit, FlavorProfile } from '@/types/spirit.types';

let mockJournalsStore: Journal[] = [];
let mockSpiritsStore: Spirit[] = [];

vi.mock('@/lib/db', () => {
  return {
    db: {
      journals: {
        toArray: vi.fn().mockImplementation(async () => mockJournalsStore),
        add: vi.fn().mockImplementation(async (j) => {
          mockJournalsStore.push(j);
        }),
        update: vi.fn().mockImplementation(async (id, changes) => {
          const idx = mockJournalsStore.findIndex((j) => j.id === id);
          if (idx !== -1) {
            mockJournalsStore[idx] = { ...mockJournalsStore[idx], ...changes };
          }
        }),
        delete: vi.fn().mockImplementation(async (id) => {
          mockJournalsStore = mockJournalsStore.filter((j) => j.id !== id);
        }),
      },
      spirits: {
        where: vi.fn().mockImplementation((field) => {
          return {
            equals: vi.fn().mockImplementation((value) => {
              return {
                toArray: vi.fn().mockImplementation(async () => {
                  return mockSpiritsStore.filter((s) => (s as any)[field] === value);
                }),
                delete: vi.fn().mockImplementation(async () => {
                  mockSpiritsStore = mockSpiritsStore.filter((s) => (s as any)[field] !== value);
                }),
              };
            }),
          };
        }),
      },
    },
  };
});

describe('useJournals Hook', () => {
  beforeEach(() => {
    mockJournalsStore = [
      {
        id: 'default-compendium',
        name: 'My Journal',
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
      },
      {
        id: 'journal-1',
        name: 'Summer Whiskys',
        createdAt: '2026-08-05T00:00:00Z',
        updatedAt: '2026-08-05T00:00:00Z',
      },
    ];

    mockSpiritsStore = [
      {
        id: 'spirit-1',
        journalId: 'default-compendium',
        spiritType: 'Single Malt Scotch',
        distillery: 'Laphroaig',
        name: '10',
        region: 'Islay',
        abv: 40,
        dateTasted: '2026-08-02',
        rating100: 90,
        starRating: 4.5,
        colour: 'Gold',
        finishNotes: '',
        flavorTags: [],
        noseProfile: {} as FlavorProfile,
        tasteProfile: {} as FlavorProfile,
      },
      {
        id: 'spirit-2',
        journalId: 'default-compendium',
        spiritType: 'Bourbon',
        distillery: 'Makers',
        name: 'Mark',
        region: 'Kentucky',
        abv: 45,
        dateTasted: '2026-08-03',
        rating100: 80,
        starRating: 4.0,
        colour: 'Copper',
        finishNotes: '',
        flavorTags: [],
        noseProfile: {} as FlavorProfile,
        tasteProfile: {} as FlavorProfile,
      },
    ];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads journals and computes correct statistics', async () => {
    const { result } = renderHook(() => useJournals());

    // Wait for async load to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current.journals.length).toBe(2);

    // Default Compendium stats
    const defaultComp = result.current.journals.find((j) => j.id === 'default-compendium');
    expect(defaultComp).toBeDefined();
    expect(defaultComp?.bottleCount).toBe(2);
    expect(defaultComp?.averageRating).toBe(85); // (90 + 80) / 2 = 85
    expect(defaultComp?.latestTastedDate).toBe('2026-08-03');

    // Summer Whiskys stats (empty)
    const summerWhiskys = result.current.journals.find((j) => j.id === 'journal-1');
    expect(summerWhiskys).toBeDefined();
    expect(summerWhiskys?.bottleCount).toBe(0);
    expect(summerWhiskys?.averageRating).toBe(0);
    expect(summerWhiskys?.latestTastedDate).toBeNull();
  });

  it('creates a new journal successfully', async () => {
    const { result } = renderHook(() => useJournals());

    // Wait for async load to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    let newJournal: Journal | undefined;
    await act(async () => {
      newJournal = await result.current.createJournal('Gin Collection');
    });

    expect(newJournal).toBeDefined();
    expect(newJournal?.name).toBe('Gin Collection');
    expect(mockJournalsStore.some((j) => j.name === 'Gin Collection')).toBe(true);
    expect(result.current.journals.length).toBe(3);
  });

  it('renames and updates a journal successfully', async () => {
    const { result } = renderHook(() => useJournals());

    // Wait for async load to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    await act(async () => {
      await result.current.renameJournal('journal-1', 'Peated Malts', 'High-peat single malts');
    });

    const updated = mockJournalsStore.find((j) => j.id === 'journal-1');
    expect(updated?.name).toBe('Peated Malts');
    expect(updated?.description).toBe('High-peat single malts');
  });

  it('deletes a journal and cascade deletes its spirits', async () => {
    const { result } = renderHook(() => useJournals());

    // Wait for async load to finish
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    await act(async () => {
      await result.current.deleteJournal('default-compendium');
    });

    // Journal metadata is gone
    expect(mockJournalsStore.some((j) => j.id === 'default-compendium')).toBe(false);
    // Spirits in default-compendium are cascade deleted
    expect(mockSpiritsStore.length).toBe(0);
    expect(result.current.journals.length).toBe(1);
  });
});
