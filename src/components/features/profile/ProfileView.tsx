'use client';

import { useLanguage } from '@/context/LanguageContext';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { User, Database, Info, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileViewProps {
  className?: string;
}

export function ProfileView({
  className,
}: ProfileViewProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        'w-full max-w-xl mx-auto flex flex-col justify-center items-center p-4 sm:p-6 my-auto min-h-[380px]',
        className
      )}
    >
      {/* Main Profile Card Container */}
      <div className="w-full rounded-xl border border-[#C59B27]/30 bg-black/45 backdrop-blur-md p-6 sm:p-8 text-center shadow-[0_15px_35px_rgba(0,0,0,0.6)] border-t-[#C59B27]/50 border-l-[#C59B27]/50">
        {/* Circular Avatar Placeholder */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#C59B27]/40 flex items-center justify-center bg-[#C59B27]/10 mx-auto mb-4 shadow-[0_0_25px_rgba(197,155,39,0.25)] text-[#C59B27]">
          <User size={38} className="sm:size-[44px] stroke-[1.5]" />
        </div>

        {/* Profile Name & Status */}
        <h2 className="font-display text-lg sm:text-xl font-bold text-[#E8D5B7] tracking-wider uppercase mb-1">
          {t('profileTab')}
        </h2>
        <p className="font-body text-[10px] sm:text-xs text-white/40 uppercase tracking-widest mb-6">
          Offline tasting ledger
        </p>

        {/* Settings Box */}
        <div className="w-full bg-[#122616]/40 border border-white/5 rounded-lg divide-y divide-white/5 text-left overflow-hidden">
          {/* Row 1: Language */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Globe size={16} className="text-[#C59B27]" />
              <div>
                <p className="font-display text-xs sm:text-sm font-semibold text-[#E8D5B7]">
                  {t('profileLanguage')}
                </p>
                <p className="font-body text-[9px] sm:text-[10px] text-white/40">
                  Select application interface language
                </p>
              </div>
            </div>
            <LanguageToggle />
          </div>

          {/* Row 2: Cloud Sync (Coming Soon) */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.01] transition-colors opacity-70">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Database size={16} className="text-[#C59B27]/60" />
              <div>
                <p className="font-display text-xs sm:text-sm font-semibold text-white/75">
                  Google Sync
                </p>
                <p className="font-body text-[9px] sm:text-[10px] text-white/40">
                  Sync journals with Google Account
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/5 text-white/40 border border-white/10">
              Offline
            </span>
          </div>

          {/* Row 3: App Version */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <Info size={16} className="text-[#C59B27]" />
              <div>
                <p className="font-display text-xs sm:text-sm font-semibold text-[#E8D5B7]">
                  App Version
                </p>
                <p className="font-body text-[9px] sm:text-[10px] text-white/40">
                  Aqua Vitaeum Codex release details
                </p>
              </div>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-white/30">
              Beta v0.1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
