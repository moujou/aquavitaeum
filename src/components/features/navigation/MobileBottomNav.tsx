'use client';

import React from 'react';
import { Menu, Plus, BookOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface MobileBottomNavProps {
  activeView: 'welcome' | 'overview' | 'journal-detail' | 'profile';
  activeJournalId: string | null;
  isBottomBarVisible: boolean;
  isMobileDrawerOpen: boolean;
  setActiveView: (view: 'welcome' | 'overview' | 'journal-detail' | 'profile') => void;
  setActiveJournalId: (id: string | null) => void;
  setIsMobileDrawerOpen: (open: boolean) => void;
  setIsCreateJournalModalOpen: (open: boolean) => void;
  handleNewNote: () => void;
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
      {/* Left Group (flex-1) */}
      <div className="flex-1 flex justify-around items-center h-full">
        {/* Tab 1: Bookshelf */}
        <button
          type="button"
          onClick={() => {
            setActiveJournalId(null);
            setActiveView('overview');
            setIsMobileDrawerOpen(false);
          }}
          className={cn(
            "flex items-center justify-center w-16 h-full border-t-4 transition-all cursor-pointer",
            activeView === 'overview'
              ? "border-[#C59B27] bg-gradient-to-b from-black/35 from-0% to-transparent to-[12%] text-[#e8d5b7]"
              : "border-transparent text-[#e8d5b7]/60 hover:text-[#e8d5b7]/90 active:border-[#C59B27]"
          )}
          title={t('journalsTitle')}
        >
          <BookOpen size={20} />
        </button>

        {/* Tab 2: Collection Drawer (Only visible when activeJournalId is present) */}
        {activeJournalId ? (
          <button
            type="button"
            onClick={() => {
              if (activeView !== 'journal-detail') {
                setActiveView('journal-detail');
                setIsMobileDrawerOpen(true);
              } else {
                setIsMobileDrawerOpen(!isMobileDrawerOpen);
              }
            }}
            className={cn(
              "flex items-center justify-center w-16 h-full border-t-4 transition-all cursor-pointer",
              (isMobileDrawerOpen && activeView === 'journal-detail')
                ? "border-[#C59B27] bg-gradient-to-b from-black/35 from-0% to-transparent to-[12%] text-[#e8d5b7]"
                : "border-transparent text-[#e8d5b7]/60 hover:text-[#e8d5b7]/90 active:border-[#C59B27]"
            )}
            title={t('collection')}
          >
            <Menu size={20} />
          </button>
        ) : (
          // Spacer to maintain centering alignment when no active journal
          <div className="w-16 h-full" />
        )}
      </div>

      {/* Center Group: Primary Action Highlighted Circular FAB (flex-shrink-0) */}
      <div className="w-14 flex items-center justify-center flex-shrink-0 h-full">
        <button
          type="button"
          onClick={() => {
            if (activeView === 'journal-detail') {
              handleNewNote();
              setIsMobileDrawerOpen(false);
            } else if (activeView === 'overview') {
              setIsCreateJournalModalOpen(true);
            } else if (activeView === 'profile') {
              if (activeJournalId) {
                setActiveView('journal-detail');
                handleNewNote();
                setIsMobileDrawerOpen(false);
              } else {
                setActiveView('overview');
                setIsCreateJournalModalOpen(true);
              }
            }
          }}
          className="w-9 h-9 rounded-full bg-[#E8D5B7] text-[#311e15] border border-[#C59B27]/40 shadow-[0_0_12px_rgba(197,155,39,0.4)] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-20 hover:bg-[#F5F2EB]"
          title="Create New"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Right Group (flex-1) */}
      <div className="flex-1 flex justify-around items-center h-full">
        {/* Symmetrical inner spacer to match the left Collection tab */}
        {activeJournalId ? (
          <div className="w-16 h-full" />
        ) : (
          // Spacer to maintain centering alignment when no active journal
          <div className="w-16 h-full" />
        )}

        {/* Tab 3: You (Profile) */}
        <button
          type="button"
          onClick={() => {
            setActiveView('profile');
            setIsMobileDrawerOpen(false);
          }}
          className={cn(
            "flex items-center justify-center w-16 h-full border-t-4 transition-all cursor-pointer",
            activeView === 'profile'
              ? "border-[#C59B27] bg-gradient-to-b from-black/35 from-0% to-transparent to-[12%] text-[#e8d5b7]"
              : "border-transparent text-[#e8d5b7]/60 hover:text-[#e8d5b7]/90 active:border-[#C59B27]"
          )}
          title={t('profileTab')}
        >
          <User size={20} />
        </button>
      </div>
    </nav>
  );
}
