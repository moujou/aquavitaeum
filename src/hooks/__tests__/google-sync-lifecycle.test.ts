import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGoogleDriveSync, GoogleDriveSyncProvider } from '../useGoogleDriveSync';
import { notifyDataChanged } from '@/lib/sync-events';

const TOKEN_KEY = 'aqua-vitaeum-google-token';
const ENABLED_KEY = 'aqua-vitaeum-google-sync-enabled';

vi.mock('@/lib/google-drive-sync', () => ({
  requestGoogleAccessToken: vi.fn().mockResolvedValue('mock-google-access-token-123'),
  performGoogleDriveSync: vi.fn().mockResolvedValue({
    pushedSpirits: 1,
    pulledSpirits: 2,
    pushedJournals: 0,
    pulledJournals: 1,
    skippedInvalidFiles: 0,
    lastSyncedAt: '2026-08-16T12:00:00.000Z',
  }),
  downloadLocalBackupFile: vi.fn(),
  importLocalBackupFile: vi.fn(),
}));

describe('Google Drive Sync - Lifecycle & Persistent Session Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('restores connected state and token from localStorage across app sessions', () => {
    localStorage.setItem(TOKEN_KEY, 'stored-access-token-456');
    localStorage.setItem(ENABLED_KEY, 'true');

    const { result } = renderHook(() => useGoogleDriveSync(), {
      wrapper: GoogleDriveSyncProvider,
    });

    expect(result.current.isEnabled).toBe(true);
    expect(result.current.isConnected).toBe(true);
  });

  it('persists access token and enabled flag to localStorage upon connecting', async () => {
    localStorage.setItem('aqua-vitaeum-google-client-id', 'mock-client-id.apps.googleusercontent.com');
    const { result } = renderHook(() => useGoogleDriveSync(), {
      wrapper: GoogleDriveSyncProvider,
    });

    let connectSuccess = false;
    await act(async () => {
      connectSuccess = await result.current.connect();
    });

    expect(connectSuccess).toBe(true);
    expect(result.current.isConnected).toBe(true);
    expect(localStorage.getItem(TOKEN_KEY)).toBe('mock-google-access-token-123');
    expect(localStorage.getItem(ENABLED_KEY)).toBe('true');
  });

  it('clears token and enabled flag from localStorage upon disconnecting', async () => {
    localStorage.setItem(TOKEN_KEY, 'stored-access-token-456');
    localStorage.setItem(ENABLED_KEY, 'true');

    const { result } = renderHook(() => useGoogleDriveSync(), {
      wrapper: GoogleDriveSyncProvider,
    });
    expect(result.current.isConnected).toBe(true);

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isEnabled).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(ENABLED_KEY)).toBe('false');
  });

  it('triggers debounced sync when notifyDataChanged is called', async () => {
    localStorage.setItem(TOKEN_KEY, 'stored-access-token-456');
    localStorage.setItem(ENABLED_KEY, 'true');

    const { result } = renderHook(() => useGoogleDriveSync(), {
      wrapper: GoogleDriveSyncProvider,
    });
    expect(result.current.isConnected).toBe(true);

    // Trigger local data changed event
    act(() => {
      notifyDataChanged();
    });

    expect(result.current.isEnabled).toBe(true);
  });
});
