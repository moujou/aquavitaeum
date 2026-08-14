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
        'w-full max-w-2xl mx-auto flex flex-col justify-center items-center p-4 sm:p-6 my-auto min-h-[380px]',
        className
      )}
    >
      {/* Main Profile Card Container */}
      <div className="w-full rounded-xl border border-[var(--brass-accent)]/30 bg-black/45 backdrop-blur-md p-6 sm:p-10 text-center shadow-[0_15px_35px_rgba(0,0,0,0.6)] border-t-[var(--brass-accent)]/50 border-l-[var(--brass-accent)]/50">
        {/* Circular Avatar Placeholder */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[var(--brass-accent)]/40 flex items-center justify-center bg-[var(--brass-accent)]/10 mx-auto mb-4 shadow-[0_0_25px_rgba(197,155,39,0.25)] text-[var(--brass-accent)]">
          <User size={38} className="sm:size-[44px] stroke-[1.5]" />
        </div>

        {/* Profile Name & Status */}
        <h2 className="font-display text-lg sm:text-xl font-bold text-[var(--foreground)] tracking-wider uppercase mb-1">
          {t('profileTab')}
        </h2>
        <p className="font-body text-[11px] sm:text-xs text-white/40 uppercase tracking-widest mb-8">
          Offline tasting ledger
        </p>

        {/* Settings Box */}
        <div className="w-full bg-[var(--pub-bg)]/40 border border-white/5 rounded-lg divide-y divide-white/5 text-left overflow-hidden">
          {/* Row 1: Language */}
          <div className="flex items-center justify-between p-4.5 sm:p-5.5 hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5 sm:gap-4.5">
              <Globe size={20} className="text-[var(--brass-accent)] shrink-0" />
              <div>
                <p className="font-display text-sm sm:text-base font-semibold text-[var(--foreground)]">
                  {t('profileLanguage')}
                </p>
                <p className="font-body text-xs sm:text-sm text-white/45">
                  Select application interface language
                </p>
              </div>
            </div>
            <LanguageToggle className="shrink-0" />
          </div>

          {/* Row 2: Tasting Cards Overview Layout */}
          <div className="flex items-center justify-between p-4.5 sm:p-5.5 hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5 sm:gap-4.5">
              <LayoutGrid size={20} className="text-[var(--brass-accent)] shrink-0" />
              <div>
                <p className="font-display text-sm sm:text-base font-semibold text-[var(--foreground)]">
                  {t('overviewLayout')}
                </p>
                <p className="font-body text-xs sm:text-sm text-white/45">
                  {t('overviewLayoutDesc')}
                </p>
              </div>
            </div>
            <LayoutToggle value={layout} onChange={onLayoutChange} />
          </div>

          {/* Row 2: Cloud Sync (Coming Soon) */}
          <div className="flex items-center justify-between p-4.5 sm:p-5.5 hover:bg-white/[0.01] transition-colors opacity-70">
            <div className="flex items-center gap-3.5 sm:gap-4.5">
              <Database size={20} className="text-[var(--brass-accent)]/60 shrink-0" />
              <div>
                <p className="font-display text-sm sm:text-base font-semibold text-white/75">
                  Google Sync
                </p>
                <p className="font-body text-xs sm:text-sm text-white/45">
                  Sync journals with Google Account
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-white/5 text-white/45 border border-white/10 shrink-0">
              Offline
            </span>
          </div>

          {/* Row 3: App Version */}
          <div className="flex items-center justify-between p-4.5 sm:p-5.5 hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-3.5 sm:gap-4.5">
              <Info size={20} className="text-[var(--brass-accent)] shrink-0" />
              <div>
                <p className="font-display text-sm sm:text-base font-semibold text-[var(--foreground)]">
                  App Version
                </p>
                <p className="font-body text-xs sm:text-sm text-white/45">
                  Aqua Vitaeum Codex release details
                </p>
              </div>
            </div>
            <span className="text-xs sm:text-sm font-mono text-white/30 shrink-0">
              Beta v0.1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
