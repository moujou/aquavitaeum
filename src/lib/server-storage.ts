import { promises as fs } from 'fs';
import path from 'path';
import { Spirit } from '@/types/spirit.types';
import { MOCK_SPIRITS } from '@/data/mock-spirits';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE_PATH = path.join(DATA_DIR, 'spirits.json');
const TEMP_FILE_PATH = path.join(DATA_DIR, 'spirits.json.tmp');

/**
 * Reads spirits from src/data/spirits.json.
 * If the file does not exist, automatically seeds it with MOCK_SPIRITS.
 */
export async function readSpiritsFromFile(): Promise<Spirit[]> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return MOCK_SPIRITS;
  } catch {
    await writeSpiritsToFile(MOCK_SPIRITS);
    return MOCK_SPIRITS;
  }
}

/**
 * Atomically writes the spirits array to src/data/spirits.json
 * with fallback copy for Windows file-locking scenarios.
 */
export async function writeSpiritsToFile(spirits: Spirit[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const jsonContent = JSON.stringify(spirits, null, 2);
  await fs.writeFile(TEMP_FILE_PATH, jsonContent, 'utf-8');
  try {
    await fs.rename(TEMP_FILE_PATH, DATA_FILE_PATH);
  } catch {
    await fs.copyFile(TEMP_FILE_PATH, DATA_FILE_PATH);
    try {
      await fs.unlink(TEMP_FILE_PATH);
    } catch {
      // Ignore temp file cleanup error
    }
  }
}
