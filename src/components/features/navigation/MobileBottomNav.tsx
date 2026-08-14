'use client';

import React from 'react';
import { Plus, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface MobileBottomNavProps {
  activeView: 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'profile';
  activeJournalId: string | null;
  isBottomBarVisible: boolean;
  isMobileDrawerOpen: boolean;
  setActiveView: (view: 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'profile') => void;
  setActiveJournalId: (id: string | null) => void;
  setIsMobileDrawerOpen: (open: boolean) => void;
  setIsCreateJournalModalOpen: (open: boolean) => void;
  handleNewNote: () => void;
  onEnterProfile: () => void;
  onLeaveProfile: () => void;
}

export default function MobileBottomNav({
  activeView,
  activeJournalId,
  isBottomBarVisible,
  isMobileDrawerOpen,
  setActiveView,
  setActiveJournalId,
  setIsMobileDrawerOpen,
  setIsCreateJournalModalOpen,
  handleNewNote,
  onEnterProfile,
  onLeaveProfile,
}: MobileBottomNavProps) {
  const { t } = useLanguage();

  const isBookshelfActive = activeView === 'overview' || activeView === 'journal-landing';
  const isProfileActive = activeView === 'profile';

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 h-14 z-50 bg-wood border-t border-[var(--brass-accent)]/25 shadow-[0_-8px_30px_rgba(0,0,0,0.7)] flex items-center justify-around px-6 pb-safe lg:hidden transition-all duration-300 ease-in-out",
        (isBottomBarVisible || isMobileDrawerOpen || activeView === 'profile')
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      {/* Left: Journals / Bookshelf Tab */}
      <button
        type="button"
        onClick={() => {
          if (activeView === 'journal-detail') {
            setActiveView('journal-landing');
          } else {
            setActiveJournalId(null);
            setActiveView('overview');
          }
          if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
        }}
        className={cn(
          "flex items-center justify-center w-14 h-full transition-all cursor-pointer relative group",
          isBookshelfActive
            ? "text-[var(--brass-accent)]"
            : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/90 active:scale-95"
        )}
        title={t('journalsTitle')}
      >
        <BookOpen
          size={22}
          strokeWidth={isBookshelfActive ? 2.2 : 1.75}
          className="transition-transform group-hover:scale-110 duration-200"
        />
        {/* Active Golden Bar Indicator */}
        {isBookshelfActive && (
          <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-[var(--brass-accent)] shadow-[0_0_6px_var(--brass-accent)]" />
        )}
      </button>

      {/* Center: Flush In-Line Action Button (Contained inside bar) */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => {
            if (activeView === 'journal-detail') {
              handleNewNote();
              if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
            } else if (activeView === 'journal-landing') {
              handleNewNote();
              setActiveView('journal-detail');
              if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
            } else if (activeView === 'overview') {
              setIsCreateJournalModalOpen(true);
            } else if (activeView === 'profile') {
              if (activeJournalId) {
                setActiveView('journal-detail');
                handleNewNote();
                if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
              } else {
                setActiveView('overview');
                setIsCreateJournalModalOpen(true);
              }
            }
          }}
          className="w-9 h-9 rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] border border-[var(--brass-accent)]/50 shadow-md flex items-center justify-center cursor-pointer hover:bg-[var(--fab-bg-hover)] active:scale-95 transition-all"
          title="Create New"
        >
          <Plus size={20} strokeWidth={2.5} />
        </button>
      </div>

      {/* Right: Profile Tab */}
      <button
        type="button"
        onClick={() => {
          if (activeView === 'profile') {
            onLeaveProfile();
          } else {
            onEnterProfile();
          }
          if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
        }}
        className={cn(
          "flex items-center justify-center w-14 h-full transition-all cursor-pointer relative group",
          isProfileActive
            ? "text-[var(--brass-accent)]"
            : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]/90 active:scale-95"
        )}
        title={t('profileTab')}
      >
        <User
          size={22}
          strokeWidth={isProfileActive ? 2.2 : 1.75}
          className="transition-transform group-hover:scale-110 duration-200"
        />
        {/* Active Golden Bar Indicator */}
        {isProfileActive && (
          <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-[var(--brass-accent)] shadow-[0_0_6px_var(--brass-accent)]" />
        )}
      </button>
    </nav>
  );
}
