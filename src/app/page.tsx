'use client';

import { useState, useEffect, useMemo, useRef, useCallback, startTransition } from 'react';
import { Plus, BookOpen, Book, AlignJustify, LayoutGrid } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { SpiritType } from '@/types/spirit.types';
import AppLoader from '@/components/ui/AppLoader';
import AppHeader from '@/components/features/navigation/AppHeader';
import MobileBottomNav from '@/components/features/navigation/MobileBottomNav';
import { useHistoryNavigation } from '@/hooks/useHistoryNavigation';
import { NoteEmptyState } from '@/components/features/journals/landing/NoteEmptyState';

export default function Home() {
  const { t, language } = useLanguage();
  const basePath = process.env.NODE_ENV === 'production' ? '/aquavitaeum' : '';
  
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
  const { layout, setLayout, journalLayout, setJournalLayout } = useLayoutPreference();
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
    handleNewNoteFromScan,
    handleSave,
    handleDelete,
  } = useSpiritCollection(activeJournalId);

  // Native OS History & Gesture Navigation Hook (Pixel Android & iOS back gesture integration)
  const {
    pushView,
    navigateBack,
    initRootHistory,
  } = useHistoryNavigation({
    onPopState: useCallback((state) => {
      // Close active modals, search results, or selection states when navigating back
      setIsCreateJournalModalOpen(false);
      setIsMobileDrawerOpen(false);
      setIsSelectModeActive(false);

      if (state.view === 'profile') {
        setActiveView('profile');
      } else if (state.view === 'journal-detail') {
        if (state.journalId) setActiveJournalId(state.journalId);
        if (state.spiritId) selectSpirit(state.spiritId);
        setActiveView('journal-detail');
      } else if (state.view === 'journal-landing') {
        if (state.journalId) setActiveJournalId(state.journalId);
        setActiveView('journal-landing');
      } else if (state.view === 'overview') {
        setActiveJournalId(null);
        setActiveView('overview');
      } else if (state.view === 'welcome') {
        setActiveView('welcome');
      }
    }, [selectSpirit]),
    fallbackBack: useCallback(() => {
      if (activeView === 'journal-detail') {
        setActiveView('journal-landing');
      } else if (activeView === 'journal-landing') {
        setActiveJournalId(null);
        setActiveView('overview');
      } else if (activeView === 'profile') {
        setActiveView(viewBeforeProfile);
      }
    }, [activeView, viewBeforeProfile]),
  });

  // Only these scrollable containers should trigger the bottom-bar hide/show.
  const SCROLL_TRACKED_IDS = [
    'journal-overview-scroll',
    'journal-landing-scroll',
    'tasting-card-scroll',
    'tasting-card-section',
  ];

  // Mobile smart scroll: hides the bottom nav & header on downward scroll and reveals on scroll up.
  useEffect(() => {
    let ticking = false;

    const handleScroll = (e: Event) => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        return;
      }
      const target = e.target as HTMLElement;
      if (!target) return;

      const scroller = (target.id && SCROLL_TRACKED_IDS.includes(target.id))
        ? target
        : (target.closest?.('[id$="-scroll"]') as HTMLElement | null);

      if (!scroller || typeof scroller.scrollTop === 'undefined') return;

      const scrollTop = scroller.scrollTop;
      if (scrollTop < 0) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = scrollTop - lastScrollTop.current;
          if (Math.abs(delta) >= 10) {
            if (delta > 0 && scrollTop > 30) {
              setIsBottomBarVisible((prev) => (prev ? false : prev));
            } else if (delta < 0) {
              setIsBottomBarVisible((prev) => (!prev ? true : prev));
            }
            lastScrollTop.current = scrollTop;
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset scroll state on view transition & refresh journals stats on entering overview
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsBottomBarVisible(true);
    setIsSelectModeActive(false);
    lastScrollTop.current = 0;
    if (activeView === 'overview') {
      refreshJournals();
    }
  }, [activeView, refreshJournals]);



  // Automatically refresh journals stats when the active spirits list changes (saved or deleted notes)
  useEffect(() => {
    refreshJournals();
  }, [spirits, refreshJournals]);

  // If activeJournalId was deleted on another device during sync, gracefully return to overview
  useEffect(() => {
    if (activeJournalId && !isLoadingJournals && journals.length > 0) {
      const exists = journals.some((j) => j.id === activeJournalId);
      if (!exists) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveJournalId(null);
        if (activeView === 'journal-landing' || activeView === 'journal-detail') {
          setActiveView('overview');
        }
      }
    }
  }, [journals, activeJournalId, isLoadingJournals, activeView]);

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

  // Show welcome screen on initial onboarding, or restore saved view on F5 / reload
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const welcomeCompleted = localStorage.getItem('aqua-vitaeum-welcome-completed');
      if (welcomeCompleted === 'true') {
        const savedView = sessionStorage.getItem('aqua-vitaeum-active-view') as
          | 'overview'
          | 'journal-landing'
          | 'journal-detail'
          | 'profile'
          | null;
        const savedJournalId = sessionStorage.getItem('aqua-vitaeum-active-journal-id');

        if (savedJournalId) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setActiveJournalId(savedJournalId);
        }

        const initialView = (savedView && ['overview', 'journal-landing', 'journal-detail', 'profile'].includes(savedView))
          ? savedView
          : 'overview';
        setActiveView(initialView);
        initRootHistory(initialView, savedJournalId);
      } else {
        setActiveView('welcome');
        initRootHistory('welcome');
      }
    }
  }, [initRootHistory]);

  // Persist active view to sessionStorage across F5 / page reloads
  useEffect(() => {
    if (typeof window !== 'undefined' && activeView !== 'loading' && activeView !== 'welcome') {
      sessionStorage.setItem('aqua-vitaeum-active-view', activeView);
    }
  }, [activeView]);

  // Persist active journal ID to sessionStorage across F5 / page reloads
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (activeJournalId) {
        sessionStorage.setItem('aqua-vitaeum-active-journal-id', activeJournalId);
      } else {
        sessionStorage.removeItem('aqua-vitaeum-active-journal-id');
      }
    }
  }, [activeJournalId]);

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

  // Profile navigation wired to native history stack
  const handleEnterProfile = useCallback(() => {
    if (activeView !== 'profile') {
      setViewBeforeProfile(activeView as 'overview' | 'journal-landing' | 'journal-detail');
      setActiveView('profile');
      pushView('profile', {
        fromView: activeView as 'overview' | 'journal-landing' | 'journal-detail',
        journalId: activeJournalId,
      });
    }
  }, [activeView, activeJournalId, pushView]);

  const handleLeaveProfile = useCallback(() => {
    setActiveView(viewBeforeProfile);
    navigateBack();
  }, [viewBeforeProfile, navigateBack]);

  const handleGoToOverview = useCallback(() => {
    setActiveJournalId(null);
    setActiveView('overview');
    pushView('overview', { journalId: null });
  }, [pushView]);

  const handleSelectJournal = useCallback((id: string) => {
    setActiveJournalId(id);
    setActiveView('journal-landing');
    pushView('journal-landing', { journalId: id });
  }, [pushView]);

  const handleBackToLanding = useCallback(() => {
    if (activeJournalId) {
      setActiveView('journal-landing');
      pushView('journal-landing', { journalId: activeJournalId });
    } else {
      handleGoToOverview();
    }
  }, [activeJournalId, handleGoToOverview, pushView]);

  const handleSelectSpirit = useCallback((spiritId: string) => {
    selectSpirit(spiritId);
    setActiveView('journal-detail');
    pushView('journal-detail', { journalId: activeJournalId, spiritId });
  }, [selectSpirit, activeJournalId, pushView]);

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
        initRootHistory('journal-landing', created.id as string);
      } else {
        setActiveView('overview');
        initRootHistory('overview');
      }
    } catch (err) {
      console.error('Failed to create onboarding journal, falling back to overview.', err);
      setActiveView('overview');
      initRootHistory('overview');
    }
  };

  const handleNavigateToSpirit = useCallback((spiritId: string, journalId: string) => {
    setActiveJournalId(journalId);
    selectSpirit(spiritId);
    setActiveView('journal-detail');
    setGlobalSearchQuery('');
    pushView('journal-detail', { journalId, spiritId });
  }, [selectSpirit, pushView]);

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
            initRootHistory('overview');
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
          'h-screen h-[100dvh] min-h-[100dvh] flex flex-col overflow-hidden',
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
          <div className="flex-1 overflow-y-auto bg-[var(--pub-bg)] max-lg:pt-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:pt-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0 flex items-center justify-center">
            <ProfileView
              layout={layout}
              onLayoutChange={setLayout}
              journalLayout={journalLayout}
              onJournalLayoutChange={setJournalLayout}
            />
          </div>
        ) : activeView === 'overview' ? (
          <div className="flex-1 h-full relative overflow-hidden flex flex-col">
            <div id="journal-overview-scroll" className="flex-1 overflow-y-auto bg-[var(--pub-bg)] max-lg:pt-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:pt-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
              {isLoadingJournals ? (
                <AppLoader />
              ) : (
                <JournalsOverview
                  journals={journals}
                  journalLayout={journalLayout}
                  onCreateJournal={createJournal}
                  onRenameJournal={renameJournal}
                  onDeleteJournal={deleteJournal}
                  isCreateOpen={isCreateJournalModalOpen}
                  onOpenCreate={() => setIsCreateJournalModalOpen(true)}
                  onCloseCreate={() => setIsCreateJournalModalOpen(false)}
                  onSelectModeChange={setIsSelectModeActive}
                  onSelectJournal={handleSelectJournal}
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
          isLoadingJournals || !activeJournal ? (
            <AppLoader />
          ) : (
            <div className="flex flex-1 overflow-hidden relative flex-col">
              <div
                id="journal-landing-scroll"
                className="flex-1 overflow-y-auto bg-[var(--pub-bg)] max-lg:pt-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:pt-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
              >
                <JournalLandingPage
                  journal={activeJournal}
                  spirits={spirits}
                  layout={layout}
                  isLoading={isLoadingSpirits}
                  onSelectModeChange={setIsSelectModeActive}
                  onSelectSpirit={handleSelectSpirit}
                  onNewNote={() => {
                    handleNewNote().then(() => {
                      startTransition(() => {
                        setActiveView('journal-detail');
                        pushView('journal-detail', { journalId: activeJournalId });
                      });
                    });
                  }}
                  onNewNoteFromScan={async (result, uploadedImage, mode) => {
                    const id = await handleNewNoteFromScan(result, uploadedImage, mode);
                    if (id) {
                      startTransition(() => {
                        setActiveView('journal-detail');
                        pushView('journal-detail', { journalId: activeJournalId, spiritId: id });
                      });
                    }
                    return id;
                  }}
                  onDeleteSpirit={handleDelete}
                />
              </div>
              {/* Content-Aligned Desktop Action Layer (Journal Landing) */}
              <div className="hidden lg:block absolute inset-0 pointer-events-none z-30">
                <div className="w-full max-w-6xl mx-auto h-full relative px-4 sm:px-6">
                  {/* Back to Journals (Library / BookOpen) FAB */}
                  <button
                    type="button"
                    onClick={handleGoToOverview}
                    className="pointer-events-auto absolute bottom-10 left-4 xl:-left-10 2xl:-left-16 w-16 h-16 rounded-full bg-[var(--fab-bg)] text-[var(--fab-text)] border border-[var(--brass-accent)]/50 shadow-[0_12px_32px_rgba(0,0,0,0.35)] flex items-center justify-center cursor-pointer hover:scale-108 active:scale-95 transition-all hover:bg-[var(--fab-bg-hover)]"
                    title={language === 'DE' ? 'Zurück zur Journal-Übersicht' : 'Back to Journals'}
                  >
                    {journalLayout === 'bookshelf' ? (
                      <Book size={26} strokeWidth={2} />
                    ) : (
                      <BookOpen size={26} strokeWidth={2} />
                    )}
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
          )
        ) : (
          /* activeView === 'journal-detail' */
          <div className="flex flex-1 overflow-hidden relative flex-col animate-fade-in">
            {/* Main Wrapper: Holds scrollable card and floating buttons */}
            <div className="flex-1 h-full relative overflow-hidden flex flex-col">
              <div
                id="tasting-card-scroll"
                className="flex-1 overflow-y-auto bg-[var(--pub-bg)] max-lg:pt-[calc(4.5rem+env(safe-area-inset-top,0px))] lg:pt-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0"
              >
                {isLoadingSpirits && spirits.length === 0 ? (
                  <AppLoader />
                ) : spirits.length === 0 ? (
                  <NoteEmptyState onNewNote={handleNewNote} />
                ) : (
                  <div className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-8 pb-8 animate-fade-in">
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
              </div>

              {/* Content-Aligned Desktop Action Layer (Detail) */}
              {(() => {
                const LayoutFabIcon = layout === 'grid' ? LayoutGrid : AlignJustify;
                return (
                  <div className="hidden lg:block absolute inset-0 pointer-events-none z-30">
                    <div className="w-full max-w-6xl mx-auto h-full relative px-4 sm:px-6">
                      <button
                        type="button"
                        onClick={handleBackToLanding}
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
          journalLayout={journalLayout}
          isBottomBarVisible={isBottomBarVisible}
          isMobileDrawerOpen={isMobileDrawerOpen}
          setActiveView={setActiveView}
          setActiveJournalId={setActiveJournalId}
          setIsMobileDrawerOpen={setIsMobileDrawerOpen}
          setIsCreateJournalModalOpen={setIsCreateJournalModalOpen}
          handleNewNote={handleNewNote}
          onEnterProfile={handleEnterProfile}
          onLeaveProfile={handleLeaveProfile}
          onGoToOverview={handleGoToOverview}
        />
      </main>
    </>
  );
}
