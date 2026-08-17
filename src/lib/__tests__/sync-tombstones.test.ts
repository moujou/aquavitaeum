import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTombstones,
  recordTombstone,
  isTombstoned,
  removeTombstone,
  mergeRemoteTombstones,
  TOMBSTONES_STORAGE_KEY,
} from '@/lib/sync-tombstones';

describe('sync-tombstones', () => {
  beforeEach(() => {
    localStorage.removeItem(TOMBSTONES_STORAGE_KEY);
  });

  it('records and detects a tombstone', () => {
    expect(isTombstoned('spirit-123')).toBe(false);

    recordTombstone('spirit-123', 'spirit');
    expect(isTombstoned('spirit-123')).toBe(true);

    const all = getTombstones();
    expect(all['spirit-123']).toBeDefined();
    expect(all['spirit-123']?.type).toBe('spirit');
  });

  it('correctly compares tombstone deletedAt with entity updatedAt', () => {
    recordTombstone('spirit-abc', 'spirit');
    const record = getTombstones()['spirit-abc'];
    expect(record).toBeDefined();

    // Entity updated BEFORE deletion -> tombstoned is true (should delete entity)
    const olderTime = new Date(new Date(record!.deletedAt).getTime() - 5000).toISOString();
    expect(isTombstoned('spirit-abc', olderTime)).toBe(true);

    // Entity updated AFTER deletion (on another device) -> tombstoned is false (update wins)
    const newerTime = new Date(new Date(record!.deletedAt).getTime() + 5000).toISOString();
    expect(isTombstoned('spirit-abc', newerTime)).toBe(false);
  });

  it('removes a tombstone on re-creation', () => {
    recordTombstone('journal-456', 'journal');
    expect(isTombstoned('journal-456')).toBe(true);

    removeTombstone('journal-456');
    expect(isTombstoned('journal-456')).toBe(false);
  });

  it('merges remote tombstones from Google Drive manifest', () => {
    mergeRemoteTombstones({
      'remote-spirit-1': { type: 'spirit', deletedAt: '2026-08-16T12:00:00.000Z' },
      'remote-journal-2': { type: 'journal', deletedAt: '2026-08-16T13:00:00.000Z' },
    });

    expect(isTombstoned('remote-spirit-1')).toBe(true);
    expect(isTombstoned('remote-journal-2')).toBe(true);
  });

  it('automatically prunes tombstones older than 60 days', () => {
    const now = Date.now();
    const seventyDaysAgo = new Date(now - 70 * 24 * 60 * 60 * 1000).toISOString();
    const tenDaysAgo = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();

    mergeRemoteTombstones({
      'ancient-spirit': { type: 'spirit', deletedAt: seventyDaysAgo },
      'recent-spirit': { type: 'spirit', deletedAt: tenDaysAgo },
    });

    const tombstones = getTombstones();
    expect(tombstones['ancient-spirit']).toBeUndefined();
    expect(tombstones['recent-spirit']).toBeDefined();
    expect(isTombstoned('ancient-spirit')).toBe(false);
    expect(isTombstoned('recent-spirit')).toBe(true);
  });
});
