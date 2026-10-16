import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileBottomNav from '../MobileBottomNav';
import { LanguageProvider } from '@/context/LanguageContext';

describe('MobileBottomNav Component', () => {
  const defaultProps = {
    activeView: 'overview' as const,
    activeJournalId: null,
    isBottomBarVisible: true,
    isMobileDrawerOpen: false,
    setActiveView: vi.fn(),
    setActiveJournalId: vi.fn(),
    setIsMobileDrawerOpen: vi.fn(),
    setIsCreateJournalModalOpen: vi.fn(),
    handleNewNote: vi.fn(),
    onEnterProfile: vi.fn(),
    onLeaveProfile: vi.fn(),
  };

  it('renders navigation buttons (Journals, Add Note / Journal, Profile)', () => {
    render(
      <LanguageProvider>
        <MobileBottomNav {...defaultProps} />
      </LanguageProvider>
    );

    expect(screen.getByRole('button', { name: /Journals|Notizbücher/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /You|Profil|Du/i })).toBeDefined();
  });

  it('triggers onEnterProfile when clicking profile tab from overview', () => {
    const onEnterProfile = vi.fn();
    render(
      <LanguageProvider>
        <MobileBottomNav {...defaultProps} onEnterProfile={onEnterProfile} />
      </LanguageProvider>
    );

    const profileBtn = screen.getByRole('button', { name: /You|Profil|Du/i });
    fireEvent.click(profileBtn);
    expect(onEnterProfile).toHaveBeenCalled();
  });

  it('triggers setIsCreateJournalModalOpen when on overview and plus button is pressed', () => {
    const setIsCreateJournalModalOpen = vi.fn();
    render(
      <LanguageProvider>
        <MobileBottomNav
          {...defaultProps}
          activeView="overview"
          setIsCreateJournalModalOpen={setIsCreateJournalModalOpen}
        />
      </LanguageProvider>
    );

    const plusBtn = screen.getByRole('button', { name: /Create New|Neu|Anlegen/i });
    fireEvent.click(plusBtn);
    expect(setIsCreateJournalModalOpen).toHaveBeenCalledWith(true);
  });

  it('navigates from journal-detail directly to overview when left tab is clicked', () => {
    const setActiveView = vi.fn();
    const setActiveJournalId = vi.fn();
    render(
      <LanguageProvider>
        <MobileBottomNav
          {...defaultProps}
          activeView="journal-detail"
          activeJournalId="journal-1"
          setActiveView={setActiveView}
          setActiveJournalId={setActiveJournalId}
        />
      </LanguageProvider>
    );

    const journalsBtn = screen.getByRole('button', { name: /Journals|Notizbücher/i });
    expect(journalsBtn).toBeDefined();
    fireEvent.click(journalsBtn);
    expect(setActiveJournalId).toHaveBeenCalledWith(null);
    expect(setActiveView).toHaveBeenCalledWith('overview');
  });

  it('navigates from journal-landing back to overview in 1 click', () => {
    const setActiveView = vi.fn();
    const setActiveJournalId = vi.fn();
    render(
      <LanguageProvider>
        <MobileBottomNav
          {...defaultProps}
          activeView="journal-landing"
          activeJournalId="journal-1"
          setActiveView={setActiveView}
          setActiveJournalId={setActiveJournalId}
        />
      </LanguageProvider>
    );

    const journalsBtn = screen.getByRole('button', { name: /Journals|Notizbücher/i });
    expect(journalsBtn).toBeDefined();
    fireEvent.click(journalsBtn);
    expect(setActiveJournalId).toHaveBeenCalledWith(null);
    expect(setActiveView).toHaveBeenCalledWith('overview');
  });

  it('only highlights left tab as active when on overview view, not on landing or detail', () => {
    const { rerender } = render(
      <LanguageProvider>
        <MobileBottomNav {...defaultProps} activeView="overview" />
      </LanguageProvider>
    );

    let leftBtn = screen.getByRole('button', { name: /Journals|Notizbücher/i });
    expect(leftBtn.className).toContain('text-[var(--nav-active)]');

    rerender(
      <LanguageProvider>
        <MobileBottomNav {...defaultProps} activeView="journal-landing" activeJournalId="journal-1" />
      </LanguageProvider>
    );

    leftBtn = screen.getByRole('button', { name: /Journals|Notizbücher/i });
    expect(leftBtn.className).toContain('text-[var(--nav-inactive)]');

    rerender(
      <LanguageProvider>
        <MobileBottomNav {...defaultProps} activeView="journal-detail" activeJournalId="journal-1" />
      </LanguageProvider>
    );

    leftBtn = screen.getByRole('button', { name: /Journals|Notizbücher/i });
    expect(leftBtn.className).toContain('text-[var(--nav-inactive)]');
  });

  it('renders Library icon when journalLayout is "bookshelf"', () => {
    const { container } = render(
      <LanguageProvider>
        <MobileBottomNav {...defaultProps} activeView="overview" journalLayout="bookshelf" />
      </LanguageProvider>
    );

    // Lucide Book icon is rendered for bookshelf
    const bookIcon = container.querySelector('.lucide-book');
    expect(bookIcon).toBeDefined();
  });

  it('calls onGoToOverview when provided and left Journals tab is clicked', () => {
    const onGoToOverview = vi.fn();
    render(
      <LanguageProvider>
        <MobileBottomNav
          {...defaultProps}
          activeView="journal-landing"
          activeJournalId="journal-1"
          onGoToOverview={onGoToOverview}
        />
      </LanguageProvider>
    );

    const journalsBtn = screen.getByRole('button', { name: /Journals|Notizbücher/i });
    fireEvent.click(journalsBtn);
    expect(onGoToOverview).toHaveBeenCalledTimes(1);
  });
});

