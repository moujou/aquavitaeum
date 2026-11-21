/**
 * Event Constants & Dispatchers for Aqua Vitaeum Real-Time Synchronization
 */

/** Fired when local user creates, modifies, or deletes a tasting note or journal */
export const DATA_MUTATED_EVENT = 'aqua-vitaeum-data-mutated';

/** Fired when Google Drive sync finishes pulling changes / deletions from the cloud */
export const REMOTE_SYNC_COMPLETED_EVENT = 'aqua-vitaeum-remote-sync-completed';

/** Notify that local user mutated data -> triggers debounced Google Drive upload */
export function notifyDataMutated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_MUTATED_EVENT));
  }
}

/** Notify that remote sync downloaded new data or deletions -> triggers UI refresh without upload loop */
export function notifyRemoteSyncCompleted(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(REMOTE_SYNC_COMPLETED_EVENT));
  }
}
