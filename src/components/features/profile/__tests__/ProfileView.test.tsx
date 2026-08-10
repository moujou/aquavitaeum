import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProfileView } from '../ProfileView';
import { LanguageProvider } from '@/context/LanguageContext';

describe('ProfileView Component', () => {
  it('renders avatar, settings rows and labels correctly in English', () => {
    render(
      <LanguageProvider>
        <ProfileView />
      </LanguageProvider>
    );

    // Verify avatar title/header
    expect(screen.getAllByText(/You/i).length).toBeGreaterThan(0);

    // Verify settings rows
    expect(screen.getByText('Language')).toBeDefined();
    expect(screen.getByText('Google Sync')).toBeDefined();
    expect(screen.getByText('App Version')).toBeDefined();
    expect(screen.getByText('Beta v0.1.0')).toBeDefined();
  });
});
