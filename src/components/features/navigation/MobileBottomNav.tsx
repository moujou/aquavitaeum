'use client';

import { Plus, BookOpen, Book, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { OverviewLayout, JournalShelfLayout } from '@/hooks/useLayoutPreference';

interface MobileBottomNavProps {
  activeView: 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'profile';
  activeJournalId: string | null;
  layout?: OverviewLayout;
  journalLayout?: JournalShelfLayout;
  isBottomBarVisible: boolean;
  isMobileDrawerOpen: boolean;
  setActiveView: (view: 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'profile') => void;
  setActiveJournalId: (id: string | null) => void;
  setIsMobileDrawerOpen: (open: boolean) => void;
  setIsCreateJournalModalOpen: (open: boolean) => void;
  handleNewNote: () => void;
  onEnterProfile: () => void;
  onLeaveProfile: () => void;
  onGoToOverview?: () => void;
}

export default function MobileBottomNav({
  activeView,
  activeJournalId,
  journalLayout = 'manuscript',
  isBottomBarVisible,
  isMobileDrawerOpen,
  setActiveView,
  setActiveJournalId,
  setIsMobileDrawerOpen,
  setIsCreateJournalModalOpen,
  handleNewNote,
  onEnterProfile,
  onLeaveProfile,
  onGoToOverview,
}: MobileBottomNavProps) {
  const { t } = useLanguage();

  const isOverviewActive = activeView === 'overview';
  const isProfileActive = activeView === 'profile';

  const JournalIcon = journalLayout === 'bookshelf' ? Book : BookOpen;
  const leftTabTitle = t('journalsTitle');

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] z-50 bg-[var(--nav-bg)]/98 backdrop-blur-md border-t border-[var(--forest-green)]/30 shadow-[0_-4px_18px_rgba(46,148,93,0.13)] flex items-center justify-around px-4 lg:hidden transform-gpu will-change-transform transition-transform duration-250 ease-out",
        (isBottomBarVisible || isMobileDrawerOpen || activeView === 'profile')
          ? "translate-y-0"
          : "translate-y-full pointer-events-none"
      )}
    >
      {/* Left: Journals Overview Navigation Tab (Direct jump to Journals Overview) */}
      <button
        type="button"
        onClick={() => {
          if (onGoToOverview) {
            onGoToOverview();
          } else {
            setActiveJournalId(null);
            setActiveView('overview');
          }
          if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
        }}
        className={cn(
          "flex flex-col items-center justify-center w-[68px] h-12 transition-all cursor-pointer relative group rounded-xl my-auto",
          isOverviewActive
            ? "bg-[var(--forest-green)]/15 border border-[var(--forest-green)]/35 text-[var(--nav-active)] shadow-[0_2px_12px_rgba(46,148,93,0.22)]"
            : "text-[var(--nav-inactive)] hover:text-[var(--forest-green)] hover:bg-[var(--forest-green)]/10 active:scale-95"
        )}
        title={leftTabTitle}
        aria-label={leftTabTitle}
      >
        <JournalIcon
          size={23}
          strokeWidth={isOverviewActive ? 2.2 : 1.75}
          className="transition-transform group-hover:scale-110 duration-200"
        />
        {/* Active High-Contrast Indicator */}
        {isOverviewActive && (
          <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-[var(--nav-active)] shadow-[0_0_8px_rgba(46,148,93,0.5)]" />
        )}
      </button>

      {/* Center: Flush In-Line Action Button (48px Ergonomic Trigger with 16px safety spacing) */}
      <div className="w-16 h-full flex items-center justify-center shrink-0">
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
          className="w-12 h-12 rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] border border-[var(--fab-border)] shadow-md flex items-center justify-center cursor-pointer hover:bg-[var(--fab-bg-hover)] active:scale-90 transition-all duration-150"
          title="Create New"
        >
          <Plus size={24} strokeWidth={2.5} />
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
          "flex flex-col items-center justify-center w-[68px] h-12 transition-all cursor-pointer relative group rounded-xl my-auto",
          isProfileActive
            ? "bg-[var(--forest-green)]/15 border border-[var(--forest-green)]/35 text-[var(--nav-active)] shadow-[0_2px_12px_rgba(46,148,93,0.22)]"
            : "text-[var(--nav-inactive)] hover:text-[var(--forest-green)] hover:bg-[var(--forest-green)]/10 active:scale-95"
        )}
        title={t('profileTab')}
      >
        <User
          size={23}
          strokeWidth={isProfileActive ? 2.2 : 1.75}
          className="transition-transform group-hover:scale-110 duration-200"
        />
        {/* Active High-Contrast Indicator */}
        {isProfileActive && (
          <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-[var(--nav-active)] shadow-[0_0_8px_rgba(46,148,93,0.5)]" />
        )}
      </button>
    </nav>
  );
}
