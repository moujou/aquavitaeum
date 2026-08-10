'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useSpiritCollection } from '@/hooks/useSpiritCollection';
import { useJournals } from '@/hooks/useJournals';
import { TastingCard } from '@/components/features/tasting-card/TastingCard';
import { WelcomePage } from '@/components/features/welcome/WelcomePage';
import { JournalsOverview } from '@/components/features/journals/JournalsOverview';
import { ProfileView } from '@/components/features/profile/ProfileView';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useLanguage } from '@/context/LanguageContext';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { cn } from '@/lib/utils';
import { SpiritType } from '@/types/spirit.types';
import AppLoader from '@/components/ui/AppLoader';
import AppHeader from '@/components/features/navigation/AppHeader';
import SpiritSidebar from '@/components/features/collection/SpiritSidebar';
import MobileBottomNav from '@/components/features/navigation/MobileBottomNav';

export default function Home() {
  const { t } = useLanguage();
  const basePath = process.env.NODE_ENV === 'production' ? '/aquavitaeum' : '';
  
  // Navigation View State: loading | welcome (onboarding) | overview (bookshelf) | journal-detail (tasting ledger) | profile
  const [activeView, setActiveView] = useState<'loading' | 'welcome' | 'overview' | 'journal-detail' | 'profile'>('loading');
  const [activeJournalId, setActiveJournalId] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const lastScrollTop = useRef(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreateJournalModalOpen, setIsCreateJournalModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalTypeFilter, setGlobalTypeFilter] = useState<SpiritType | 'All'>('All');

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
    selectedId,
    activeSpirit,
    isLoading: isLoadingSpirits,
    selectSpirit,
    handleNewNote,
    handleSave,
    handleDelete,
  } = useSpiritCollection(activeJournalId);



  // Scroll visibility for bottom bar
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        return;
      }
      const target = e.target as HTMLElement;
      if (!target || typeof target.scrollTop === 'undefined') return;

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
  }, []);

  // Reset scroll state on view transition
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsBottomBarVisible(true);
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

  // Show welcome screen on initial session start, but skip if onboarding is completed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const welcomeCompleted = localStorage.getItem('aqua-vitaeum-welcome-completed');
      const sessionStarted = sessionStorage.getItem('aqua-vitaeum-session-started');
      if (welcomeCompleted === 'true' || sessionStarted === 'true') {
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

  // Handle welcome onboarding completion
  const handleWelcomeComplete = async (firstJournalName: string, description?: string) => {
    try {
      const created = await createJournal(firstJournalName, description);
      if (created && typeof created === 'object' && 'id' in created) {
        setActiveJournalId(created.id as string);
        setActiveView('journal-detail');
      } else {
        setActiveView('overview');
      }
    } catch (err) {
      console.error('Failed to create onboarding journal, falling back to overview.', err);
      setActiveView('overview');
    }
  };

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
          onEnter={() => setActiveView('overview')}
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
          'bg-[var(--pub-bg)] text-[#e8d5b7]'
        )}
      >
        {/* ── App Header ─────────────────────────────────────────────────── */}
        <AppHeader
          basePath={basePath}
          journals={journals}
          activeView={activeView}
          setActiveView={setActiveView}
          activeJournalId={activeJournalId}
          setActiveJournalId={setActiveJournalId}
          selectSpirit={selectSpirit}
          isBottomBarVisible={isBottomBarVisible}
          isMobileDrawerOpen={isMobileDrawerOpen}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
          globalTypeFilter={globalTypeFilter}
          setGlobalTypeFilter={setGlobalTypeFilter}
        />

        {/* ── Main Layout View switcher ──────────────────────────────────── */}
        {activeView === 'profile' ? (
          <div className="flex-1 overflow-y-auto bg-[var(--pub-bg)] pt-14 lg:pt-0 pb-16 lg:pb-0 flex items-center justify-center">
            <ProfileView />
          </div>
        ) : activeView === 'overview' ? (
          <div className="flex-1 h-full relative overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto bg-[var(--pub-bg)] pt-14 lg:pt-0 pb-16 lg:pb-0">
              {isLoadingJournals ? (
                <div className="flex-1 h-64 flex flex-col items-center justify-center text-center p-6 select-none animate-pulse">
                  <div className="w-16 h-16 rounded-full border border-[#C59B27]/40 flex items-center justify-center bg-[#C59B27]/10 mb-4 shadow-[0_0_25px_rgba(197,155,39,0.25)]">
                    <WhiskyLogo size={32} className="text-[#C59B27]" />
                  </div>
                  <h2 className="font-display text-xs font-bold text-[#C59B27] tracking-widest uppercase">
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
                  onSelectJournal={(id) => {
                    setActiveJournalId(id);
                    setActiveView('journal-detail');
                  }}
                />
              )}
            </div>

            {/* Desktop Floating Plus Button (Overview View) */}
            <button
              type="button"
              onClick={() => setIsCreateJournalModalOpen(true)}
              className="hidden lg:flex absolute bottom-6 right-6 w-12 h-12 rounded-full bg-[#E8D5B7] text-[#311e15] border border-[#C59B27]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-30 hover:bg-[#F5F2EB]"
              title={t('createJournalBtn')}
            >
              <Plus size={22} />
            </button>
          </div>
        ) : (
          /* activeView === 'journal-detail' */
          <div className="flex flex-1 overflow-hidden relative">
            <SpiritSidebar
              isSidebarCollapsed={isSidebarCollapsed}
              setIsSidebarCollapsed={setIsSidebarCollapsed}
              isMobileDrawerOpen={isMobileDrawerOpen}
              setIsMobileDrawerOpen={setIsMobileDrawerOpen}
              activeJournal={activeJournal}
              filteredSpirits={filteredSpirits}
              selectedId={selectedId}
              isLoadingSpirits={isLoadingSpirits}
              selectSpirit={selectSpirit}
            />

            {/* Main Wrapper: Holds scrollable card and floating buttons */}
            <div className="flex-1 h-full relative overflow-hidden flex flex-col">
              <section
                id="tasting-card-section"
                className="flex-1 h-full overflow-y-auto overflow-x-hidden px-3 pt-17 pb-16 sm:px-6 sm:pt-20 sm:pb-18 lg:pt-6 lg:pb-6 flex justify-center items-center"
              >
                {isLoadingSpirits ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 select-none animate-pulse">
                    <div className="w-16 h-16 rounded-full border border-[#C59B27]/40 flex items-center justify-center bg-[#C59B27]/10 mb-4 shadow-[0_0_25px_rgba(197,155,39,0.25)]">
                      <WhiskyLogo size={32} className="text-[#C59B27]" />
                    </div>
                    <h2 className="font-display text-xs font-bold text-[#C59B27] tracking-widest uppercase">
                      {t('uncasking')}
                    </h2>
                  </div>
                ) : spirits.length === 0 ? (
                  <div className="w-full max-w-xl flex flex-col items-center justify-center min-h-[380px] rounded-xl border border-[#C59B27]/30 bg-black/45 backdrop-blur-md p-8 sm:p-12 text-center shadow-[0_15px_35px_rgba(0,0,0,0.6)] border-t-[#C59B27]/50 border-l-[#C59B27]/50 my-auto animate-fade-in">
                    <div className="w-20 h-20 rounded-full border-2 border-[#C59B27]/40 flex items-center justify-center bg-[#C59B27]/10 mb-6 shadow-[0_0_35px_rgba(197,155,39,0.25)] animate-fade-in-up">
                      <WhiskyLogo size={38} className="text-[#C59B27]" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[#C59B27] tracking-wide mb-3">
                      {t('cellarEmptyTitle')}
                    </h2>
                    <p className="font-body text-xs sm:text-sm text-white/50 max-w-md leading-relaxed mb-8">
                      {t('cellarEmptySubtitle')}
                    </p>
                    <button
                      type="button"
                      onClick={handleNewNote}
                      className="flex items-center gap-2 px-5 py-2.5 rounded text-xs sm:text-sm font-display uppercase tracking-wider font-bold border shrink-0 bg-[#E8D5B7] text-[#311e15] border-[#C59B27]/40 hover:bg-[#F5F2EB] hover:text-[#21140e] transition-all duration-250 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-[1.02]"
                    >
                      <Plus size={14} />
                      {t('newNote')}
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-5xl self-start">
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

              {/* Desktop Floating Action Buttons (Symmetrical FABs) */}
              <button
                type="button"
                onClick={() => {
                  setActiveJournalId(null);
                  setActiveView('overview');
                }}
                className="hidden lg:flex absolute bottom-6 left-6 w-12 h-12 rounded-full bg-[#E8D5B7] text-[#311e15] border border-[#C59B27]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-30 hover:bg-[#F5F2EB]"
                title={t('journalsTitle') || 'Journals'}
              >
                <BookOpen size={22} />
              </button>

              <button
                type="button"
                onClick={handleNewNote}
                className="hidden lg:flex absolute bottom-6 right-6 w-12 h-12 rounded-full bg-[#E8D5B7] text-[#311e15] border border-[#C59B27]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-30 hover:bg-[#F5F2EB]"
                title={t('newNote')}
              >
                <Plus size={22} />
              </button>
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
        />
      </main>
    </>
  );
}
