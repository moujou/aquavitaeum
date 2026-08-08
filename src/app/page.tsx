'use client';

import { useState, useEffect } from 'react';
import { Menu, Plus } from 'lucide-react';
import { useSpiritCollection } from '@/hooks/useSpiritCollection';
import { TastingCard } from '@/components/features/tasting-card/TastingCard';
import { SpiritCollectionGrid } from '@/components/features/collection/SpiritCollectionGrid';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useLanguage } from '@/context/LanguageContext';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { cn } from '@/lib/utils';

export default function Home() {
  const { t } = useLanguage();
  const {
    spirits,
    selectedId,
    activeSpirit,
    isLoading,
    selectSpirit,
    handleNewNote,
    handleSave,
    handleDelete,
  } = useSpiritCollection();

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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

  return (
    <>
      {/* SEO */}
      <title>Aqua Vitaeum · Fine Spirits Tasting Notes</title>

      <main
        id="app-main"
        className={cn(
          'h-screen flex flex-col overflow-hidden',
          'bg-[var(--pub-bg)] text-[#e8d5b7]',
        )}
      >
        {/* ── App Header ─────────────────────────────────────────────────── */}
        <header
          id="app-header"
          className="flex-shrink-0 h-14 flex items-center justify-between px-3 sm:px-6 border-b border-white/10 bg-[var(--wood-accent)]/60 backdrop-blur-sm z-10"
        >
          {/* Left Header: Mobile Hamburger Menu Trigger + Brand Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Mobile Hamburger Menu Icon (< lg screens) */}
            <button
              id="mobile-menu-btn"
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden h-7 w-7 flex items-center justify-center rounded border border-[#C59B27]/40 bg-[#1A120B] text-[#C59B27] hover:bg-[#C59B27]/10 transition-all duration-150 cursor-pointer select-none"
              aria-label="Open sidebar menu"
              aria-expanded={isMobileDrawerOpen}
              title="Open menu"
            >
              <Menu size={18} />
            </button>

            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[#C59B27] flex items-center justify-center bg-[#C59B27]/10 shadow-[0_0_10px_rgba(197,155,39,0.25)] flex-shrink-0">
                <WhiskyLogo size={16} className="text-[#C59B27]" />
              </div>
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

        {/* ── Main layout: Sidebar (Desktop) & Tasting Card ───────────────── */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Desktop Sidebar: Collection (lg:flex, ~380px) */}
          <aside
            id="collection-sidebar"
            className="hidden lg:flex w-[340px] xl:w-[380px] flex-shrink-0 h-full flex-col overflow-hidden p-4 border-r border-white/10 bg-white/[0.02]"
          >
            <SpiritCollectionGrid
              spirits={spirits}
              selectedId={selectedId}
              isLoading={isLoading}
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
              'fixed top-0 left-0 bottom-0 w-[310px] sm:w-[360px] bg-[#120C07] border-r border-[#C59B27]/40 shadow-2xl z-50 flex flex-col p-4 transition-transform duration-300 ease-in-out lg:hidden',
              isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            {/* Collection Grid inside Drawer with Close Button in header */}
            <div className="flex-1 overflow-hidden">
              <SpiritCollectionGrid
                spirits={spirits}
                selectedId={selectedId}
                isLoading={isLoading}
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
            {isLoading ? (
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded text-xs sm:text-sm font-display uppercase tracking-wider font-bold border shrink-0 bg-[#1A120B] text-[#C59B27] border-[#C59B27] hover:bg-[#C59B27] hover:text-[#1A120B] transition-all duration-250 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-[1.02]"
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
      </main>
    </>
  );
}
