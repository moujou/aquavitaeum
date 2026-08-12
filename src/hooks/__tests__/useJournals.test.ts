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

  // ── New branch coverage tests ───────────────────────────────────────────────

  it('falls back to "New Journal" when name is an empty string', async () => {
    const { result } = renderHook(() => useJournals());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    let created: Journal | undefined;
    await act(async () => {
      created = await result.current.createJournal('   '); // only whitespace
    });

    expect(created?.name).toBe('New Journal');
    expect(mockJournalsStore.some((j) => j.name === 'New Journal')).toBe(true);
  });

  it('creates a journal with a coverImage and persists it on the record', async () => {
    const { result } = renderHook(() => useJournals());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    const COVER = 'data:image/jpeg;base64,MOCK';
    let created: Journal | undefined;
    await act(async () => {
      created = await result.current.createJournal('Islay Collection', 'Peat monsters', COVER);
    });

    expect(created?.coverImage).toBe(COVER);
    const stored = mockJournalsStore.find((j) => j.name === 'Islay Collection');
    expect(stored?.coverImage).toBe(COVER);
  });

  it('renames a journal and persists the new coverImage via spread conditional', async () => {
    const { result } = renderHook(() => useJournals());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    const COVER = 'data:image/jpeg;base64,COVER_UPDATE';
    await act(async () => {
      await result.current.renameJournal('journal-1', 'Peated Malts v2', 'Updated desc', COVER);
    });

    const updated = mockJournalsStore.find((j) => j.id === 'journal-1');
    expect(updated?.name).toBe('Peated Malts v2');
    expect(updated?.coverImage).toBe(COVER);
  });

  it('renames a journal without passing description — description stays undefined (else branch)', async () => {
    const { result } = renderHook(() => useJournals());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    await act(async () => {
      // newDescription is undefined — should hit the undefined branch (no trimming)
      await result.current.renameJournal('journal-1', 'No Desc Update');
    });

    const updated = mockJournalsStore.find((j) => j.id === 'journal-1');
    expect(updated?.name).toBe('No Desc Update');
    // description should remain undefined (the else branch returns undefined)
    expect(updated?.description).toBeUndefined();
  });

  it('re-throws and logs error when createJournal DB call fails', async () => {
    const { result } = renderHook(() => useJournals());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    const { db } = await import('@/lib/db');
    vi.mocked(db.journals.add).mockRejectedValueOnce(new Error('DB write error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      act(async () => { await result.current.createJournal('Fail Journal'); })
    ).rejects.toThrow('DB write error');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to create journal'),
      expect.any(Error),
    );
  });

  it('re-throws and logs error when renameJournal DB call fails', async () => {
    const { result } = renderHook(() => useJournals());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    const { db } = await import('@/lib/db');
    vi.mocked(db.journals.update).mockRejectedValueOnce(new Error('DB update error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      act(async () => { await result.current.renameJournal('journal-1', 'Will Fail'); })
    ).rejects.toThrow('DB update error');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to rename journal'),
      expect.any(Error),
    );
  });

  it('re-throws and logs error when deleteJournal DB call fails', async () => {
    const { result } = renderHook(() => useJournals());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    const { db } = await import('@/lib/db');
    vi.mocked(db.journals.delete).mockRejectedValueOnce(new Error('DB delete error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      act(async () => { await result.current.deleteJournal('journal-1'); })
    ).rejects.toThrow('DB delete error');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to delete journal'),
      expect.any(Error),
    );
  });

  it('sorts two non-default journals by createdAt descending (newest first)', async () => {
    // Replace store with two non-default journals only, to test sort logic
    mockJournalsStore = [
      {
        id: 'journal-older',
        name: 'Older Journal',
        createdAt: '2026-06-01T00:00:00Z',
        updatedAt: '2026-06-01T00:00:00Z',
      },
      {
        id: 'journal-newer',
        name: 'Newer Journal',
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
      },
    ];

    const { result } = renderHook(() => useJournals());
    await act(async () => { await new Promise((r) => setTimeout(r, 10)); });

    expect(result.current.journals[0].id).toBe('journal-newer');
    expect(result.current.journals[1].id).toBe('journal-older');
  });
});

