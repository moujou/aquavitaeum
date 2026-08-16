import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JournalsOverview } from '../JournalsOverview';
import { LanguageProvider } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';

describe('JournalsOverview Actions & Dropdown', () => {
  const mockJournals: JournalWithStats[] = [
    {
      id: 'journal-1',
      name: 'Highland Whiskies',
      description: 'Single malts from the Highlands',
      createdAt: '2026-08-16',
      totalNotes: 5,
      avgRating: 88,
      avgStarRating: 4.5,
      spiritTypes: ['Single Malt Scotch'],
    },
    {
      id: 'journal-2',
      name: 'Islay Peat Bombs',
      description: 'Heavily peated malts',
      createdAt: '2026-08-16',
      totalNotes: 8,
      avgRating: 92,
      avgStarRating: 5,
      spiritTypes: ['Single Malt Scotch'],
    },
  ];

  it('renders PageActionsDropdown gear button and opens actions menu', () => {
    render(
      <LanguageProvider>
        <JournalsOverview
          journals={mockJournals}
          onCreateJournal={vi.fn()}
          onRenameJournal={vi.fn()}
          onDeleteJournal={vi.fn()}
          onSelectJournal={vi.fn()}
        />
      </LanguageProvider>
    );

    const gearBtn = screen.getByRole('button', { name: /aktionen|actions/i });
    expect(gearBtn).toBeDefined();

    // Open dropdown
    fireEvent.click(gearBtn);

    expect(screen.getByText(/journale auswählen|select journals/i)).toBeDefined();
    expect(screen.getByText(/journal importieren|import journal/i)).toBeDefined();
  });

  it('enters select mode when clicking "Journale auswählen" in dropdown', () => {
    const onSelectModeChange = vi.fn();
    render(
      <LanguageProvider>
        <JournalsOverview
          journals={mockJournals}
          onCreateJournal={vi.fn()}
          onRenameJournal={vi.fn()}
          onDeleteJournal={vi.fn()}
          onSelectJournal={vi.fn()}
          onSelectModeChange={onSelectModeChange}
        />
      </LanguageProvider>
    );

    const gearBtn = screen.getByRole('button', { name: /aktionen|actions/i });
    fireEvent.click(gearBtn);

    const selectModeItem = screen.getByText(/journale auswählen|select journals/i);
    fireEvent.click(selectModeItem);

    expect(onSelectModeChange).toHaveBeenCalledWith(true);
  });
});
