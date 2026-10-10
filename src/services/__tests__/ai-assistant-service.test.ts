import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getActiveAiApiKey,
  getStoredAiApiKey,
  setStoredAiApiKey,
  removeStoredAiApiKey,
  getMaskedAiApiKey,
  hasConfiguredAiApiKey,
  analyzeSpiritFromText,
  analyzeSpiritFromImage,
  testAiAssistantConnection,
} from '../ai-assistant-service';

describe('AI Assistant Service (ai-assistant-service.ts)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('BYOK Key Management & Storage', () => {
    it('returns custom key when passed as override', () => {
      expect(getActiveAiApiKey('AIzaExplicitKey')).toBe('AIzaExplicitKey');
    });

    it('correctly stores, retrieves, and removes key in localStorage', () => {
      expect(getStoredAiApiKey()).toBeNull();
      expect(hasConfiguredAiApiKey()).toBe(false);

      setStoredAiApiKey('AIzaStoredKey123456');
      expect(getStoredAiApiKey()).toBe('AIzaStoredKey123456');
      expect(getActiveAiApiKey()).toBe('AIzaStoredKey123456');
      expect(hasConfiguredAiApiKey()).toBe(true);

      removeStoredAiApiKey();
      expect(getStoredAiApiKey()).toBeNull();
      expect(hasConfiguredAiApiKey()).toBe(false);
    });

    it('masks API keys securely showing only the last 4 characters', () => {
      expect(getMaskedAiApiKey('AIzaSyD7-ExampleKey9988')).toBe('••••••••••••••••9988');
      expect(getMaskedAiApiKey('12345678')).toBe('••••••••');
      expect(getMaskedAiApiKey('')).toBe('');
    });
    it('dispatches aqua_ai_key_changed event when setting and removing key', () => {
      const listener = vi.fn();
      window.addEventListener('aqua_ai_key_changed', listener);

      setStoredAiApiKey('AIzaKey123');
      expect(listener).toHaveBeenCalledTimes(1);

      removeStoredAiApiKey();
      expect(listener).toHaveBeenCalledTimes(2);

      window.removeEventListener('aqua_ai_key_changed', listener);
    });
  });

  describe('Connection Testing', () => {
    it('returns clear error message when no key is present', async () => {
      const result = await testAiAssistantConnection('');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Kein API-Schlüssel hinterlegt');
    });

    it('successfully connects when fetch returns valid response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: '{"status": "OK"}' }],
              },
            },
          ],
        }),
      });
      global.fetch = mockFetch;

      const result = await testAiAssistantConnection('AIzaValidKey');
      expect(result.success).toBe(true);
      expect(result.message).toContain('erfolgreich hergestellt');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.not.stringContaining('?key='),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-goog-api-key': 'AIzaValidKey',
          }),
        })
      );
    });

    it('returns invalid key error when status is 400 or 403', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'API_KEY_INVALID' } }),
      });
      global.fetch = mockFetch;

      const result = await testAiAssistantConnection('AIzaBadKey', 'DE');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Ungültiger Google Gemini API-Key');
    });

    it('returns friendly quota error when status is 429', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Quota exceeded' } }),
      });
      global.fetch = mockFetch;

      const result = await testAiAssistantConnection('AIzaKey');
      expect(result.success).toBe(false);
      expect(result.message).toMatch(/Kontingent|Rate Limit/i);
    });

    it('returns network error when fetch throws an exception', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network offline'));
      global.fetch = mockFetch;

      const result = await testAiAssistantConnection('AIzaKey', 'EN');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Network offline');
    });
  });

  describe('Full AI Analysis & Parsing', () => {
    it('analyzes text query and parses complete spirit specifications', async () => {
      setStoredAiApiKey('test_key');
      const mockResponse = {
        name: 'Caol Ila 2010',
        distillery: 'Caol Ila',
        bottler: 'Signatory Vintage',
        spiritType: 'Single Malt Scotch',
        region: 'Islay',
        abv: 57.1,
        age: 12,
        volumeMl: 700,
        characteristics: ['Cask Strength', 'Non-Chill Filtered'],
        colour: 'Deep Gold',
        barRole: ['Connoisseur Choice', 'Showcase Bottle'],
        caskNo: 'Cask #1024',
        caskTypes: ['Bourbon', 'Sherry Butt'],
        caskFinish: 'Oloroso Sherry Casks',
        suggestedNoseTags: ['Peat Smoke', 'Dark Chocolate'],
        suggestedTasteTags: ['Espresso', 'Brine'],
        noseTagIntensities: { 'Peat Smoke': 9, 'Dark Chocolate': 7 },
        tasteTagIntensities: { Espresso: 8, Brine: 6 },
        noseProfile: { peaty: 9, fruity: 6 },
        tasteProfile: { peaty: 10, spicy: 7 },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: '```json\n' + JSON.stringify(mockResponse) + '\n```' }],
              },
            },
          ],
        }),
      });

      const result = await analyzeSpiritFromText('Caol Ila 2010 Signatory Vintage');
      expect(result.name).toBe('Caol Ila 2010');
      expect(result.distillery).toBe('Caol Ila');
      expect(result.bottler).toBe('Signatory Vintage');
      expect(result.caskNo).toBe('Cask #1024');
      expect(result.abv).toBe(57.1);
      expect(result.characteristics).toContain('Cask Strength');
      expect(result.barRole).toContain('Connoisseur Choice');
      expect(result.suggestedNoseTags).toEqual(['Peat Smoke', 'Dark Chocolate']);
      expect(result.noseTagIntensities).toEqual({ 'Peat Smoke': 9, 'Dark Chocolate': 7 });
      expect(result.tasteTagIntensities).toEqual({ Espresso: 8, Brine: 6 });
      expect(result.noseProfile?.peaty).toBe(9);
      expect(result.tasteProfile?.peaty).toBe(10);
      expect(result.caskFinish).toBe('Oloroso Sherry Casks');
    });

    it('analyzes image query and parses beginner friendly spirit', async () => {
      setStoredAiApiKey('test_key');
      const mockResponse = {
        name: 'Glenfiddich 12',
        distillery: 'Glenfiddich',
        spiritType: 'Single Malt Scotch',
        region: 'Speyside',
        abv: 40,
        age: 12,
        volumeMl: 700,
        characteristics: ['Small Batch'],
        colour: 'Pale Gold',
        barRole: ['Beginner Friendly', 'Daily Sipper'],
        suggestedNoseTags: ['Green Apple', 'Pear'],
        suggestedTasteTags: ['Vanilla', 'Butterscotch'],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify(mockResponse) }],
              },
            },
          ],
        }),
      });

      const result = await analyzeSpiritFromImage('data:image/jpeg;base64,123456');
      expect(result.name).toBe('Glenfiddich 12');
      expect(result.barRole).toContain('Beginner Friendly');
      expect(result.barRole).toContain('Daily Sipper');
      expect(result.colour).toBe('Pale Gold');
    });

    it('sends German directives and examples when language is DE', async () => {
      setStoredAiApiKey('test_key');
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify({ name: 'Lagavulin 16', distillery: 'Lagavulin', spiritType: 'Single Malt Scotch', abv: 43 }) }],
              },
            },
          ],
        }),
      });
      global.fetch = mockFetch;

      await analyzeSpiritFromText('Lagavulin 16', { language: 'DE' });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const promptText = requestBody.contents[0].parts[0].text;
      expect(promptText).toContain('WICHTIG ZUR SPRACHE: Gib alle Notizen');
      expect(promptText).toContain('Kräftiger Torfrauch mit dunklen Rosinen');
      expect(promptText).toContain('Torfrauch');
    });

    it('sends English directives and examples when language is EN', async () => {
      setStoredAiApiKey('test_key');
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify({ name: 'Lagavulin 16', distillery: 'Lagavulin', spiritType: 'Single Malt Scotch', abv: 43 }) }],
              },
            },
          ],
        }),
      });
      global.fetch = mockFetch;

      await analyzeSpiritFromText('Lagavulin 16', { language: 'EN' });

      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const promptText = requestBody.contents[0].parts[0].text;
      expect(promptText).toContain('LANGUAGE DIRECTIVE: Provide all notes');
      expect(promptText).toContain('Rich peat smoke with dark raisins');
    });
  });

  describe('Error Handling without Key', () => {
    it('throws descriptive error when attempting text search without API key', async () => {
      await expect(analyzeSpiritFromText('Kilchoman Machir Bay')).rejects.toThrow(
        /Kein KI-Schlüssel hinterlegt/
      );
    });

    it('throws descriptive error when attempting image search without API key', async () => {
      await expect(analyzeSpiritFromImage('data:image/jpeg;base64,...')).rejects.toThrow(
        /Kein KI-Schlüssel hinterlegt/
      );
    });
  });
});
