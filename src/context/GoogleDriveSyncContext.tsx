'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  requestGoogleAccessToken,
  performGoogleDriveSync,
  downloadLocalBackupFile,
  importLocalBackupFile,
  SyncStats,
} from '@/lib/google-drive-sync';
import { DATA_MUTATED_EVENT } from '@/lib/sync-events';

const TOKEN_STORAGE_KEY = 'aqua-vitaeum-google-token';
const TOKEN_EXPIRES_KEY = 'aqua-vitaeum-google-token-expires-at';
const CLIENT_ID_STORAGE_KEY = 'aqua-vitaeum-google-client-id';
const ENABLED_STORAGE_KEY = 'aqua-vitaeum-google-sync-enabled';
const LAST_SYNC_KEY = 'aqua-vitaeum-last-sync-time';

export interface GoogleDriveSyncContextValue {
  isEnabled: boolean;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
  syncStats: SyncStats | null;
  clientId: string;
  saveClientId: (newId: string) => void;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  syncNow: () => Promise<SyncStats | null>;
  exportLocalBackup: () => Promise<void>;
  importLocalBackup: (file: File) => Promise<{ importedSpirits: number; importedJournals: number }>;
}

const GoogleDriveSyncContext = createContext<GoogleDriveSyncContextValue | null>(null);

export function GoogleDriveSyncProvider({ children }: { children: React.ReactNode }) {
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
      const token = await requestGoogleAccessToken(idToUse, 'consent');
      setAccessToken(token);
      setIsEnabled(true);
      const expiresAt = Date.now() + 3500 * 1000;

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt));
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
      localStorage.removeItem(TOKEN_EXPIRES_KEY);
      localStorage.setItem(ENABLED_STORAGE_KEY, 'false');
    }
  }, []);

  const syncNow = useCallback(async (): Promise<SyncStats | null> => {
    if (!isEnabled) return null;

    const idToUse = clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const tokenExpiresAt =
      typeof window !== 'undefined' ? Number(localStorage.getItem(TOKEN_EXPIRES_KEY) || '0') : 0;
    const isExpired = !accessToken || (tokenExpiresAt > 0 && Date.now() >= tokenExpiresAt);

    let token = accessToken;

    // If token is missing or expired, attempt a silent background refresh
    if (!token || isExpired) {
      if (!idToUse) {
        setSyncError('Google Client ID is missing.');
        return null;
      }

      try {
        token = await requestGoogleAccessToken(idToUse, '');
        setAccessToken(token);
        const expiresAt = Date.now() + 3500 * 1000;
        if (typeof window !== 'undefined') {
          localStorage.setItem(TOKEN_STORAGE_KEY, token);
          localStorage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt));
        }
      } catch (refreshErr) {
        console.warn('[Aqua Vitaeum] Silent token refresh failed, using existing token if present:', refreshErr);
        if (!token) {
          try {
            token = await requestGoogleAccessToken(idToUse, 'consent');
            setAccessToken(token);
            const expiresAt = Date.now() + 3500 * 1000;
            if (typeof window !== 'undefined') {
              localStorage.setItem(TOKEN_STORAGE_KEY, token);
              localStorage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt));
            }
          } catch (consentErr) {
            const msg = consentErr instanceof Error ? consentErr.message : String(consentErr);
            setSyncError(msg);
            return null;
          }
        }
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

      // If 401 Unauthorized, retry ONCE with silent re-auth
      if (
        (message.includes('401') || message.toLowerCase().includes('unauthorized')) &&
        idToUse
      ) {
        try {
          const freshToken = await requestGoogleAccessToken(idToUse, '');
          setAccessToken(freshToken);
          const expiresAt = Date.now() + 3500 * 1000;
          if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_STORAGE_KEY, freshToken);
            localStorage.setItem(TOKEN_EXPIRES_KEY, String(expiresAt));
          }
          const retryStats = await performGoogleDriveSync(freshToken);
          setSyncStats(retryStats);
          setLastSyncTime(retryStats.lastSyncedAt);
          setIsSyncing(false);
          return retryStats;
        } catch {
          // Token refresh failed completely
          setAccessToken(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(TOKEN_EXPIRES_KEY);
          }
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

  // ── Smart 24/7 Background Auto-Sync Engine ────────────────────────────────
  // 1. Initial background pull immediately on mount
  // 2. Fast debounced auto-sync (1.0s) on local user data changes (save, edit, delete, photo added)
  // 3. Immediate 0s background pull when opening / focusing the app (window focus & visibilitychange)
  // 4. Ultra-fast 8s heartbeat poll when app is active in the foreground (live 2-device sync!)
  // 5. Battery-friendly 3min heartbeat poll when app is minimized / in background
  useEffect(() => {
    if (!isEnabled) return;

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
      if (document.visibilityState === 'visible' && !isSyncingRef.current) {
        syncNowRef.current();
      }
    };

    // Initial silent pull on mount
    const initialTimer = setTimeout(() => {
      if (!isSyncingRef.current) {
        syncNowRef.current();
      }
    }, 150);

    // Foreground 8s heartbeat poll
    const foregroundInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isSyncingRef.current) {
        syncNowRef.current();
      }
    }, 8 * 1000);

    // Background 3min heartbeat poll
    const backgroundInterval = setInterval(() => {
      if (document.visibilityState !== 'visible' && !isSyncingRef.current) {
        syncNowRef.current();
      }
    }, 3 * 60 * 1000);

    window.addEventListener(DATA_MUTATED_EVENT, handleDataChange);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(foregroundInterval);
      clearInterval(backgroundInterval);
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener(DATA_MUTATED_EVENT, handleDataChange);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, [isEnabled]);

  const value: GoogleDriveSyncContextValue = {
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

  return (
    <GoogleDriveSyncContext.Provider value={value}>
      {children}
    </GoogleDriveSyncContext.Provider>
  );
}

export function useGoogleDriveSync(): GoogleDriveSyncContextValue {
  const ctx = useContext(GoogleDriveSyncContext);
  if (!ctx) {
    return {
      isEnabled: false,
      isConnected: false,
      isSyncing: false,
      lastSyncTime: null,
      syncError: null,
      syncStats: null,
      clientId: '',
      saveClientId: () => {},
      connect: async () => false,
      disconnect: () => {},
      syncNow: async () => null,
      exportLocalBackup: async () => {},
      importLocalBackup: async () => ({ importedSpirits: 0, importedJournals: 0 }),
    };
  }
  return ctx;
}
