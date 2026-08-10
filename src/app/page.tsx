'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Menu, Plus, BookOpen, User, Search, Star } from 'lucide-react';
import { useSpiritCollection } from '@/hooks/useSpiritCollection';
import { useJournals } from '@/hooks/useJournals';
import { TastingCard } from '@/components/features/tasting-card/TastingCard';
import { SpiritCollectionGrid } from '@/components/features/collection/SpiritCollectionGrid';
import { WelcomePage } from '@/components/features/welcome/WelcomePage';
import { JournalsOverview } from '@/components/features/journals/JournalsOverview';
import { ProfileView } from '@/components/features/profile/ProfileView';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useLanguage } from '@/context/LanguageContext';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { cn } from '@/lib/utils';
import { SpiritType, SPIRIT_TYPES } from '@/types/spirit.types';
import { db } from '@/lib/db';

export default function Home() {
  const { t } = useLanguage();
  const basePath = process.env.NODE_ENV === 'production' ? '/aquavitaeum' : '';
  
  // Navigation View State: loading | welcome (onboarding) | overview (bookshelf) | journal-detail (tasting ledger) | profile
  const [activeView, setActiveView] = useState<'loading' | 'welcome' | 'overview' | 'journal-detail' | 'profile'>('loading');
  const [activeJournalId, setActiveJournalId] = useState<string | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const lastScrollTop = useRef(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCreateJournalModalOpen, setIsCreateJournalModalOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalTypeFilter, setGlobalTypeFilter] = useState<SpiritType | 'All'>('All');

  const searchRef = useRef<HTMLDivElement>(null);
  const [searchResults, setSearchResults] = useState<{
    journals: { id: string; name: string; recentImages?: string[]; bottleCount: number; averageRating: number; description?: string }[];
    spirits: { id: string; name: string; distillery: string; journalId: string; journalName: string; thumbnailImage?: string; region: string; rating100: number; spiritType: string }[];
  }>({ journals: [], spirits: [] });

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setGlobalSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global search effect
  useEffect(() => {
    if (!globalSearchQuery.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults({ journals: [], spirits: [] });
      return;
    }

    let isMounted = true;
    const query = globalSearchQuery.toLowerCase();

    async function performGlobalSearch() {
      try {
        // 1. Filter matching journals from our already-calculated state (which contains stats)
        const matchingJournals = journals
          .filter(j => j.name.toLowerCase().includes(query) || (j.description && j.description.toLowerCase().includes(query)))
          .map(j => ({
            id: j.id,
            name: j.name,
            recentImages: j.recentImages,
            bottleCount: j.bottleCount,
            averageRating: j.averageRating,
            description: j.description
          }));

        // 2. Fetch matching spirits
        const allSpirits = await db.spirits.toArray();
        const matchingSpirits = allSpirits
          .filter(s => {
            const matchesType = globalTypeFilter === 'All' || s.spiritType === globalTypeFilter;
            const matchesText = s.name.toLowerCase().includes(query) || 
                                s.distillery.toLowerCase().includes(query) || 
                                s.region.toLowerCase().includes(query) ||
                                s.spiritType.toLowerCase().includes(query);
            return matchesType && matchesText;
          })
          .map(s => {
            const journal = journals.find(j => j.id === s.journalId);
            return {
              id: s.id,
              name: s.name,
              distillery: s.distillery,
              journalId: s.journalId,
              journalName: journal ? journal.name : 'Unknown Journal',
              thumbnailImage: s.thumbnailImage,
              region: s.region,
              rating100: s.rating100,
              spiritType: s.spiritType
            };
          });

        if (isMounted) {
          setSearchResults({ journals: matchingJournals, spirits: matchingSpirits });
        }
      } catch (err) {
        console.error('Failed to perform global search:', err);
      }
    }

    performGlobalSearch();
    return () => {
      isMounted = false;
    };
  }, [globalSearchQuery, globalTypeFilter]);

  // Scroll visibility for bottom bar
  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        return;
      }
      const target = e.target as HTMLElement;
      if (!target || typeof target.scrollTop === 'undefined') return;

      const scrollTop = target.scrollTop;
      if (scrollTop < 0) return;

      const delta = scrollTop - lastScrollTop.current;
      if (Math.abs(delta) < 15) return;

      if (delta > 0 && scrollTop > 60) {
        setIsBottomBarVisible(false);
      } else if (delta < 0) {
        setIsBottomBarVisible(true);
      }
      lastScrollTop.current = scrollTop;
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // Reset scroll state on view transition
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsBottomBarVisible(true);
    lastScrollTop.current = 0;
  }, [activeView]);

  // Load journals hook
  const {
    journals,
    isLoading: isLoadingJournals,
    createJournal,
    renameJournal,
    deleteJournal,
    refreshJournals,
  } = useJournals();

  // Load spirits collection hook for the selected journal
  const {
    spirits,
    selectedId,
    activeSpirit,
    isLoading: isLoadingSpirits,
    selectSpirit,
    handleNewNote,
    handleSave,
    handleDelete,
  } = useSpiritCollection(activeJournalId);

  // Local filtered spirits inside the active journal
  const filteredSpirits = useMemo(() => {
    return spirits.filter((s) => {
      const matchesType = globalTypeFilter === 'All' || s.spiritType === globalTypeFilter;
      const q = globalSearchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (s.distillery || '').toLowerCase().includes(q) ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.region || '').toLowerCase().includes(q) ||
        (s.spiritType || '').toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [spirits, globalSearchQuery, globalTypeFilter]);

  // Automatically refresh journals stats when the active spirits list changes (saved or deleted notes)
  useEffect(() => {
    refreshJournals();
  }, [spirits, refreshJournals]);

  // Lock body scroll when mobile drawer is open to prevent background scroll chaining
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  // Show welcome screen on initial session start, but skip if onboarding is completed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const welcomeCompleted = localStorage.getItem('aqua-vitaeum-welcome-completed');
      const sessionStarted = sessionStorage.getItem('aqua-vitaeum-session-started');
      if (welcomeCompleted === 'true' || sessionStarted === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveView('overview');
      } else {
        setActiveView('welcome');
      }
    }
  }, []);

  // Find currently active journal object for header meta info
  const activeJournal = useMemo(() => {
    return journals.find((j) => j.id === activeJournalId);
  }, [journals, activeJournalId]);

  // Close mobile drawer on Escape key press (W3C standard dialog behavior)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen]);

  // Handle welcome onboarding completion
  const handleWelcomeComplete = async (firstJournalName: string, description?: string) => {
    try {
      const created = await createJournal(firstJournalName, description);
      if (created && typeof created === 'object' && 'id' in created) {
        setActiveJournalId(created.id as string);
        setActiveView('journal-detail');
      } else {
        setActiveView('overview');
      }
    } catch (err) {
      console.error('Failed to create onboarding journal, falling back to overview.', err);
      setActiveView('overview');
    }
  };

  // Render a minimal centered loader spinner on initial server/client mount to prevent layout flickers
  if (activeView === 'loading') {
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

  // If in welcome/onboarding view, render welcome page full-screen overlay
  if (activeView === 'welcome') {
    return (
      <>
        <title>Aqua Vitaeum · Welcome</title>
        <WelcomePage 
          hasJournals={journals.length > 0}
          onComplete={handleWelcomeComplete} 
          onEnter={() => setActiveView('overview')}
        />
      </>
    );
  }

  return (
    <>
      <title>
        {activeJournal
          ? `Aqua Vitaeum · ${activeJournal.name}`
          : 'Aqua Vitaeum · Fine Spirits Tasting Notes'}
      </title>

      <main
        id="app-main"
        className={cn(
          'h-screen flex flex-col overflow-hidden',
          'bg-[var(--pub-bg)] text-[#e8d5b7]'
        )}
      >
        {/* ── App Header ─────────────────────────────────────────────────── */}
        <header
          id="app-header"
          className={cn(
            "flex-shrink-0 h-14 flex items-center justify-between px-3 sm:px-6 border-b border-black/40 border-t border-white/[0.03] bg-wood z-30 shadow-md transition-all duration-300 ease-in-out",
            "max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:right-0",
            (!isBottomBarVisible && !isMobileDrawerOpen && activeView !== 'profile')
              ? "max-lg:-translate-y-full max-lg:opacity-0 max-lg:pointer-events-none"
              : "translate-y-0 opacity-100"
          )}
        >
          {/* Left Header: Brand Logo & Title (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${basePath}/whisky-logo-with-circle-v4.svg`}
              alt="Aqua Vitaeum Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 select-none pointer-events-none rounded-full"
              width={40}
              height={40}
            />
            <div>
              <h1 className="font-display text-sm sm:text-base font-bold text-[#C59B27] tracking-wide leading-none">
                {t('appTitle')}
              </h1>
              <p className="font-body text-[9px] text-white/40 uppercase tracking-widest leading-none mt-1">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Middle Header: Global Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-sm md:max-w-xl lg:max-w-3xl mx-auto relative w-full">
            <div className="relative flex items-center bg-black/35 hover:bg-black/45 focus-within:bg-black/50 border border-white/10 focus-within:border-[#C59B27]/50 rounded-md px-3 py-1.5 focus-within:ring-0 focus-within:outline-none h-10 transition-colors duration-150">
              <Search size={16} className="text-white/60 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search spirits & journals..."
                className="bg-transparent border-none text-sm text-[#e8d5b7] placeholder-white/40 focus:outline-none focus:ring-0 focus-within:ring-0 w-full pr-32"
              />
              <select
                value={globalTypeFilter}
                onChange={(e) => setGlobalTypeFilter(e.target.value as SpiritType | 'All')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#224229] border border-white/10 text-xs text-[#e8d5b7] font-semibold focus:outline-none cursor-pointer px-2.5 py-1 rounded hover:border-[#C59B27]/40 transition-colors"
              >
                <option value="All">All</option>
                {SPIRIT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Global Search Dropdown Overlay */}
            {globalSearchQuery.trim() !== '' && (
              <div className="absolute top-10 left-0 right-0 bg-[#224229] border border-[#C59B27]/40 rounded-lg shadow-2xl z-50 p-2 max-h-[380px] overflow-y-auto divide-y divide-white/5">
                {searchResults.journals.length === 0 && searchResults.spirits.length === 0 ? (
                  <p className="text-center text-xs text-white/40 py-4 italic">
                    No matches found.
                  </p>
                ) : (
                  <>
                    {searchResults.journals.length > 0 && (
                      <div className="py-1">
                        <p className="text-[10px] uppercase font-bold text-[#C59B27] tracking-wider px-2 mb-1.5">Journals</p>
                        {searchResults.journals.map(j => {
                          const hasImg = j.recentImages && j.recentImages.length > 0 && j.recentImages[0] && j.recentImages[0].trim() !== '';
                          return (
                            <button
                              key={j.id}
                              onClick={() => {
                                setActiveJournalId(j.id);
                                setActiveView('journal-detail');
                                setGlobalSearchQuery('');
                              }}
                              className="w-full text-left text-xs text-[#E8D5B7] hover:bg-white/5 p-3 rounded-lg transition-all flex items-center gap-4.5 cursor-pointer group min-h-[84px]"
                            >
                              {/* Left Column: Image & Rating under it */}
                              <div className="flex flex-col items-center justify-center shrink-0 w-14 text-center">
                                {hasImg && j.recentImages ? (
                                  <img
                                    src={j.recentImages[0]}
                                    alt=""
                                    className="w-14 h-14 rounded-md object-cover border border-white/10"
                                  />
                                ) : (
                                  <div
                                    className="w-14 h-14 rounded-md border border-white/5 flex items-center justify-center text-base"
                                    style={{ background: 'radial-gradient(circle, #2A5E3F33 0%, #121212 100%)' }}
                                  >
                                    📖
                                  </div>
                                )}
                                {j.averageRating > 0 && (
                                  <div className="flex items-center gap-0.5 text-[#C59B27] font-black text-[12px] sm:text-[13px] mt-1.5 select-none leading-none">
                                    <Star size={12} className="fill-[#C59B27] text-[#C59B27] shrink-0" />
                                    <span>{j.averageRating}</span>
                                  </div>
                                )}
                              </div>

                              {/* Right Column: Text Details */}
                              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                                <p className="font-display font-black text-[14px] sm:text-[15px] text-white group-hover:text-[#C59B27] transition-colors truncate">
                                  {j.name}
                                </p>
                                <p className="font-body text-[12px] text-white/60 line-clamp-1 italic mt-0.5">
                                  {j.description || 'No description provided.'}
                                </p>
                                <p className="text-[11px] text-white/40 truncate mt-0.5">
                                  {j.bottleCount} {j.bottleCount === 1 ? 'Note' : 'Notes'}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {searchResults.spirits.length > 0 && (
                      <div className="py-1">
                        <p className="text-[10px] uppercase font-bold text-[#C59B27] tracking-wider px-2 mb-1.5">Spirits</p>
                        {searchResults.spirits.map(s => {
                          const hasImg = s.thumbnailImage && s.thumbnailImage.trim() !== '';
                          return (
                            <button
                              key={s.id}
                              onClick={() => {
                                setActiveJournalId(s.journalId);
                                setActiveView('journal-detail');
                                selectSpirit(s.id);
                                setGlobalSearchQuery('');
                              }}
                              className="w-full text-left text-xs text-[#E8D5B7] hover:bg-white/5 p-3 rounded-lg transition-all flex items-center gap-4.5 cursor-pointer group min-h-[84px]"
                            >
                              {/* Left Column: Image & Rating under it */}
                              <div className="flex flex-col items-center justify-center shrink-0 w-14 text-center">
                                {hasImg && s.thumbnailImage ? (
                                  <img
                                    src={s.thumbnailImage}
                                    alt=""
                                    className="w-14 h-14 rounded-md object-cover border border-white/10"
                                  />
                                ) : (
                                  <div
                                    className="w-14 h-14 rounded-md border border-white/5 flex items-center justify-center text-base"
                                    style={{ background: 'radial-gradient(circle, #C59B2722 0%, #121212 100%)' }}
                                  >
                                    🥃
                                  </div>
                                )}
                                <div className="flex items-center gap-0.5 text-[#C59B27] font-black text-[12px] sm:text-[13px] mt-1.5 select-none leading-none">
                                  <Star size={12} className="fill-[#C59B27] text-[#C59B27] shrink-0" />
                                  <span>{s.rating100}</span>
                                </div>
                              </div>

                              {/* Right Column: Text Details */}
                              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                                <p className="font-display font-black text-[14px] sm:text-[15px] text-white group-hover:text-[#C59B27] transition-colors truncate">
                                  {s.name}
                                </p>
                                <p className="text-[12px] text-white/80 font-medium truncate mt-0.5">
                                  {s.distillery} • <span className="text-white/60">{s.region}</span>
                                </p>
                                <p className="text-[11px] text-white/40 truncate mt-0.5">
                                  {s.spiritType} <span className="mx-1">•</span> in <span className="italic">{s.journalName}</span>
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Header: Desktop Profile Button */}
          {/* Right Header: Desktop Actions Group */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeView === 'profile') {
                  if (activeJournalId) {
                    setActiveView('journal-detail');
                  } else {
                    setActiveView('overview');
                  }
                } else {
                  setActiveView('profile');
                }
              }}
              className={cn(
                "hidden lg:flex h-8 w-8 items-center justify-center rounded-full bg-[#E8D5B7] text-[#311e15] hover:bg-[#F5F2EB] transition-all duration-150 cursor-pointer select-none",
                activeView === 'profile' && "ring-2 ring-[#C59B27] ring-offset-2 ring-offset-[#311e15]"
              )}
              title={t('profileTab')}
            >
              <User size={16} />
            </button>
          </div>
        </header>

        {/* ── Main Layout View switcher ──────────────────────────────────── */}
        {activeView === 'profile' ? (
          <div className="flex-1 overflow-y-auto bg-[var(--pub-bg)] pt-14 lg:pt-0 pb-16 lg:pb-0 flex items-center justify-center">
            <ProfileView />
          </div>
        ) : activeView === 'overview' ? (
          <div className="flex-1 h-full relative overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto bg-[var(--pub-bg)] pt-14 lg:pt-0 pb-16 lg:pb-0">
              {isLoadingJournals ? (
                <div className="flex-1 h-64 flex flex-col items-center justify-center text-center p-6 select-none animate-pulse">
                  <div className="w-16 h-16 rounded-full border border-[#C59B27]/40 flex items-center justify-center bg-[#C59B27]/10 mb-4 shadow-[0_0_25px_rgba(197,155,39,0.25)]">
                    <WhiskyLogo size={32} className="text-[#C59B27]" />
                  </div>
                  <h2 className="font-display text-xs font-bold text-[#C59B27] tracking-widest uppercase">
                    {t('uncasking')}
                  </h2>
                </div>
              ) : (
                <JournalsOverview
                  journals={journals}
                  onCreateJournal={createJournal}
                  onRenameJournal={renameJournal}
                  onDeleteJournal={deleteJournal}
                  isCreateOpen={isCreateJournalModalOpen}
                  onCloseCreate={() => setIsCreateJournalModalOpen(false)}
                  onSelectJournal={(id) => {
                    setActiveJournalId(id);
                    setActiveView('journal-detail');
                  }}
                />
              )}
            </div>

            {/* Desktop Floating Plus Button (Overview View) */}
            <button
              type="button"
              onClick={() => setIsCreateJournalModalOpen(true)}
              className="hidden lg:flex absolute bottom-6 right-6 w-12 h-12 rounded-full bg-[#E8D5B7] text-[#311e15] border border-[#C59B27]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-30 hover:bg-[#F5F2EB]"
              title={t('createJournalBtn')}
            >
              <Plus size={22} />
            </button>
          </div>
        ) : (
          /* activeView === 'journal-detail' */
          <div className="flex flex-1 overflow-hidden relative">
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

            {/* Main Wrapper: Holds scrollable card and floating buttons */}
            <div className="flex-1 h-full relative overflow-hidden flex flex-col">
              <section
                id="tasting-card-section"
                className="flex-1 h-full overflow-y-auto overflow-x-hidden px-3 pt-17 pb-16 sm:px-6 sm:pt-20 sm:pb-18 lg:pt-6 lg:pb-6 flex justify-center items-center"
              >
                {isLoadingSpirits ? (
                  <div className="flex flex-col items-center justify-center text-center p-6 select-none animate-pulse">
                    <div className="w-16 h-16 rounded-full border border-[#C59B27]/40 flex items-center justify-center bg-[#C59B27]/10 mb-4 shadow-[0_0_25px_rgba(197,155,39,0.25)]">
                      <WhiskyLogo size={32} className="text-[#C59B27]" />
                    </div>
                    <h2 className="font-display text-xs font-bold text-[#C59B27] tracking-widest uppercase">
                      {t('uncasking')}
                    </h2>
                  </div>
                ) : spirits.length === 0 ? (
                  <div className="w-full max-w-xl flex flex-col items-center justify-center min-h-[380px] rounded-xl border border-[#C59B27]/30 bg-black/45 backdrop-blur-md p-8 sm:p-12 text-center shadow-[0_15px_35px_rgba(0,0,0,0.6)] border-t-[#C59B27]/50 border-l-[#C59B27]/50 my-auto animate-fade-in">
                    <div className="w-20 h-20 rounded-full border-2 border-[#C59B27]/40 flex items-center justify-center bg-[#C59B27]/10 mb-6 shadow-[0_0_35px_rgba(197,155,39,0.25)] animate-fade-in-up">
                      <WhiskyLogo size={38} className="text-[#C59B27]" />
                    </div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-[#C59B27] tracking-wide mb-3">
                      {t('cellarEmptyTitle')}
                    </h2>
                    <p className="font-body text-xs sm:text-sm text-white/50 max-w-md leading-relaxed mb-8">
                      {t('cellarEmptySubtitle')}
                    </p>
                    <button
                      type="button"
                      onClick={handleNewNote}
                      className="flex items-center gap-2 px-5 py-2.5 rounded text-xs sm:text-sm font-display uppercase tracking-wider font-bold border shrink-0 bg-[#E8D5B7] text-[#311e15] border-[#C59B27]/40 hover:bg-[#F5F2EB] hover:text-[#21140e] transition-all duration-250 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-[1.02]"
                    >
                      <Plus size={14} />
                      {t('newNote')}
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-5xl self-start">
                    <ErrorBoundary>
                      <TastingCard
                        key={activeSpirit.id}
                        initialSpirit={activeSpirit}
                        onSave={handleSave}
                        onDelete={handleDelete}
                      />
                    </ErrorBoundary>
                  </div>
                )}
              </section>

              {/* Desktop Floating Action Buttons (Symmetrical FABs) */}
              <button
                type="button"
                onClick={() => {
                  setActiveJournalId(null);
                  setActiveView('overview');
                }}
                className="hidden lg:flex absolute bottom-6 left-6 w-12 h-12 rounded-full bg-[#E8D5B7] text-[#311e15] border border-[#C59B27]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-30 hover:bg-[#F5F2EB]"
                title={t('journalsTitle') || 'Journals'}
              >
                <BookOpen size={22} />
              </button>

              <button
                type="button"
                onClick={handleNewNote}
                className="hidden lg:flex absolute bottom-6 right-6 w-12 h-12 rounded-full bg-[#E8D5B7] text-[#311e15] border border-[#C59B27]/40 shadow-[0_4px_20px_rgba(0,0,0,0.5)] items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-30 hover:bg-[#F5F2EB]"
                title={t('newNote')}
              >
                <Plus size={22} />
              </button>
            </div>
          </div>
        )}

        {/* Global Mobile Bottom Navigation Bar (lg:hidden) */}
        <nav
          className={cn(
            "fixed bottom-0 left-0 right-0 h-12 z-50 bg-wood border-t border-black/40 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] flex items-center pb-safe lg:hidden transition-all duration-300 ease-in-out",
            (isBottomBarVisible || isMobileDrawerOpen || activeView === 'profile')
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0 pointer-events-none"
          )}
        >
          {/* Left Group (flex-1) */}
          <div className="flex-1 flex justify-around items-center h-full">
            {/* Tab 1: Bookshelf */}
            <button
              type="button"
              onClick={() => {
                setActiveJournalId(null);
                setActiveView('overview');
                setIsMobileDrawerOpen(false);
              }}
              className={cn(
                "flex items-center justify-center w-16 h-full border-t-4 transition-all cursor-pointer",
                activeView === 'overview'
                  ? "border-[#C59B27] bg-gradient-to-b from-black/35 from-0% to-transparent to-[12%] text-[#e8d5b7]"
                  : "border-transparent text-[#e8d5b7]/60 hover:text-[#e8d5b7]/90 active:border-[#C59B27]"
              )}
              title={t('journalsTitle')}
            >
              <BookOpen size={20} />
            </button>

            {/* Tab 2: Collection Drawer (Only visible when activeJournalId is present) */}
            {activeJournalId ? (
              <button
                type="button"
                onClick={() => {
                  if (activeView !== 'journal-detail') {
                    setActiveView('journal-detail');
                    setIsMobileDrawerOpen(true);
                  } else {
                    setIsMobileDrawerOpen(!isMobileDrawerOpen);
                  }
                }}
                className={cn(
                  "flex items-center justify-center w-16 h-full border-t-4 transition-all cursor-pointer",
                  (isMobileDrawerOpen && activeView === 'journal-detail')
                    ? "border-[#C59B27] bg-gradient-to-b from-black/35 from-0% to-transparent to-[12%] text-[#e8d5b7]"
                    : "border-transparent text-[#e8d5b7]/60 hover:text-[#e8d5b7]/90 active:border-[#C59B27]"
                )}
                title={t('collection')}
              >
                <Menu size={20} />
              </button>
            ) : (
              // Spacer to maintain centering alignment when no active journal
              <div className="w-16 h-full" />
            )}
          </div>

          {/* Center Group: Primary Action Highlighted Circular FAB (flex-shrink-0) */}
          <div className="w-14 flex items-center justify-center flex-shrink-0 h-full">
            <button
              type="button"
              onClick={() => {
                if (activeView === 'journal-detail') {
                  handleNewNote();
                  setIsMobileDrawerOpen(false);
                } else if (activeView === 'overview') {
                  setIsCreateJournalModalOpen(true);
                } else if (activeView === 'profile') {
                  if (activeJournalId) {
                    setActiveView('journal-detail');
                    handleNewNote();
                    setIsMobileDrawerOpen(false);
                  } else {
                    setActiveView('overview');
                    setIsCreateJournalModalOpen(true);
                  }
                }
              }}
              className="w-9 h-9 rounded-full bg-[#E8D5B7] text-[#311e15] border border-[#C59B27]/40 shadow-[0_0_12px_rgba(197,155,39,0.4)] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-20 hover:bg-[#F5F2EB]"
              title="Create New"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Right Group (flex-1) */}
          <div className="flex-1 flex justify-around items-center h-full">
            {/* Symmetrical inner spacer to match the left Collection tab */}
            {activeJournalId ? (
              <div className="w-16 h-full" />
            ) : (
              // Spacer to maintain centering alignment when no active journal
              <div className="w-16 h-full" />
            )}

            {/* Tab 3: You (Profile) */}
            <button
              type="button"
              onClick={() => {
                setActiveView('profile');
                setIsMobileDrawerOpen(false);
              }}
              className={cn(
                "flex items-center justify-center w-16 h-full border-t-4 transition-all cursor-pointer",
                activeView === 'profile'
                  ? "border-[#C59B27] bg-gradient-to-b from-black/35 from-0% to-transparent to-[12%] text-[#e8d5b7]"
                  : "border-transparent text-[#e8d5b7]/60 hover:text-[#e8d5b7]/90 active:border-[#C59B27]"
              )}
              title={t('profileTab')}
            >
              <User size={20} />
            </button>
          </div>
        </nav>
      </main>
    </>
  );
}
