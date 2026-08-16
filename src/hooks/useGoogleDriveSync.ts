'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  requestGoogleAccessToken,
  performGoogleDriveSync,
  downloadLocalBackupFile,
  importLocalBackupFile,
  SyncStats,
} from '@/lib/google-drive-sync';
import { DATA_CHANGED_EVENT } from '@/lib/sync-events';

const TOKEN_STORAGE_KEY = 'aqua-vitaeum-google-token';
const CLIENT_ID_STORAGE_KEY = 'aqua-vitaeum-google-client-id';
const ENABLED_STORAGE_KEY = 'aqua-vitaeum-google-sync-enabled';
const LAST_SYNC_KEY = 'aqua-vitaeum-last-sync-time';

export function useGoogleDriveSync() {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ENABLED_STORAGE_KEY) === 'true';
  });

  const [accessToken, setAccessToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  });

  const [clientId, setClientId] = useState<string>(() => {
    const envClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    if (typeof window === 'undefined') return envClientId;
    return localStorage.getItem(CLIENT_ID_STORAGE_KEY) || envClientId;
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncingRef = useRef(isSyncing);

  useEffect(() => {
    isSyncingRef.current = isSyncing;
  }, [isSyncing]);

  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(LAST_SYNC_KEY);
  });
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);

  const saveClientId = useCallback((newId: string) => {
    setClientId(newId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CLIENT_ID_STORAGE_KEY, newId);
    }
  }, []);

  const connect = useCallback(async (): Promise<boolean> => {
    const idToUse = clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!idToUse) {
      setSyncError('Google Drive Client-ID ist nicht hinterlegt.');
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const token = await requestGoogleAccessToken(idToUse);
      setAccessToken(token);
      setIsEnabled(true);

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(ENABLED_STORAGE_KEY, 'true');
      }

      // Initial sync immediately after connecting
      const stats = await performGoogleDriveSync(token);
      setSyncStats(stats);
      setLastSyncTime(stats.lastSyncedAt);
      setIsSyncing(false);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Google Drive Connect Error]', err);
      setSyncError(message);
      setIsSyncing(false);
      return false;
    }
  }, [clientId]);

  const disconnect = useCallback(() => {
    setAccessToken(null);
    setIsEnabled(false);
    setSyncError(null);
    setSyncStats(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.setItem(ENABLED_STORAGE_KEY, 'false');
    }
  }, []);

  const syncNow = useCallback(async (): Promise<SyncStats | null> => {
    if (!isEnabled) return null;

    let token = accessToken;

    if (!token) {
      // If token expired, request a new one
      const idToUse = clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!idToUse) {
        setSyncError('Google Client ID is missing.');
        return null;
      }

      try {
        token = await requestGoogleAccessToken(idToUse);
        setAccessToken(token);
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setSyncError(message);
        return null;
      }
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const stats = await performGoogleDriveSync(token);
      setSyncStats(stats);
      setLastSyncTime(stats.lastSyncedAt);
      setIsSyncing(false);
      return stats;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[Google Drive Sync Error]', err);
      
      // If token expired (401), clear invalid token from localStorage
      if (message.includes('401') || message.toLowerCase().includes('unauthorized')) {
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
      
      setSyncError(message);
      setIsSyncing(false);
      return null;
    }
  }, [accessToken, clientId, isEnabled]);

  const syncNowRef = useRef(syncNow);
  useEffect(() => {
    syncNowRef.current = syncNow;
  }, [syncNow]);

  // ── Smart Zero-Friction Auto-Sync ──────────────────────────────────────────
  // 1. Initial background pull on mount
  // 2. Debounced fast auto-sync (1.0s) on local data changes (save, edit, delete)
  // 3. Immediate background pull when opening / focusing the app (window focus & visibilitychange: visible)
  // 4. Immediate background push when leaving / minimizing the app (visibilitychange: hidden)
  // 5. Periodic background sync every 5 minutes
  useEffect(() => {
    if (!isEnabled || !accessToken) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const handleDataChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!isSyncingRef.current) {
          syncNowRef.current();
        }
      }, 1000);
    };

    const handleVisibilityOrFocus = () => {
      if (!isSyncingRef.current) {
        syncNowRef.current();
      }
    };

    // Initial silent pull on mount (non-blocking)
    const initialTimer = setTimeout(() => {
      if (!isSyncingRef.current) {
        syncNowRef.current();
      }
    }, 150);

    // Periodic sync every 5 minutes
    const periodicInterval = setInterval(() => {
      if (!isSyncingRef.current) {
        syncNowRef.current();
      }
    }, 5 * 60 * 1000);

    window.addEventListener(DATA_CHANGED_EVENT, handleDataChange);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(periodicInterval);
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener(DATA_CHANGED_EVENT, handleDataChange);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [isEnabled, accessToken]);

  return {
    isEnabled,
    isConnected: !!accessToken,
    isSyncing,
    lastSyncTime,
    syncError,
    syncStats,
    clientId,
    saveClientId,
    connect,
    disconnect,
    syncNow,
    exportLocalBackup: downloadLocalBackupFile,
    importLocalBackup: importLocalBackupFile,
  };
}
