'use client';

import React from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { SpiritType } from '@/types/spirit.types';
import { JournalWithStats } from '@/hooks/useJournals';
import GlobalSearch from '@/components/features/search/GlobalSearch';

interface AppHeaderProps {
  basePath: string;
  journals: JournalWithStats[];
  activeView: 'loading' | 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'profile';
  setActiveView: (view: 'loading' | 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'profile') => void;
  setActiveJournalId: (id: string | null) => void;
  selectSpirit: (id: string) => void;
  isBottomBarVisible: boolean;
  isMobileDrawerOpen: boolean;
  onEnterProfile: () => void;
  onLeaveProfile: () => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  globalTypeFilter: SpiritType | 'All';
  setGlobalTypeFilter: (t: SpiritType | 'All') => void;
}

export default function AppHeader({
  basePath,
  journals,
  activeView,
  setActiveView,
  setActiveJournalId,
  selectSpirit,
  isBottomBarVisible,
  isMobileDrawerOpen,
  onEnterProfile,
  onLeaveProfile,
  globalSearchQuery,
  setGlobalSearchQuery,
  globalTypeFilter,
  setGlobalTypeFilter,
}: AppHeaderProps) {
  const { t } = useLanguage();

  return (
    <header
      id="app-header"
      className={cn(
        "flex-shrink-0 h-14 flex items-center justify-between px-3 sm:px-6 border-b border-[var(--brass-accent)]/20 border-t border-white/[0.05] bg-wood z-30 shadow-md transition-all duration-300 ease-in-out",
        "max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:right-0",
        (!isBottomBarVisible && !isMobileDrawerOpen && activeView !== 'profile')
          ? "max-lg:-translate-y-full max-lg:opacity-0 max-lg:pointer-events-none"
          : "translate-y-0 opacity-100"
      )}
    >
      {/* ── Desktop Layout Header ─────────────────────────────────── */}
      <div className="hidden lg:flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${basePath}/whisky-logo-with-circle-v4.svg`}
          alt="Aqua Vitaeum Logo"
          className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 select-none pointer-events-none rounded-full"
          width={40}
          height={40}
        />
        <div>
          <h1 className="font-display text-sm sm:text-base font-bold text-[var(--brass-accent)] tracking-wide leading-none">
            {t('appTitle')}
          </h1>
          <p className="font-body text-[9px] text-white/40 uppercase tracking-widest leading-none mt-1">
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      <div className="hidden lg:block flex-1 max-w-sm sm:max-w-md mx-4">
        <GlobalSearch
          journals={journals}
          setActiveJournalId={setActiveJournalId}
          setActiveView={setActiveView}
          selectSpirit={selectSpirit}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
          globalTypeFilter={globalTypeFilter}
          setGlobalTypeFilter={setGlobalTypeFilter}
        />
      </div>

      <div className="hidden lg:flex items-center gap-3">
        <button
          onClick={() => {
            if (activeView === 'profile') {
              onLeaveProfile();
            } else {
              onEnterProfile();
            }
          }}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] hover:bg-[var(--fab-bg-hover)] transition-all duration-150 cursor-pointer select-none",
            activeView === 'profile' && "ring-2 ring-[var(--brass-accent)] ring-offset-2 ring-offset-[var(--wood-dark)]"
          )}
          title={t('profileTab')}
        >
          <User size={16} />
        </button>
      </div>

      {/* ── Mobile Layout Header ─────────────────────────────────── */}
      <div className="flex lg:hidden items-center justify-between w-full">
        {/* Left Slot: empty spacer (no drawer button — navigation via Bottom Nav) */}
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" />

        {/* Center Search Bar */}
        <div className="flex-1 flex justify-center px-1.5 min-w-0">
          <GlobalSearch
            journals={journals}
            setActiveJournalId={setActiveJournalId}
            setActiveView={setActiveView}
            selectSpirit={selectSpirit}
            globalSearchQuery={globalSearchQuery}
            setGlobalSearchQuery={setGlobalSearchQuery}
            globalTypeFilter={globalTypeFilter}
            setGlobalTypeFilter={setGlobalTypeFilter}
          />
        </div>

        {/* Right Slot: Symmetrical balance spacer */}
        <div className="w-8 h-8 flex-shrink-0" />
      </div>
    </header>
  );
}
