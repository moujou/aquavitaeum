import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JournalLandingPage } from '../JournalLandingPage';
import { NoteEmptyState } from '../NoteEmptyState';
import { LanguageProvider } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';
import { Spirit, FlavorProfile } from '@/types/spirit.types';

const MOCK_JOURNAL: JournalWithStats = {
  id: 'journal-1',
  name: 'Islay Cellar',
  description: 'Smoky drams',
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-01T00:00:00Z',
  bottleCount: 2,
  averageRating: 92,
  latestTastedDate: '2026-06-02',
  recentImages: [],
};

const MOCK_SPIRIT_1: Spirit = {
  id: 'spirit-1',
  journalId: 'journal-1',
  spiritType: 'Single Malt Scotch',
  distillery: 'Ardbeg',
  name: 'Uigeadail',
  region: 'Islay',
  abv: 54.2,
  dateTasted: '2026-06-02',
  rating100: 92,
  starRating: 4.5,
  colour: 'Deep Copper',
  finishNotes: 'Long and smoky',
  flavorTags: ['Peat Smoke', 'Dark Chocolate'],
  noseProfile: {} as FlavorProfile,
  tasteProfile: {} as FlavorProfile,
};

const MOCK_SPIRIT_2: Spirit = {
  id: 'spirit-2',
  journalId: 'journal-1',
  spiritType: 'Bourbon',
  distillery: 'Buffalo Trace',
  name: 'Eagle Rare 10',
  region: 'Kentucky',
  abv: 45.0,
  dateTasted: '2026-06-01',
  rating100: 86,
  starRating: 4,
  colour: 'Amber',
  finishNotes: 'Oak and vanilla',
  flavorTags: ['Vanilla', 'Oak'],
  noseProfile: {} as FlavorProfile,
  tasteProfile: {} as FlavorProfile,
};

describe('JournalLandingPage and NoteEmptyState with AI Scanner', () => {
  it('renders loading state when isLoading is true', () => {
    render(
      <LanguageProvider>
        <JournalLandingPage
          journal={MOCK_JOURNAL}
          spirits={[]}
          layout="grid"
          isLoading={true}
          onSelectSpirit={vi.fn()}
          onNewNote={vi.fn()}
          onDeleteSpirit={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Uncasking...')).toBeDefined();
  });

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

  it('renders JournalLandingPage in grid layout and selects spirit', () => {
    const handleSelectSpirit = vi.fn();
    render(
      <LanguageProvider>
        <JournalLandingPage
          journal={MOCK_JOURNAL}
          spirits={[MOCK_SPIRIT_1]}
          layout="grid"
          isLoading={false}
          onSelectSpirit={handleSelectSpirit}
          onNewNote={vi.fn()}
          onDeleteSpirit={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Ardbeg')).toBeDefined();
    expect(screen.getByText('Uigeadail')).toBeDefined();

    fireEvent.click(screen.getByText('Uigeadail'));
    expect(handleSelectSpirit).toHaveBeenCalledWith('spirit-1');
  });

  it('renders JournalLandingPage in list layout and selects spirit', () => {
    const handleSelectSpirit = vi.fn();
    render(
      <LanguageProvider>
        <JournalLandingPage
          journal={MOCK_JOURNAL}
          spirits={[MOCK_SPIRIT_1]}
          layout="list"
          isLoading={false}
          onSelectSpirit={handleSelectSpirit}
          onNewNote={vi.fn()}
          onDeleteSpirit={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Ardbeg')).toBeDefined();
    expect(screen.getByText('Uigeadail')).toBeDefined();

    fireEvent.click(screen.getByText('Uigeadail'));
    expect(handleSelectSpirit).toHaveBeenCalledWith('spirit-1');
  });

  it('filters spirits by category and shows reset button when all notes are filtered out', () => {
    render(
      <LanguageProvider>
        <JournalLandingPage
          journal={MOCK_JOURNAL}
          spirits={[MOCK_SPIRIT_1, MOCK_SPIRIT_2]}
          layout="grid"
          isLoading={false}
          onSelectSpirit={vi.fn()}
          onNewNote={vi.fn()}
          onDeleteSpirit={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Uigeadail')).toBeDefined();
    expect(screen.getByText('Eagle Rare 10')).toBeDefined();

    // Open filter dropdown
    const filterBtn = screen.getByRole('button', { name: /^Filter$/i });
    fireEvent.click(filterBtn);

    // Filter by Min Rating 90+ (Uigeadail 92 matches, Eagle Rare 86 is filtered out)
    const chip90 = screen.getByRole('button', { name: '90+' });
    fireEvent.click(chip90);

    expect(screen.getByText('Uigeadail')).toBeDefined();
    expect(screen.queryByText('Eagle Rare 10')).toBeNull();

    // Filter by spirit type to Rye (which neither has)
    const select = screen.getByLabelText(/Spirit Type|Spirituosen-Typ/i);
    fireEvent.change(select, { target: { value: 'Rye Whiskey' } });

    // Should show empty filtered state
    expect(screen.getByText(/No notes match the active filters|Keine Notizen entsprechen den aktiven Filtern/i)).toBeDefined();

    // Click reset filters button
    const resetBtns = screen.getAllByRole('button', { name: /Reset Filters|Filter zurücksetzen/i });
    fireEvent.click(resetBtns[0]);

    // Both notes should be visible again
    expect(screen.getByText('Uigeadail')).toBeDefined();
    expect(screen.getByText('Eagle Rare 10')).toBeDefined();
  });

  it('handles bulk delete in landing page select mode', async () => {
    const onDeleteSpirit = vi.fn().mockResolvedValue(undefined);
    render(
      <LanguageProvider>
        <JournalLandingPage
          journal={MOCK_JOURNAL}
          spirits={[MOCK_SPIRIT_1]}
          layout="grid"
          isLoading={false}
          onSelectSpirit={vi.fn()}
          onNewNote={vi.fn()}
          onDeleteSpirit={onDeleteSpirit}
        />
      </LanguageProvider>
    );

    // Open Actions and enter select mode
    const gearBtn = screen.getByRole('button', { name: /aktionen|actions/i });
    fireEvent.click(gearBtn);
    const selectModeItem = screen.getByText(/notizen auswählen|select notes/i);
    fireEvent.click(selectModeItem);

    // Select the spirit card
    fireEvent.click(screen.getByText('Uigeadail'));

    // Open Select Mode Actions
    const actionsBtn = screen.getByRole('button', { name: /aktionen|actions/i });
    fireEvent.click(actionsBtn);

    // Click Delete Notes in dropdown
    const deleteOption = screen.getByText(/notizen löschen|delete notes/i);
    fireEvent.click(deleteOption);

    // Confirm dialog
    const confirmBtn = screen.getByRole('button', { name: /löschen|delete/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(onDeleteSpirit).toHaveBeenCalledWith('spirit-1');
    });
  });
});
