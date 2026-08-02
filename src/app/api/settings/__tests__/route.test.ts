import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';

vi.mock('@/lib/settings-storage', () => ({
  readSettingsFromFile: vi.fn().mockResolvedValue({ language: 'EN' }),
  writeSettingsToFile: vi.fn().mockResolvedValue(undefined),
}));

describe('Settings API Route (/api/settings)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET returns settings object with HTTP 200', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.settings).toEqual({ language: 'EN' });
  });

  it('POST updates language setting to DE with HTTP 200', async () => {
    const request = new Request('http://localhost/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'DE' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.settings).toEqual({ language: 'DE' });
  });

  it('POST returns HTTP 400 when given invalid language string', async () => {
    const request = new Request('http://localhost/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'ES' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });
});
