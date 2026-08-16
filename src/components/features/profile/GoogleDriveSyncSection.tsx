'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useGoogleDriveSync } from '@/hooks/useGoogleDriveSync';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Download,
  Upload,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function GoogleDriveSyncSection() {
  const { t } = useLanguage();
  const {
    isEnabled,
    isConnected,
    isSyncing,
    lastSyncTime,
    syncError,
    syncStats,
    connect,
    disconnect,
    syncNow,
    exportLocalBackup,
    importLocalBackup,
  } = useGoogleDriveSync();

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus(null);
      const result = await importLocalBackup(file);
      setImportStatus(
        `${result.importedSpirits} Tastings & ${result.importedJournals} Journals importiert!`
      );
      setTimeout(() => {
        setImportStatus(null);
        window.location.reload();
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setImportStatus(`Fehler: ${message}`);
    }
  };

  const formattedLastSync = lastSyncTime
    ? new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      {/* ── Main Settings Row 3: Google Drive Sync ─────────────────────── */}
      <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-black/[0.02] transition-colors">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
          {/* Official Google G Logo Badge */}
          <div className="w-9 h-9 rounded-lg bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 flex items-center justify-center text-[var(--forest-green)] shrink-0">
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm sm:text-base font-semibold text-[var(--foreground)] truncate">
              {t('googleSyncTitle')}
            </p>
            <p className="font-body text-xs text-[var(--sepia-muted)] mt-0.5 truncate">
              {isSyncing ? (
                <span className="inline-flex items-center gap-1.5 text-[var(--forest-green)] font-medium">
                  <RefreshCw size={11} className="animate-spin shrink-0" />
                  <span>{t('googleSyncing')}</span>
                </span>
              ) : isEnabled && isConnected ? (
                formattedLastSync
                  ? `${t('googleSyncLastSynced')}: ${formattedLastSync}`
                  : t('googleSyncConnected')
              ) : (
                t('googleSyncOffline')
              )}
            </p>
          </div>
        </div>

        {/* Minimalist Cloud / CloudOff Icon Toggle — Always accessible so user can de-sync at any time */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isEnabled && isConnected ? (
            <button
              type="button"
              onClick={disconnect}
              className="w-9 h-9 rounded-lg bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs flex items-center justify-center transition-all cursor-pointer hover:bg-[var(--wood-dark)] active:scale-95"
              title={`${t('googleSyncConnected')} · ${t('googleSyncDisconnect')}`}
              aria-label={t('googleSyncConnected')}
            >
              <Cloud size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => connect()}
              className="w-9 h-9 rounded-lg bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5 shadow-xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title={t('googleSyncConnect')}
              aria-label={t('googleSyncConnect')}
            >
              <CloudOff size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Connected Sync Status Sub-Bar */}
      {isEnabled && isConnected && (
        <div className="p-3.5 bg-[var(--pub-bg)]/60 border-t border-[var(--parchment-divider)] flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 size={15} className="text-[var(--forest-green)] shrink-0" />
            <span className="text-xs font-body text-[var(--sepia-muted)] truncate">
              {syncStats
                ? `${syncStats.pushedSpirits} hochgeladen, ${syncStats.pulledSpirits} geladen`
                : 'Automatische Synchronisation aktiv'}
            </span>
          </div>

          <button
            type="button"
            disabled={isSyncing}
            onClick={() => syncNow()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--forest-green)] hover:bg-[var(--wood-dark)] text-[var(--parchment-bg)] font-display text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 shrink-0"
            title={t('googleSyncNow')}
          >
            <RefreshCw size={12} className={cn(isSyncing && 'animate-spin')} />
            <span>{isSyncing ? t('googleSyncing') : t('googleSyncNow')}</span>
          </button>
        </div>
      )}

      {/* Error Message Toast */}
      {syncError && (
        <div className="m-3 p-2.5 flex items-center gap-2 text-xs text-red-700 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900 animate-fade-in">
          <AlertCircle size={15} className="shrink-0" />
          <span className="truncate">{syncError}</span>
        </div>
      )}

      {/* ── Main Settings Row 4: Offline JSON Backup ─────────────────────── */}
      <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-black/[0.02] transition-colors border-t border-[var(--parchment-divider)]">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
          <div className="w-9 h-9 rounded-lg bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 flex items-center justify-center text-[var(--forest-green)] shrink-0">
            <HardDrive size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm sm:text-base font-semibold text-[var(--foreground)] truncate">
              Offline Datensicherung
            </p>
            <p className="font-body text-xs text-[var(--sepia-muted)] mt-0.5 truncate">
              Manuelles Backup als .json Datei
            </p>
          </div>
        </div>

        {/* Distinct 2-Button Icon Group with Fat-Finger Spacing */}
        <div className="flex items-center gap-2 shrink-0 select-none">
          <button
            type="button"
            onClick={() => exportLocalBackup()}
            className="w-9 h-9 rounded-lg bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
            title={t('exportLocalJson')}
            aria-label={t('exportLocalJson')}
          >
            <Download size={18} />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-lg bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-xs"
            title={t('importLocalJson')}
            aria-label={t('importLocalJson')}
          >
            <Upload size={18} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
        </div>
      </div>

      {importStatus && (
        <div className="mx-4 mb-3 text-xs text-[var(--forest-green)] bg-[var(--forest-green)]/10 px-3 py-2 rounded-md border border-[var(--forest-green)]/30 font-medium animate-fade-in">
          {importStatus}
        </div>
      )}

      {/* Privacy Notice Banner in Atelier Clover Green */}
      <div className="p-3.5 sm:p-4 bg-[var(--forest-green)]/10 border-t border-[var(--forest-green)]/25 flex items-start gap-2.5 text-xs text-[var(--sepia-text)] leading-relaxed">
        <ShieldCheck size={17} className="text-[var(--forest-green)] shrink-0 mt-0.5" />
        <span>{t('privacyNoteGoogle')}</span>
      </div>
    </>
  );
}
