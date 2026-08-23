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
        name: 'Ardbeg Uigeadail',
        distillery: 'Ardbeg',
        spiritType: 'Single Malt Scotch',
        region: 'Islay',
        abv: 54.2,
        age: 10,
        volumeMl: 700,
        characteristics: ['Cask Strength', 'Non-Chill Filtered'],
        colour: 'Deep Gold',
        barRole: ['Connoisseur Choice', 'Showcase Bottle'],
        caskTypes: ['Bourbon', 'Sherry Butt'],
        caskFinish: 'Oloroso Sherry Casks',
        suggestedNoseTags: ['Peat Smoke', 'Dark Chocolate'],
        suggestedTasteTags: ['Espresso', 'Brine'],
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

      const result = await analyzeSpiritFromText('Ardbeg Uigeadail');
      expect(result.name).toBe('Ardbeg Uigeadail');
      expect(result.distillery).toBe('Ardbeg');
      expect(result.abv).toBe(54.2);
      expect(result.characteristics).toContain('Cask Strength');
      expect(result.barRole).toContain('Connoisseur Choice');
      expect(result.suggestedNoseTags).toEqual(['Peat Smoke', 'Dark Chocolate']);
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
