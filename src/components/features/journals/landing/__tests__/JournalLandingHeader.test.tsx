import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JournalLandingHeader } from '../JournalLandingHeader';
import { LanguageProvider } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';

const mockJournal: JournalWithStats = {
  id: 'journal-test',
  name: 'Speyside Selection',
  description: 'Fruity & Floral single malts',
  bottleCount: 3,
  averageRating: 88,
  latestTastedDate: '2026-02-01',
  recentImages: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

describe('JournalLandingHeader Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders actions and sort/filter dropdowns as well as subtle title and description in standard mode', () => {
    render(
      <LanguageProvider>
        <JournalLandingHeader
          journal={mockJournal}
          isSelectMode={false}
          sortBy="date_desc"
          onSortChange={vi.fn()}
          filterState={{ spiritType: 'All', minRating: 0 }}
          onFilterChange={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByRole('button', { name: /^Sort|Sortieren$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /^Filter$/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /aktionen|actions/i })).toBeDefined();
    expect(screen.getByText('Speyside Selection')).toBeDefined();
    expect(screen.getByText('Fruity & Floral single malts')).toBeDefined();
  });

  it('renders selection badge and action buttons in select mode', () => {
    const onExitSelectMode = vi.fn();
    render(
      <LanguageProvider>
        <JournalLandingHeader
          journal={mockJournal}
          isSelectMode={true}
          selectedCount={2}
          canDelete={true}
          onExitSelectMode={onExitSelectMode}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/2 selected|2 ausgewählt/i)).toBeDefined();
    const doneBtn = screen.getByRole('button', { name: /Fertig|Done/i });
    expect(doneBtn).toBeDefined();
    fireEvent.click(doneBtn);
    expect(onExitSelectMode).toHaveBeenCalled();
  });

  it('renders AI assistant button when API key is set and triggers onScanNote', () => {
    localStorage.setItem('aqua_gemini_api_key', 'mock_key');
    const onScanNote = vi.fn();

    render(
      <LanguageProvider>
        <JournalLandingHeader
          journal={mockJournal}
          onScanNote={onScanNote}
        />
      </LanguageProvider>
    );

    const scanBtn = screen.getByRole('button', { name: /Flasche scannen|Scan bottle/i });
    expect(scanBtn).toBeDefined();
    fireEvent.click(scanBtn);
    expect(onScanNote).toHaveBeenCalled();
  });

  it('triggers export journal action from dropdown', () => {
    const onExportJournal = vi.fn();

    render(
      <LanguageProvider>
        <JournalLandingHeader
          journal={mockJournal}
          onExportJournal={onExportJournal}
        />
      </LanguageProvider>
    );

    const gearBtn = screen.getByRole('button', { name: /aktionen|actions/i });
    fireEvent.click(gearBtn);

    const exportOption = screen.getByText(/journal exportieren|export journal/i);
    fireEvent.click(exportOption);

    expect(onExportJournal).toHaveBeenCalledWith('journal-test');
  });

  it('handles note import file with success feedback notice', async () => {
    const onImportNotes = vi.fn().mockResolvedValue({ importedCount: 4 });

    const { container } = render(
      <LanguageProvider>
        <JournalLandingHeader
          journal={mockJournal}
          onImportNotes={onImportNotes}
        />
      </LanguageProvider>
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    const mockFile = new File(['[{"name":"Glenfiddich"}]'], 'notes.json', { type: 'application/json' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(onImportNotes).toHaveBeenCalledWith(mockFile);
      expect(screen.getByText(/Successfully imported 4 note\(s\)!|4 Notiz\(en\) erfolgreich importiert!/i)).toBeDefined();
    });
  });
});
