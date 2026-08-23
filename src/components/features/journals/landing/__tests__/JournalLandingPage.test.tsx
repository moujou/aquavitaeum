import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JournalLandingPage } from '../JournalLandingPage';
import { NoteEmptyState } from '../NoteEmptyState';
import { LanguageProvider } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';

const MOCK_JOURNAL: JournalWithStats = {
  id: 'journal-1',
  name: 'Islay Cellar',
  description: 'Smoky drams',
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
  bottleCount: 0,
  averageRating: 0,
  latestTastedDate: null,
  recentImages: [],
};

describe('JournalLandingPage and NoteEmptyState with AI Scanner', () => {
  it('renders NoteEmptyState with Scan Button when AI key is present', () => {
    localStorage.setItem('aqua_gemini_api_key', 'test_key');
    const handleNewNote = vi.fn();
    const handleScan = vi.fn();

    render(
      <LanguageProvider>
        <NoteEmptyState onNewNote={handleNewNote} onScanNote={handleScan} />
      </LanguageProvider>
    );

    expect(screen.getByRole('button', { name: /Scan Bottle|Flasche scannen/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /New Note|Neue Notiz/i })).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /Scan Bottle|Flasche scannen/i }));
    expect(handleScan).toHaveBeenCalledOnce();
  });

  it('renders NoteEmptyState without Scan Button when no AI key is present', () => {
    localStorage.clear();
    const handleNewNote = vi.fn();
    const handleScan = vi.fn();

    render(
      <LanguageProvider>
        <NoteEmptyState onNewNote={handleNewNote} onScanNote={handleScan} />
      </LanguageProvider>
    );

    expect(screen.queryByRole('button', { name: /Scan Bottle|Flasche scannen/i })).toBeNull();
    expect(screen.getByRole('button', { name: /New Note|Neue Notiz/i })).toBeDefined();
  });

  it('renders JournalLandingPage and opens scan modal when clicking scan in empty state with key', () => {
    localStorage.setItem('aqua_gemini_api_key', 'test_key');
    const handleSelectSpirit = vi.fn();
    const handleNewNote = vi.fn();
    const handleDeleteSpirit = vi.fn().mockResolvedValue(undefined);

    render(
      <LanguageProvider>
        <JournalLandingPage
          journal={MOCK_JOURNAL}
          spirits={[]}
          layout="grid"
          isLoading={false}
          onSelectSpirit={handleSelectSpirit}
          onNewNote={handleNewNote}
          onDeleteSpirit={handleDeleteSpirit}
        />
      </LanguageProvider>
    );

    const scanBtns = screen.getAllByRole('button', { name: /Scan Bottle|Flasche scannen/i });
    expect(scanBtns.length).toBeGreaterThan(0);

    fireEvent.click(scanBtns[0]);
    expect(screen.getByText(/Cask & Spirit Assistant|Cask & Spirit Assistent/i)).toBeDefined();
  });
});
