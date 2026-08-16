import { db } from '@/lib/db';
import { Journal, Spirit } from '@/types/spirit.types';
import { isValidSpiritData } from '@/lib/schemas/spirit.schema';
import { isValidJournalData } from '@/lib/schemas/journal.schema';
import { notifyDataChanged } from '@/lib/sync-events';
import {
  getTombstones,
  isTombstoned,
  mergeRemoteTombstones,
} from '@/lib/sync-tombstones';

// ─── Constants & Types ────────────────────────────────────────────────────────

export const GOOGLE_DRIVE_ROOT_FOLDER = 'Aqua Vitaeum';
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const JOURNAL_METADATA_FILE = '_journal.json';
export const DELETIONS_MANIFEST_FILE = '_deletions.json';

export interface SyncStats {
  pushedSpirits: number;
  pulledSpirits: number;
  pushedJournals: number;
  pulledJournals: number;
  deletedRemotes: number;
  skippedInvalidFiles: number;
  lastSyncedAt: string;
}

export interface AquaVitaeumFullBackup {
  version: number;
  exportedAt: string;
  journals: Journal[];
  spirits: Spirit[];
}

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

// ─── 1. Google Identity Services (GIS) Token Client ───────────────────────────

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (err: unknown) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

/**
 * Dynamically loads the official Google Identity Services client script
 */
export async function loadGoogleGsiScript(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (window.google?.accounts?.oauth2) return;

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

/**
 * Requests an OAuth 2.0 access token with drive.file scope using Google Identity Services
 */
export async function requestGoogleAccessToken(clientId: string): Promise<string> {
  await loadGoogleGsiScript();

  const google = typeof window !== 'undefined' ? window.google : undefined;
  if (!google?.accounts?.oauth2) {
    throw new Error('Google Identity Services SDK could not be loaded.');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_DRIVE_SCOPE,
        callback: (resp) => {
          if (resp.error) {
            reject(new Error(resp.error));
          } else if (resp.access_token) {
            resolve(resp.access_token);
          } else {
            reject(new Error('No access token returned from Google.'));
          }
        },
        error_callback: (err) => {
          reject(new Error(`OAuth initialization error: ${String(err)}`));
        },
      });

      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
}

// ─── 2. Google Drive REST API v3 Helpers ──────────────────────────────────────

async function driveApiFetch(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = endpoint.startsWith('https://')
    ? endpoint
    : `https://www.googleapis.com/drive/v3/${endpoint}`;

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`Google Drive API error (${res.status}): ${errorText || res.statusText}`);
  }
  return res;
}

/**
 * Finds or creates a folder in Google Drive
 */
export async function findOrCreateDriveFolder(
  token: string,
  folderName: string,
  parentId?: string
): Promise<string> {
  let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName.replace(/'/g, "\\'")}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const listRes = await driveApiFetch(`files?q=${encodeURIComponent(query)}&fields=files(id,name)`, token);
  const data = await listRes.json();

  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder
  const createRes = await driveApiFetch('files', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    }),
  });

  const createdData = await createRes.json();
  return createdData.id;
}

/**
 * Lists all subfolders inside a parent folder in Google Drive
 */
export async function listDriveSubfolders(
  token: string,
  parentId: string
): Promise<GoogleDriveFile[]> {
  const query = `mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
  const res = await driveApiFetch(`files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)`, token);
  const data = await res.json();
  return data.files || [];
}

/**
 * Lists all files inside a parent folder in Google Drive
 */
export async function listDriveFiles(
  token: string,
  parentId: string
): Promise<GoogleDriveFile[]> {
  const query = `'${parentId}' in parents and mimeType!='application/vnd.google-apps.folder' and trashed=false`;
  const res = await driveApiFetch(`files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime)`, token);
  const data = await res.json();
  return data.files || [];
}

/**
 * Deletes a file or folder from Google Drive
 */
export async function deleteDriveFile(token: string, fileId: string): Promise<void> {
  try {
    await driveApiFetch(`files/${fileId}`, token, { method: 'DELETE' });
  } catch (err) {
    console.warn(`[Aqua Vitaeum Sync] Failed to delete file ${fileId} in Drive:`, err);
  }
}

/**
 * Reads and parses a JSON file from Google Drive
 */
export async function readDriveJsonFile<T>(
  token: string,
  fileId: string
): Promise<T | null> {
  try {
    const res = await driveApiFetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, token);
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`Failed to parse Drive file ${fileId}:`, err);
    return null;
  }
}

/**
 * Writes or updates a JSON file inside a parent folder in Google Drive
 */
export async function writeDriveJsonFile(
  token: string,
  parentId: string,
  fileName: string,
  data: unknown,
  existingFileId?: string
): Promise<string> {
  const fileContent = JSON.stringify(data, null, 2);

  if (existingFileId) {
    // Update existing file content
    const res = await driveApiFetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
      token,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: fileContent,
      }
    );
    const updated = await res.json();
    return updated.id;
  }

  // Create new file via multipart upload
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    parents: [parentId],
    mimeType: 'application/json',
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const res = await driveApiFetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    token,
    {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  const created = await res.json();
  return created.id;
}

// ─── 3. Domain Sync Engine (Aqua Vitaeum Folder Hierarchy) ───────────────────

/**
 * Sanitizes a string for safe filesystem and Google Drive filenames
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'Untitled';
}

export { isValidSpiritData } from '@/lib/schemas/spirit.schema';

/**
 * Executes a full bidirectional sync with Google Drive using transparent folder hierarchy:
 * Aqua Vitaeum/
 * └── [Journal Name]/
 *      ├── _journal.json
 *      └── [Distillery - Spirit Name].json
 */
export async function performGoogleDriveSync(token: string): Promise<SyncStats> {
  let pushedSpirits = 0;
  let pulledSpirits = 0;
  let pushedJournals = 0;
  let pulledJournals = 0;
  let deletedRemotes = 0;
  let skippedInvalidFiles = 0;

  // 1. Ensure Root "Aqua Vitaeum" folder exists in Drive
  const rootFolderId = await findOrCreateDriveFolder(token, GOOGLE_DRIVE_ROOT_FOLDER);
  const rootFiles = await listDriveFiles(token, rootFolderId);

  // 2. Sync Deletions Manifest (_deletions.json in Root folder)
  const remoteDeletionsFile = rootFiles.find((f) => f.name === DELETIONS_MANIFEST_FILE);
  if (remoteDeletionsFile) {
    const remoteDeletions = await readDriveJsonFile<{
      deletions?: Record<string, { type?: 'spirit' | 'journal'; deletedAt: string }>;
    }>(token, remoteDeletionsFile.id);
    if (remoteDeletions?.deletions) {
      mergeRemoteTombstones(remoteDeletions.deletions);
    }
  }

  // 3. Purge any locally stored spirits/journals that are tombstoned
  const localSpiritsBefore = await db.spirits.toArray();
  for (const s of localSpiritsBefore) {
    if (isTombstoned(s.id, s.updatedAt || s.dateTasted)) {
      await db.spirits.delete(s.id);
    }
  }
  const localJournalsBefore = await db.journals.toArray();
  for (const j of localJournalsBefore) {
    if (isTombstoned(j.id, j.updatedAt || j.createdAt)) {
      await db.journals.delete(j.id);
      await db.spirits.where('journalId').equals(j.id).delete();
    }
  }

  // 4. Load all active local records from Dexie IndexedDB
  const localJournals = await db.journals.toArray();
  const localSpirits = await db.spirits.toArray();
  const localSpiritMap = new Map<string, Spirit>(localSpirits.map((s) => [s.id, s]));

  // 5. Scan remote Google Drive folder structure
  const remoteJournalFolders = await listDriveSubfolders(token, rootFolderId);

  // 6. Process Remote Journals & Tasting Cards -> Pull into local IndexedDB with Delta optimization
  for (const folder of remoteJournalFolders) {
    // Check if this folder is tombstoned
    if (isTombstoned(folder.id) || isTombstoned(folder.name)) {
      await deleteDriveFile(token, folder.id);
      deletedRemotes++;
      continue;
    }

    const folderFiles = await listDriveFiles(token, folder.id);
    const journalMetaFile = folderFiles.find((f) => f.name === JOURNAL_METADATA_FILE);

    let journalId = folder.id; // fallback
    let journalName = folder.name;
    let journalDescription: string | undefined = undefined;
    let journalCreatedAt = new Date().toISOString();
    let journalUpdatedAt = new Date().toISOString();
    let journalCoverImage: string | undefined = undefined;

    if (journalMetaFile) {
      const meta = await readDriveJsonFile<Partial<Journal>>(token, journalMetaFile.id);
      if (meta && meta.name) {
        journalId = meta.id || journalId;
        journalName = meta.name;
        journalDescription = meta.description;
        journalCreatedAt = meta.createdAt || journalCreatedAt;
        journalUpdatedAt = meta.updatedAt || journalUpdatedAt;
        journalCoverImage = meta.coverImage;
      }
    }

    // Check if the parsed journal ID is tombstoned
    if (isTombstoned(journalId, journalUpdatedAt)) {
      await deleteDriveFile(token, folder.id);
      deletedRemotes++;
      continue;
    }

    // Check if local journal exists by ID or by Name
    const existingLocalJournal = localJournals.find(
      (j) => j.id === journalId || j.name.toLowerCase() === journalName.toLowerCase()
    );

    if (!existingLocalJournal) {
      await db.journals.put({
        id: journalId,
        name: journalName,
        description: journalDescription,
        createdAt: journalCreatedAt,
        updatedAt: journalUpdatedAt,
        coverImage: journalCoverImage,
      });
      pulledJournals++;
    } else {
      journalId = existingLocalJournal.id;
      // If remote journal has newer updatedAt or local is missing coverImage, update local
      const localDate = new Date(existingLocalJournal.updatedAt || existingLocalJournal.createdAt || 0).getTime();
      const remoteDate = new Date(journalUpdatedAt || journalCreatedAt || 0).getTime();
      const shouldAdoptCover = !existingLocalJournal.coverImage && !!journalCoverImage;

      if (remoteDate > localDate || shouldAdoptCover) {
        await db.journals.update(existingLocalJournal.id, {
          name: journalName,
          description: journalDescription || existingLocalJournal.description,
          updatedAt: journalUpdatedAt,
          coverImage: journalCoverImage || existingLocalJournal.coverImage,
        });
        pulledJournals++;
      }
    }

    // Read and sync spirit JSON files in this folder
    const spiritFilesToPull = folderFiles.filter(
      (f) => f.name !== JOURNAL_METADATA_FILE && f.name.endsWith('.json')
    );

    for (const file of spiritFilesToPull) {
      const parsedData = await readDriveJsonFile<unknown>(token, file.id);
      if (!isValidSpiritData(parsedData)) {
        console.warn(`[Aqua Vitaeum Sync] Skipping invalid rogue file in Drive: ${file.name}`);
        skippedInvalidFiles++;
        continue;
      }

      const remoteSpirit = parsedData as Spirit;
      remoteSpirit.journalId = journalId;

      if (isTombstoned(remoteSpirit.id, remoteSpirit.updatedAt || remoteSpirit.dateTasted)) {
        await deleteDriveFile(token, file.id);
        deletedRemotes++;
        continue;
      }

      const localSpirit = localSpiritMap.get(remoteSpirit.id);
      if (!localSpirit) {
        await db.spirits.put(remoteSpirit);
        localSpiritMap.set(remoteSpirit.id, remoteSpirit);
        pulledSpirits++;
      } else {
        const localDate = new Date(localSpirit.updatedAt || localSpirit.dateTasted || 0).getTime();
        const remoteDate = new Date(remoteSpirit.updatedAt || remoteSpirit.dateTasted || 0).getTime();
        const shouldAdoptImage = !localSpirit.thumbnailImage && !!remoteSpirit.thumbnailImage;

        if (remoteDate > localDate || shouldAdoptImage) {
          const mergedSpirit: Spirit = {
            ...remoteSpirit,
            thumbnailImage: remoteSpirit.thumbnailImage || localSpirit.thumbnailImage,
            images:
              remoteSpirit.images && remoteSpirit.images.length > 0
                ? remoteSpirit.images
                : localSpirit.images,
          };
          await db.spirits.put(mergedSpirit);
          localSpiritMap.set(remoteSpirit.id, mergedSpirit);
          pulledSpirits++;
        }
      }
    }
  }

  // 7. Reload local state after pull
  const refreshedLocalJournals = await db.journals.toArray();
  const refreshedLocalSpirits = await db.spirits.toArray();

  // 8. Push Local Journals & Spirits to Google Drive (Delta-only push)
  for (const journal of refreshedLocalJournals) {
    if (isTombstoned(journal.id)) continue;

    const folderName = sanitizeFileName(journal.name);
    const journalFolderId = await findOrCreateDriveFolder(token, folderName, rootFolderId);

    const folderFiles = await listDriveFiles(token, journalFolderId);
    const existingMetaFile = folderFiles.find((f) => f.name === JOURNAL_METADATA_FILE);

    // Delta check for journal metadata
    const localJournalTime = new Date(journal.updatedAt || journal.createdAt || 0).getTime();
    const remoteMetaTime = existingMetaFile?.modifiedTime
      ? new Date(existingMetaFile.modifiedTime).getTime()
      : 0;

    if (!existingMetaFile || localJournalTime > remoteMetaTime) {
      await writeDriveJsonFile(
        token,
        journalFolderId,
        JOURNAL_METADATA_FILE,
        {
          id: journal.id,
          name: journal.name,
          description: journal.description,
          createdAt: journal.createdAt,
          updatedAt: journal.updatedAt || new Date().toISOString(),
          coverImage: journal.coverImage,
        },
        existingMetaFile?.id
      );
      pushedJournals++;
    }

    // Push all spirits belonging to this journal
    const journalSpirits = refreshedLocalSpirits.filter((s) => s.journalId === journal.id);

    for (const spirit of journalSpirits) {
      if (isTombstoned(spirit.id)) continue;

      const spiritFileName = `${sanitizeFileName(spirit.distillery || 'Spirit')} - ${sanitizeFileName(spirit.name || 'Note')}.json`;
      const existingSpiritFile = folderFiles.find(
        (f) => f.name === spiritFileName || (f.name.endsWith('.json') && f.name.includes(spirit.id))
      );

      const localSpiritTime = new Date(spirit.updatedAt || spirit.dateTasted || 0).getTime();
      const remoteFileTime = existingSpiritFile?.modifiedTime
        ? new Date(existingSpiritFile.modifiedTime).getTime()
        : 0;

      // DELTA OPTIMIZATION: Only upload if spirit is new in Drive OR has been edited locally after remote file
      if (!existingSpiritFile || localSpiritTime > remoteFileTime) {
        await writeDriveJsonFile(
          token,
          journalFolderId,
          spiritFileName,
          spirit,
          existingSpiritFile?.id
        );
        pushedSpirits++;
      }
    }
  }

  // 9. Upload updated _deletions.json manifest to Google Drive Root Folder
  const tombstones = getTombstones();
  if (Object.keys(tombstones).length > 0) {
    const existingDeletionsFile = rootFiles.find((f) => f.name === DELETIONS_MANIFEST_FILE);
    await writeDriveJsonFile(
      token,
      rootFolderId,
      DELETIONS_MANIFEST_FILE,
      {
        version: 1,
        updatedAt: new Date().toISOString(),
        deletions: tombstones,
      },
      existingDeletionsFile?.id
    );
  }

  const nowIso = new Date().toISOString();
  if (typeof window !== 'undefined') {
    localStorage.setItem('aqua-vitaeum-last-sync-time', nowIso);
  }

  if (pulledSpirits > 0 || pulledJournals > 0 || deletedRemotes > 0) {
    notifyDataChanged();
  }

  return {
    pushedSpirits,
    pulledSpirits,
    pushedJournals,
    pulledJournals,
    deletedRemotes,
    skippedInvalidFiles,
    lastSyncedAt: nowIso,
  };
}

// ─── 4. Local File Export & Import (.json) ───────────────────────────────────

/**
 * Exports all IndexedDB data into a single downloadable JSON backup file
 */
export async function downloadLocalBackupFile(): Promise<void> {
  const journals = await db.journals.toArray();
  const spirits = await db.spirits.toArray();

  const backup: AquaVitaeumFullBackup = {
    version: 3,
    exportedAt: new Date().toISOString(),
    journals,
    spirits,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `aqua-vitaeum-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports a local JSON backup file into IndexedDB with schema validation
 */
export async function importLocalBackupFile(file: File): Promise<{ importedSpirits: number; importedJournals: number }> {
  const fileText = await readFileText(file);
  const parsed = JSON.parse(fileText) as Partial<AquaVitaeumFullBackup>;

  if (!parsed.journals || !Array.isArray(parsed.journals) || !parsed.spirits || !Array.isArray(parsed.spirits)) {
    throw new Error('Invalid backup file structure.');
  }

  let importedJournals = 0;
  let importedSpirits = 0;

  for (const j of parsed.journals) {
    if (isValidJournalData(j)) {
      await db.journals.put(j);
      importedJournals++;
    }
  }

  for (const s of parsed.spirits) {
    if (isValidSpiritData(s)) {
      await db.spirits.put(s);
      importedSpirits++;
    }
  }

  return { importedJournals, importedSpirits };
}

/**
 * Exports a single Spirit note as a standalone downloadable JSON file
 */
export function exportSingleSpiritFile(spirit: Spirit): void {
  const fileName = `${sanitizeFileName(spirit.distillery || 'Spirit')} - ${sanitizeFileName(spirit.name || 'Tasting Note')}.json`;
  const blob = new Blob([JSON.stringify(spirit, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Parses and validates a single Spirit note from a JSON file
 */
export async function parseSingleSpiritFile(file: File): Promise<Spirit> {
  const fileText = await readFileText(file);
  const parsed = JSON.parse(fileText) as unknown;

  if (!isValidSpiritData(parsed)) {
    throw new Error('Invalid or corrupt tasting note JSON structure.');
  }

  return parsed;
}

/**
 * Exports one or more journals and all their associated tasting notes to a JSON file
 */
export async function exportJournalsToFile(journalIds: string[]): Promise<void> {
  if (journalIds.length === 0) return;

  const journals = await db.journals.where('id').anyOf(journalIds).toArray();
  const spirits = await db.spirits.where('journalId').anyOf(journalIds).toArray();

  const exportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    type: 'journal-export',
    journals,
    spirits,
  };

  const fileName =
    journals.length === 1
      ? `Journal - ${sanitizeFileName(journals[0].name)}.json`
      : `aqua-vitaeum-journals-${journals.length}-${new Date().toISOString().split('T')[0]}.json`;

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports one or more selected spirit notes to a JSON file
 */
export async function exportSpiritsToFile(spiritIds: string[], journalName?: string): Promise<void> {
  if (spiritIds.length === 0) return;

  const spirits = await db.spirits.where('id').anyOf(spiritIds).toArray();
  if (spirits.length === 0) return;

  if (spirits.length === 1) {
    exportSingleSpiritFile(spirits[0]);
    return;
  }

  const exportPayload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    type: 'spirits-export',
    journalName: journalName || 'Compendium',
    spirits,
  };

  const prefix = journalName ? `Notes - ${sanitizeFileName(journalName)}` : 'aqua-vitaeum-notes';
  const fileName = `${prefix}-${spirits.length}-${new Date().toISOString().split('T')[0]}.json`;

  const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports a journal export file (or single journal JSON) into IndexedDB
 */
export async function importJournalFile(file: File): Promise<{ journalCount: number; spiritCount: number }> {
  const fileText = await readFileText(file);
  const parsed = JSON.parse(fileText) as Record<string, unknown>;

  let journalCount = 0;
  let spiritCount = 0;

  // Case 1: Standard export payload with journals and spirits arrays
  if (Array.isArray(parsed.journals) && Array.isArray(parsed.spirits)) {
    for (const j of parsed.journals) {
      if (isValidJournalData(j)) {
        await db.journals.put(j);
        journalCount++;
      }
    }
    for (const s of parsed.spirits) {
      if (isValidSpiritData(s)) {
        await db.spirits.put(s);
        spiritCount++;
      }
    }
    return { journalCount, spiritCount };
  }

  // Case 2: Direct single journal object
  if (isValidJournalData(parsed)) {
    await db.journals.put(parsed);
    journalCount++;
    return { journalCount, spiritCount: 0 };
  }

  // Case 3: Direct spirits export payload (spirits array)
  if (Array.isArray(parsed.spirits)) {
    for (const s of parsed.spirits) {
      if (isValidSpiritData(s)) {
        await db.spirits.put(s);
        spiritCount++;
      }
    }
    return { journalCount: 0, spiritCount };
  }

  throw new Error('Invalid or corrupt journal JSON file.');
}
