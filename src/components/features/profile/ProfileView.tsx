'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { LayoutToggle } from '@/components/ui/LayoutToggle';
import { User, Database, Info, Globe, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OverviewLayout } from '@/hooks/useLayoutPreference';

interface ProfileViewProps {
  layout: OverviewLayout;
  onLayoutChange: (l: OverviewLayout) => void;
  className?: string;
}

export function ProfileView({
  layout,
  onLayoutChange,
  className,
}: ProfileViewProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        'w-full max-w-2xl mx-auto flex flex-col justify-center items-center p-4 sm:p-6 my-auto min-h-[380px] animate-fade-in',
        className
      )}
    >
      {/* Main Profile Card Container */}
      <div className="w-full rounded-2xl border border-t-white/18 border-x-white/10 border-b-black/50 bg-gradient-to-b from-[#18241D]/95 via-[#131D16]/98 to-[#0E1510] backdrop-blur-xl p-6 sm:p-10 text-center shadow-2xl relative overflow-hidden">
        {/* Ambient Top Lantern Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-[var(--brass-accent)]/15 blur-3xl pointer-events-none" />

        {/* Circular Avatar Placeholder */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[var(--brass-accent)]/40 flex items-center justify-center bg-gradient-to-b from-[var(--brass-accent)]/20 to-black/40 mx-auto mb-4 shadow-[0_0_30px_rgba(197,155,39,0.25)] text-[var(--brass-accent)] relative z-10">
          <User size={38} className="sm:size-[44px] stroke-[1.5]" />
        </div>

        {/* Profile Name & Status */}
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-wide mb-1 relative z-10">
          {t('profileTab')}
        </h2>
        <p className="font-body text-[11px] sm:text-xs text-white/60 uppercase tracking-widest mb-8 relative z-10">
          Archival Tasting Ledger
        </p>

        {/* Settings Box */}
        <div className="w-full bg-white/5 border border-white/10 rounded-xl divide-y divide-white/8 text-left overflow-hidden shadow-inner relative z-10">
          {/* Row 1: Language */}
          <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--brass-accent)]/15 border border-[var(--brass-accent)]/30 flex items-center justify-center text-[var(--brass-accent)] shrink-0">
                <Globe size={18} />
              </div>
              <div>
                <p className="font-display text-sm sm:text-base font-semibold text-[var(--foreground)]">
                  {t('profileLanguage')}
                </p>
                <p className="font-body text-xs text-white/65 mt-0.5">
                  Select interface language
                </p>
              </div>
            </div>
            <LanguageToggle className="shrink-0" />
          </div>

          {/* Row 2: Tasting Cards Overview Layout */}
          <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--brass-accent)]/10 border border-[var(--brass-accent)]/20 flex items-center justify-center text-[var(--brass-accent)] shrink-0">
                <LayoutGrid size={18} />
              </div>
              <div>
                <p className="font-display text-sm sm:text-base font-semibold text-[var(--foreground)]">
                  {t('overviewLayout')}
                </p>
                <p className="font-body text-xs text-white/65 mt-0.5">
                  {t('overviewLayoutDesc')}
                </p>
              </div>
            </div>
            <LayoutToggle value={layout} onChange={onLayoutChange} />
          </div>

          {/* Row 3: Cloud Sync (Coming Soon) */}
          <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/[0.02] transition-colors opacity-80">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
                <Database size={18} />
              </div>
              <div>
                <p className="font-display text-sm sm:text-base font-semibold text-white/90">
                  Google Sync
                </p>
                <p className="font-body text-xs text-white/65 mt-0.5">
                  Sync journals with Google Account
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/70 border border-white/15 shrink-0">
              Offline
            </span>
          </div>

          {/* Row 4: App Version */}
          <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-white/[0.02] transition-colors">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
                <Info size={18} />
              </div>
              <div>
                <p className="font-display text-sm sm:text-base font-semibold text-[var(--foreground)]">
                  App Version
                </p>
                <p className="font-body text-xs text-white/65 mt-0.5">
                  Aqua Vitaeum release details
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-white/70 shrink-0 bg-white/8 px-2.5 py-1 rounded-md border border-white/15">
              Beta v0.1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
