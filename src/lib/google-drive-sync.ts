import { db } from '@/lib/db';
import { Journal, Spirit } from '@/types/spirit.types';
import { validateSpirit } from '@/lib/schemas/spirit.schema';

// ─── Constants & Types ────────────────────────────────────────────────────────

export const GOOGLE_DRIVE_ROOT_FOLDER = 'Aqua Vitaeum';
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const JOURNAL_METADATA_FILE = '_journal.json';

export interface SyncStats {
  pushedSpirits: number;
  pulledSpirits: number;
  pushedJournals: number;
  pulledJournals: number;
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

/**
 * Validates a spirit object against rogue or invalid files
 */
export function isValidSpiritData(data: unknown): data is Spirit {
  if (!data || typeof data !== 'object') return false;
  const spirit = data as Partial<Spirit>;
  if (!spirit.id || typeof spirit.id !== 'string') return false;
  if (!spirit.name || typeof spirit.name !== 'string') return false;
  if (!spirit.spiritType || typeof spirit.spiritType !== 'string') return false;
  
  const validation = validateSpirit(spirit);
  return validation.valid;
}

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
  let skippedInvalidFiles = 0;

  // 1. Ensure Root "Aqua Vitaeum" folder exists in Drive
  const rootFolderId = await findOrCreateDriveFolder(token, GOOGLE_DRIVE_ROOT_FOLDER);

  // 2. Load all local records from Dexie IndexedDB
  const localJournals = await db.journals.toArray();
  const localSpirits = await db.spirits.toArray();

  // 3. Scan remote Google Drive folder structure
  const remoteJournalFolders = await listDriveSubfolders(token, rootFolderId);
  const remoteJournalFolderMap = new Map<string, GoogleDriveFile>();
  for (const f of remoteJournalFolders) {
    remoteJournalFolderMap.set(f.name.toLowerCase(), f);
  }

  // 4. Process Remote Journals & Tasting Cards -> Pull into local IndexedDB
  for (const folder of remoteJournalFolders) {
    const folderFiles = await listDriveFiles(token, folder.id);
    const journalMetaFile = folderFiles.find((f) => f.name === JOURNAL_METADATA_FILE);

    let journalId = folder.id; // fallback
    let journalName = folder.name;
    let journalCreatedAt = new Date().toISOString();
    let journalUpdatedAt = new Date().toISOString();
    let journalCoverImage: string | undefined = undefined;

    if (journalMetaFile) {
      const meta = await readDriveJsonFile<Partial<Journal>>(token, journalMetaFile.id);
      if (meta && meta.name) {
        journalId = meta.id || journalId;
        journalName = meta.name;
        journalCreatedAt = meta.createdAt || journalCreatedAt;
        journalUpdatedAt = meta.updatedAt || journalUpdatedAt;
        journalCoverImage = meta.coverImage;
      }
    }

    // Check if local journal exists by ID or by Name
    const existingLocalJournal = localJournals.find(
      (j) => j.id === journalId || j.name.toLowerCase() === journalName.toLowerCase()
    );

    if (!existingLocalJournal) {
      await db.journals.put({
        id: journalId,
        name: journalName,
        createdAt: journalCreatedAt,
        updatedAt: journalUpdatedAt,
        coverImage: journalCoverImage,
      });
      pulledJournals++;
    } else {
      // Use existing local journal ID for spirit mapping
      journalId = existingLocalJournal.id;
    }

    // Read all spirit JSON files in this folder
    for (const file of folderFiles) {
      if (file.name === JOURNAL_METADATA_FILE || !file.name.endsWith('.json')) {
        // Skip metadata file or non-json files
        if (!file.name.endsWith('.json')) {
          skippedInvalidFiles++;
        }
        continue;
      }

      const parsedData = await readDriveJsonFile<unknown>(token, file.id);
      if (!isValidSpiritData(parsedData)) {
        console.warn(`[Aqua Vitaeum Sync] Skipping invalid rogue file in Drive: ${file.name}`);
        skippedInvalidFiles++;
        continue;
      }

      const remoteSpirit = parsedData as Spirit;
      remoteSpirit.journalId = journalId; // Link to this journal folder

      const localSpirit = localSpirits.find((s) => s.id === remoteSpirit.id);
      if (!localSpirit) {
        await db.spirits.put(remoteSpirit);
        pulledSpirits++;
      } else {
        // Conflict resolution: compare updatedAt timestamps
        const localDate = new Date(localSpirit.updatedAt || localSpirit.dateTasted || 0).getTime();
        const remoteDate = new Date(remoteSpirit.updatedAt || remoteSpirit.dateTasted || 0).getTime();

        if (remoteDate > localDate) {
          await db.spirits.put(remoteSpirit);
          pulledSpirits++;
        }
      }
    }
  }

  // Reload local state after pull
  const refreshedLocalJournals = await db.journals.toArray();
  const refreshedLocalSpirits = await db.spirits.toArray();

  // 5. Push Local Journals & Spirits to Google Drive
  for (const journal of refreshedLocalJournals) {
    const folderName = sanitizeFileName(journal.name);
    const journalFolderId = await findOrCreateDriveFolder(token, folderName, rootFolderId);

    const folderFiles = await listDriveFiles(token, journalFolderId);
    const existingMetaFile = folderFiles.find((f) => f.name === JOURNAL_METADATA_FILE);

    // Write / update _journal.json
    await writeDriveJsonFile(
      token,
      journalFolderId,
      JOURNAL_METADATA_FILE,
      {
        id: journal.id,
        name: journal.name,
        createdAt: journal.createdAt,
        updatedAt: journal.updatedAt || new Date().toISOString(),
        coverImage: journal.coverImage,
      },
      existingMetaFile?.id
    );
    pushedJournals++;

    // Push all spirits belonging to this journal
    const journalSpirits = refreshedLocalSpirits.filter((s) => s.journalId === journal.id);

    for (const spirit of journalSpirits) {
      const spiritFileName = `${sanitizeFileName(spirit.distillery || 'Spirit')} - ${sanitizeFileName(spirit.name || 'Note')}.json`;
      const existingSpiritFile = folderFiles.find(
        (f) => f.name === spiritFileName || (f.name.endsWith('.json') && f.name.includes(spirit.id))
      );

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

  const nowIso = new Date().toISOString();
  if (typeof window !== 'undefined') {
    localStorage.setItem('aqua-vitaeum-last-sync-time', nowIso);
  }

  return {
    pushedSpirits,
    pulledSpirits,
    pushedJournals,
    pulledJournals,
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
  const fileText = await file.text();
  const parsed = JSON.parse(fileText) as Partial<AquaVitaeumFullBackup>;

  if (!parsed.journals || !Array.isArray(parsed.journals) || !parsed.spirits || !Array.isArray(parsed.spirits)) {
    throw new Error('Invalid backup file structure.');
  }

  let importedJournals = 0;
  let importedSpirits = 0;

  for (const j of parsed.journals) {
    if (j.id && j.name) {
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
      if (j && typeof j === 'object' && 'id' in j && 'name' in j) {
        await db.journals.put(j as never);
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
  if (parsed.id && parsed.name && typeof parsed.name === 'string') {
    await db.journals.put(parsed as never);
    journalCount++;
    return { journalCount, spiritCount: 0 };
  }

  throw new Error('Invalid or corrupt journal JSON file.');
}
