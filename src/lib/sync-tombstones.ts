export type TombstoneType = 'spirit' | 'journal';

export interface TombstoneRecord {
  id: string;
  type: TombstoneType;
  deletedAt: string; // ISO 8601 string
}

export const TOMBSTONES_STORAGE_KEY = 'aqua-vitaeum-tombstones';
export const MAX_TOMBSTONE_AGE_DAYS = 60;

/**
 * Prunes tombstones older than MAX_TOMBSTONE_AGE_DAYS (60 days)
 */
export function pruneTombstones(records: Record<string, TombstoneRecord>, maxAgeDays = MAX_TOMBSTONE_AGE_DAYS): Record<string, TombstoneRecord> {
  const now = Date.now();
  const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
  const pruned: Record<string, TombstoneRecord> = {};

  for (const [id, record] of Object.entries(records)) {
    const recordTime = new Date(record.deletedAt).getTime();
    if (!isNaN(recordTime) && now - recordTime < maxAgeMs) {
      pruned[id] = record;
    }
  }
  return pruned;
}

/**
 * Retrieves all stored local tombstones (automatically pruned)
 */
export function getTombstones(): Record<string, TombstoneRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TOMBSTONES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, TombstoneRecord>;
    return pruneTombstones(parsed);
  } catch (err) {
    console.warn('[Aqua Vitaeum] Failed to parse tombstones:', err);
    return {};
  }
}

/**
 * Saves tombstones back to localStorage, automatically pruning old ones
 */
export function saveTombstones(records: Record<string, TombstoneRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    const pruned = pruneTombstones(records);
    localStorage.setItem(TOMBSTONES_STORAGE_KEY, JSON.stringify(pruned));
  } catch (err) {
    console.warn('[Aqua Vitaeum] Failed to save tombstones:', err);
  }
}

/**
 * Records a deletion of a spirit or journal with an ISO timestamp
 */
export function recordTombstone(id: string, type: TombstoneType): void {
  const current = getTombstones();
  current[id] = {
    id,
    type,
    deletedAt: new Date().toISOString(),
  };
  saveTombstones(current);
}

/**
 * Checks whether an entity is tombstoned (deleted).
 * If `entityUpdatedAt` is provided, returns true only if the deletion happened
 * at or AFTER the entity was last updated.
 */
export function isTombstoned(id: string, entityUpdatedAt?: string): boolean {
  const current = getTombstones();
  const record = current[id];
  if (!record) return false;

  if (!entityUpdatedAt) return true;

  const deletedTime = new Date(record.deletedAt).getTime();
  const updatedTime = new Date(entityUpdatedAt).getTime();

  if (isNaN(deletedTime) || isNaN(updatedTime)) return true;

  return deletedTime >= updatedTime;
}

/**
 * Removes a tombstone (e.g. if an entity was explicitly re-created or synced)
 */
export function removeTombstone(id: string): void {
  const current = getTombstones();
  if (current[id]) {
    delete current[id];
    saveTombstones(current);
  }
}

/**
 * Merges a remote deletions map (from `_deletions.json` in Google Drive) into local storage
 */
export function mergeRemoteTombstones(
  remoteDeletions: Record<string, { type?: TombstoneType; deletedAt: string }>
): void {
  const current = getTombstones();
  let changed = false;

  for (const [id, remote] of Object.entries(remoteDeletions)) {
    const local = current[id];
    if (!local || new Date(remote.deletedAt).getTime() > new Date(local.deletedAt).getTime()) {
      current[id] = {
        id,
        type: remote.type || 'spirit',
        deletedAt: remote.deletedAt,
      };
      changed = true;
    }
  }

  if (changed) {
    saveTombstones(current);
  }
}
