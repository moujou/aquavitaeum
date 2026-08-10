'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { SpiritCollectionGrid } from '@/components/features/collection/SpiritCollectionGrid';
import { JournalWithStats } from '@/hooks/useJournals';
import { Spirit } from '@/types/spirit.types';

interface SpiritSidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (open: boolean) => void;
  activeJournal?: JournalWithStats;
  filteredSpirits: Spirit[];
  selectedId: string | null;
  isLoadingSpirits: boolean;
  selectSpirit: (id: string) => void;
}

export default function SpiritSidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  isMobileDrawerOpen,
  setIsMobileDrawerOpen,
  activeJournal,
  filteredSpirits,
  selectedId,
  isLoadingSpirits,
  selectSpirit,
}: SpiritSidebarProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Desktop Sidebar: Collection (lg:flex, ~380px) */}
      <aside
        id="collection-sidebar"
        className={cn(
          "hidden lg:flex flex-col h-full overflow-hidden bg-white/[0.02] transition-all duration-300 ease-in-out flex-shrink-0",
          isSidebarCollapsed 
            ? "w-[16px] p-0 border-r-0" 
            : "w-[340px] xl:w-[380px] border-r border-white/10"
        )}
      >
        <div
          className={cn(
            "w-[340px] xl:w-[380px] p-4 h-full transition-all duration-300 ease-in-out",
            isSidebarCollapsed 
              ? "opacity-0 -translate-x-4 pointer-events-none" 
              : "opacity-100 translate-x-0"
          )}
        >
          <SpiritCollectionGrid
            title={activeJournal?.name}
            description={activeJournal?.description}
            spirits={filteredSpirits}
            selectedId={selectedId}
            isLoading={isLoadingSpirits}
            onSelect={(spirit) => selectSpirit(spirit.id)}
          />
        </div>
      </aside>

      {/* Collapsible Sidebar Rail Divider (Desktop: lg:block) */}
      <div
        className={cn(
          "relative w-1 group select-none h-full transition-colors hidden lg:block flex-shrink-0 cursor-pointer border-r border-white/10",
          isSidebarCollapsed ? "hover:bg-[#C59B27]/40 w-2" : "hover:bg-[#C59B27]/40"
        )}
      >
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-28 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#E8D5B7] text-[#311e15] border border-[#C59B27]/40 flex items-center justify-center cursor-pointer shadow-md z-20 hover:scale-110 active:scale-95 transition-all hover:bg-[#F5F2EB]"
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu size={16} />
        </button>
      </div>

      {/* Mobile Off-Canvas Sidebar Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 transition-opacity lg:hidden"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Off-Canvas Sidebar Drawer - Premium Overlay, stopping above bottom bar */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('collection')}
        className={cn(
          'fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] h-full bg-[var(--pub-bg)] border-r border-white/10 z-40 flex flex-col p-4 sm:p-6 pb-[calc(3.5rem+env(safe-area-inset-bottom))] transition-transform duration-300 ease-in-out shadow-2xl lg:hidden',
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex-1 overflow-hidden">
          <SpiritCollectionGrid
            title={activeJournal?.name}
            description={activeJournal?.description}
            spirits={filteredSpirits}
            selectedId={selectedId}
            isLoading={isLoadingSpirits}
            onSelect={(spirit) => {
              selectSpirit(spirit.id);
              setIsMobileDrawerOpen(false);
            }}
          />
        </div>
      </div>
    </>
  );
}
