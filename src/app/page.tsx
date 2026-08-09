'use client';

import { useState, useEffect, useMemo } from 'react';
import { Menu, Plus, ArrowLeft } from 'lucide-react';
import { useSpiritCollection } from '@/hooks/useSpiritCollection';
import { useJournals } from '@/hooks/useJournals';
import { TastingCard } from '@/components/features/tasting-card/TastingCard';
import { SpiritCollectionGrid } from '@/components/features/collection/SpiritCollectionGrid';
import { WelcomePage } from '@/components/features/welcome/WelcomePage';
import { JournalsOverview } from '@/components/features/journals/JournalsOverview';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useLanguage } from '@/context/LanguageContext';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { cn } from '@/lib/utils';

export default function Home() {
  const { t } = useLanguage();
  
  // Navigation View State: loading | welcome (onboarding) | overview (bookshelf) | journal-detail (tasting ledger)
  const [activeView, setActiveView] = useState<'loading' | 'welcome' | 'overview' | 'journal-detail'>('loading');
  const [activeJournalId, setActiveJournalId] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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

  // Automatically refresh journals stats when the active spirits list changes (saved or deleted notes)
  useEffect(() => {
    refreshJournals();
  }, [spirits, refreshJournals]);

  // Show welcome screen on initial session start, but skip on refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionStarted = sessionStorage.getItem('aqua-vitaeum-session-started');
      if (sessionStarted) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveView('overview');
      } else {
        sessionStorage.setItem('aqua-vitaeum-session-started', 'true');
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
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0c1a0e] select-none text-center">
        <div className="w-16 h-16 rounded-full border border-[#C59B27]/40 flex items-center justify-center bg-[#C59B27]/10 mb-4 shadow-[0_0_25px_rgba(197,155,39,0.25)] animate-pulse">
          <WhiskyLogo size={32} className="text-[#C59B27]" />
        </div>
        <h2 className="font-display text-xs font-bold text-[#C59B27] tracking-widest uppercase animate-pulse">
          {t('uncasking')}
        </h2>
      </div>
    );
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
        <header
          id="app-header"
          className="flex-shrink-0 h-14 flex items-center justify-between px-3 sm:px-6 border-b border-white/10 bg-[var(--wood-accent)] z-10 shadow-md"
        >
          {/* Left Header: Back button OR Mobile Menu Trigger + Brand Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Show Back Button if inside a journal */}
            {activeView === 'journal-detail' ? (
              <button
                onClick={() => {
                  setActiveJournalId(null);
                  setActiveView('overview');
                }}
                className="h-8 w-8 flex items-center justify-center rounded border border-[#C59B27]/40 bg-[var(--wood-accent)] text-[#C59B27] hover:bg-[#C59B27]/10 transition-all duration-150 cursor-pointer select-none"
                title="Back to Journals"
              >
                <ArrowLeft size={16} />
              </button>
            ) : null}

            {/* Mobile Hamburger Menu Icon (only inside journal view, < lg screens) */}
            {activeView === 'journal-detail' ? (
              <button
                id="mobile-menu-btn"
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="lg:hidden h-7 w-7 flex items-center justify-center rounded border border-[#C59B27]/40 bg-[var(--wood-accent)] text-[#C59B27] hover:bg-[#C59B27]/10 transition-all duration-150 cursor-pointer select-none"
                aria-label="Open sidebar menu"
                aria-expanded={isMobileDrawerOpen}
                title="Open menu"
              >
                <Menu size={18} />
              </button>
            ) : null}

            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/whisky-logo-with-circle-v3.svg"
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
          </div>

          {/* Right Header: Language Toggle */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
          </div>
        </header>

        {/* ── Main Layout View switcher ──────────────────────────────────── */}
        {activeView === 'overview' ? (
          <div className="flex-1 overflow-y-auto bg-[var(--pub-bg)]">
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
                onSelectJournal={(id) => {
                  setActiveJournalId(id);
                  setActiveView('journal-detail');
                }}
              />
            )}
          </div>
        ) : (
          /* activeView === 'journal-detail' */
          <div className="flex flex-1 overflow-hidden relative">
            {/* Desktop Sidebar: Collection (lg:flex, ~380px) */}
            <aside
              id="collection-sidebar"
              className="hidden lg:flex w-[340px] xl:w-[380px] flex-shrink-0 h-full flex-col overflow-hidden p-4 border-r border-white/10 bg-white/[0.02]"
            >
              <SpiritCollectionGrid
                title={activeJournal?.name}
                spirits={spirits}
                selectedId={selectedId}
                isLoading={isLoadingSpirits}
                onSelect={(spirit) => selectSpirit(spirit.id)}
                onNewNote={handleNewNote}
              />
            </aside>

            {/* Mobile Off-Canvas Collection Drawer Backdrop */}
            {isMobileDrawerOpen && (
              <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity cursor-pointer"
                onClick={() => setIsMobileDrawerOpen(false)}
                aria-hidden="true"
              />
            )}

            {/* Mobile Off-Canvas Sidebar Drawer */}
            <div
              role="dialog"
              aria-modal="true"
              aria-label={t('collection')}
              className={cn(
                'fixed top-0 left-0 bottom-0 w-[310px] sm:w-[360px] bg-[var(--pub-bg-panel)] border-r border-[#C59B27]/40 shadow-2xl z-50 flex flex-col p-4 transition-transform duration-300 ease-in-out lg:hidden',
                isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
              )}
            >
              {/* Collection Grid inside Drawer with Close Button in header */}
              <div className="flex-1 overflow-hidden">
                <SpiritCollectionGrid
                  title={activeJournal?.name}
                  spirits={spirits}
                  selectedId={selectedId}
                  isLoading={isLoadingSpirits}
                  onSelect={(spirit) => {
                    selectSpirit(spirit.id);
                    setIsMobileDrawerOpen(false);
                  }}
                  onNewNote={() => {
                    handleNewNote();
                    setIsMobileDrawerOpen(false);
                  }}
                  onClose={() => setIsMobileDrawerOpen(false)}
                />
              </div>
            </div>

            {/* Main: Tasting Card (Independent Scroll with Error Boundary) */}
            <section
              id="tasting-card-section"
              className="flex-1 h-full overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex justify-center items-center"
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
                <div className="w-full max-w-xl flex flex-col items-center justify-center min-h-[380px] rounded-xl border border-[#C59B27]/30 bg-black/45 backdrop-blur-md p-8 sm:p-12 text-center shadow-[0_15px_35px_rgba(0,0,0,0.6)] border-t-[#C59B27]/50 border-l-[#C59B27]/50 my-auto">
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
          </div>
        )}
      </main>
    </>
  );
}
