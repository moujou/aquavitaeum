import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteGridView } from '../layouts/NoteGridView';
import { NoteListView } from '../layouts/NoteListView';
import { JournalLandingHeader } from '../JournalLandingHeader';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { JournalWithStats } from '@/hooks/useJournals';
import { LanguageProvider } from '@/context/LanguageContext';
import * as aiConfigHook from '@/hooks/useAiAssistantConfig';

const mockSpirit = MOCK_SPIRITS[0];

const mockJournal: JournalWithStats = {
  id: 'journal-1',
  name: 'Scotch Collection',
  description: 'Single malts and blends',
  bottleCount: 1,
  averageRating: 4.5,
  latestTastedDate: '2026-01-01T00:00:00Z',
  recentImages: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('Journal Landing Layouts & Header', () => {
  describe('NoteGridView', () => {
    it('renders spirits in a grid layout and triggers onSelect', () => {
      const onSelect = vi.fn();
      render(
        <LanguageProvider>
          <NoteGridView
            spirits={[mockSpirit]}
            onSelect={onSelect}
            isSelectMode={false}
            selectedIds={new Set()}
            onToggleSelect={vi.fn()}
            onTouchStart={vi.fn()}
            cancelLongPress={vi.fn()}
            onTouchEnd={vi.fn()}
          />
        </LanguageProvider>
      );

      expect(screen.getByText(mockSpirit.name)).toBeDefined();
      fireEvent.click(screen.getByText(mockSpirit.name));
      expect(onSelect).toHaveBeenCalledWith(mockSpirit.id);
    });
  });

  describe('NoteListView', () => {
    it('renders spirits in a list layout and triggers onToggleSelect in select mode', () => {
      const onToggleSelect = vi.fn();
      render(
        <LanguageProvider>
          <NoteListView
            spirits={[mockSpirit]}
            onSelect={vi.fn()}
            isSelectMode={true}
            selectedIds={new Set([mockSpirit.id])}
            onToggleSelect={onToggleSelect}
            onTouchStart={vi.fn()}
            cancelLongPress={vi.fn()}
            onTouchEnd={vi.fn()}
          />
        </LanguageProvider>
      );

      expect(screen.getByText(mockSpirit.name)).toBeDefined();
      fireEvent.click(screen.getByText(mockSpirit.name));
      expect(onToggleSelect).toHaveBeenCalledWith(mockSpirit.id);
    });
  });

  describe('JournalLandingHeader', () => {
    it('renders journal title, stats, and green AI button when hasAiKey is true', () => {
      vi.spyOn(aiConfigHook, 'useAiAssistantConfig').mockReturnValue({
        hasAiKey: true,
      });

      const onScanNote = vi.fn();
      render(
        <LanguageProvider>
          <JournalLandingHeader
            journal={mockJournal}
            noteCount={1}
            onScanNote={onScanNote}
            language="DE"
          />
        </LanguageProvider>
      );

      expect(screen.getByText('Scotch Collection')).toBeDefined();

      const aiBtn = screen.getByTitle(/Cask & Spirit Assistent/);
      expect(aiBtn).toBeDefined();
      fireEvent.click(aiBtn);
      expect(onScanNote).toHaveBeenCalled();
    });

    it('renders select mode controls with exit button', () => {
      const onExitSelectMode = vi.fn();

      render(
        <LanguageProvider>
          <JournalLandingHeader
            journal={mockJournal}
            noteCount={1}
            isSelectMode={true}
            selectedCount={1}
            canDelete={true}
            onExitSelectMode={onExitSelectMode}
            language="DE"
          />
        </LanguageProvider>
      );

      expect(screen.getByText('Scotch Collection')).toBeDefined();
      const doneBtn = screen.getByTitle('Fertig');
      expect(doneBtn).toBeDefined();
      fireEvent.click(doneBtn);
      expect(onExitSelectMode).toHaveBeenCalled();
    });

    it('triggers onConfirmDelete when clicking delete in select mode dropdown', () => {
      const onConfirmDelete = vi.fn();

      render(
        <LanguageProvider>
          <JournalLandingHeader
            journal={mockJournal}
            noteCount={1}
            isSelectMode={true}
            selectedCount={1}
            canDelete={true}
            onConfirmDelete={onConfirmDelete}
            language="DE"
          />
        </LanguageProvider>
      );

      const gearBtn = screen.getByRole('button', { name: /Aktionen|Actions/i });
      fireEvent.click(gearBtn);

      const deleteOption = screen.getByRole('button', { name: /Notizen löschen|Delete Notes/i });
      fireEvent.click(deleteOption);

      expect(onConfirmDelete).toHaveBeenCalled();
    });

    it('triggers onExportJournal via actions dropdown', () => {
      const onExportJournal = vi.fn();

      render(
        <LanguageProvider>
          <JournalLandingHeader
            journal={mockJournal}
            noteCount={1}
            onExportJournal={onExportJournal}
            language="DE"
          />
        </LanguageProvider>
      );

      const gearBtn = screen.getByRole('button', { name: /Aktionen|Actions/i });
      fireEvent.click(gearBtn);

      const exportOption = screen.getByRole('button', { name: /Als Datei exportieren|Export/i });
      fireEvent.click(exportOption);
      expect(onExportJournal).toHaveBeenCalledWith(mockJournal.id);
    });
  });
});
