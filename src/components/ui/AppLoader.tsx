'use client';

import React from 'react';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { useLanguage } from '@/context/LanguageContext';

export default function AppLoader() {
  const { t } = useLanguage();

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
