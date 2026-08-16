/**
 * Global custom event dispatched whenever tasting notes or journals are created, modified, or deleted.
 * Used by useGoogleDriveSync to trigger a debounced background sync to Google Drive.
 */
export const DATA_CHANGED_EVENT = 'aqua-vitaeum-data-changed';

export function notifyDataChanged(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT));
  }
}
