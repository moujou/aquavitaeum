import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { JournalsOverview } from '../JournalsOverview';
import { LanguageProvider } from '@/context/LanguageContext';
import { JournalWithStats } from '@/hooks/useJournals';

const MOCK_JOURNALS: JournalWithStats[] = [
  {
    id: 'journal-1',
    name: 'Peaty Malts',
    description: 'Islay peat smoke monsters',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    bottleCount: 3,
    averageRating: 92.5,
    latestTastedDate: '2026-08-01',
    recentImages: ['/img1.jpg', '/img2.jpg', '/img3.jpg'],
  },
  {
    id: 'journal-default',
    name: 'My Journal',
    description: 'General collection',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    bottleCount: 1,
    averageRating: 85.0,
    latestTastedDate: '2026-07-15',
    recentImages: ['/img4.jpg'],
  }
];

describe('JournalsOverview Bookshelf Component', () => {
  it('renders journals bookshelf with statistics and preview images', () => {
    const onSelectJournal = vi.fn();
    const onCreateJournal = vi.fn();
    const onRenameJournal = vi.fn();
    const onDeleteJournal = vi.fn();

    render(
      <LanguageProvider>
        <JournalsOverview
          journals={MOCK_JOURNALS}
          onSelectJournal={onSelectJournal}
          onCreateJournal={onCreateJournal}
          onRenameJournal={onRenameJournal}
          onDeleteJournal={onDeleteJournal}
        />
      </LanguageProvider>
    );

    // Verify shelf titles
    expect(screen.getByText('Peaty Malts')).toBeDefined();
    expect(screen.getByText('Islay peat smoke monsters')).toBeDefined();
    expect(screen.getByText('My Journal')).toBeDefined();

    // Verify statistics are rendered
    expect(screen.getByText('3')).toBeDefined(); // Flaschenanzahl
    expect(screen.getByText('92.5')).toBeDefined(); // Rating

    // Verify that the images are rendered
    const images = screen.getAllByAltText('Recent Bottle Preview');
    expect(images.length).toBe(4); // 3 from journal-1 + 1 from journal-default
  });

  it('selects journal when clicking on card', () => {
    const onSelectJournal = vi.fn();
    const onCreateJournal = vi.fn();
    const onRenameJournal = vi.fn();
    const onDeleteJournal = vi.fn();

    render(
      <LanguageProvider>
        <JournalsOverview
          journals={MOCK_JOURNALS}
          onSelectJournal={onSelectJournal}
          onCreateJournal={onCreateJournal}
          onRenameJournal={onRenameJournal}
          onDeleteJournal={onDeleteJournal}
        />
      </LanguageProvider>
    );

    // Click on card
    fireEvent.click(screen.getByText('Peaty Malts'));
    expect(onSelectJournal).toHaveBeenCalledWith('journal-1');
  });

  it('reveals editing fields and saves name and description updates', async () => {
    const onSelectJournal = vi.fn();
    const onCreateJournal = vi.fn();
    const onRenameJournal = vi.fn();
    const onDeleteJournal = vi.fn();

    render(
      <LanguageProvider>
        <JournalsOverview
          journals={MOCK_JOURNALS}
          onSelectJournal={onSelectJournal}
          onCreateJournal={onCreateJournal}
          onRenameJournal={onRenameJournal}
          onDeleteJournal={onDeleteJournal}
        />
      </LanguageProvider>
    );

    // Find and click edit pencil button
    const editBtns = screen.getAllByTitle('Rename');
    fireEvent.click(editBtns[0]);

    // Check that form input fields are visible
    const nameInput = screen.getByDisplayValue('Peaty Malts');
    const descInput = screen.getByDisplayValue('Islay peat smoke monsters');

    fireEvent.change(nameInput, { target: { value: 'Super Peaty Malts' } });
    fireEvent.change(descInput, { target: { value: 'Only heavily peated whiskies' } });

    // Submit form
    const saveButton = screen.getByRole('button', { name: /Save/i });
    
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(onRenameJournal).toHaveBeenCalledWith('journal-1', 'Super Peaty Malts', 'Only heavily peated whiskies');
  });

  it('triggers delete confirmation dialog and deletes journal', async () => {
    const onSelectJournal = vi.fn();
    const onCreateJournal = vi.fn();
    const onRenameJournal = vi.fn();
    const onDeleteJournal = vi.fn();

    render(
      <LanguageProvider>
        <JournalsOverview
          journals={MOCK_JOURNALS}
          onSelectJournal={onSelectJournal}
          onCreateJournal={onCreateJournal}
          onRenameJournal={onRenameJournal}
          onDeleteJournal={onDeleteJournal}
        />
      </LanguageProvider>
    );

    // Find and click delete trash button
    const deleteBtns = screen.getAllByTitle('Delete');
    fireEvent.click(deleteBtns[0]);

    // Check that confirm dialog appears
    expect(screen.getByText(/Are you sure you want to delete this journal/i)).toBeDefined();

    // Click confirm delete button
    const confirmBtn = screen.getByRole('button', { name: /^Delete Journal$/i });
    
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(onDeleteJournal).toHaveBeenCalledWith('journal-1');
  });
});
