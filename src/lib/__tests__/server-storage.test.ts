import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { readSpiritsFromFile, writeSpiritsToFile } from '../server-storage';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { Spirit } from '@/types/spirit.types';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const DATA_FILE_PATH = path.join(DATA_DIR, 'spirits.json');
const TEMP_FILE_PATH = path.join(DATA_DIR, 'spirits.json.tmp');

describe('Server Storage Module', () => {
  let backupContent: string | null = null;

  beforeEach(async () => {
    try {
      backupContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    } catch {
      backupContent = null;
    }
  });

  afterEach(async () => {
    // Restore original file if it existed
    if (backupContent !== null) {
      await fs.writeFile(DATA_FILE_PATH, backupContent, 'utf-8');
    } else {
      try {
        await fs.unlink(DATA_FILE_PATH);
      } catch {
        // Ignore missing file error
      }
    }
    try {
      await fs.unlink(TEMP_FILE_PATH);
    } catch {
      // Ignore missing file error
    }
  });

  it('reads spirits from file when file exists', async () => {
    const testSpirits: Spirit[] = [MOCK_SPIRITS[0]];
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(testSpirits), 'utf-8');

    const result = await readSpiritsFromFile();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(MOCK_SPIRITS[0].id);
  });

  it('automatically creates spirits.json with an empty array when file does not exist', async () => {
    try {
      await fs.unlink(DATA_FILE_PATH);
    } catch {
      // Ignore error if unlinked
    }

    const result = await readSpiritsFromFile();
    expect(result).toEqual([]);

    const createdContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    expect(JSON.parse(createdContent)).toEqual([]);
  });

  it('atomically writes updated spirits to file', async () => {
    const updatedList: Spirit[] = [
      { ...MOCK_SPIRITS[0], name: 'Server Stored Name' },
    ];

    await writeSpiritsToFile(updatedList);
    const saved = await readSpiritsFromFile();

    expect(saved).toHaveLength(1);
    expect(saved[0].name).toBe('Server Stored Name');
  });
});
