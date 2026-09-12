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
    averageRating: 94,
    latestTastedDate: '2026-01-02',
    latestSpiritName: 'Lagavulin Distillers Edition',
    recentSpirits: [
      { name: 'Lagavulin Distillers Edition', date: '2026-01-02' },
      { name: 'Ardbeg 10', date: '2025-12-20' },
      { name: 'Laphroaig 10 CS', date: '2025-11-15' },
    ],
    topDrams: [
      { name: 'Lagavulin 16', rating: 94 },
      { name: 'Ardbeg 10', rating: 91 },
      { name: 'Laphroaig 10 CS', rating: 89 },
    ],
    topScore: 94,
    regionCount: 3,
    distilleryCount: 3,
    recentImages: [],
    createdAt: '2026-01-02',
    updatedAt: '2026-01-02',
  },
  {
    id: 'j-2',
    name: 'Bourbon & Rye',
    description: 'American whiskeys',
    bottleCount: 2,
    averageRating: 84,
    latestTastedDate: '2026-01-01',
    latestSpiritName: 'Makers Mark',
    recentSpirits: [{ name: 'Makers Mark', date: '2026-01-01' }],
    topDrams: [{ name: 'Makers Mark', rating: 84 }],
    topScore: 84,
    regionCount: 1,
    distilleryCount: 1,
    recentImages: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

describe('JournalsOverview Component', () => {
  it('renders list of journals with stats, latest tasting, top-drams and titles', () => {
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
    expect(screen.getByText('Lagavulin Distillers Edition')).toBeDefined();
    expect(screen.getByText('Lagavulin 16')).toBeDefined();
    expect(screen.getAllByText('Ardbeg 10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Laphroaig 10 CS').length).toBeGreaterThan(0);
  });

  it('renders empty notes message when a journal has no tastings', () => {
    const emptyJournals: JournalWithStats[] = [
      {
        id: 'j-empty',
        name: 'Empty Book',
        bottleCount: 0,
        averageRating: 0,
        latestTastedDate: null,
        recentImages: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];

    render(
      <LanguageProvider>
        <JournalsOverview
          journals={emptyJournals}
          onCreateJournal={vi.fn()}
          onRenameJournal={vi.fn()}
          onDeleteJournal={vi.fn()}
          onSelectJournal={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/Noch keine Notizen erfasst|No tasting notes yet/i)).toBeDefined();
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
      expect(onCreateJournal).toHaveBeenCalledWith('Rum Collection', '', undefined, 'green');
    });
  });

  it('renders bookshelf spine layout when journalLayout is "bookshelf"', () => {
    const onSelectJournal = vi.fn();
    render(
      <LanguageProvider>
        <JournalsOverview
          journals={mockJournals}
          journalLayout="bookshelf"
          onCreateJournal={vi.fn()}
          onRenameJournal={vi.fn()}
          onDeleteJournal={vi.fn()}
          onSelectJournal={onSelectJournal}
        />
      </LanguageProvider>
    );

    // Both book spine titles should be rendered
    expect(screen.getByText('Scotch Vault')).toBeDefined();
    expect(screen.getByText('Bourbon & Rye')).toBeDefined();

    // Clicking a book spine triggers selection
    fireEvent.click(screen.getByText('Scotch Vault'));
    expect(onSelectJournal).toHaveBeenCalledWith('j-1');
  });

  it('handles editing journal from bookshelf mode', async () => {
    const onRenameJournal = vi.fn().mockResolvedValue(undefined);
    render(
      <LanguageProvider>
        <JournalsOverview
          journals={mockJournals}
          journalLayout="bookshelf"
          onCreateJournal={vi.fn()}
          onRenameJournal={onRenameJournal}
          onDeleteJournal={vi.fn()}
          onSelectJournal={vi.fn()}
        />
      </LanguageProvider>
    );

    // Find and click edit on first spine
    const editBtns = screen.getAllByTitle(/Bearbeiten|Edit/i);
    expect(editBtns.length).toBeGreaterThan(0);
    fireEvent.click(editBtns[0]);

    // Modal input should appear
    const textInputs = screen.getAllByRole('textbox');
    expect(textInputs.length).toBeGreaterThan(0);
    fireEvent.change(textInputs[0], { target: { value: 'Renamed Scotch Shelf' } });

    const saveBtn = screen.getByRole('button', { name: /Speichern|Save/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(onRenameJournal).toHaveBeenCalledWith(
        'j-1',
        'Renamed Scotch Shelf',
        'Highland and Speyside single malts',
        undefined,
        'green'
      );
    });
  });

  it('allows sorting journals by different criteria', async () => {
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

    // Initial state shows default sorted first item
    expect(screen.getByText('Scotch Vault')).toBeDefined();

    // Open sort dropdown
    const sortBtn = screen.getByTitle(/Sort|Sortieren/i);
    expect(sortBtn).toBeDefined();
    fireEvent.click(sortBtn);

    // Select Name (A–Z) / Name (A–Z)
    const azOption = screen.getByRole('option', { name: /A–Z|A-Z|Alphabetisch/i });
    expect(azOption).toBeDefined();
    fireEvent.click(azOption);

    // Books should still be rendered correctly
    expect(screen.getByText('Bourbon & Rye')).toBeDefined();
    expect(screen.getByText('Scotch Vault')).toBeDefined();
  });
});


