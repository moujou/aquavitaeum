/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { Spirit, Journal } from '@/types/spirit.types';
import { validateSpirit, isValidSpiritData } from '@/lib/schemas/spirit.schema';
import { validateJournal, isValidJournalData } from '@/lib/schemas/journal.schema';
import { importLocalBackupFile, importJournalFile } from '@/lib/google-drive-sync';

let mockJournalsStore: Journal[] = [];
let mockSpiritsStore: Spirit[] = [];

vi.mock('@/lib/db', () => {
  return {
    db: {
      journals: {
        clear: vi.fn().mockImplementation(async () => {
          mockJournalsStore = [];
        }),
        toArray: vi.fn().mockImplementation(async () => mockJournalsStore),
        get: vi.fn().mockImplementation(async (id: string) => mockJournalsStore.find((j) => j.id === id)),
        put: vi.fn().mockImplementation(async (j: Journal) => {
          const idx = mockJournalsStore.findIndex((item) => item.id === j.id);
          if (idx !== -1) mockJournalsStore[idx] = j;
          else mockJournalsStore.push(j);
        }),
      },
      spirits: {
        clear: vi.fn().mockImplementation(async () => {
          mockSpiritsStore = [];
        }),
        toArray: vi.fn().mockImplementation(async () => mockSpiritsStore),
        get: vi.fn().mockImplementation(async (id: string) => mockSpiritsStore.find((s) => s.id === id)),
        put: vi.fn().mockImplementation(async (s: Spirit) => {
          const idx = mockSpiritsStore.findIndex((item) => item.id === s.id);
          if (idx !== -1) mockSpiritsStore[idx] = s;
          else mockSpiritsStore.push(s);
        }),
        where: vi.fn().mockImplementation((field) => {
          return {
            equals: vi.fn().mockImplementation((value) => {
              return {
                toArray: vi.fn().mockImplementation(async () => {
                  return mockSpiritsStore.filter((s) => (s as any)[field] === value);
                }),
              };
            }),
            anyOf: vi.fn().mockImplementation((values: string[]) => {
              return {
                toArray: vi.fn().mockImplementation(async () => {
                  return mockSpiritsStore.filter((s) => values.includes((s as any)[field]));
                }),
              };
            }),
          };
        }),
      },
    },
  };
});

describe('Tasting Card Attributes - Database & Import/Export Suite', () => {
  beforeEach(async () => {
    mockSpiritsStore = [];
    mockJournalsStore = [];
    await db.spirits.clear();
    await db.journals.clear();
  });

  const sampleSpiritWithNewAttributes: Spirit = {
    id: 'test-laphroaig-cs-10',
    journalId: 'default-compendium',
    distillery: 'Laphroaig',
    name: '10 Year Old Cask Strength Batch #015',
    spiritType: 'Single Malt Scotch',
    region: 'Islay, Schottland',
    age: 10,
    abv: 56.5,
    volumeMl: 700,
    isCaskStrength: true,
    addedColour: false,
    chillFiltered: false,
    addedWater: true,
    onTheRocks: false,
    withChocolate: true,
    finish: 'Oloroso Sherry Cask Finish',
    caskNo: 'Batch #015',
    price: 89.5,
    currency: '€',
    dateTasted: '2026-08-16',
    rating100: 92,
    starRating: 5,
    colour: 'Gold',
    glance: ['Oily', 'Creamy'],
    finishNotes: 'Intensiver Torfrauch mit maritimer Gischt und feiner Zitruszeste.',
    noseFlavorTags: ['Torfrauch', 'Zitruszeste'],
    tasteFlavorTags: ['Meersalz', 'Dunkle Schokolade'],
    flavorTags: ['Torfrauch', 'Zitruszeste', 'Meersalz', 'Dunkle Schokolade'],
    noseProfile: {
      fruity: 4,
      floral: 2,
      spicy: 6,
      cereal: 5,
      peaty: 9,
      sulphury: 2,
      feinty: 7,
      nutty: 3,
      woody: 5,
      winey: 6,
      chocolate: 7,
    },
    tasteProfile: {
      fruity: 3,
      floral: 1,
      spicy: 7,
      cereal: 4,
      peaty: 10,
      sulphury: 3,
      feinty: 8,
      nutty: 4,
      woody: 6,
      winey: 7,
      chocolate: 8,
    },
  };

  const sampleJournal: Journal = {
    id: 'default-compendium',
    name: 'Islay Whiskies Collection',
    description: 'Exclusive peated single malts from the Hebrides',
    coverImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-16T12:00:00.000Z',
  };

  it('validates a complete Spirit object with all new production, craft and price fields', () => {
    const result = validateSpirit(sampleSpiritWithNewAttributes);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(isValidSpiritData(sampleSpiritWithNewAttributes)).toBe(true);
  });

  it('validates a complete Journal object', () => {
    const result = validateJournal(sampleJournal);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
    expect(isValidJournalData(sampleJournal)).toBe(true);
  });

  it('correctly rejects corrupted boolean or numerical values', () => {
    const corruptedSpirit = {
      ...sampleSpiritWithNewAttributes,
      isCaskStrength: 'not-a-boolean' as unknown as boolean,
      volumeMl: -50,
      price: -10,
    };

    const result = validateSpirit(corruptedSpirit);
    expect(result.valid).toBe(false);
    expect(result.errors.isCaskStrength).toBeDefined();
    expect(result.errors.volumeMl).toBeDefined();
    expect(result.errors.price).toBeDefined();
  });

  it('correctly rejects corrupted radar profile dimensions', () => {
    const corruptedSpirit = {
      ...sampleSpiritWithNewAttributes,
      noseProfile: {
        ...sampleSpiritWithNewAttributes.noseProfile,
        peaty: 99, // exceeds 0-10 max
      },
    };

    const result = validateSpirit(corruptedSpirit);
    expect(result.valid).toBe(false);
    expect(result.errors.noseProfile).toBeDefined();
  });

  it('persists and recovers all new attributes losslessly through Dexie IndexedDB', async () => {
    await db.journals.put(sampleJournal);
    await db.spirits.put(sampleSpiritWithNewAttributes);

    const loadedSpirit = await db.spirits.get('test-laphroaig-cs-10');
    expect(loadedSpirit).toBeDefined();
    expect(loadedSpirit?.isCaskStrength).toBe(true);
    expect(loadedSpirit?.addedColour).toBe(false);
    expect(loadedSpirit?.chillFiltered).toBe(false);
    expect(loadedSpirit?.volumeMl).toBe(700);
    expect(loadedSpirit?.finish).toBe('Oloroso Sherry Cask Finish');
    expect(loadedSpirit?.caskNo).toBe('Batch #015');
    expect(loadedSpirit?.price).toBe(89.5);
    expect(loadedSpirit?.currency).toBe('€');
    expect(loadedSpirit?.noseFlavorTags).toEqual(['Torfrauch', 'Zitruszeste']);
    expect(loadedSpirit?.tasteFlavorTags).toEqual(['Meersalz', 'Dunkle Schokolade']);
  });

  it('imports full backup JSON files losslessly with all new fields preserved', async () => {
    const backupData = {
      version: 3,
      exportedAt: new Date().toISOString(),
      journals: [sampleJournal],
      spirits: [sampleSpiritWithNewAttributes],
    };

    const file = new File([JSON.stringify(backupData)], 'backup.json', { type: 'application/json' });
    const result = await importLocalBackupFile(file);

    expect(result.importedJournals).toBe(1);
    expect(result.importedSpirits).toBe(1);

    const importedSpirit = await db.spirits.get('test-laphroaig-cs-10');
    expect(importedSpirit?.isCaskStrength).toBe(true);
    expect(importedSpirit?.volumeMl).toBe(700);
    expect(importedSpirit?.finish).toBe('Oloroso Sherry Cask Finish');
  });

  it('imports single journal JSON files with all spirits validated', async () => {
    const journalExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      type: 'journal-export',
      journals: [sampleJournal],
      spirits: [sampleSpiritWithNewAttributes],
    };

    const file = new File([JSON.stringify(journalExport)], 'journal.json', { type: 'application/json' });
    const result = await importJournalFile(file);

    expect(result.journalCount).toBe(1);
    expect(result.spiritCount).toBe(1);

    const importedSpirit = await db.spirits.get('test-laphroaig-cs-10');
    expect(importedSpirit?.name).toBe('10 Year Old Cask Strength Batch #015');
    expect(importedSpirit?.abv).toBe(56.5);
  });
});
