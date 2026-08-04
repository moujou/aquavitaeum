import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LanguageToggle } from '../LanguageToggle';
import { LanguageProvider } from '@/context/LanguageContext';

describe('LanguageToggle UI Component', () => {
  it('renders DE and EN toggle buttons', () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>,
    );

    expect(screen.getByRole('button', { name: 'DE' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'EN' })).toBeDefined();
  });

  it('highlights EN as active by default and switches to DE when clicked', async () => {
    render(
      <LanguageProvider>
        <LanguageToggle />
      </LanguageProvider>,
    );

    const deBtn = screen.getByRole('button', { name: 'DE' });
    const enBtn = screen.getByRole('button', { name: 'EN' });

    expect(enBtn.getAttribute('aria-pressed')).toBe('true');
    expect(deBtn.getAttribute('aria-pressed')).toBe('false');

    fireEvent.click(deBtn);

    expect(deBtn.getAttribute('aria-pressed')).toBe('true');
    expect(enBtn.getAttribute('aria-pressed')).toBe('false');
  });
});
