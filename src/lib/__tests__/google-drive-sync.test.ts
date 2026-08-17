import { describe, it, expect, vi } from 'vitest';
import {
  sanitizeFileName,
  getDriveSpiritFileName,
  isValidSpiritData,
  parseSingleSpiritFile,
  importJournalFile,
  importSpiritsIntoJournal,
  GOOGLE_DRIVE_ROOT_FOLDER,
  JOURNAL_METADATA_FILE,
} from '../google-drive-sync';
import { Spirit } from '@/types/spirit.types';

// Mock IndexedDB Dexie db
vi.mock('@/lib/db', () => ({
  db: {
    journals: {
      put: vi.fn().mockResolvedValue('j-test-1'),
      where: vi.fn().mockReturnValue({
        anyOf: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
    spirits: {
      put: vi.fn().mockResolvedValue('s-test-1'),
      where: vi.fn().mockReturnValue({
        anyOf: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
    },
  },
}));

describe('Google Drive Sync Engine & Rogue-File Guards', () => {
  it('has standard constants defined', () => {
    expect(GOOGLE_DRIVE_ROOT_FOLDER).toBe('Aqua Vitaeum');
    expect(JOURNAL_METADATA_FILE).toBe('_journal.json');
  });

  describe('getDriveSpiritFileName', () => {
    it('constructs canonical spirit_<UUID>.json filenames', () => {
      expect(getDriveSpiritFileName('550e8400-e29b-41d4-a716-446655440000')).toBe(
        'spirit_550e8400-e29b-41d4-a716-446655440000.json'
      );
      expect(getDriveSpiritFileName('abc-123')).toBe('spirit_abc-123.json');
    });
  });

  describe('sanitizeFileName', () => {
    it('strips illegal filesystem and path characters', () => {
      expect(sanitizeFileName('Ardbeg 10: Special Edition/Cask#1?')).toBe('Ardbeg 10_ Special Edition_Cask#1_');
      expect(sanitizeFileName('Glenfiddich <12> *Superb* | Oak')).toBe('Glenfiddich _12_ _Superb_ _ Oak');
    });

    it('handles empty or whitespace strings gracefully', () => {
      expect(sanitizeFileName('')).toBe('Untitled');
      expect(sanitizeFileName('   ')).toBe('Untitled');
    });
  });

  describe('isValidSpiritData (Rogue File & Schema Protection)', () => {
    it('accepts a fully valid Spirit record', () => {
      const validSpirit: Spirit = {
        id: 'spirit-123',
        journalId: 'journal-default',
        spiritType: 'Single Malt Scotch',
        name: 'Lagavulin 16',
        distillery: 'Lagavulin',
        region: 'Islay',
        abv: 43,
        dateTasted: '2026-08-16',
        rating100: 92,
        starRating: 5,
        colour: 'Amber',
        finishNotes: 'Classic maritime peat.',
        flavorTags: ['Peat Smoke', 'Sea Salt'],
        noseProfile: {
          fruity: 4,
          floral: 2,
          spicy: 5,
          cereal: 3,
          peaty: 9,
          sulphury: 1,
          feinty: 3,
          nutty: 4,
          woody: 6,
          winey: 3,
          chocolate: 2,
        },
        tasteProfile: {
          fruity: 3,
          floral: 1,
          spicy: 6,
          cereal: 3,
          peaty: 10,
          sulphury: 1,
          feinty: 4,
          nutty: 5,
          woody: 7,
          winey: 2,
          chocolate: 3,
        },
        createdAt: '2026-08-16T00:00:00.000Z',
        updatedAt: '2026-08-16T00:00:00.000Z',
      };

      expect(isValidSpiritData(validSpirit)).toBe(true);
    });

    it('accepts a blank/in-progress Spirit record with empty name', () => {
      const blankSpirit: Spirit = {
        id: 'spirit-blank-123',
        journalId: 'journal-default',
        spiritType: 'Single Malt Scotch',
        name: '',
        distillery: '',
        region: '',
        abv: 0,
        dateTasted: '',
        rating100: 0,
        starRating: 0,
        colour: 'Clear',
        finishNotes: '',
        flavorTags: [],
        noseProfile: { fruity: 0, floral: 0, spicy: 0, cereal: 0, peaty: 0, sulphury: 0, feinty: 0, nutty: 0, woody: 0, winey: 0, chocolate: 0 },
        tasteProfile: { fruity: 0, floral: 0, spicy: 0, cereal: 0, peaty: 0, sulphury: 0, feinty: 0, nutty: 0, woody: 0, winey: 0, chocolate: 0 },
        createdAt: '2026-08-16T00:00:00.000Z',
        updatedAt: '2026-08-16T00:00:00.000Z',
      };

      expect(isValidSpiritData(blankSpirit)).toBe(true);
    });

    it('rejects rogue foreign files or non-objects', () => {
      expect(isValidSpiritData(null)).toBe(false);
      expect(isValidSpiritData(undefined)).toBe(false);
      expect(isValidSpiritData('random text from a txt file')).toBe(false);
      expect(isValidSpiritData(12345)).toBe(false);
      expect(isValidSpiritData([])).toBe(false);
    });

    it('rejects corrupt or incomplete JSON objects', () => {
      // Missing spiritType
      expect(isValidSpiritData({ id: '1', name: 'Whisky without type' })).toBe(false);

      // Missing name
      expect(isValidSpiritData({ id: '2', spiritType: 'Single Malt Scotch' })).toBe(false);

      // Invalid spirit type
      expect(isValidSpiritData({ id: '3', name: 'Vodka', spiritType: 'AlienLiquid' })).toBe(false);

      // Invalid ABV percentage (>100)
      expect(isValidSpiritData({
        id: '4',
        name: 'Rocket Fuel',
        spiritType: 'Single Malt Scotch',
        abv: 150,
      })).toBe(false);
    });
  });

  function createMockFile(content: string, name: string): File {
    const file = new File([content], name, { type: 'application/json' });
    file.text = async () => content;
    return file;
  }

  describe('parseSingleSpiritFile', () => {
    it('successfully parses and validates a single spirit file', async () => {
      const validSpirit = {
        id: 'spirit-abc',
        journalId: 'journal-123',
        spiritType: 'Bourbon',
        name: 'Woodford Reserve',
        distillery: 'Woodford',
        region: 'Kentucky',
        abv: 45.2,
        dateTasted: '2026-08-16',
        rating100: 88,
        starRating: 4,
        colour: 'Honey',
        finishNotes: 'Rich vanilla caramel finish.',
        flavorTags: ['Vanilla & Honey'],
        noseProfile: { fruity: 2, floral: 1, spicy: 4, cereal: 2, peaty: 0, sulphury: 0, feinty: 1, nutty: 3, woody: 5, winey: 1, chocolate: 2 },
        tasteProfile: { fruity: 2, floral: 0, spicy: 5, cereal: 2, peaty: 0, sulphury: 0, feinty: 1, nutty: 4, woody: 6, winey: 1, chocolate: 3 },
      };

      const file = createMockFile(JSON.stringify(validSpirit), 'Woodford.json');
      const parsed = await parseSingleSpiritFile(file);
      expect(parsed.name).toBe('Woodford Reserve');
      expect(parsed.spiritType).toBe('Bourbon');
    });

    it('throws on invalid or corrupt files', async () => {
      const badFile = createMockFile('not a json string', 'Corrupt.json');
      await expect(parseSingleSpiritFile(badFile)).rejects.toThrow();
    });
  });

  describe('importJournalFile', () => {
    it('successfully parses and imports journals and spirits', async () => {
      const validPayload = {
        version: '1.0',
        exportedAt: '2026-08-16T00:00:00.000Z',
        type: 'journal-export',
        journals: [
          { id: 'j-test-1', name: 'Islay Malts', description: 'Torfige Whiskys' }
        ],
        spirits: [
          {
            id: 's-test-1',
            journalId: 'j-test-1',
            spiritType: 'Single Malt Scotch',
            name: 'Laphroaig 10',
            distillery: 'Laphroaig',
            region: 'Islay',
            abv: 40,
            dateTasted: '2026-08-16',
            rating100: 90,
            starRating: 5,
            colour: 'Straw',
            finishNotes: 'Long smoky finish',
            flavorTags: ['Peat Smoke'],
            noseProfile: { fruity: 1, floral: 0, spicy: 3, cereal: 1, peaty: 10, sulphury: 0, feinty: 3, nutty: 2, woody: 4, winey: 0, chocolate: 1 },
            tasteProfile: { fruity: 1, floral: 0, spicy: 4, cereal: 1, peaty: 10, sulphury: 0, feinty: 3, nutty: 2, woody: 5, winey: 0, chocolate: 1 },
          }
        ]
      };

      const file = createMockFile(JSON.stringify(validPayload), 'Journal - Islay Malts.json');
      const result = await importJournalFile(file);
      expect(result.journalCount).toBe(1);
      expect(result.spiritCount).toBe(1);
    });

    it('successfully parses and imports spirits-only export payloads', async () => {
      const spiritsPayload = {
        version: '1.0',
        exportedAt: '2026-08-16T00:00:00.000Z',
        type: 'spirits-export',
        journalName: 'Islay Malts',
        spirits: [
          {
            id: 's-test-2',
            journalId: 'j-test-1',
            spiritType: 'Single Malt Scotch',
            name: 'Bowmore 15',
            distillery: 'Bowmore',
            region: 'Islay',
            abv: 43,
            dateTasted: '2026-08-16',
            rating100: 88,
            starRating: 4,
            colour: 'Amber',
            flavorTags: ['Dark Chocolate'],
            noseProfile: { fruity: 2, floral: 0, spicy: 2, cereal: 1, peaty: 6, sulphury: 0, feinty: 1, nutty: 3, woody: 4, winey: 5, chocolate: 6 },
            tasteProfile: { fruity: 2, floral: 0, spicy: 3, cereal: 1, peaty: 5, sulphury: 0, feinty: 1, nutty: 3, woody: 5, winey: 6, chocolate: 7 },
          },
        ],
      };

      const file = createMockFile(JSON.stringify(spiritsPayload), 'Notes - Islay Malts-1-2026-08-16.json');
      const result = await importJournalFile(file);
      expect(result.journalCount).toBe(0);
      expect(result.spiritCount).toBe(1);
    });

    it('rejects completely invalid journal files', async () => {
      const invalidFile = createMockFile('{"something": "wrong"}', 'Invalid.json');
      await expect(importJournalFile(invalidFile)).rejects.toThrow();
    });
  });

  describe('importSpiritsIntoJournal', () => {
    it('imports single spirit note assigning target journalId and new UUID v4', async () => {
      const singleSpirit = {
        id: 'old-uuid-from-friend',
        journalId: 'friends-journal',
        spiritType: 'Single Malt Scotch',
        name: 'Ardbeg Corryvreckan',
        distillery: 'Ardbeg',
        region: 'Islay',
        abv: 57.1,
        dateTasted: '2026-08-16',
        rating100: 94,
        starRating: 5,
        colour: 'Amber',
        finishNotes: 'Intense peppery finish.',
        flavorTags: ['Sea Salt', 'Black Pepper'],
        noseProfile: { fruity: 2, floral: 0, spicy: 6, cereal: 2, peaty: 10, sulphury: 0, feinty: 4, nutty: 3, woody: 5, winey: 2, chocolate: 4 },
        tasteProfile: { fruity: 2, floral: 0, spicy: 7, cereal: 2, peaty: 10, sulphury: 0, feinty: 4, nutty: 3, woody: 6, winey: 2, chocolate: 4 },
      };

      const file = createMockFile(JSON.stringify(singleSpirit), 'Ardbeg - Corryvreckan.json');
      const result = await importSpiritsIntoJournal(file, 'my-target-journal-123');

      expect(result.importedCount).toBe(1);
    });

    it('imports multi-spirit export payload assigning target journalId', async () => {
      const multiPayload = {
        version: '1.0',
        exportedAt: '2026-08-16T00:00:00.000Z',
        type: 'spirits-export',
        journalName: 'Islay Malts',
        spirits: [
          {
            id: 'old-id-1',
            journalId: 'old-journal',
            spiritType: 'Single Malt Scotch',
            name: 'Talisker 10',
            distillery: 'Talisker',
            region: 'Islands',
            abv: 45.8,
            dateTasted: '2026-08-16',
            rating100: 89,
            starRating: 4.5,
            colour: 'Gold',
            finishNotes: 'Smoky pepper finish',
            flavorTags: ['Maritime'],
            noseProfile: { fruity: 3, floral: 1, spicy: 5, cereal: 2, peaty: 7, sulphury: 0, feinty: 2, nutty: 2, woody: 4, winey: 1, chocolate: 1 },
            tasteProfile: { fruity: 3, floral: 1, spicy: 6, cereal: 2, peaty: 8, sulphury: 0, feinty: 2, nutty: 2, woody: 5, winey: 1, chocolate: 1 },
          },
          {
            id: 'old-id-2',
            journalId: 'old-journal',
            spiritType: 'Single Malt Scotch',
            name: 'Highland Park 12',
            distillery: 'Highland Park',
            region: 'Islands',
            abv: 40,
            dateTasted: '2026-08-16',
            rating100: 86,
            starRating: 4,
            colour: 'Gold',
            finishNotes: 'Heather honey smoke',
            flavorTags: ['Honey', 'Heather Smoke'],
            noseProfile: { fruity: 4, floral: 3, spicy: 3, cereal: 3, peaty: 4, sulphury: 0, feinty: 2, nutty: 3, woody: 4, winey: 2, chocolate: 2 },
            tasteProfile: { fruity: 4, floral: 2, spicy: 3, cereal: 3, peaty: 4, sulphury: 0, feinty: 2, nutty: 3, woody: 4, winey: 2, chocolate: 2 },
          },
        ],
      };

      const file = createMockFile(JSON.stringify(multiPayload), 'Islay-Export.json');
      const result = await importSpiritsIntoJournal(file, 'my-target-journal-123');

      expect(result.importedCount).toBe(2);
    });

    it('rejects corrupt tasting note files', async () => {
      const corruptFile = createMockFile('not valid json at all', 'Corrupt.json');
      await expect(importSpiritsIntoJournal(corruptFile, 'target-journal')).rejects.toThrow();
    });
  });
});
