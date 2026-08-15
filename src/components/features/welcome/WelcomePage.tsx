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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[var(--pub-bg)] overflow-hidden select-none transition-all duration-700 ease-in-out ${
        isAnimating ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >

      {/* Immersive Emerald Aurora & Malt Glow Atmospheric Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-80">
        {/* Shifting Emerald Fluid Glow Spot 1 */}
        <div
          className="absolute rounded-full bg-gradient-to-tr from-[#164E2F] via-[#237347] to-[#3AB472] w-[60vw] h-[60vw] lg:w-[650px] lg:h-[650px] opacity-75"
          style={{
            top: '-15%',
            left: '-15%',
            filter: 'blur(clamp(50px, 8vw, 85px))',
            animation: 'liquidGlow 18s ease-in-out infinite alternate',
          }}
        />

        {/* Shifting Irish Clover Fluid Glow Spot 2 */}
        <div
          className="absolute rounded-full bg-gradient-to-br from-[#2E945D] via-[#237347] to-[#164E2F] w-[70vw] h-[70vw] lg:w-[750px] lg:h-[750px] opacity-75"
          style={{
            bottom: '-20%',
            right: '-15%',
            filter: 'blur(clamp(55px, 9vw, 95px))',
            animation: 'liquidGlow 22s ease-in-out infinite alternate-reverse',
          }}
        />

        {/* Shifting Central Highland Malt Glow Spot 3 */}
        <div
          className="absolute rounded-full bg-gradient-to-br from-[#C97A1E]/40 via-[#FFD166]/25 to-transparent w-[50vw] h-[50vw] lg:w-[500px] lg:h-[500px] opacity-60"
          style={{
            top: '25%',
            left: '25%',
            filter: 'blur(clamp(60px, 10vw, 100px))',
            animation: 'liquidGlow 26s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Flowing Liquid Waves at the Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-52 overflow-hidden pointer-events-none z-0 opacity-75">
        <svg
          className="absolute bottom-0 w-[200%] h-full animate-wave-slow"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,60 C150,90 350,30 500,60 C650,90 850,30 1000,60 C1150,90 1350,30 1500,60 L1500,120 L0,120 Z"
            fill="url(#emeraldWave1)"
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
            fill="url(#emeraldWave2)"
          />
        </svg>
      </div>

      {/* Gradients definition for the liquid waves */}
      <svg className="hidden">
        <defs>
          <linearGradient id="emeraldWave1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#164E2F" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#237347" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--pub-bg)" stopOpacity="0.98" />
          </linearGradient>
          <linearGradient id="emeraldWave2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E945D" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#237347" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--pub-bg)" stopOpacity="0.98" />
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

      {/* Welcome Screen Content */}
      <div className="relative z-10 flex flex-col items-center justify-between h-full py-16 px-6 max-w-xl mx-auto text-center w-full">
        {/* Upper half: Logo, Brand & Elegant cursive Subtitle */}
        <div className="flex-1 flex flex-col items-center justify-center pt-16">
          {/* Logo */}
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center mb-6 drop-shadow-[0_12px_32px_rgba(35,115,71,0.30)] animate-fade-in">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${basePath}/whisky-logo-with-circle-v5.svg`}
              alt="Aqua Vitaeum Logo"
              className="w-full h-full select-none pointer-events-none"
              width={144}
              height={144}
            />
          </div>

          {/* Brand Title */}
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-widest uppercase mb-3">
            {t('welcomeTitle')}
          </h1>

          {/* Subtitle */}
          <p className="font-serif italic text-lg sm:text-xl text-[var(--brass-accent)] tracking-wide">
            {t('welcomeSubtitle')}
          </p>
        </div>

        {/* Bottom half: Action Button */}
        <div className="w-full max-w-sm mt-auto pb-8">
          <button
            onClick={hasJournals ? handleEnterClick : () => setIsModalOpen(true)}
            className="w-full h-12 rounded-lg bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] border border-[var(--fab-border)] text-[var(--fab-text)] font-body text-xs sm:text-sm font-bold tracking-widest uppercase shadow-md cursor-pointer transition-all duration-300 active:scale-[0.98]"
          >
            {hasJournals ? t('enterJournalBtn') : t('createFirstJournal')}
          </button>
        </div>
      </div>

      {/* Creation Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="w-full max-w-md bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/60 pb-3 mb-5">
              <h3 className="font-display text-base sm:text-lg font-bold text-[var(--foreground)] uppercase tracking-wider">
                {t('createFirstJournal')}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setName('');
                  setDescription('');
                }}
                className="p-1 rounded hover:bg-black/5 text-[var(--sepia-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-body text-[var(--sepia-muted)] mb-2 tracking-wider">
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
                  className="w-full h-11 px-3 rounded-lg bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-sm focus:outline-none focus:border-[var(--brass-accent)] mb-4"
                />
              </div>

              <div>
                <label className="block text-xs font-body text-[var(--sepia-muted)] mb-2 tracking-wider">
                  Description (optional)
                </label>
                <input
                  type="text"
                  maxLength={120}
                  placeholder="e.g. My collection of Single Malts..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg bg-[var(--pub-bg)] border border-[var(--parchment-border)] text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 font-body text-sm focus:outline-none focus:border-[var(--brass-accent)]"
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
                  className="h-10 px-4 rounded-lg bg-[var(--pub-bg-alt)] hover:bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:text-[var(--foreground)] text-sm font-semibold transition-colors cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-[var(--fab-bg)] hover:bg-[var(--fab-bg-hover)] border border-[var(--fab-border)] text-[var(--fab-text)] font-semibold text-sm transition-all cursor-pointer shadow-md active:scale-[0.98]"
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
