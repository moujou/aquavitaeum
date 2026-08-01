'use client';

import { useSpiritCollection } from '@/hooks/useSpiritCollection';
import { TastingCard } from '@/components/features/tasting-card/TastingCard';
import { SpiritCollectionGrid } from '@/components/features/collection/SpiritCollectionGrid';
import { cn } from '@/lib/utils';

export default function Home() {
  const {
    spirits,
    selectedId,
    activeSpirit,
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
          'min-h-screen flex flex-col',
          'bg-[var(--pub-bg)]',
        )}
      >
        {/* ── App Header ─────────────────────────────────────────────────── */}
        <header
          id="app-header"
          className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[var(--wood-accent)]/60 backdrop-blur-sm sticky top-0 z-10"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full border border-[#C59B27] flex items-center justify-center bg-[#C59B27]/10">
              <span className="text-[#C59B27] text-xs font-display font-bold">AV</span>
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-[#C59B27] tracking-wide leading-none">
                Aqua Vitaeum
              </h1>
              <p className="font-body text-[9px] text-white/40 uppercase tracking-widest leading-none mt-0.5">
                Fine Spirits Journal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-body text-white/30">
              {spirits.length} spirit{spirits.length !== 1 ? 's' : ''} in collection
            </span>
          </div>
        </header>

        {/* ── Main layout ────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: Collection */}
          <aside
            id="collection-sidebar"
            className="w-72 flex-shrink-0 border-r border-white/10 bg-white/[0.02] p-4 overflow-y-auto"
          >
            <SpiritCollectionGrid
              spirits={spirits}
              selectedId={selectedId}
              onSelect={(spirit) => selectSpirit(spirit.id)}
              onNewNote={handleNewNote}
            />
          </aside>

          {/* Main: Tasting Card */}
          <section
            id="tasting-card-section"
            className="flex-1 overflow-y-auto p-6 flex justify-center"
          >
            <div className="w-full max-w-5xl">
              <TastingCard
                key={activeSpirit.id}
                initialSpirit={activeSpirit}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
