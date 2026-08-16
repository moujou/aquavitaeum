import { describe, it, expect, vi } from 'vitest';
import {
  sanitizeFileName,
  isValidSpiritData,
  parseSingleSpiritFile,
  importJournalFile,
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

    it('rejects completely invalid journal files', async () => {
      const invalidFile = createMockFile('{"something": "wrong"}', 'Invalid.json');
      await expect(importJournalFile(invalidFile)).rejects.toThrow();
    });
  });
});
