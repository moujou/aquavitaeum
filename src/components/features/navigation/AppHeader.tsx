'use client';

import React from 'react';
import { User, BookOpen, Book } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { SpiritType } from '@/types/spirit.types';
import { JournalWithStats } from '@/hooks/useJournals';
import { JournalShelfLayout } from '@/hooks/useLayoutPreference';
import GlobalSearch from '@/components/features/search/GlobalSearch';
import { AromaIcon } from '@/components/ui/AromaIcon';

interface AppHeaderProps {
  basePath: string;
  journals: JournalWithStats[];
  journalLayout?: JournalShelfLayout;
  activeView: 'loading' | 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'aroma-catalog' | 'profile';
  setActiveView: (view: 'loading' | 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'aroma-catalog' | 'profile') => void;
  setActiveJournalId: (id: string | null) => void;
  selectSpirit: (id: string) => void;
  isBottomBarVisible: boolean;
  onEnterProfile: () => void;
  onLeaveProfile: () => void;
  onEnterAromaCatalog?: () => void;
  onGoToOverview?: () => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  globalTypeFilter: SpiritType | 'All';
  setGlobalTypeFilter: (t: SpiritType | 'All') => void;
  isSelectMode?: boolean;
  onNavigateToSpirit?: (spiritId: string, journalId: string) => void;
  onNavigateToAroma?: (aromaName: string) => void;
}

export default function AppHeader({
  basePath,
  journals,
  journalLayout = 'manuscript',
  activeView,
  setActiveView,
  setActiveJournalId,
  selectSpirit,
  isBottomBarVisible,
  onEnterProfile,
  onLeaveProfile,
  onEnterAromaCatalog,
  onGoToOverview,
  globalSearchQuery,
  setGlobalSearchQuery,
  globalTypeFilter,
  setGlobalTypeFilter,
  isSelectMode = false,
  onNavigateToSpirit,
  onNavigateToAroma,
}: AppHeaderProps) {
  const { t, language } = useLanguage();
  const JournalIcon = journalLayout === 'bookshelf' ? Book : BookOpen;

  return (
    <header
      id="app-header"
      className={cn(
        'flex-shrink-0 h-16 max-lg:h-[calc(4rem+env(safe-area-inset-top,0px))] max-lg:pt-[env(safe-area-inset-top,0px)] w-full border-b border-[var(--parchment-border)] bg-[var(--nav-bg)] z-30 shadow-xs transition-transform duration-250 ease-out',
        'max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:right-0',
        !isBottomBarVisible && activeView !== 'profile'
          ? 'max-lg:-translate-y-full max-lg:pointer-events-none'
          : 'translate-y-0'
      )}
    >
      <div className="w-full max-w-6xl mx-auto h-full flex items-center justify-between px-3 sm:px-6">
        {/* ── Desktop Layout Header ─────────────────────────────────── */}
        <button
          type="button"
          onClick={() => {
            if (onGoToOverview) {
              onGoToOverview();
            } else {
              setActiveJournalId(null);
              setActiveView('overview');
            }
          }}
          className="hidden lg:flex items-center gap-3.5 w-60 shrink-0 select-none cursor-pointer text-left group"
          title={t('journalsTitle')}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}/favicon.svg`}
            alt="Aqua Vitaeum Logo"
            className="w-11 h-11 sm:w-12 sm:h-12 select-none pointer-events-none drop-shadow-xs transition-transform group-hover:scale-105"
            width={48}
            height={48}
          />
          <h1 className="font-display text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-wide leading-none">
            {t('appTitle')}
          </h1>
        </button>

        <div className="hidden lg:flex flex-1 justify-center max-w-lg xl:max-w-xl mx-4">
          {isSelectMode && activeView !== 'aroma-catalog' ? (
            <div className="flex items-center justify-center h-10 px-5 rounded-full bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] text-xs font-display tracking-wide text-[var(--wood-selection)] font-bold shadow-xs select-none animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-[var(--wood-selection)] animate-pulse mr-2" />
              {language === 'DE' ? 'Auswahlmodus aktiv' : 'Selection Mode Active'}
            </div>
          ) : (
            <GlobalSearch
              journals={journals}
              activeView={activeView}
              setActiveJournalId={setActiveJournalId}
              setActiveView={setActiveView}
              selectSpirit={selectSpirit}
              globalSearchQuery={globalSearchQuery}
              setGlobalSearchQuery={setGlobalSearchQuery}
              globalTypeFilter={globalTypeFilter}
              setGlobalTypeFilter={setGlobalTypeFilter}
              onNavigateToSpirit={onNavigateToSpirit}
              onNavigateToAroma={onNavigateToAroma}
            />
          )}
        </div>

        {/* Desktop Right Navigation Action Buttons (Journals, Aroma Catalog, Profile) */}
        <div className="hidden lg:flex items-center justify-end w-60 shrink-0 gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (onGoToOverview) {
                onGoToOverview();
              } else {
                setActiveJournalId(null);
                setActiveView('overview');
              }
            }}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] text-[var(--fab-text)] border border-[var(--fab-border)] shadow-xs transition-all duration-150 cursor-pointer select-none active:scale-95',
              activeView === 'overview' && 'ring-2 ring-[var(--nav-active)] ring-offset-2 ring-offset-[var(--nav-bg)]'
            )}
            title={t('journalsTitle')}
            aria-label={t('journalsTitle')}
          >
            <JournalIcon size={20} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (onEnterAromaCatalog) {
                onEnterAromaCatalog();
              } else {
                setActiveView('aroma-catalog');
              }
            }}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] text-[var(--fab-text)] border border-[var(--fab-border)] shadow-xs transition-all duration-150 cursor-pointer select-none active:scale-95',
              activeView === 'aroma-catalog' && 'ring-2 ring-[var(--nav-active)] ring-offset-2 ring-offset-[var(--nav-bg)]'
            )}
            title={t('aromaCatalogTitle')}
            aria-label={t('aromaCatalogTitle')}
          >
            <AromaIcon size={21} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeView === 'profile') {
                onLeaveProfile();
              } else {
                onEnterProfile();
              }
            }}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-full bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] text-[var(--fab-text)] border border-[var(--fab-border)] shadow-xs transition-all duration-150 cursor-pointer select-none active:scale-95',
              activeView === 'profile' && 'ring-2 ring-[var(--nav-active)] ring-offset-2 ring-offset-[var(--nav-bg)]'
            )}
            title={t('profileTab')}
            aria-label={t('profileTab')}
          >
            <User size={21} strokeWidth={2} />
          </button>
        </div>

        {/* ── Mobile Layout Header ─────────────────────────────────── */}
        <div className="flex lg:hidden items-center justify-between w-full gap-1.5">
          {/* Left Slot: Atelier brand logo */}
          <button
            type="button"
            onClick={() => {
              setActiveJournalId(null);
              setActiveView('overview');
            }}
            className="w-9 h-9 flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-90 transition-transform select-none"
            title={t('appTitle')}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${basePath}/favicon.svg`}
              alt="Aqua Vitaeum"
              className="w-8 h-8 select-none pointer-events-none drop-shadow-xs"
              width={32}
              height={32}
            />
          </button>

          {/* Center Search Bar or Selection Indicator */}
          <div className="flex-1 flex justify-center min-w-0">
            {isSelectMode && activeView !== 'aroma-catalog' ? (
              <div className="flex items-center justify-center h-8 px-4 rounded-full bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] text-[11px] font-display tracking-wide text-[var(--wood-selection)] font-bold shadow-xs select-none animate-fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--wood-selection)] animate-pulse mr-2" />
                {language === 'DE' ? 'Auswahlmodus' : 'Select Mode'}
              </div>
            ) : (
              <GlobalSearch
                journals={journals}
                activeView={activeView}
                setActiveJournalId={setActiveJournalId}
                setActiveView={setActiveView}
                selectSpirit={selectSpirit}
                globalSearchQuery={globalSearchQuery}
                setGlobalSearchQuery={setGlobalSearchQuery}
                globalTypeFilter={globalTypeFilter}
                setGlobalTypeFilter={setGlobalTypeFilter}
                onNavigateToSpirit={onNavigateToSpirit}
                onNavigateToAroma={onNavigateToAroma}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
