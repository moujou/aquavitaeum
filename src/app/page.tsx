'use client';

import { useSpiritCollection } from '@/hooks/useSpiritCollection';
import { TastingCard } from '@/components/features/tasting-card/TastingCard';
import { SpiritCollectionGrid } from '@/components/features/collection/SpiritCollectionGrid';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
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
          className="flex-shrink-0 h-14 flex items-center justify-between px-6 border-b border-white/10 bg-[var(--wood-accent)]/60 backdrop-blur-sm z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#C59B27] flex items-center justify-center bg-[#C59B27]/10 shadow-[0_0_10px_rgba(197,155,39,0.2)]">
              <WhiskyLogo size={16} className="text-[#C59B27]" />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-[#C59B27] tracking-wide leading-none">
                {t('appTitle')}
              </h1>
              <p className="font-body text-[9px] text-white/40 uppercase tracking-widest leading-none mt-1">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Right Header: Theme-Fitted DE | EN Language Toggle */}
          <div className="flex items-center gap-3">
            <LanguageToggle />
          </div>
        </header>

        {/* ── Main layout: Independent Sidebar & Tasting Card Sections ──── */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar: Collection (Independent Scroll, Balanced 3:7 Ratio ~380px) */}
          <aside
            id="collection-sidebar"
            className="w-80 md:w-[360px] lg:w-[380px] xl:w-[390px] flex-shrink-0 h-full flex flex-col overflow-hidden p-4 border-r border-white/10 bg-white/[0.02]"
          >
            <SpiritCollectionGrid
              spirits={spirits}
              selectedId={selectedId}
              isLoading={isLoading}
              onSelect={(spirit) => selectSpirit(spirit.id)}
              onNewNote={handleNewNote}
            />
          </aside>

          {/* Main: Tasting Card (Independent Scroll) */}
          <section
            id="tasting-card-section"
            className="flex-1 h-full overflow-y-auto overflow-x-hidden p-6 flex justify-center"
          >
            {isLoading ? (
              <div className="w-full max-w-5xl flex flex-col items-center justify-center min-h-[400px] rounded-xl border border-white/10 bg-black/30 backdrop-blur-md p-12 text-center">
                <div className="w-16 h-16 rounded-full border border-[#C59B27]/40 flex items-center justify-center bg-[#C59B27]/10 mb-4 shadow-[0_0_25px_rgba(197,155,39,0.25)] animate-pulse">
                  <WhiskyLogo size={32} className="text-[#C59B27]" />
                </div>
                <h2 className="font-display text-lg font-bold text-[#C59B27] tracking-wide mb-1">
                  {t('uncasking')}
                </h2>
                <p className="font-body text-xs text-white/50 max-w-sm leading-relaxed">
                  Retrieving sensory profiles, tasting notes, and cellar collection data…
                </p>
              </div>
            ) : (
              <div className="w-full max-w-5xl">
                <TastingCard
                  key={activeSpirit.id}
                  initialSpirit={activeSpirit}
                  onSave={handleSave}
                  onDelete={handleDelete}
                />
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
