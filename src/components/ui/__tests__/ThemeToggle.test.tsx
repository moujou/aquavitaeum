import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';
import React from 'react';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  const renderComponent = () => {
    return render(
      <ThemeProvider>
        <LanguageProvider>
          <ThemeToggle />
        </LanguageProvider>
      </ThemeProvider>
    );
  };

  it('renders both Light and Dark toggle buttons', () => {
    renderComponent();

    const lightBtn = screen.getByRole('button', { name: /Light/i });
    const darkBtn = screen.getByRole('button', { name: /Dark/i });

    expect(lightBtn).toBeDefined();
    expect(darkBtn).toBeDefined();
    expect(lightBtn.getAttribute('aria-pressed')).toBe('true');
    expect(darkBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('switches to pub-dark when clicking the Dark button', () => {
    renderComponent();

    const darkBtn = screen.getByRole('button', { name: /Dark/i });
    const lightBtn = screen.getByRole('button', { name: /Light/i });

    fireEvent.click(darkBtn);

    expect(darkBtn.getAttribute('aria-pressed')).toBe('true');
    expect(lightBtn.getAttribute('aria-pressed')).toBe('false');
    expect(document.documentElement.getAttribute('data-theme')).toBe('pub-dark');
  });

  it('switches back to light when clicking the Light button', () => {
    renderComponent();

    const darkBtn = screen.getByRole('button', { name: /Dark/i });
    const lightBtn = screen.getByRole('button', { name: /Light/i });

    fireEvent.click(darkBtn);
    expect(document.documentElement.getAttribute('data-theme')).toBe('pub-dark');

    fireEvent.click(lightBtn);
    expect(lightBtn.getAttribute('aria-pressed')).toBe('true');
    expect(darkBtn.getAttribute('aria-pressed')).toBe('false');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('renders icon-only buttons with accessible labels and no text nodes', () => {
    renderComponent();

    const lightBtn = screen.getByRole('button', { name: /Light/i });
    const darkBtn = screen.getByRole('button', { name: /Dark/i });

    expect(lightBtn.textContent).toBe('');
    expect(darkBtn.textContent).toBe('');
  });
});
