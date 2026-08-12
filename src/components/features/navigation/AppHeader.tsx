'use client';

import React from 'react';
import { User, Menu } from 'lucide-react';
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
  setIsMobileDrawerOpen?: (open: boolean) => void;
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
  setIsMobileDrawerOpen,
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
          <h1 className="font-display text-sm sm:text-base font-bold text-[#C59B27] tracking-wide leading-none">
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
            "flex h-8 w-8 items-center justify-center rounded-full bg-[#E8D5B7] text-[#311e15] hover:bg-[#F5F2EB] transition-all duration-150 cursor-pointer select-none",
            activeView === 'profile' && "ring-2 ring-[#C59B27] ring-offset-2 ring-offset-[#311e15]"
          )}
          title={t('profileTab')}
        >
          <User size={16} />
        </button>
      </div>

      {/* ── Mobile Layout Header ─────────────────────────────────── */}
      <div className="flex lg:hidden items-center justify-between w-full">
        {/* Left Slot: Burger Menu FAB (Reddit Style) */}
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          {activeView === 'journal-detail' && activeJournalId && setIsMobileDrawerOpen && (
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className={cn(
                "w-8 h-8 rounded-full bg-[#E8D5B7] text-[#311e15] border border-[#C59B27]/40 shadow-[0_2px_6px_rgba(0,0,0,0.35)] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-20 hover:bg-[#F5F2EB]",
                isMobileDrawerOpen && "bg-[#F5F2EB] text-[#21140e] border-[#C59B27]/80"
              )}
              title="Toggle Spirit List"
            >
              <Menu size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>

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
