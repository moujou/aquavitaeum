import { NextResponse } from 'next/server';
import { readSettingsFromFile, writeSettingsToFile } from '@/lib/settings-storage';
import { SUPPORTED_LANGUAGES, Language } from '@/lib/i18n/translations';

export async function GET() {
  try {
    const settings = await readSettingsFromFile();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read settings from storage' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const language = body?.language ?? body?.settings?.language;

    if (!(SUPPORTED_LANGUAGES as readonly string[]).includes(language)) {
      return NextResponse.json(
        { error: `Invalid language setting. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}.` },
        { status: 400 },
      );
    }

    const settings = { language: language as Language };
    await writeSettingsToFile(settings);
    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json(
      { error: 'Failed to write settings to storage' },
      { status: 500 },
    );
  }
}
