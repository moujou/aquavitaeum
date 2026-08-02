import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../route';
import * as serverStorage from '@/lib/server-storage';
import { MOCK_SPIRITS } from '@/data/mock-spirits';

vi.mock('@/lib/server-storage', () => ({
  readSpiritsFromFile: vi.fn(),
  writeSpiritsToFile: vi.fn(),
}));

describe('API /api/spirits Route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('GET /api/spirits returns list of spirits from storage', async () => {
    vi.mocked(serverStorage.readSpiritsFromFile).mockResolvedValue(MOCK_SPIRITS);

    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.spirits).toEqual(MOCK_SPIRITS);
  });

  it('POST /api/spirits saves valid spirits to storage', async () => {
    vi.mocked(serverStorage.writeSpiritsToFile).mockResolvedValue();

    const req = new Request('http://localhost:3000/api/spirits', {
      method: 'POST',
      body: JSON.stringify({ spirits: MOCK_SPIRITS }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(serverStorage.writeSpiritsToFile).toHaveBeenCalledWith(MOCK_SPIRITS);
  });

  it('POST /api/spirits returns 400 for invalid non-array payload', async () => {
    const req = new Request('http://localhost:3000/api/spirits', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
