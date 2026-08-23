import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GlobalSearch from '../GlobalSearch';
import { JournalWithStats } from '@/hooks/useJournals';
import { LanguageProvider } from '@/context/LanguageContext';
import { db } from '@/lib/db';
import { Spirit } from '@/types/spirit.types';

const mockJournal: JournalWithStats = {
  id: 'j-1',
  name: 'Islay Malts',
  description: 'Smoky whiskies',
  bottleCount: 3,
  averageRating: 4.8,
  latestTastedDate: '2026-01-01',
  recentImages: [],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const mockSpirit: Spirit = {
  id: 's-1',
  journalId: 'j-1',
  name: 'Laphroaig 10',
  distillery: 'Laphroaig',
  region: 'Islay',
  abv: 40,
  dateTasted: '2026-01-01',
  rating100: 92,
  starRating: 5,
  colour: 'Pale Gold',
  finishNotes: 'Smoky finish',
  spiritType: 'Single Malt Scotch',
  flavorTags: ['Peat', 'Smoke'],
  noseProfile: { fruity: 1, floral: 1, spicy: 3, cereal: 1, peaty: 8, sulphury: 0, feinty: 1, nutty: 1, woody: 3, winey: 0, chocolate: 0 },
  tasteProfile: { fruity: 1, floral: 1, spicy: 3, cereal: 1, peaty: 9, sulphury: 0, feinty: 1, nutty: 1, woody: 4, winey: 0, chocolate: 0 },
};

vi.mock('@/lib/db', () => ({
  db: {
    spirits: {
      toArray: vi.fn(),
    },
  },
}));

describe('GlobalSearch Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.mocked(db.spirits.toArray).mockResolvedValue([mockSpirit]);
  });

  it('renders search input field with placeholder', () => {
    render(
      <LanguageProvider>
        <GlobalSearch
          journals={[mockJournal]}
          setActiveJournalId={vi.fn()}
          setActiveView={vi.fn()}
          selectSpirit={vi.fn()}
          globalSearchQuery=""
          setGlobalSearchQuery={vi.fn()}
          globalTypeFilter="All"
          setGlobalTypeFilter={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByPlaceholderText(/Search spirits|Suche nach Notizen/i)).toBeDefined();
  });

  it('filters results based on search query and displays matches', async () => {
    render(
      <LanguageProvider>
        <GlobalSearch
          journals={[mockJournal]}
          setActiveJournalId={vi.fn()}
          setActiveView={vi.fn()}
          selectSpirit={vi.fn()}
          globalSearchQuery="Laphroaig"
          setGlobalSearchQuery={vi.fn()}
          globalTypeFilter="All"
          setGlobalTypeFilter={vi.fn()}
        />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Laphroaig 10')).toBeDefined();
      expect(screen.getByText(/Islay Malts/)).toBeDefined();
    });
  });

  it('navigates to spirit on result click', async () => {
    const onNavigateToSpirit = vi.fn();
    const setGlobalSearchQuery = vi.fn();

    render(
      <LanguageProvider>
        <GlobalSearch
          journals={[mockJournal]}
          setActiveJournalId={vi.fn()}
          setActiveView={vi.fn()}
          selectSpirit={vi.fn()}
          globalSearchQuery="Laphroaig"
          setGlobalSearchQuery={setGlobalSearchQuery}
          globalTypeFilter="All"
          setGlobalTypeFilter={vi.fn()}
          onNavigateToSpirit={onNavigateToSpirit}
        />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Laphroaig 10')).toBeDefined();
    });

    fireEvent.click(screen.getByText('Laphroaig 10'));
    expect(onNavigateToSpirit).toHaveBeenCalledWith('s-1', 'j-1');
  });
});
