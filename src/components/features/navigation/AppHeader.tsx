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
  activeView: 'loading' | 'welcome' | 'overview' | 'journal-detail' | 'profile';
  setActiveView: (view: 'loading' | 'welcome' | 'overview' | 'journal-detail' | 'profile') => void;
  activeJournalId: string | null;
  setActiveJournalId: (id: string | null) => void;
  selectSpirit: (id: string) => void;
  isBottomBarVisible: boolean;
  isMobileDrawerOpen: boolean;
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
  activeJournalId,
  setActiveJournalId,
  selectSpirit,
  isBottomBarVisible,
  isMobileDrawerOpen,
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
        "flex-shrink-0 h-14 flex items-center justify-between px-3 sm:px-6 border-b border-black/40 border-t border-white/[0.03] bg-wood z-30 shadow-md transition-all duration-300 ease-in-out",
        "max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:right-0",
        (!isBottomBarVisible && !isMobileDrawerOpen && activeView !== 'profile')
          ? "max-lg:-translate-y-full max-lg:opacity-0 max-lg:pointer-events-none"
          : "translate-y-0 opacity-100"
      )}
    >
      {/* Left Header: Brand Logo & Title (Desktop Only) */}
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
          <h1 className="font-display text-sm sm:text-base font-bold text-[#C59B27] tracking-wide leading-none">
            {t('appTitle')}
          </h1>
          <p className="font-body text-[9px] text-white/40 uppercase tracking-widest leading-none mt-1">
            {t('appSubtitle')}
          </p>
        </div>
      </div>

      {/* Middle Header: Global Search Bar */}
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

      {/* Right Header: Desktop Profile Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (activeView === 'profile') {
              if (activeJournalId) {
                setActiveView('journal-detail');
              } else {
                setActiveView('overview');
              }
            } else {
              setActiveView('profile');
            }
          }}
          className={cn(
            "hidden lg:flex h-8 w-8 items-center justify-center rounded-full bg-[#E8D5B7] text-[#311e15] hover:bg-[#F5F2EB] transition-all duration-150 cursor-pointer select-none",
            activeView === 'profile' && "ring-2 ring-[#C59B27] ring-offset-2 ring-offset-[#311e15]"
          )}
          title={t('profileTab')}
        >
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
