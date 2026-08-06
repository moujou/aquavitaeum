import fs from 'fs/promises';
import path from 'path';
import { Language, SUPPORTED_LANGUAGES } from '@/lib/i18n/translations';

export interface AppSettings {
  language: Language;
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'settings.json');
const TEMP_SETTINGS_PATH = path.join(process.cwd(), 'src', 'data', 'settings.json.tmp');

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'EN',
};

/**
 * Reads settings from src/data/settings.json.
 * If file does not exist, writes default settings and returns them.
 */
export async function readSettingsFromFile(): Promise<AppSettings> {
  try {
    const content = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    if (parsed && (SUPPORTED_LANGUAGES as readonly string[]).includes(parsed.language)) {
      return { language: parsed.language as Language };
    }
    return DEFAULT_SETTINGS;
  } catch {
    await writeSettingsToFile(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Writes settings to src/data/settings.json using atomic temp file rename.
 */
export async function writeSettingsToFile(settings: AppSettings): Promise<void> {
  const dir = path.dirname(SETTINGS_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });

  const payload = JSON.stringify(settings, null, 2);
  await fs.writeFile(TEMP_SETTINGS_PATH, payload, 'utf-8');
  try {
    await fs.rename(TEMP_SETTINGS_PATH, SETTINGS_FILE_PATH);
  } catch (renameErr) {
    console.warn('Aqua Vitaeum: settings fs.rename failed, falling back to copyFile:', renameErr);
    await fs.copyFile(TEMP_SETTINGS_PATH, SETTINGS_FILE_PATH);
    try {
      await fs.unlink(TEMP_SETTINGS_PATH);
    } catch (cleanupErr) {
      console.warn('Aqua Vitaeum: Failed to clean up temp settings file:', cleanupErr);
    }
  }
}
