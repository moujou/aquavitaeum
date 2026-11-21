'use client';

import { Plus, BookOpen, Book, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { OverviewLayout, JournalShelfLayout } from '@/hooks/useLayoutPreference';
import { AromaIcon } from '@/components/ui/AromaIcon';

export type ActiveAppView = 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'aroma-catalog' | 'profile';

interface MobileBottomNavProps {
  activeView: ActiveAppView;
  activeJournalId: string | null;
  layout?: OverviewLayout;
  journalLayout?: JournalShelfLayout;
  isBottomBarVisible: boolean;
  isMobileDrawerOpen: boolean;
  setActiveView: (view: ActiveAppView) => void;
  setActiveJournalId: (id: string | null) => void;
  setIsMobileDrawerOpen: (open: boolean) => void;
  setIsCreateJournalModalOpen: (open: boolean) => void;
  setIsCreateAromaModalOpen?: (open: boolean) => void;
  handleNewNote: () => void;
  onEnterProfile: () => void;
  onLeaveProfile: () => void;
  onEnterAromaCatalog?: () => void;
  onGoToOverview?: () => void;
}

export default function MobileBottomNav({
  activeView,
  journalLayout = 'manuscript',
  isBottomBarVisible,
  isMobileDrawerOpen,
  setActiveView,
  setActiveJournalId,
  setIsMobileDrawerOpen,
  setIsCreateJournalModalOpen,
  setIsCreateAromaModalOpen,
  handleNewNote,
  onEnterProfile,
  onLeaveProfile,
  onEnterAromaCatalog,
  onGoToOverview,
}: MobileBottomNavProps) {
  const { t } = useLanguage();

  const isOverviewActive = activeView === 'overview';
  const isAromaCatalogActive = activeView === 'aroma-catalog';
  const isProfileActive = activeView === 'profile';

  const JournalIcon = journalLayout === 'bookshelf' ? Book : BookOpen;
  const leftTabTitle = t('journalsTitle');
  const aromaTabTitle = t('aromaCatalogTitle');

  const isBarShown = isBottomBarVisible || isMobileDrawerOpen || activeView === 'profile';
  const isFabVisible = isBottomBarVisible && activeView !== 'profile';

  return (
    <>
      {/* Context-Smart Floating Action Button (Bottom-Right on Mobile, hides on downward scroll & in Profile) */}
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
          } else if (activeView === 'aroma-catalog') {
            setIsCreateAromaModalOpen?.(true);
            if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
          } else {
            setIsCreateJournalModalOpen(true);
          }
        }}
        className={cn(
          'fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] z-50 lg:hidden w-13 h-13 rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] shadow-[0_8px_24px_-2px_rgba(0,0,0,0.35),0_4px_10px_-2px_rgba(24,94,55,0.28)] flex items-center justify-center cursor-pointer hover:bg-[var(--fab-bg-hover)] active:scale-90 transition-all duration-250 ease-out',
          isFabVisible
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-16 opacity-0 scale-75 pointer-events-none'
        )}
        title={activeView === 'aroma-catalog' ? t('addAromaBtn') : t('addJournalOrNote')}
        aria-label={t('addJournalOrNote')}
      >
        <Plus size={25} strokeWidth={2.5} />
      </button>

      {/* Bottom 3-Tab Navigation Bar */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] z-50 bg-[var(--nav-bg)] border-t border-[var(--parchment-border)] shadow-xs flex items-center justify-around px-4 lg:hidden transition-transform duration-250 ease-out',
          isBarShown ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        )}
      >
        {/* 1. Left: Journals Overview Tab */}
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
            'flex flex-col items-center justify-center flex-1 max-w-[96px] h-16 transition-colors cursor-pointer relative group',
            isOverviewActive
              ? 'text-[var(--nav-active)]'
              : 'text-[var(--nav-inactive)] hover:text-[var(--foreground)] active:scale-95'
          )}
          title={leftTabTitle}
          aria-label={leftTabTitle}
        >
          {isOverviewActive && (
            <div className="absolute top-0 inset-x-4 h-[3px] rounded-b-full bg-[var(--nav-active)]" />
          )}
          <JournalIcon
            size={24}
            strokeWidth={isOverviewActive ? 2.4 : 1.75}
            className="transition-transform group-hover:scale-105 duration-200"
          />
        </button>

        {/* 2. Center: Aroma Catalog Tab (Steaming Aroma Bowl Icon) */}
        <button
          type="button"
          onClick={() => {
            if (onEnterAromaCatalog) {
              onEnterAromaCatalog();
            } else {
              setActiveView('aroma-catalog');
            }
            if (setIsMobileDrawerOpen) setIsMobileDrawerOpen(false);
          }}
          className={cn(
            'flex flex-col items-center justify-center flex-1 max-w-[96px] h-16 transition-colors cursor-pointer relative group',
            isAromaCatalogActive
              ? 'text-[var(--nav-active)]'
              : 'text-[var(--nav-inactive)] hover:text-[var(--foreground)] active:scale-95'
          )}
          title={aromaTabTitle}
          aria-label={aromaTabTitle}
        >
          {isAromaCatalogActive && (
            <div className="absolute top-0 inset-x-4 h-[3px] rounded-b-full bg-[var(--nav-active)]" />
          )}
          <AromaIcon
            size={24}
            strokeWidth={isAromaCatalogActive ? 2.4 : 1.75}
            className="transition-transform group-hover:scale-105 duration-200"
          />
        </button>

        {/* 3. Right: Profile Tab */}
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
            'flex flex-col items-center justify-center flex-1 max-w-[96px] h-16 transition-colors cursor-pointer relative group',
            isProfileActive
              ? 'text-[var(--nav-active)]'
              : 'text-[var(--nav-inactive)] hover:text-[var(--foreground)] active:scale-95'
          )}
          title={t('profileTab')}
        >
          {isProfileActive && (
            <div className="absolute top-0 inset-x-4 h-[3px] rounded-b-full bg-[var(--nav-active)]" />
          )}
          <User
            size={24}
            strokeWidth={isProfileActive ? 2.4 : 1.75}
            className="transition-transform group-hover:scale-105 duration-200"
          />
        </button>
      </nav>
    </>
  );
}
