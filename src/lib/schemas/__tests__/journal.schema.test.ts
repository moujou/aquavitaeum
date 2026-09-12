import { describe, it, expect } from 'vitest';
import { validateJournal, isValidJournalData } from '../journal.schema';

describe('Journal Schema Validation', () => {
  it('rejects non-object inputs', () => {
    expect(validateJournal(null).valid).toBe(false);
    expect(validateJournal(undefined).valid).toBe(false);
    expect(validateJournal('string').valid).toBe(false);
    expect(validateJournal(123).valid).toBe(false);
    expect(validateJournal([]).valid).toBe(false);
  });

  it('validates required id', () => {
    expect(validateJournal({ name: 'Valid' }).valid).toBe(false);
    expect(validateJournal({ id: '', name: 'Valid' }).valid).toBe(false);
    expect(validateJournal({ id: '   ', name: 'Valid' }).valid).toBe(false);
    expect(validateJournal({ id: 'a'.repeat(151), name: 'Valid' }).valid).toBe(false);
  });

  it('validates required name', () => {
    expect(validateJournal({ id: 'j-1' }).valid).toBe(false);
    expect(validateJournal({ id: 'j-1', name: '' }).valid).toBe(false);
    expect(validateJournal({ id: 'j-1', name: '   ' }).valid).toBe(false);
    expect(validateJournal({ id: 'j-1', name: 'a'.repeat(151) }).valid).toBe(false);
  });

  it('validates optional description constraints', () => {
    // Valid description
    expect(validateJournal({ id: 'j-1', name: 'Valid', description: 'Some note' }).valid).toBe(true);
    // Invalid type
    expect(validateJournal({ id: 'j-1', name: 'Valid', description: 123 as unknown as string }).valid).toBe(false);
    // Too long
    expect(validateJournal({ id: 'j-1', name: 'Valid', description: 'a'.repeat(1001) }).valid).toBe(false);
  });

  it('validates optional coverImage constraints', () => {
    expect(validateJournal({ id: 'j-1', name: 'Valid', coverImage: 'data:image/jpeg;base64,...' }).valid).toBe(true);
    expect(validateJournal({ id: 'j-1', name: 'Valid', coverImage: 12345 as unknown as string }).valid).toBe(false);
  });

  it('validates optional createdAt and updatedAt date strings', () => {
    expect(validateJournal({ id: 'j-1', name: 'Valid', createdAt: '2026-01-01T00:00:00Z' }).valid).toBe(true);
    expect(validateJournal({ id: 'j-1', name: 'Valid', createdAt: 123 as unknown as string }).valid).toBe(false);

    expect(validateJournal({ id: 'j-1', name: 'Valid', updatedAt: '2026-01-01T00:00:00Z' }).valid).toBe(true);
    expect(validateJournal({ id: 'j-1', name: 'Valid', updatedAt: true as unknown as string }).valid).toBe(false);
  });

  it('validates complete valid journal record with isValidJournalData type-guard', () => {
    const validJournal = {
      id: 'journal-uuid-1',
      name: 'Highland Whiskies',
      description: 'Single malts from Northern Scotland',
      coverImage: 'data:image/jpeg;base64,mock',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    };

    const res = validateJournal(validJournal);
    expect(res.valid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);

    expect(isValidJournalData(validJournal)).toBe(true);
    expect(isValidJournalData({ id: '' })).toBe(false);
  });
});
