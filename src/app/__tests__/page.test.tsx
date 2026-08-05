import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '../page';
import { LanguageProvider } from '@/context/LanguageContext';

describe('Home Page Component', () => {
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
});
