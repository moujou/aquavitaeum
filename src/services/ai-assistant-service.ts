/**
 * AI Assistant Service Layer for Aqua Vitaeum
 *
 * Provides spirit identification, metadata extraction (ABV, distillery, casks, age),
 * and official distillery tasting notes using Google Gemini Flash models with typed output.
 *
 * Keys are loaded from:
 * 1. Environment variables (.env.local locally, GitHub Secrets in production)
 * 2. Optional customKey override
 */

import {
  SpiritType,
  SpiritColour,
  SpiritGlance,
  SpiritCharacteristic,
  SpiritFinishDuration,
  SpiritFinishCharacter,
  SpiritBarRole,
  SPIRIT_TYPES,
  SPIRIT_COLOURS,
  SPIRIT_CHARACTERISTICS,
  SPIRIT_GLANCES,
  SPIRIT_FINISH_DURATIONS,
  SPIRIT_FINISH_CHARACTERS,
  SPIRIT_BAR_ROLES,
} from '@/types/spirit.types';

export const GEMINI_MODEL_CANDIDATES = [
  process.env.NEXT_PUBLIC_GEMINI_MODEL,
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
].filter((m): m is string => typeof m === 'string' && m.trim().length > 0);

export const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface SpiritAnalysisResult {
  name: string;
  distillery: string;
  region?: string;
  spiritType: SpiritType;
  abv: number;
  age?: number;
  volumeMl?: number;
  caskFinish?: string;
  caskTypes?: string[];
  characteristics?: SpiritCharacteristic[];
  colour?: SpiritColour;
  glance?: SpiritGlance[];
  noseNotes?: string;
  tasteNotes?: string;
  finishNotes?: string;
  finish?: string;
  finishDuration?: SpiritFinishDuration;
  finishCharacter?: SpiritFinishCharacter[];
  servingNotes?: string;
  barRole?: SpiritBarRole[];
  suggestedNoseTags?: string[];
  suggestedTasteTags?: string[];
  confidence?: number;
}

export interface SpiritAnalysisOptions {
  language?: 'DE' | 'EN';
  includeTastingNotes?: boolean;
  customKey?: string;
}

// ─── Key Management (BYOK - Bring Your Own Key) ────────────────────────────

export const GEMINI_STORAGE_KEY = 'aqua_gemini_api_key';

export function getStoredAiApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = localStorage.getItem(GEMINI_STORAGE_KEY);
    return key && key.trim().length > 0 ? key.trim() : null;
  } catch {
    return null;
  }
}

export function setStoredAiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(GEMINI_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(GEMINI_STORAGE_KEY);
    }
    window.dispatchEvent(new Event('aqua_ai_key_changed'));
  } catch {
    // Ignore storage write errors
  }
}

export function removeStoredAiApiKey(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
    window.dispatchEvent(new Event('aqua_ai_key_changed'));
  } catch {
    // Ignore storage errors
  }
}

export function getMaskedAiApiKey(key?: string): string {
  const targetKey = key || getActiveAiApiKey() || '';
  if (!targetKey) return '';
  if (targetKey.length <= 8) return '••••••••';
  return `••••••••••••••••${targetKey.slice(-4)}`;
}

export function hasConfiguredAiApiKey(): boolean {
  return !!getActiveAiApiKey();
}

export function getActiveAiApiKey(customOverride?: string): string | undefined {
  if (customOverride && customOverride.trim().length > 0) {
    return customOverride.trim();
  }
  const stored = getStoredAiApiKey();
  if (stored) {
    return stored;
  }
  if (process.env.NEXT_PUBLIC_GEMINI_API_KEY && process.env.NEXT_PUBLIC_GEMINI_API_KEY.trim().length > 0) {
    return process.env.NEXT_PUBLIC_GEMINI_API_KEY.trim();
  }
  return undefined;
}

// ─── Connection & Validation Test ────────────────────────────────────────────

export async function testAiAssistantConnection(
  customKey?: string,
  lang: 'DE' | 'EN' = 'DE'
): Promise<{ success: boolean; message: string }> {
  const apiKey = getActiveAiApiKey(customKey);
  if (!apiKey) {
    return {
      success: false,
      message:
        lang === 'DE'
          ? 'Kein API-Schlüssel hinterlegt. Bitte erstelle einen kostenlosen Key bei Google AI Studio.'
          : 'No API key configured. Please create a free key in Google AI Studio.',
    };
  }

  try {
    const rawText = await executeGeminiContentRequest(
      apiKey,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Respond with the word "OK" in JSON: {"status": "OK"}' }],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
          temperature: 0.1,
        },
      },
      lang
    );

    if (rawText) {
      return {
        success: true,
        message:
          lang === 'DE'
            ? 'Verbindung zu Google Gemini erfolgreich hergestellt!'
            : 'Successfully connected to Google Gemini!',
      };
    }
    return {
      success: false,
      message:
        lang === 'DE'
          ? 'Keine Antwortdaten von der KI erhalten.'
          : 'No response received from the AI service.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: msg,
    };
  }
}

// ─── Prompt Engineering ──────────────────────────────────────────────────────

function buildSystemPrompt(language: 'DE' | 'EN' = 'DE', includeTastingNotes = true): string {
  const langInstruction =
    language === 'DE'
      ? 'Gib alle Notizen (Nase, Geschmack, Abgang, Servierempfehlung) in eleganter, deutscher Fachsprache für Spirituosen-Liebhaber an.'
      : 'Provide all notes (nose, palate, finish, serving notes) in elegant, sommelier-grade English.';

  return `You are the master blender and spirit archivist for Aqua Vitaeum, a fine spirits journal.
Your task is to analyze a spirit (from a photo of the bottle/label, or from a name/barcode text) and extract factual specifications and official distillery tasting notes.

${langInstruction}

Rules for field mapping:
- "ANTI-HALLUCINATION & BARCODE RULE": If the user query is a numerical barcode (EAN/UPC) or an unknown bottling that you cannot identify with high factual certainty, DO NOT GUESS, GUESSWORK, OR HALLUCINATE A RANDOM DISTILLERY (e.g. do not invent Lagavulin, Ardbeg, Macallan). Return {"notFound": true, "name": "NOT_FOUND"}.
- "spiritType" MUST match one of the standard categories if applicable: ${JSON.stringify(SPIRIT_TYPES)}.
- "volumeMl": Bottle volume in ml as an integer (e.g. 700, 750, 500, 1000, 50). Extract from label or bottle text (e.g. "70cl" or "700ml" -> 700, "750ml" or "75cl" -> 750, "0.7L" -> 700, "1L" -> 1000, "5cl" -> 50). Default to 700 for European bottlings or 750 for US bottlings if unspecified.
- "caskFinish": The cask finishing and wood maturation type (e.g. "Oloroso Sherry Finish", "Port Wood Finish", "Ex-Bourbon & Quarter Cask", "Red Wine Cask Finish", "PX Sherry Cask", "Virgin Oak"). This is the WOOD FINISH specification, NOT sensory tasting notes.
- "colour" SHOULD match one of the 21 classic sommelier shades: ${JSON.stringify(SPIRIT_COLOURS)}. Default to realistic whisky colors like "Amber", "Deep Gold", "Chestnut", "Russet".
- "characteristics" CAN include values from: ${JSON.stringify(SPIRIT_CHARACTERISTICS)}.
- "glance" CAN include values from: ${JSON.stringify(SPIRIT_GLANCES)}.
- "finishDuration" MUST be one of: ${JSON.stringify(SPIRIT_FINISH_DURATIONS)}.
- "finishCharacter" CAN include values from: ${JSON.stringify(SPIRIT_FINISH_CHARACTERS)}.
- "barRole" CAN include values from: ${JSON.stringify(SPIRIT_BAR_ROLES)}.
- "suggestedNoseTags" should be 3-6 individual aroma descriptors (e.g. "Peat Smoke", "Vanilla", "Dried Fig", "Iodine", "Green Apple").
- "suggestedTasteTags" should be 3-6 individual palate descriptors (e.g. "Sherry", "Salted Caramel", "Dark Chocolate", "Oak Spice").

${
  includeTastingNotes
    ? 'Provide evocative, authentic official distillery tasting notes for noseNotes, tasteNotes, and finishNotes (the sensory finish on palate).'
    : 'Leave noseNotes, tasteNotes, finishNotes, suggestedNoseTags, and suggestedTasteTags empty or concise, focusing primarily on factual metadata.'
}

Return ONLY valid JSON matching this schema:
{
  "name": "Full official bottling name (e.g. Ardbeg Uigeadail)",
  "distillery": "Distillery name (e.g. Ardbeg)",
  "region": "Region and Country (e.g. Islay, Scotland)",
  "spiritType": "Single Malt Scotch",
  "abv": 54.2,
  "age": null,
  "volumeMl": 700,
  "caskFinish": "Oloroso Sherry Finish",
  "caskTypes": ["Ex-Bourbon", "Oloroso Sherry Butts"],
  "characteristics": ["Cask Strength", "Non-Chill Filtered", "Peated"],
  "colour": "Deep Gold",
  "glance": ["Oily", "Viscous"],
  "noseNotes": "Rich peat smoke with dark raisins, leather and espresso.",
  "tasteNotes": "Sweet sherry notes exploding into intense smoke, winter spices and tar.",
  "finishNotes": "Long, warming and deeply peaty with lingering dark chocolate.",
  "finishDuration": "Very Long",
  "finishCharacter": ["Warming", "Peated", "Smoky"],
  "servingNotes": "Enjoy neat at room temperature; add a few drops of spring water to open sherry notes.",
  "barRole": ["Showcase Bottle", "Buy Again"],
  "suggestedNoseTags": ["Peat Smoke", "Raisin", "Leather", "Coffee"],
  "suggestedTasteTags": ["Sherry", "Smoke", "Dark Chocolate", "Oak Spice"],
  "confidence": 0.95
}`;
}

// ─── Sanitizer & Validator ──────────────────────────────────────────────────

function sanitizeAnalysisResult(raw: Record<string, unknown>): SpiritAnalysisResult {
  if (
    raw.notFound === true ||
    raw.name === 'NOT_FOUND' ||
    raw.name === 'Unknown Spirit' ||
    !raw.name ||
    typeof raw.name !== 'string' ||
    raw.name.trim().length === 0
  ) {
    throw new Error('NOT_FOUND');
  }

  const name = raw.name.trim();
  const distillery = typeof raw.distillery === 'string' ? raw.distillery.trim() : '';
  const region = typeof raw.region === 'string' ? raw.region.trim() : '';
  const spiritType =
    typeof raw.spiritType === 'string' && raw.spiritType.trim()
      ? (raw.spiritType.trim() as SpiritType)
      : 'Single Malt Scotch';

  let abv = 40.0;
  if (typeof raw.abv === 'number' && !isNaN(raw.abv) && raw.abv > 0 && raw.abv <= 100) {
    abv = Math.round(raw.abv * 10) / 10;
  } else if (typeof raw.abv === 'string') {
    const parsed = parseFloat(raw.abv.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      abv = Math.round(parsed * 10) / 10;
    }
  }

  let age: number | undefined = undefined;
  if (typeof raw.age === 'number' && raw.age > 0 && raw.age < 150) {
    age = Math.round(raw.age);
  }

  let volumeMl = 700;
  if (typeof raw.volumeMl === 'number' && !isNaN(raw.volumeMl) && raw.volumeMl > 0 && raw.volumeMl <= 5000) {
    volumeMl = Math.round(raw.volumeMl);
  } else if (typeof raw.volumeMl === 'string') {
    const str = raw.volumeMl.toLowerCase().trim();
    if (str.includes('cl')) {
      const clVal = parseFloat(str.replace(/[^0-9.]/g, ''));
      if (!isNaN(clVal) && clVal > 0) volumeMl = Math.round(clVal * 10);
    } else if (str.includes('l') && !str.includes('ml')) {
      const lVal = parseFloat(str.replace(/[^0-9.]/g, ''));
      if (!isNaN(lVal) && lVal > 0) volumeMl = Math.round(lVal * 1000);
    } else {
      const mlVal = parseFloat(str.replace(/[^0-9.]/g, ''));
      if (!isNaN(mlVal) && mlVal > 0) volumeMl = Math.round(mlVal);
    }
  }

  const caskTypes = Array.isArray(raw.caskTypes)
    ? raw.caskTypes.filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
    : undefined;

  let caskFinish: string | undefined = undefined;
  if (typeof raw.caskFinish === 'string' && raw.caskFinish.trim().length > 0) {
    caskFinish = raw.caskFinish.trim();
  } else if (caskTypes && caskTypes.length > 0) {
    caskFinish = caskTypes.join(', ');
  }

  const characteristics = Array.isArray(raw.characteristics)
    ? raw.characteristics.filter((c): c is SpiritCharacteristic => typeof c === 'string' && c.trim().length > 0)
    : undefined;

  const colour =
    typeof raw.colour === 'string' && (SPIRIT_COLOURS as readonly string[]).includes(raw.colour)
      ? (raw.colour as SpiritColour)
      : 'Amber';

  const glance = Array.isArray(raw.glance)
    ? raw.glance.filter((g): g is SpiritGlance => typeof g === 'string' && g.trim().length > 0)
    : undefined;

  const finishDuration =
    typeof raw.finishDuration === 'string' &&
    SPIRIT_FINISH_DURATIONS.includes(raw.finishDuration as SpiritFinishDuration)
      ? (raw.finishDuration as SpiritFinishDuration)
      : 'Medium';

  const finishCharacter = Array.isArray(raw.finishCharacter)
    ? raw.finishCharacter.filter(
        (f): f is SpiritFinishCharacter => typeof f === 'string' && f.trim().length > 0
      )
    : undefined;

  const barRole = Array.isArray(raw.barRole)
    ? raw.barRole.filter((b): b is SpiritBarRole => typeof b === 'string' && b.trim().length > 0)
    : undefined;

  const suggestedNoseTags = Array.isArray(raw.suggestedNoseTags)
    ? raw.suggestedNoseTags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    : [];

  const suggestedTasteTags = Array.isArray(raw.suggestedTasteTags)
    ? raw.suggestedTasteTags.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    : [];

  let finishNotes: string | undefined = undefined;
  if (typeof raw.finishNotes === 'string' && raw.finishNotes.trim().length > 0) {
    finishNotes = raw.finishNotes.trim();
  } else if (typeof raw.finish === 'string' && raw.finish.trim().length > 15) {
    finishNotes = raw.finish.trim();
  }

  return {
    name,
    distillery,
    region,
    spiritType,
    abv,
    age,
    volumeMl,
    caskFinish,
    caskTypes,
    characteristics,
    colour,
    glance,
    noseNotes: typeof raw.noseNotes === 'string' ? raw.noseNotes.trim() : undefined,
    tasteNotes: typeof raw.tasteNotes === 'string' ? raw.tasteNotes.trim() : undefined,
    finishNotes,
    finish: finishNotes || (typeof raw.finish === 'string' ? raw.finish.trim() : undefined),
    finishDuration,
    finishCharacter,
    servingNotes: typeof raw.servingNotes === 'string' ? raw.servingNotes.trim() : undefined,
    barRole,
    suggestedNoseTags,
    suggestedTasteTags,
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.9,
  };
}

// ─── Multi-Model Resilient Request Dispatcher ────────────────────────────────

async function executeGeminiContentRequest(
  apiKey: string,
  payload: Record<string, unknown>,
  language: 'DE' | 'EN' = 'DE'
): Promise<string> {
  let lastError = '';

  for (const model of GEMINI_MODEL_CANDIDATES) {
    try {
      const url = `${GEMINI_BASE_URL}/${model}:generateContent`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 429) {
        throw new Error(
          language === 'DE'
            ? 'API-Kontingent erreicht (Rate Limit). Bitte warte kurz oder versuche es später erneut.'
            : 'API rate limit reached. Please wait a moment or try again later.'
        );
      }

      if (response.status === 400 || response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || `HTTP ${response.status}`;
        throw new Error(
          language === 'DE'
            ? `Ungültiger Google Gemini API-Key (${errMsg})`
            : `Invalid Google Gemini API Key (${errMsg})`
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errMsg = errorData?.error?.message || `HTTP ${response.status}`;
        lastError = errMsg;
        // If model version is not available on this API tier, seamlessly try next model
        if (
          errMsg.includes('not found') ||
          errMsg.includes('no longer available') ||
          errMsg.includes('is not supported') ||
          response.status === 404
        ) {
          continue;
        }
        throw new Error(
          language === 'DE'
            ? `KI-Analyse fehlgeschlagen: ${errMsg}`
            : `AI analysis failed: ${errMsg}`
        );
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        return rawText;
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Tageskontingent')) {
        throw err;
      }
      if (
        err instanceof Error &&
        (err.message.includes('not found') ||
          err.message.includes('no longer available') ||
          err.message.includes('is not supported'))
      ) {
        continue;
      }
      throw err;
    }
  }

  throw new Error(
    language === 'DE'
      ? `KI-Analyse fehlgeschlagen: ${lastError || 'Kein passendes Gemini-Modell gefunden.'}`
      : `AI analysis failed: ${lastError || 'No matching Gemini model found.'}`
  );
}

function parseJsonFromAiResponse(rawText: string): Record<string, unknown> {
  let clean = rawText.trim();
  if (clean.startsWith('```')) {
    clean = clean.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  return JSON.parse(clean);
}

// ─── Main AI Assistant Analysis Execution ───────────────────────────────────

export async function analyzeSpiritFromText(
  query: string,
  options: SpiritAnalysisOptions = {}
): Promise<SpiritAnalysisResult> {
  const language = options.language || 'DE';
  const includeNotes = options.includeTastingNotes !== false;
  const apiKey = getActiveAiApiKey(options.customKey);

  if (!apiKey) {
    throw new Error(
      language === 'DE'
        ? 'Kein KI-Schlüssel hinterlegt. Bitte trage deinen Google Gemini API-Key in die Datei .env.local ein.'
        : 'No AI key configured. Please add your Google Gemini API key to your .env.local file.'
    );
  }

  const systemPrompt = buildSystemPrompt(language, includeNotes);
  const userPrompt = `Identify and analyze this spirit from the following query/barcode: "${query}". Return the structured JSON.`;

  const rawText = await executeGeminiContentRequest(
    apiKey,
    {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.2,
      },
    },
    language
  );

  if (!rawText) {
    throw new Error(
      language === 'DE'
        ? 'Keine Daten von der KI empfangen. Bitte versuche es erneut.'
        : 'No data received from AI. Please try again.'
    );
  }

  try {
    const parsedJson = parseJsonFromAiResponse(rawText);
    return sanitizeAnalysisResult(parsedJson);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      const isDigitsOnly = /^[0-9]+$/.test(query.trim());
      throw new Error(
        language === 'DE'
          ? isDigitsOnly
            ? `Barcode "${query}" konnte keiner eindeutigen Abfüllung zugeordnet werden. Bitte gib den Namen ein (z. B. "Miltonduff 14") oder lade ein Foto des Etiketts hoch.`
            : `Keine passende Abfüllung zu "${query}" gefunden. Bitte prüfe die Schreibweise oder lade ein Foto des Etiketts hoch.`
          : isDigitsOnly
            ? `Barcode "${query}" could not be matched to an exact bottling. Please enter the name or upload a photo of the label.`
            : `No matching spirit found for "${query}". Please check spelling or upload a photo of the label.`
      );
    }
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      language === 'DE'
        ? `Antwort der KI konnte nicht verarbeitet werden: ${msg}`
        : `Could not parse AI response: ${msg}`
    );
  }
}

export async function analyzeSpiritFromImage(
  imageBase64: string,
  options: SpiritAnalysisOptions = {}
): Promise<SpiritAnalysisResult> {
  const language = options.language || 'DE';
  const includeNotes = options.includeTastingNotes !== false;
  const apiKey = getActiveAiApiKey(options.customKey);

  if (!apiKey) {
    throw new Error(
      language === 'DE'
        ? 'Kein KI-Schlüssel hinterlegt. Bitte trage deinen Google Gemini API-Key in die Datei .env.local ein.'
        : 'No AI key configured. Please add your Google Gemini API key to your .env.local file.'
    );
  }

  // Strip prefix if present (e.g. data:image/jpeg;base64,)
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  const mimeType = imageBase64.startsWith('data:image/png')
    ? 'image/png'
    : imageBase64.startsWith('data:image/webp')
    ? 'image/webp'
    : 'image/jpeg';

  const systemPrompt = buildSystemPrompt(language, includeNotes);
  const userPrompt = `Carefully examine this bottle/label image. Read all text, branding, ABV, age, and cask specifications. Extract and return the structured spirit JSON.`;

  const rawText = await executeGeminiContentRequest(
    apiKey,
    {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\n${userPrompt}` },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature: 0.2,
      },
    },
    language
  );

  if (!rawText) {
    throw new Error(
      language === 'DE'
        ? 'Etikett konnte nicht erkannt werden. Bitte lade ein schärferes Foto hoch.'
        : 'Label could not be identified. Please upload a clearer photo.'
    );
  }

  try {
    const parsedJson = parseJsonFromAiResponse(rawText);
    return sanitizeAnalysisResult(parsedJson);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NOT_FOUND') {
      throw new Error(
        language === 'DE'
          ? 'Etikett konnte nicht eindeutig identifiziert werden. Bitte lade ein schärferes Foto hoch.'
          : 'Label could not be identified. Please upload a clearer photo.'
      );
    }
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      language === 'DE'
        ? `Antwort der KI konnte nicht verarbeitet werden: ${msg}`
        : `Could not parse AI response: ${msg}`
    );
  }
}
