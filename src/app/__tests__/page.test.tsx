import { render, screen, fireEvent } from '@testing-library/react';
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
    localStorage.setItem('aqua-vitaeum-seeded', 'true');
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

  it('navigates to bookshelf overview when welcome onboarding is completed', async () => {
    localStorage.setItem('aqua-vitaeum-welcome-completed', 'true');

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

  it('renders the empty cellar state UI when the active journal has 0 spirits', async () => {
    localStorage.setItem('aqua-vitaeum-welcome-completed', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // Click journal → now navigates to journal-landing (not detail directly)
    const journalCard = await screen.findByText('My Journal');
    fireEvent.click(journalCard);

    // Landing page shows NoteEmptyState with i18n text (t('cellarEmptyTitle'))
    const emptyStateTitle = await screen.findByText('Your Cellar is Empty');
    expect(emptyStateTitle).toBeDefined();
  });

  it('renders New Note desktop FAB in journal-landing view', async () => {
    localStorage.setItem('aqua-vitaeum-welcome-completed', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // Click journal → lands on journal-landing
    const journalCard = await screen.findByText('My Journal');
    fireEvent.click(journalCard);

    // Desktop New Note FAB must be present on landing page (hidden on mobile via CSS)
    const newNoteFab = screen.getByTitle('New Note');
    expect(newNoteFab).toBeDefined();
    expect(newNoteFab.className).toContain('w-16 h-16 rounded-full bg-[var(--fab-bg)]');
  });

  it('renders floating Plus button in Bookshelf Overview view', async () => {
    localStorage.setItem('aqua-vitaeum-welcome-completed', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // Verify presence of creation FAB on bookshelf overview
    const createBtn = screen.getByTitle(/Create Journal/i);
    expect(createBtn).toBeDefined();
    expect(createBtn.className).toContain('w-16 h-16 rounded-full bg-[var(--fab-bg)]');
  });

  it('redirects from Profile view back to journals overview when tapping Journals in bottom navigation', async () => {
    localStorage.setItem('aqua-vitaeum-welcome-completed', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // 1. Enter a journal → lands on journal-landing
    const journalCard = await screen.findByText('My Journal');
    fireEvent.click(journalCard);

    // 2. Navigate to Profile ("You")
    const profileBtns = await screen.findAllByTitle(/You/i);
    fireEvent.click(profileBtns[0]);

    // Verify Profile view content (e.g. settings text)
    expect(screen.getByText('Language')).toBeDefined();

    // 3. Navigate back to overview via the Journals bookshelf tab in bottom nav
    const journalNavBtns = screen.getAllByTitle(/My Journals/i);
    fireEvent.click(journalNavBtns[0]);

    // 4. Verify we are back at journals overview (journal title visible again)
    const overviewTitle = await screen.findByText('My Journals');
    expect(overviewTitle).toBeDefined();
  });

  it('returns to journal-landing (not journal-detail) when toggling Profile tab off', async () => {
    localStorage.setItem('aqua-vitaeum-welcome-completed', 'true');

    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // 1. Click journal → journal-landing (NoteEmptyState visible with 0 spirits)
    const journalCard = await screen.findByText('My Journal');
    fireEvent.click(journalCard);
    expect(await screen.findByText('Your Cellar is Empty')).toBeDefined();

    // 2. Open Profile via the Profile icon/tab
    const profileBtns = await screen.findAllByTitle(/You/i);
    fireEvent.click(profileBtns[0]);
    expect(screen.getByText('Language')).toBeDefined();

    // 3. Toggle Profile OFF by clicking Profile icon again
    fireEvent.click(profileBtns[0]);

    // 4. Must return to journal-landing (not profile): Language settings are gone.
    //    NoteEmptyState ('Your Cellar is Empty') reappears on landing with 0 spirits.
    expect(screen.queryByText('Language')).toBeNull();
    expect(await screen.findByText('Your Cellar is Empty')).toBeDefined();
  });
});
