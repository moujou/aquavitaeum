import { NextResponse } from 'next/server';
import { readSpiritsFromFile, writeSpiritsToFile } from '@/lib/server-storage';
import { validateSpirit } from '@/lib/schemas/spirit.schema';
import { Spirit } from '@/types/spirit.types';

export const dynamic = 'force-static';

export async function GET() {
  try {
    const spirits = await readSpiritsFromFile();
    return NextResponse.json({ spirits });
  } catch {
    return NextResponse.json(
      { error: 'Failed to read spirits dataset from storage' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawSpirits = Array.isArray(body) ? body : body?.spirits;

    if (!Array.isArray(rawSpirits)) {
      return NextResponse.json(
        { error: 'Payload must be an array of Spirit objects or { spirits: Spirit[] }' },
        { status: 400 },
      );
    }

    // Validate spirits
    const spirits: Spirit[] = rawSpirits;
    for (const spirit of spirits) {
      const validation = validateSpirit(spirit);
      if (!validation.valid) {
        return NextResponse.json(
          { error: `Invalid spirit note "${spirit.name || spirit.id}"`, details: validation.errors },
          { status: 422 },
        );
      }
    }

    await writeSpiritsToFile(spirits);
    return NextResponse.json({ success: true, spirits });
  } catch {
    return NextResponse.json(
      { error: 'Failed to write spirits dataset to storage' },
      { status: 500 },
    );
  }
}
