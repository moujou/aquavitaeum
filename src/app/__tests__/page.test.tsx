import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../page';
import { LanguageProvider } from '@/context/LanguageContext';

// Mock IndexedDB Dexie db object
vi.mock('@/lib/db', () => {
  return {
    db: {
      spirits: {
        where: vi.fn().mockImplementation(() => {
          return {
            equals: vi.fn().mockImplementation(() => {
              return {
                toArray: vi.fn().mockResolvedValue([]),
              };
            }),
          };
        }),
        toArray: vi.fn().mockResolvedValue([]),
        clear: vi.fn().mockResolvedValue(null),
        bulkPut: vi.fn().mockResolvedValue(null),
        put: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

// Mock useJournals hook to control bookshelf state in page tests
vi.mock('@/hooks/useJournals', () => {
  return {
    useJournals: () => ({
      journals: [
        {
          id: 'default-compendium',
          name: 'My Journal',
          description: 'A mock journal for testing',
          bottleCount: 0,
          averageRating: 0,
          latestTastedDate: null,
          recentImages: [],
        },
      ],
      isLoading: false,
      createJournal: vi.fn().mockResolvedValue({ id: 'new-journal-id' }),
      renameJournal: vi.fn(),
      deleteJournal: vi.fn(),
      refreshJournals: vi.fn(),
    }),
  };
});

describe('Home Page Component & Multi-Journal Navigation', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ spirits: [] }),
        });
      }),
    );
  });

  it('renders welcome onboarding page when session is not started', () => {
    // Leave sessionStorage empty to trigger first-load launch screen
    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // Should display welcome screen branding
    expect(screen.getByText('Your Fine Spirits Tasting Journal')).toBeDefined();
  });

  it('navigates to bookshelf overview when session is started', async () => {
    sessionStorage.setItem('aqua-vitaeum-session-started', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // Wait for the hydration loading screen to clear and reveal overview
    const overviewTitle = await screen.findByText('My Journals');
    expect(overviewTitle).toBeDefined();
    expect(screen.getByText('My Journal')).toBeDefined();
    expect(screen.getByText('A mock journal for testing')).toBeDefined();
  });

  it('opens and closes mobile off-canvas drawer when inside journal detail view', async () => {
    sessionStorage.setItem('aqua-vitaeum-session-started', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // 1. Click on the journal card to open it
    const journalCard = await screen.findByText('My Journal');
    fireEvent.click(journalCard);

    // 2. Mobile hamburger/drawer toggle button should now be visible in the header
    const collectionBtn = await screen.findByTitle('Toggle Spirit List');
    expect(collectionBtn).toBeDefined();

    // 3. Click drawer toggle to open the full-screen collection drawer
    fireEvent.click(collectionBtn);

    // 4. Verify global search bar is present (multiple may render — check at least one)
    const globalSearchInputs = screen.getAllByPlaceholderText(/Search spirits & journals/i);
    expect(globalSearchInputs.length).toBeGreaterThan(0);

    // 5. Click drawer toggle again to close
    fireEvent.click(collectionBtn);
  });

  it('renders the empty cellar state UI when the active journal has 0 spirits', async () => {
    sessionStorage.setItem('aqua-vitaeum-session-started', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // Click to enter the default compendium
    const journalCard = await screen.findByText('My Journal');
    fireEvent.click(journalCard);

    // Wait for empty cellar screen to load
    const emptyStateTitle = await screen.findByText('Your Cellar is Empty');
    expect(emptyStateTitle).toBeDefined();

    // Verify 'New Note' CTA button exists in empty state
    const newNoteButtons = screen.getAllByRole('button', { name: /New Note/i });
    expect(newNoteButtons.length).toBeGreaterThan(0);
  });

  it('collapses desktop sidebar to Reddit-style 16px width and toggles Menu icon', async () => {
    sessionStorage.setItem('aqua-vitaeum-session-started', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // Enter journal
    const journalCard = await screen.findByText('My Journal');
    fireEvent.click(journalCard);

    // Find the toggle rail container buttons
    const toggleButton = screen.getByTitle(/Collapse sidebar/i);
    expect(toggleButton).toBeDefined();

    // Click to collapse sidebar
    await act(async () => { fireEvent.click(toggleButton); });

    // Check if sidebar has collapsed class
    const sidebar = document.getElementById('collection-sidebar');
    expect(sidebar?.className).toContain('w-[16px]');
  });

  it('renders symmetrical floating buttons in detail view (Bookshelf & New Note)', async () => {
    sessionStorage.setItem('aqua-vitaeum-session-started', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // Enter journal
    const journalCard = await screen.findByText('My Journal');
    fireEvent.click(journalCard);

    // Verify presence of bottom-left Bookshelf/Journals button
    const backBtns = screen.getAllByTitle(/Journals/i);
    const desktopBackBtn = backBtns.find(btn => btn.className.includes('absolute'));
    expect(desktopBackBtn).toBeDefined();
    expect(desktopBackBtn?.className).toContain('absolute bottom-6 left-6');

    // Verify presence of bottom-right New Note button
    const newNoteBtn = screen.getByRole('button', { name: /New Note/i });
    expect(newNoteBtn).toBeDefined();
  });

  it('renders floating Plus button in Bookshelf Overview view', async () => {
    sessionStorage.setItem('aqua-vitaeum-session-started', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // Verify presence of creation FAB on bookshelf overview
    const createBtn = screen.getByTitle(/Create Journal/i);
    expect(createBtn).toBeDefined();
    expect(createBtn.className).toContain('absolute bottom-6 right-6');
  });

  it('redirects from Profile view back to journals overview when tapping Journals in bottom navigation', async () => {
    sessionStorage.setItem('aqua-vitaeum-session-started', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // 1. Enter a journal to make activeJournalId present
    const journalCard = await screen.findByText('My Journal');
    fireEvent.click(journalCard);

    // 2. Navigate to Profile ("You")
    const profileBtns = await screen.findAllByTitle(/You/i);
    fireEvent.click(profileBtns[0]);

    // Verify Profile view content (e.g. settings text)
    expect(screen.getByText('Language')).toBeDefined();

    // 3. Navigate back to overview via the Journals bookshelf tab in bottom nav
    // (Toggle Spirit List only appears in journal-detail view; in profile view we
    // navigate via the bookshelf tab button which has title t('journalsTitle'))
    const journalNavBtns = screen.getAllByTitle(/My Journals/i);
    fireEvent.click(journalNavBtns[0]);

    // 4. Verify we are back at journals overview (journal title visible again)
    const overviewTitle = await screen.findByText('My Journals');
    expect(overviewTitle).toBeDefined();
  });
});
