'use client';

import React from 'react';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { useLanguage } from '@/context/LanguageContext';

export default function AppLoader() {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[var(--pub-bg)] select-none text-center">
      <div className="w-16 h-16 rounded-full border border-[var(--forest-green)]/40 flex items-center justify-center bg-[var(--wood-dark)]/10 mb-4 shadow-[0_0_25px_rgba(35,115,71,0.20)] animate-pulse">
        <WhiskyLogo size={32} className="text-[var(--forest-green)]" />
      </div>
      <h2 className="font-display text-xs font-bold text-[var(--forest-green)] tracking-widest uppercase animate-pulse">
        {t('uncasking')}
      </h2>
    </div>
  );
}
