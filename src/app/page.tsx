'use client';

import { useState, useEffect, useMemo, useRef, useCallback, startTransition } from 'react';
import { Plus, BookOpen, AlignJustify, LayoutGrid } from 'lucide-react';
import { useSpiritCollection } from '@/hooks/useSpiritCollection';
import { useJournals } from '@/hooks/useJournals';
import { useLayoutPreference } from '@/hooks/useLayoutPreference';
import { TastingCard } from '@/components/features/tasting-card/TastingCard';
import { WelcomePage } from '@/components/features/welcome/WelcomePage';
import { JournalsOverview } from '@/components/features/journals/JournalsOverview';
import { JournalLandingPage } from '@/components/features/journals/landing';
import { ProfileView } from '@/components/features/profile/ProfileView';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useLanguage } from '@/context/LanguageContext';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { cn } from '@/lib/utils';
import { SpiritType } from '@/types/spirit.types';
import { useGoogleDriveSync } from '@/hooks/useGoogleDriveSync';
import AppLoader from '@/components/ui/AppLoader';
import AppHeader from '@/components/features/navigation/AppHeader';
import MobileBottomNav from '@/components/features/navigation/MobileBottomNav';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { NoteEmptyState } from '@/components/features/journals/landing/NoteEmptyState';

export default function Home() {
  const { t } = useLanguage();
  const basePath = process.env.NODE_ENV === 'production' ? '/aquavitaeum' : '';

  // Global Google Drive background sync engine (runs continuously across all views)
  useGoogleDriveSync();
  
  // Navigation View State: loading | welcome (onboarding) | overview (bookshelf) | journal-landing (note list) | journal-detail (tasting ledger) | profile
  const [activeView, setActiveView] = useState<'loading' | 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'profile'>('loading');
  const [activeJournalId, setActiveJournalId] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const lastScrollTop = useRef(0);
  const [isCreateJournalModalOpen, setIsCreateJournalModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalTypeFilter, setGlobalTypeFilter] = useState<SpiritType | 'All'>('All');
  const [isSelectModeActive, setIsSelectModeActive] = useState(false);
  const { layout, setLayout } = useLayoutPreference();
  // Tracks which view the user was on before opening Profile, so toggling
  // Profile off correctly returns to journal-landing vs journal-detail vs overview.
  const [viewBeforeProfile, setViewBeforeProfile] = useState<'overview' | 'journal-landing' | 'journal-detail'>('overview');

  // Load journals hook
  const {
    journals,
    isLoading: isLoadingJournals,
    createJournal,
    renameJournal,
    deleteJournal,
    refreshJournals,
  } = useJournals();

  // Load spirits collection hook for the selected journal
  const {
    spirits,
    activeSpirit,
    isLoading: isLoadingSpirits,
    selectSpirit,
    handleNewNote,
    handleSave,
    handleDelete,
  } = useSpiritCollection(activeJournalId);

  // Only these scrollable containers should trigger the bottom-bar hide/show.
  const SCROLL_TRACKED_IDS = [
    'journal-overview-scroll',
    'journal-landing-scroll',
    'tasting-card-section',
  ];

  // Mobile smart scroll: hides the bottom nav on downward scroll and reveals on scroll up.
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        return;
      }
      const target = e.target as HTMLElement;
      if (!target || typeof target.scrollTop === 'undefined') return;

      // Guard: only react to scroll events from our designated main-content scrollers.
      // This prevents filter dropdowns and other inner scrollable containers from
      // accidentally hiding the bottom nav.
      const isTrackedScroller = SCROLL_TRACKED_IDS.some((id) => target.id === id);
      if (!isTrackedScroller) return;

      const scrollTop = target.scrollTop;
      if (scrollTop < 0) return;

      const delta = scrollTop - lastScrollTop.current;
      if (Math.abs(delta) < 15) return;

      if (delta > 0 && scrollTop > 60) {
        setIsBottomBarVisible(false);
      } else if (delta < 0) {
        setIsBottomBarVisible(true);
      }
      lastScrollTop.current = scrollTop;
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset scroll state on view transition
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsBottomBarVisible(true);
    setIsSelectModeActive(false);
    lastScrollTop.current = 0;
  }, [activeView]);



  // Local filtered spirits inside the active journal
  const filteredSpirits = useMemo(() => {
    return spirits.filter((s) => {
      const matchesType = globalTypeFilter === 'All' || s.spiritType === globalTypeFilter;
      const q = globalSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (s.distillery || '').toLowerCase().includes(q) ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.region || '').toLowerCase().includes(q) ||
        (s.spiritType || '').toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [spirits, globalSearchQuery, globalTypeFilter]);

  // Automatically refresh journals stats when the active spirits list changes (saved or deleted notes)
  useEffect(() => {
    refreshJournals();
  }, [spirits, refreshJournals]);

  // Lock body scroll when mobile drawer is open to prevent background scroll chaining
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  // Show welcome screen on initial onboarding (only on first launch until completed)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const welcomeCompleted = localStorage.getItem('aqua-vitaeum-welcome-completed');
      if (welcomeCompleted === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveView('overview');
      } else {
        setActiveView('welcome');
      }
    }
  }, []);

  // Find currently active journal object for header meta info
  const activeJournal = useMemo(() => {
    return journals.find((j) => j.id === activeJournalId);
  }, [journals, activeJournalId]);

  // Close mobile drawer on Escape key press (W3C standard dialog behavior)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen]);

  // Swipe-back navigation: left-edge → right swipe maps to logical "go back".
  // Navigation semantics live here; gesture mechanics live in useSwipeBack.
  const handleEnterProfile = useCallback(() => {
    if (activeView !== 'profile') {
      setViewBeforeProfile(activeView as 'overview' | 'journal-landing' | 'journal-detail');
      setActiveView('profile');
    }
  }, [activeView]);

  const handleLeaveProfile = useCallback(() => {
    setActiveView(viewBeforeProfile);
  }, [viewBeforeProfile]);

  const handleSwipeBack = useCallback(() => {
    if (activeView === 'journal-detail') {
      setActiveView('journal-landing');
    } else if (activeView === 'journal-landing') {
      setActiveJournalId(null);
      setActiveView('overview');
    } else if (activeView === 'profile') {
      // Return to the exact view the user was on before opening Profile.
      handleLeaveProfile();
    }
    // 'overview' is the root — no further back action.
  }, [activeView, handleLeaveProfile]);

  // Register the swipe-back gesture. The 44px edge-zone guard in the hook
  // effectively makes it a no-op on desktop even without an explicit lg: check.
  useSwipeBack(handleSwipeBack);

  // Handle welcome onboarding completion
  const handleWelcomeComplete = async (firstJournalName: string, description?: string) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('aqua-vitaeum-welcome-completed', 'true');
      }
      const created = await createJournal(firstJournalName, description);
      if (created && typeof created === 'object' && 'id' in created) {
        setActiveJournalId(created.id as string);
        setActiveView('journal-landing');
      } else {
        setActiveView('overview');
      }
    } catch (err) {
      console.error('Failed to create onboarding journal, falling back to overview.', err);
      setActiveView('overview');
    }
  };

  const handleNavigateToSpirit = useCallback((spiritId: string, journalId: string) => {
    setActiveJournalId(journalId);
    selectSpirit(spiritId);
    setActiveView('journal-detail');
    setGlobalSearchQuery('');
  }, [selectSpirit]);

  // Render a minimal centered loader spinner on initial server/client mount to prevent layout flickers
  if (activeView === 'loading') {
    return <AppLoader />;
  }

  // If in welcome/onboarding view, render welcome page full-screen overlay
  if (activeView === 'welcome') {
    return (
      <>
        <title>Aqua Vitaeum · Welcome</title>
        <WelcomePage 
          hasJournals={journals.length > 0}
          onComplete={handleWelcomeComplete} 
          onEnter={() => {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('aqua-vitaeum-session-started', 'true');
            }
            setActiveView('overview');
          }}
        />
      </>
    );
  }

  return (
    <>
      <title>
        {activeJournal
          ? `Aqua Vitaeum · ${activeJournal.name}`
          : 'Aqua Vitaeum · Fine Spirits Tasting Notes'}
      </title>

      <main
        id="app-main"
        className={cn(
          'h-screen flex flex-col overflow-hidden',
          'bg-[var(--pub-bg)] text-[var(--foreground)]'
        )}
      >
        {/* ── App Header ─────────────────────────────────────────────────── */}
        <AppHeader
          basePath={basePath}
          journals={journals}
          activeView={activeView}
          setActiveView={setActiveView}
          setActiveJournalId={setActiveJournalId}
          selectSpirit={selectSpirit}
          isBottomBarVisible={isBottomBarVisible}
          onEnterProfile={handleEnterProfile}
          onLeaveProfile={handleLeaveProfile}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
          globalTypeFilter={globalTypeFilter}
          setGlobalTypeFilter={setGlobalTypeFilter}
          isSelectMode={isSelectModeActive}
          onNavigateToSpirit={handleNavigateToSpirit}
        />

        {/* ── Main Layout View switcher ──────────────────────────────────── */}
        {activeView === 'profile' ? (
          <div className="flex-1 overflow-y-auto bg-[var(--pub-bg)] pt-16 lg:pt-0 pb-16 lg:pb-0 flex items-center justify-center">
            <ProfileView layout={layout} onLayoutChange={setLayout} />
          </div>
        ) : activeView === 'overview' ? (
          <div className="flex-1 h-full relative overflow-hidden flex flex-col">
            <div id="journal-overview-scroll" className="flex-1 overflow-y-auto bg-[var(--pub-bg)] pt-16 lg:pt-0 pb-16 lg:pb-0">
              {isLoadingJournals ? (
                <div className="flex-1 h-64 flex flex-col items-center justify-center text-center p-6 select-none animate-pulse">
                  <div className="w-16 h-16 rounded-full border border-[var(--forest-green)]/40 flex items-center justify-center bg-[var(--wood-dark)]/10 mb-4 shadow-[0_0_25px_rgba(35,115,71,0.20)]">
                    <WhiskyLogo size={32} className="text-[var(--forest-green)]" />
                  </div>
                  <h2 className="font-display text-xs font-bold text-[var(--forest-green)] tracking-widest uppercase">
                    {t('uncasking')}
                  </h2>
                </div>
              ) : (
                <JournalsOverview
                  journals={journals}
                  onCreateJournal={createJournal}
                  onRenameJournal={renameJournal}
                  onDeleteJournal={deleteJournal}
                  isCreateOpen={isCreateJournalModalOpen}
                  onCloseCreate={() => setIsCreateJournalModalOpen(false)}
                  onSelectModeChange={setIsSelectModeActive}
                  onSelectJournal={(id) => {
                    setActiveJournalId(id);
                    setActiveView('journal-landing');
                  }}
                />
              )}
            </div>

            {/* Content-Aligned Desktop Action Layer (Overview) */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-30">
              <div className="w-full max-w-6xl mx-auto h-full relative px-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => setIsCreateJournalModalOpen(true)}
                  className="pointer-events-auto absolute bottom-10 right-4 xl:-right-10 2xl:-right-16 w-16 h-16 rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] border border-[var(--brass-accent)]/50 shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex items-center justify-center cursor-pointer hover:scale-108 active:scale-95 transition-all hover:bg-[var(--fab-bg-hover)]"
                  title={t('createJournalBtn')}
                >
                  <Plus size={28} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        ) : activeView === 'journal-landing' ? (
          /* ── Journal Landing Page (Note Overview) ─────────────────── */
          <div className="flex flex-1 overflow-hidden relative flex-col">
            <div
              id="journal-landing-scroll"
              className="flex-1 overflow-y-auto bg-[var(--pub-bg)] pt-16 lg:pt-0 pb-16 lg:pb-0"
            >
              <JournalLandingPage
                journal={activeJournal!}
                spirits={filteredSpirits}
                layout={layout}
                isLoading={isLoadingSpirits}
                onSelectModeChange={setIsSelectModeActive}
                onSelectSpirit={(id) => {
                  selectSpirit(id);
                  setActiveView('journal-detail');
                }}
                onNewNote={() => {
                  handleNewNote().then(() => {
                    startTransition(() => setActiveView('journal-detail'));
                  });
                }}
                onDeleteSpirit={handleDelete}
              />
            </div>
            {/* Content-Aligned Desktop Action Layer (Journal Landing) */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-30">
              <div className="w-full max-w-6xl mx-auto h-full relative px-4 sm:px-6">
                {/* Back to Journals (BookOpen) FAB */}
                <button
                  type="button"
                  onClick={() => { setActiveJournalId(null); setActiveView('overview'); }}
                  className="pointer-events-auto absolute bottom-10 left-4 xl:-left-10 2xl:-left-16 w-16 h-16 rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] border border-[var(--brass-accent)]/50 shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex items-center justify-center cursor-pointer hover:scale-108 active:scale-95 transition-all hover:bg-[var(--fab-bg-hover)]"
                  title="Back to Journals"
                >
                  <BookOpen size={26} strokeWidth={2} />
                </button>
                {/* New Note FAB */}
                <button
                  type="button"
                  onClick={() => {
                    handleNewNote().then(() => {
                      startTransition(() => setActiveView('journal-detail'));
                    });
                  }}
                  className="pointer-events-auto absolute bottom-10 right-4 xl:-right-10 2xl:-right-16 w-16 h-16 rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] border border-[var(--brass-accent)]/50 shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex items-center justify-center cursor-pointer hover:scale-108 active:scale-95 transition-all hover:bg-[var(--fab-bg-hover)]"
                  title="New Note"
                >
                  <Plus size={28} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* activeView === 'journal-detail' */
          <div className="flex flex-1 overflow-hidden relative animate-fade-in">
            {/* Main Wrapper: Holds scrollable card and floating buttons */}
            <div className="flex-1 h-full relative overflow-hidden flex flex-col">
              <section
                id="tasting-card-section"
                className="flex-1 h-full overflow-y-auto overflow-x-hidden px-3 pt-18 pb-16 sm:px-6 sm:pt-22 sm:pb-18 lg:pt-8 lg:pb-8 flex justify-center items-start"
              >
                {isLoadingSpirits ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 select-none animate-pulse">
                    <div className="w-16 h-16 rounded-full border border-[var(--forest-green)]/40 flex items-center justify-center bg-[var(--wood-dark)]/10 mb-4 shadow-[0_0_25px_rgba(35,115,71,0.20)]">
                      <WhiskyLogo size={32} className="text-[var(--forest-green)]" />
                    </div>
                    <h2 className="font-display text-xs font-bold text-[var(--forest-green)] tracking-widest uppercase">
                      {t('uncasking')}
                    </h2>
                  </div>
                ) : spirits.length === 0 ? (
                  <NoteEmptyState onNewNote={handleNewNote} />
                ) : (
                  <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 self-start">
                    <ErrorBoundary>
                      <TastingCard
                        key={activeSpirit.id}
                        initialSpirit={activeSpirit}
                        onSave={handleSave}
                        onDelete={handleDelete}
                      />
                    </ErrorBoundary>
                  </div>
                )}
              </section>

              {/* Content-Aligned Desktop Action Layer (Detail) */}
              {(() => {
                const LayoutFabIcon = layout === 'grid' ? LayoutGrid : AlignJustify;
                return (
                  <div className="hidden lg:block absolute inset-0 pointer-events-none z-30">
                    <div className="w-full max-w-6xl mx-auto h-full relative px-4 sm:px-6">
                      <button
                        type="button"
                        onClick={() => setActiveView('journal-landing')}
                        className="pointer-events-auto absolute bottom-10 left-4 xl:-left-10 2xl:-left-16 w-16 h-16 rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] border border-[var(--brass-accent)]/50 shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex items-center justify-center cursor-pointer hover:scale-108 active:scale-95 transition-all hover:bg-[var(--fab-bg-hover)]"
                        title="Back to Journal Overview"
                      >
                        <LayoutFabIcon size={26} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNewNote}
                        className="pointer-events-auto absolute bottom-10 right-4 xl:-right-10 2xl:-right-16 w-16 h-16 rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] border border-[var(--brass-accent)]/50 shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex items-center justify-center cursor-pointer hover:scale-108 active:scale-95 transition-all hover:bg-[var(--fab-bg-hover)]"
                        title="New Note"
                      >
                        <Plus size={28} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Global Mobile Bottom Navigation Bar (lg:hidden) */}
        <MobileBottomNav
          activeView={activeView}
          activeJournalId={activeJournalId}
          isBottomBarVisible={isBottomBarVisible}
          isMobileDrawerOpen={isMobileDrawerOpen}
          setActiveView={setActiveView}
          setActiveJournalId={setActiveJournalId}
          setIsMobileDrawerOpen={setIsMobileDrawerOpen}
          setIsCreateJournalModalOpen={setIsCreateJournalModalOpen}
          handleNewNote={handleNewNote}
          onEnterProfile={handleEnterProfile}
          onLeaveProfile={handleLeaveProfile}
        />
      </main>
    </>
  );
}
