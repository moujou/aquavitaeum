import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProfileView } from '../ProfileView';
import { LanguageProvider } from '@/context/LanguageContext';

vi.mock('@/lib/db', () => ({
  db: {
    journals: {
      toArray: vi.fn().mockResolvedValue([]),
    },
    spirits: {
      toArray: vi.fn().mockResolvedValue([]),
    },
  },
}));

describe('ProfileView Component', () => {
  it('renders avatar, settings rows and labels correctly in English', () => {
    render(
      <LanguageProvider>
        <ProfileView layout="list" onLayoutChange={() => {}} />
      </LanguageProvider>
    );

    // Verify avatar title/header
    expect(screen.getAllByText(/You/i).length).toBeGreaterThan(0);

    // Verify settings rows
    expect(screen.getByText('Language')).toBeDefined();
    expect(screen.getByText('Google Drive Sync')).toBeDefined();
    expect(screen.getByText('Tasting Notes Layout')).toBeDefined();
    expect(screen.getByText('Journals View Style')).toBeDefined();
    expect(screen.getByText(/Aqua Vitaeum · Beta v0.1.0/i)).toBeDefined();
  });

  it('triggers onJournalLayoutChange when clicking bookshelf layout toggle', () => {
    const onJournalLayoutChange = vi.fn();
    render(
      <LanguageProvider>
        <ProfileView
          layout="list"
          onLayoutChange={() => {}}
          journalLayout="manuscript"
          onJournalLayoutChange={onJournalLayoutChange}
        />
      </LanguageProvider>
    );

    const bookshelfBtn = screen.getByRole('button', { name: /Bookshelf View/i });
    bookshelfBtn.click();
    expect(onJournalLayoutChange).toHaveBeenCalledWith('bookshelf');
  });
});
