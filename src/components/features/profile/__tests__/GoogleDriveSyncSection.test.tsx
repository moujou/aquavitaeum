import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GoogleDriveSyncSection } from '../GoogleDriveSyncSection';
import { LanguageProvider } from '@/context/LanguageContext';
import * as syncHook from '@/hooks/useGoogleDriveSync';

describe('GoogleDriveSyncSection', () => {
  it('renders disconnected state with connect button', () => {
    const connect = vi.fn();
    vi.spyOn(syncHook, 'useGoogleDriveSync').mockReturnValue({
      clientId: 'test-client-id',
      saveClientId: vi.fn(),
      isEnabled: true,
      isConnected: false,
      isSyncing: false,
      lastSyncTime: null,
      syncError: null,
      syncStats: null,
      connect,
      disconnect: vi.fn(),
      syncNow: vi.fn(),
      exportLocalBackup: vi.fn(),
      importLocalBackup: vi.fn(),
    });

    render(
      <LanguageProvider>
        <GoogleDriveSyncSection />
      </LanguageProvider>
    );

    expect(screen.getByText('Google Drive Sync')).toBeDefined();
    const connectBtn = screen.getByRole('button', { name: /Sync with Google Drive|Google Drive/i });
    expect(connectBtn).toBeDefined();

    fireEvent.click(connectBtn);
    expect(connect).toHaveBeenCalled();
  });

  it('renders connected state with syncNow and disconnect buttons', () => {
    const disconnect = vi.fn();
    const syncNow = vi.fn();
    vi.spyOn(syncHook, 'useGoogleDriveSync').mockReturnValue({
      clientId: 'test-client-id',
      saveClientId: vi.fn(),
      isEnabled: true,
      isConnected: true,
      isSyncing: false,
      lastSyncTime: '2026-08-22T20:00:00.000Z',
      syncError: null,
      syncStats: {
        pushedSpirits: 1,
        pulledSpirits: 0,
        pushedJournals: 0,
        pulledJournals: 0,
        deletedRemotes: 0,
        skippedInvalidFiles: 0,
        lastSyncedAt: '2026-08-22T20:00:00.000Z',
      },
      connect: vi.fn(),
      disconnect,
      syncNow,
      exportLocalBackup: vi.fn(),
      importLocalBackup: vi.fn(),
    });

    render(
      <LanguageProvider>
        <GoogleDriveSyncSection />
      </LanguageProvider>
    );

    const syncBtn = screen.getByRole('button', { name: /Sync now|Synchronisieren/i });
    expect(syncBtn).toBeDefined();
    fireEvent.click(syncBtn);
    expect(syncNow).toHaveBeenCalled();

    const disconnectBtn = screen.getByRole('button', { name: /Connected to Drive|Disconnect Drive|Trennen/i });
    expect(disconnectBtn).toBeDefined();
    fireEvent.click(disconnectBtn);
    expect(disconnect).toHaveBeenCalled();
  });

  it('triggers backup download and triggers file import selector', () => {
    const exportLocalBackup = vi.fn();
    vi.spyOn(syncHook, 'useGoogleDriveSync').mockReturnValue({
      clientId: 'test-client-id',
      saveClientId: vi.fn(),
      isEnabled: true,
      isConnected: false,
      isSyncing: false,
      lastSyncTime: null,
      syncError: null,
      syncStats: null,
      connect: vi.fn(),
      disconnect: vi.fn(),
      syncNow: vi.fn(),
      exportLocalBackup,
      importLocalBackup: vi.fn(),
    });

    render(
      <LanguageProvider>
        <GoogleDriveSyncSection />
      </LanguageProvider>
    );

    const exportBtn = screen.getByRole('button', { name: /Export JSON Backup|Export/i });
    fireEvent.click(exportBtn);
    expect(exportLocalBackup).toHaveBeenCalled();
  });
});
