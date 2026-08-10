'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { X } from 'lucide-react';


interface WelcomePageProps {
  hasJournals: boolean;
  onComplete: (firstJournalName: string, description?: string) => void;
  onEnter: () => void;
}

export function WelcomePage({ hasJournals, onComplete, onEnter }: WelcomePageProps) {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleEnterClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onEnter();
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const journalName = name.trim() || t('welcomeSubtitle');
    const journalDesc = description.trim();
    
    // Close modal and trigger slide-out fade animation
    setIsModalOpen(false);
    setIsAnimating(true);
    setTimeout(() => {
      // Set completed flag in localStorage
      localStorage.setItem('aqua-vitaeum-welcome-completed', 'true');
      onComplete(journalName, journalDesc || undefined);
    }, 600); // matches transition timing
  };

  const basePath = process.env.NODE_ENV === 'production' ? '/aquavitaeum' : '';

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0c1a0e] overflow-hidden select-none transition-all duration-700 ease-in-out ${
        isAnimating ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >

      {/* Immersive 10% Brighter Glowing Liquid Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Shifting Amber Fluid Glow Spot 1 */}
        <div
          className="absolute rounded-full bg-gradient-to-tr from-[#A05B17] via-[#D48A22] to-[#FFC04D] w-[50vw] h-[50vw] sm:w-[650px] sm:h-[650px] filter blur-[110px] sm:blur-[140px]"
          style={{
            top: '-15%',
            left: '-15%',
            animation: 'liquidGlow 18s ease-in-out infinite alternate',
          }}
        />

        {/* Shifting Amber Fluid Glow Spot 2 */}
        <div
          className="absolute rounded-full bg-gradient-to-br from-[#FFC04D] via-[#D48A22] to-[#A05B17] w-[60vw] h-[60vw] sm:w-[750px] sm:h-[750px] filter blur-[120px] sm:blur-[150px]"
          style={{
            bottom: '-20%',
            right: '-15%',
            animation: 'liquidGlow 22s ease-in-out infinite alternate-reverse',
          }}
        />

        {/* Subtle Green Lacquer Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#122616]/40 via-transparent to-[#122616]/60" />
      </div>

      {/* Flowing Whisky Waves at the Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden pointer-events-none z-0 opacity-40">
        <svg
          className="absolute bottom-0 w-[200%] h-full animate-wave-slow"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,60 C150,90 350,30 500,60 C650,90 850,30 1000,60 C1150,90 1350,30 1500,60 L1500,120 L0,120 Z"
            fill="url(#whiskyWave1)"
          />
        </svg>
        <svg
          className="absolute bottom-0 w-[200%] h-[90%] animate-wave-fast"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,50 C200,20 400,80 600,50 C800,20 1000,80 1200,50 L1200,120 L0,120 Z"
            fill="url(#whiskyWave2)"
          />
        </svg>
      </div>

      {/* Gradients definition for the liquid waves */}
      <svg className="hidden">
        <defs>
          <linearGradient id="whiskyWave1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A05B17" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#0c1a0e" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="whiskyWave2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D48A22" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0c1a0e" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>

      {/* CSS Animation Keyframes */}
      <style jsx global>{`
        @keyframes liquidGlow {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
          }
          50% {
            transform: translate(70px, -50px) scale(1.15) rotate(180deg);
          }
          100% {
            transform: translate(-40px, 60px) scale(0.9) rotate(360deg);
          }
        }
        @keyframes waveSlow {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes waveFast {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-wave-slow {
          animation: waveSlow 20s linear infinite;
        }
        .animate-wave-fast {
          animation: waveFast 14s linear infinite;
        }
      `}</style>

      {/* Welcome Screen Content (Floating Directly, No Background Kasten) */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-16 px-6 max-w-xl mx-auto text-center w-full">
        {/* Upper half: Logo, Brand & Elegant cursive Subtitle */}
        <div className="flex-1 flex flex-col items-center justify-center pt-16">
          {/* Logo (Larger, positioned in upper half, no pulse transition) */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-white/[0.04] to-transparent border border-[#C59B27]/40 shadow-[0_0_50px_rgba(197,155,39,0.3)] flex items-center justify-center mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${basePath}/whisky-logo-with-circle-v4.svg`}
              alt="Aqua Vitaeum Logo"
              className="w-28 h-28 sm:w-32 sm:h-32 select-none pointer-events-none rounded-full"
              width={128}
              height={128}
            />
          </div>

          {/* Brand Title */}
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#C59B27] tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mb-3">
            {t('welcomeTitle')}
          </h1>

          {/* Subsubtitle: Elegant cursive italics */}
          <p className="font-serif italic text-lg sm:text-xl text-[#e8d5b7]/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] tracking-wide">
            {t('welcomeSubtitle')}
          </p>
        </div>

        {/* Bottom half: Parchment-colored single button */}
        <div className="w-full max-w-sm mt-auto pb-8">
          <button
            onClick={hasJournals ? handleEnterClick : () => setIsModalOpen(true)}
            className="w-full h-12 rounded-lg bg-[#E8D5B7] hover:bg-[#F5F2EB] border border-[#C59B27]/40 text-[#311e15] hover:text-[#21140e] font-body text-xs sm:text-sm font-bold tracking-widest uppercase shadow-[0_8px_30px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-300 active:scale-[0.98] hover:shadow-[0_8px_35px_rgba(197,155,39,0.35)]"
          >
            {hasJournals ? t('enterJournalBtn') : t('createFirstJournal')}
          </button>
        </div>
      </div>

      {/* Creation Modal Popup (Keeps landing page clean) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in p-4">
          <div className="w-full max-w-md bg-[#1e2e21]/90 backdrop-blur-xl border border-[#C59B27]/40 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#C59B27]/20 pb-3 mb-5">
              <h3 className="font-display text-base sm:text-lg font-bold text-[#C59B27] uppercase tracking-wider">
                {t('createFirstJournal')}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setName('');
                  setDescription('');
                }}
                className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-body text-gray-400 mb-2 tracking-wider">
                  Journal Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={40}
                  placeholder={t('journalNamePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[#0c1a0e] border border-[#C59B27]/30 text-gray-100 placeholder-gray-500 font-body text-sm focus:outline-none focus:border-[#C59B27] mb-4"
                />
              </div>

              <div>
                <label className="block text-xs font-body text-gray-400 mb-2 tracking-wider">
                  Description (optional)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="e.g. My collection of Single Malts..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[#0c1a0e] border border-[#C59B27]/30 text-gray-100 placeholder-gray-500 font-body text-sm focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setName('');
                    setDescription('');
                  }}
                  className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-[#E8D5B7] hover:bg-[#F5F2EB] border border-[#C59B27]/40 text-[#311e15] hover:text-[#21140e] font-semibold text-sm transition-all cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  {t('createJournalBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
