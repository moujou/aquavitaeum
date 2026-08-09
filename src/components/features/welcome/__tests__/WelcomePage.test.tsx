import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WelcomePage } from '../WelcomePage';
import { LanguageProvider } from '@/context/LanguageContext';

describe('WelcomePage Onboarding & Launch Screen', () => {
  it('renders correctly with "Create first journal" button when hasJournals is false', () => {
    const onComplete = vi.fn();
    const onEnter = vi.fn();

    render(
      <LanguageProvider>
        <WelcomePage hasJournals={false} onComplete={onComplete} onEnter={onEnter} />
      </LanguageProvider>
    );

    // Verify title and subtitle are present
    expect(screen.getByText('Your Fine Spirits Tasting Journal')).toBeDefined();
    
    // Verify onboarding button is visible
    const button = screen.getByRole('button', { name: /Create your first Journal/i });
    expect(button).toBeDefined();

    // Click button to open modal
    fireEvent.click(button);

    // Verify modal is open and has input fields
    expect(screen.getByPlaceholderText('e.g. Islay Malts, Caribbean Rums...')).toBeDefined();
    expect(screen.getByPlaceholderText('e.g. My collection of Single Malts...')).toBeDefined();
  });

  it('submits onboarding form correctly and calls onComplete', async () => {
    const onComplete = vi.fn();
    const onEnter = vi.fn();

    render(
      <LanguageProvider>
        <WelcomePage hasJournals={false} onComplete={onComplete} onEnter={onEnter} />
      </LanguageProvider>
    );

    // Open modal
    const startButton = screen.getByRole('button', { name: /Create your first Journal/i });
    fireEvent.click(startButton);

    // Fill in the input fields
    const nameInput = screen.getByPlaceholderText('e.g. Islay Malts, Caribbean Rums...');
    const descInput = screen.getByPlaceholderText('e.g. My collection of Single Malts...');

    fireEvent.change(nameInput, { target: { value: 'My First Malt Journal' } });
    fireEvent.change(descInput, { target: { value: 'Islay and Speyside malts' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Create Journal/i });
    
    // Wrap state updates in act
    await act(async () => {
      fireEvent.click(submitButton);
      // Wait for slide-out animation timeout
      await new Promise((resolve) => setTimeout(resolve, 610));
    });

    expect(onComplete).toHaveBeenCalledWith('My First Malt Journal', 'Islay and Speyside malts');
  });

  it('renders correctly with "Open Tasting Journal" button when hasJournals is true', async () => {
    const onComplete = vi.fn();
    const onEnter = vi.fn();

    render(
      <LanguageProvider>
        <WelcomePage hasJournals={true} onComplete={onComplete} onEnter={onEnter} />
      </LanguageProvider>
    );

    // Verify open button is visible
    const button = screen.getByRole('button', { name: /Open Tasting Journal/i });
    expect(button).toBeDefined();

    // Click button to enter
    await act(async () => {
      fireEvent.click(button);
      // Wait for fade timeout
      await new Promise((resolve) => setTimeout(resolve, 610));
    });

    expect(onEnter).toHaveBeenCalled();
  });
});
