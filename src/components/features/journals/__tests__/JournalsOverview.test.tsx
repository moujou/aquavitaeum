import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { JournalsOverview } from '../JournalsOverview';
import { JournalWithStats } from '@/hooks/useJournals';
import { LanguageProvider } from '@/context/LanguageContext';

const mockJournals: JournalWithStats[] = [
  {
    id: 'j-1',
    name: 'Scotch Vault',
    description: 'Highland and Speyside single malts',
    bottleCount: 5,
    averageRating: 4.6,
    latestTastedDate: '2026-01-01',
    recentImages: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'j-2',
    name: 'Bourbon & Rye',
    description: 'American whiskeys',
    bottleCount: 2,
    averageRating: 4.2,
    latestTastedDate: '2026-01-02',
    recentImages: [],
    createdAt: '2026-01-02',
    updatedAt: '2026-01-02',
  },
];

describe('JournalsOverview Component', () => {
  it('renders list of journals with stats and titles', () => {
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

    expect(screen.getByText('Scotch Vault')).toBeDefined();
    expect(screen.getByText('Bourbon & Rye')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('selects journal on card click', () => {
    const onSelectJournal = vi.fn();
    render(
      <LanguageProvider>
        <JournalsOverview
          journals={mockJournals}
          onCreateJournal={vi.fn()}
          onRenameJournal={vi.fn()}
          onDeleteJournal={vi.fn()}
          onSelectJournal={onSelectJournal}
        />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByText('Scotch Vault'));
    expect(onSelectJournal).toHaveBeenCalledWith('j-1');
  });

  it('opens create journal modal and triggers onCreateJournal', async () => {
    const onCreateJournal = vi.fn().mockResolvedValue(undefined);
    render(
      <LanguageProvider>
        <JournalsOverview
          journals={mockJournals}
          onCreateJournal={onCreateJournal}
          onRenameJournal={vi.fn()}
          onDeleteJournal={vi.fn()}
          onSelectJournal={vi.fn()}
          isCreateOpen={true}
          onCloseCreate={vi.fn()}
        />
      </LanguageProvider>
    );

    const nameInput = screen.getByPlaceholderText(/Islay Malts/i);
    fireEvent.change(nameInput, { target: { value: 'Rum Collection' } });

    const submitBtn = screen.getByRole('button', { name: /Create Journal|Journal anlegen|Create|Anlegen/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onCreateJournal).toHaveBeenCalledWith('Rum Collection', '', undefined);
    });
  });
});
