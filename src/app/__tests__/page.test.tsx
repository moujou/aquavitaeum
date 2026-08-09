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

    // Should display welcome screen branding and language selector
    expect(screen.getByText('Your Fine Spirits Tasting Journal')).toBeDefined();
    expect(screen.getByText('EN')).toBeDefined();
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

    // 2. Mobile Hamburger menu button should now be rendered in journal detail view
    const menuBtn = await screen.findByRole('button', { name: /Open sidebar menu/i });
    expect(menuBtn).toBeDefined();

    // 3. Click menu button to open drawer
    fireEvent.click(menuBtn);

    // 4. Close button [X] should be present in mobile drawer
    const closeBtns = screen.getAllByRole('button', { name: /Close menu/i });
    expect(closeBtns.length).toBeGreaterThan(0);

    // 5. Click close button to close drawer
    fireEvent.click(closeBtns[0]);
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
});
