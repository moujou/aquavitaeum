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
    // 'journal-default' does NOT equal 'default-compendium' so the Delete button is shown
    id: 'journal-default',
    name: 'My Journal',
    description: 'General collection',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    bottleCount: 1,
    averageRating: 85.0,
    latestTastedDate: '2026-07-15',
    recentImages: ['/img4.jpg'],
  },
];

const MOCK_JOURNALS_WITH_COVER: JournalWithStats[] = [
  {
    id: 'journal-with-cover',
    name: 'Cover Journal',
    description: 'Has a cover photo',
    coverImage: 'data:image/jpeg;base64,COVER_DATA',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
    bottleCount: 0,
    averageRating: 0,
    latestTastedDate: null,
    recentImages: [],
  },
];

function renderOverview(overrides: Partial<Parameters<typeof JournalsOverview>[0]> = {}) {
  const defaults = {
    journals: MOCK_JOURNALS,
    onSelectJournal: vi.fn(),
    onCreateJournal: vi.fn().mockResolvedValue(undefined),
    onRenameJournal: vi.fn().mockResolvedValue(undefined),
    onDeleteJournal: vi.fn().mockResolvedValue(undefined),
  };
  return render(
    <LanguageProvider>
      <JournalsOverview {...defaults} {...overrides} />
    </LanguageProvider>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('JournalsOverview Bookshelf Component', () => {

  // ── Core rendering ─────────────────────────────────────────────────────────

  it('renders journal cards with name, description, and statistics', () => {
    renderOverview();

    expect(screen.getByText('Peaty Malts')).toBeDefined();
    expect(screen.getByText('Islay peat smoke monsters')).toBeDefined();
    expect(screen.getByText('My Journal')).toBeDefined();

    // Statistics: bottle count and average rating
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('92.5')).toBeDefined();
  });

  it('renders the user-selected coverImage when journal has one set', () => {
    renderOverview({ journals: MOCK_JOURNALS_WITH_COVER });

    const cover = screen.getByAltText('Cover Journal cover') as HTMLImageElement;
    expect(cover).toBeDefined();
    expect(cover.src).toContain('COVER_DATA');
  });

  it('renders the dark placeholder (no img) when journal has no coverImage', () => {
    renderOverview();

    // No cover image alt text should exist for uncovered journals
    expect(screen.queryByAltText('Peaty Malts cover')).toBeNull();
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it('calls onSelectJournal with the correct id when clicking a card', () => {
    const onSelectJournal = vi.fn();
    renderOverview({ onSelectJournal });

    fireEvent.click(screen.getByText('Peaty Malts'));
    expect(onSelectJournal).toHaveBeenCalledWith('journal-1');
  });

  // ── Create modal ───────────────────────────────────────────────────────────

  it('shows the create modal when isCreateOpen=true and closes on Cancel', async () => {
    const onCloseCreate = vi.fn();
    renderOverview({ isCreateOpen: true, onCloseCreate });

    // Modal heading: use role='heading' to avoid matching the submit button text too
    expect(screen.getByRole('heading', { name: /Create Journal/i })).toBeDefined();

    // Click Cancel (uses i18n 'cancel' key -> 'Cancel')
    const cancelBtns = screen.getAllByRole('button', { name: /^Cancel$/i });
    await act(async () => { fireEvent.click(cancelBtns[0]); });

    expect(onCloseCreate).toHaveBeenCalled();
  });

  // ── Edit inline form ───────────────────────────────────────────────────────

  it('reveals edit fields, updates values, and calls onRenameJournal with coverImage arg', async () => {
    const onRenameJournal = vi.fn().mockResolvedValue(undefined);
    renderOverview({ onRenameJournal });

    // Click the first Rename button
    const editBtns = screen.getAllByTitle('Rename');
    fireEvent.click(editBtns[0]);

    const nameInput = screen.getByDisplayValue('Peaty Malts');
    const descInput = screen.getByDisplayValue('Islay peat smoke monsters');

    fireEvent.change(nameInput, { target: { value: 'Super Peaty Malts' } });
    fireEvent.change(descInput, { target: { value: 'Only heavily peated whiskies' } });

    const saveButton = screen.getByRole('button', { name: /Save/i });
    await act(async () => { fireEvent.click(saveButton); });

    // onRenameJournal receives coverImage as 4th arg; undefined when no cover is picked
    expect(onRenameJournal).toHaveBeenCalledWith(
      'journal-1',
      'Super Peaty Malts',
      'Only heavily peated whiskies',
      undefined, // editCoverImage starts as undefined when no cover is set
    );
  });

  it('cancels editing without calling onRenameJournal when the X button is clicked', async () => {
    const onRenameJournal = vi.fn();
    renderOverview({ onRenameJournal });

    const editBtns = screen.getAllByTitle('Rename');
    fireEvent.click(editBtns[0]);

    // Confirm edit form opened (name input is visible)
    expect(screen.getByDisplayValue('Peaty Malts')).toBeDefined();

    // The cancel button has no text — it contains only an X SVG icon.
    // Find it by its position: it is the last button inside the edit form div.
    const allButtons = screen.getAllByRole('button');
    // The X cancel button is the button immediately after Save inside the form footer
    const saveBtn = screen.getByRole('button', { name: /^Save$/i });
    const saveBtnIndex = allButtons.indexOf(saveBtn);
    const cancelXBtn = allButtons[saveBtnIndex + 1];
    fireEvent.click(cancelXBtn);

    // onRenameJournal should NOT have been called
    expect(onRenameJournal).not.toHaveBeenCalled();
  });

  // ── Delete confirmation ────────────────────────────────────────────────────

  it('shows delete confirmation dialog and calls onDeleteJournal on confirm', async () => {
    const onDeleteJournal = vi.fn().mockResolvedValue(undefined);
    renderOverview({ onDeleteJournal });

    const deleteBtns = screen.getAllByTitle('Delete');
    fireEvent.click(deleteBtns[0]);

    // Hard-coded text in the delete dialog
    expect(screen.getByText('Warning / Achtung!')).toBeDefined();

    const confirmBtn = screen.getByRole('button', { name: /^Delete Journal$/i });
    await act(async () => { fireEvent.click(confirmBtn); });

    expect(onDeleteJournal).toHaveBeenCalledWith('journal-1');
  });
});
