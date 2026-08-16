'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { LayoutToggle } from '@/components/ui/LayoutToggle';
import { GoogleDriveSyncSection } from '@/components/features/profile/GoogleDriveSyncSection';
import { User, Globe, LayoutGrid } from 'lucide-react';
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
      <div className="w-full rounded-2xl border border-[#237347]/25 bg-[var(--parchment-bg)] p-6 sm:p-10 text-center shadow-[0_8px_30px_rgba(40,28,15,0.09),0_2px_8px_rgba(35,115,71,0.08)] relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-[var(--forest-green)]/10 blur-3xl pointer-events-none" />

        {/* Circular Avatar Placeholder */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[var(--forest-green)]/40 flex items-center justify-center bg-[var(--forest-green)]/10 mx-auto mb-4 shadow-xs text-[var(--forest-green)] relative z-10">
          <User size={38} className="sm:size-[44px] stroke-[1.5]" />
        </div>

        {/* Profile Name & Status */}
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-wide mb-6 relative z-10">
          {t('profileTab')}
        </h2>

        {/* Settings Box */}
        <div className="w-full bg-[var(--pub-bg-panel)] border border-[#237347]/20 rounded-xl divide-y divide-[var(--parchment-divider)] text-left overflow-hidden shadow-xs relative z-10">
          {/* Row 1: Language */}
          <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-black/[0.02] transition-colors">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 flex items-center justify-center text-[var(--forest-green)] shrink-0">
                <Globe size={18} />
              </div>
              <div>
                <p className="font-display text-sm sm:text-base font-semibold text-[var(--foreground)]">
                  {t('profileLanguage')}
                </p>
                <p className="font-body text-xs text-[var(--sepia-muted)] mt-0.5">
                  Select interface language
                </p>
              </div>
            </div>
            <LanguageToggle className="shrink-0" />
          </div>

          {/* Row 2: Tasting Cards Overview Layout */}
          <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-black/[0.02] transition-colors">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-9 h-9 rounded-lg bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/30 flex items-center justify-center text-[var(--forest-green)] shrink-0">
                <LayoutGrid size={18} />
              </div>
              <div>
                <p className="font-display text-sm sm:text-base font-semibold text-[var(--foreground)]">
                  {t('overviewLayout')}
                </p>
                <p className="font-body text-xs text-[var(--sepia-muted)] mt-0.5">
                  {t('overviewLayoutDesc')}
                </p>
              </div>
            </div>
            <LayoutToggle value={layout} onChange={onLayoutChange} />
          </div>

          {/* Row 3: Google Drive Cloud Sync & Backup */}
          <GoogleDriveSyncSection />
        </div>

        {/* Discrete App Version Footer */}
        <p className="font-mono text-[11px] sm:text-xs text-[var(--sepia-muted)]/60 tracking-wider mt-6 relative z-10 select-none">
          Aqua Vitaeum · Beta v0.1.0
        </p>
      </div>
    </div>
  );
}
