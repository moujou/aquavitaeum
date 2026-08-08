import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../page';
import { LanguageProvider } from '@/context/LanguageContext';

vi.mock('@/lib/db', () => {
  return {
    db: {
      spirits: {
        toArray: vi.fn().mockResolvedValue([]),
        clear: vi.fn().mockResolvedValue(null),
        bulkPut: vi.fn().mockResolvedValue(null),
        put: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});


describe('Home Page Component', () => {
  beforeEach(() => {
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

  it('renders the app header title and language toggle', () => {
    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    expect(screen.getByText('Aqua Vitaeum')).toBeDefined();
    expect(screen.getByRole('button', { name: /Open sidebar menu/i })).toBeDefined();
  });

  it('opens and closes mobile off-canvas drawer when hamburger button and close button are clicked', () => {
    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    const menuBtn = screen.getByRole('button', { name: /Open sidebar menu/i });
    fireEvent.click(menuBtn);

    // Inside drawer, close button [X] should be present
    const closeBtns = screen.getAllByRole('button', { name: /Close menu/i });
    expect(closeBtns.length).toBeGreaterThan(0);

    // Click close button
    fireEvent.click(closeBtns[0]);
  });

  it('renders the empty cellar state UI when the spirits database is empty', async () => {
    render(
      <LanguageProvider>
        <Home />
      </LanguageProvider>,
    );

    // Wait for the loader to clear and the empty state title to appear
    const emptyStateTitle = await screen.findByText('Your Cellar is Empty');
    expect(emptyStateTitle).toBeDefined();

    // Verify "New Note" CTA buttons exist (renders in header and empty state)
    const newNoteButtons = screen.getAllByRole('button', { name: /New Note/i });
    expect(newNoteButtons.length).toBeGreaterThan(0);
  });
});
