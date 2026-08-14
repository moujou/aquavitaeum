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

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 h-12 z-50 bg-wood border-t border-black/40 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] flex items-center pb-safe lg:hidden transition-all duration-300 ease-in-out",
        (isBottomBarVisible || isMobileDrawerOpen || activeView === 'profile')
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      {/* Left Group: Bookshelf Button */}
      <div className="flex-1 flex justify-center items-center h-full">
        <button
          type="button"
          onClick={() => {
            if (activeView === 'journal-detail') {
              // From detail → go back to landing page
              setActiveView('journal-landing');
            } else {
              // From landing → go back to overview
              setActiveJournalId(null);
              setActiveView('overview');
            }
            if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
          }}
          className={cn(
            "flex items-center justify-center w-20 h-full border-t-4 transition-all cursor-pointer",
            activeView === 'overview' || activeView === 'journal-landing'
              ? "border-[var(--brass-accent)] bg-gradient-to-b from-black/35 from-0% to-transparent to-[12%] text-[var(--foreground)]"
              : "border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]/90 active:border-[var(--brass-accent)]"
          )}
          title={t('journalsTitle')}
        >
          <BookOpen 
            size={24} 
            strokeWidth={activeView === 'overview' ? 2 : 1.75} 
            fill={activeView === 'overview' ? 'currentColor' : 'none'}
            fillOpacity={activeView === 'overview' ? 0.25 : 0}
          />
        </button>
      </div>

      {/* Center Group: Primary Action FAB */}
      <div className="w-14 flex items-center justify-center flex-shrink-0 h-full">
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
          className="w-9 h-9 rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] border border-[var(--brass-accent)]/40 shadow-[0_0_12px_rgba(197,155,39,0.4)] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-20 hover:bg-[var(--fab-bg-hover)]"
          title="Create New"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Right Group: Profile/You Button */}
      <div className="flex-1 flex justify-center items-center h-full">
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
            "flex items-center justify-center w-20 h-full border-t-4 transition-all cursor-pointer",
            activeView === 'profile'
              ? "border-[var(--brass-accent)] bg-gradient-to-b from-black/35 from-0% to-transparent to-[12%] text-[var(--foreground)]"
              : "border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]/90 active:border-[var(--brass-accent)]"
          )}
          title={t('profileTab')}
        >
          <User 
            size={24} 
            strokeWidth={activeView === 'profile' ? 2 : 1.75} 
            fill={activeView === 'profile' ? 'currentColor' : 'none'}
            fillOpacity={activeView === 'profile' ? 0.25 : 0}
          />
        </button>
      </div>
    </nav>
  );
}
