import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useJobs } from '../state/JobsContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useLanguage } from '../../../i18n/LanguageContext';
import { JobReelCard } from '../components/JobReelCard';
import { QuoteSheet } from './QuoteSheet';
import { Button } from '../../../design-system/components/Button';
import { Chip } from '../../../design-system/components/Chip';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { SKIP_REASONS, AVAILABLE_TRADES } from '../../../config/constants';
import { isBlocked } from '../../../data/repository';
import {
  ThumbsUp,
  RotateCcw,
  MapPinOff,
  TrendingDown,
  Clock,
  LayoutGrid,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  BrickWall,
  HardHat,
  UserRound,
} from 'lucide-react';
import { Job } from '../../../data/types';

const REASON_ICONS: Record<string, React.ReactNode> = {
  too_far: <MapPinOff className="w-4 h-4" />,
  pay_too_low: <TrendingDown className="w-4 h-4" />,
  wrong_timing: <Clock className="w-4 h-4" />,
};

const FILTER_TRADE_ICONS: Record<string, React.ReactNode> = {
  plumber: <Wrench className="w-4 h-4" />,
  electrician: <Zap className="w-4 h-4" />,
  carpenter: <Hammer className="w-4 h-4" />,
  painter: <Paintbrush className="w-4 h-4" />,
  mason: <BrickWall className="w-4 h-4" />,
  labourer: <HardHat className="w-4 h-4" />,
};

// Hackathon-demo-only floor: a worker's own trade/radius filter is real, but if it
// leaves fewer than this many cards there's nothing to scroll through, so the feed
// tops itself up with other open jobs (still real mock data, never fabricated).
const MIN_DEMO_FEED_SIZE = 5;

export const JobReelFeed: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUserId } = useMockAuthSession();
  const { jobs, getJobsForWorkerFeed, refreshJobs } = useJobs();

  const [skipTargetJobId, setSkipTargetJobId] = useState<string | null>(null);
  const [selectedJobForQuote, setSelectedJobForQuote] = useState<Job | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tradeFilter, setTradeFilter] = useState<string>('all');
  const [womanPreferredOnly, setWomanPreferredOnly] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef<number | null>(null);

  // Available jobs matching the worker's trade + radius, topped up with other open
  // jobs so there's always a real, scrollable reel feed to demo.
  const availableJobs = useMemo(() => {
    const matched = getJobsForWorkerFeed(currentUserId);
    if (matched.length >= MIN_DEMO_FEED_SIZE) return matched;

    const matchedIds = new Set(matched.map((j) => j.id));
    // Same block check getJobsForWorkerFeed applies — the padding fallback must
    // never reintroduce a job whose employer the worker (or who) has blocked.
    const extras = jobs.filter(
      (j) => j.status === 'open' && !matchedIds.has(j.id) && !isBlocked(currentUserId, j.employerId)
    );
    return [...matched, ...extras].slice(0, Math.max(MIN_DEMO_FEED_SIZE, matched.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, getJobsForWorkerFeed, jobs]);

  // The trade + woman-preferred filters narrow what's actually scrollable —
  // every index/scroll calculation below operates on this list, not the
  // unfiltered one.
  const visibleJobs = useMemo(() => {
    let list = tradeFilter === 'all' ? availableJobs : availableJobs.filter((j) => j.trade === tradeFilter);
    if (womanPreferredOnly) list = list.filter((j) => j.preferWomanWorker);
    return list;
  }, [availableJobs, tradeFilter, womanPreferredOnly]);

  const tradeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    availableJobs.forEach((j) => {
      counts[j.trade] = (counts[j.trade] || 0) + 1;
    });
    return counts;
  }, [availableJobs]);

  const skipTargetJob = visibleJobs.find((j) => j.id === skipTargetJobId) || null;

  // Changing the filter swaps the whole scrollable list out from under the
  // viewport, so snap position must reset to the top rather than drift.
  useEffect(() => {
    setActiveIndex(0);
    const container = scrollRef.current;
    if (container) container.scrollTo({ top: 0 });
  }, [tradeFilter, womanPreferredOnly]);

  // The scroll container reserves bottom padding to clear the fixed BottomNav (see
  // the `pb-16` below), so each snap card renders slightly shorter than the
  // container's own clientHeight. Reading the first card's real rendered height
  // keeps the index math exact instead of drifting by that 64px every item.
  const getItemHeight = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return 0;
    const firstItem = container.firstElementChild as HTMLElement | null;
    return firstItem?.clientHeight || container.clientHeight;
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      const itemHeight = getItemHeight();
      if (!container || !itemHeight) return;
      container.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
    },
    [getItemHeight]
  );

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      const itemHeight = getItemHeight();
      if (!itemHeight) return;
      const index = Math.round(container.scrollTop / itemHeight);
      setActiveIndex((prev) => (prev === index ? prev : index));
    });
  }, [getItemHeight]);

  const handleSkipClick = (jobId: string) => {
    setSkipTargetJobId(jobId);
  };

  const handleSkipReasonSelect = (reasonId: string) => {
    console.log('[Chowk Feed] Worker skipped job', skipTargetJobId, 'Reason:', reasonId);
    const skippedIndex = visibleJobs.findIndex((j) => j.id === skipTargetJobId);
    setSkipTargetJobId(null);
    if (skippedIndex !== -1) {
      scrollToIndex(skippedIndex + 1);
    }
  };

  const handleInterestedClick = (job: Job) => {
    setSelectedJobForQuote(job);
  };

  const handleQuoteSubmitted = () => {
    const quotedIndex = visibleJobs.findIndex((j) => j.id === selectedJobForQuote?.id);
    refreshJobs();
    if (quotedIndex !== -1) {
      scrollToIndex(quotedIndex + 1);
    }
  };

  const handleResetFeed = () => {
    scrollToIndex(0);
    refreshJobs();
  };

  return (
    <div className="relative w-full max-w-md mx-auto h-[100dvh] flex flex-col bg-[#111B21] overflow-hidden select-none">
      <TopBar title={t('workerJobs.reelFeed')} />

      {/* Trade filter — scrollable chip row, in normal flow so the scroll viewport
          below shrinks to fit it automatically (no overlap math needed). */}
      <div className="shrink-0 bg-primary border-b border-[#064e46] px-3 py-2 overflow-x-auto flex items-center gap-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        <Chip
          size="sm"
          label={`${t('workerJobs.allTrades')} (${availableJobs.length})`}
          icon={<LayoutGrid className="w-3.5 h-3.5" />}
          selected={tradeFilter === 'all'}
          onClick={() => setTradeFilter('all')}
          className={tradeFilter === 'all' ? '' : 'bg-white/10 text-white border-white/20'}
        />
        {AVAILABLE_TRADES.filter((trade) => tradeCounts[trade.id]).map((trade) => (
          <Chip
            key={trade.id}
            size="sm"
            label={`${language === 'hi' ? trade.labelHi : trade.labelEn} (${tradeCounts[trade.id]})`}
            icon={FILTER_TRADE_ICONS[trade.id]}
            selected={tradeFilter === trade.id}
            onClick={() => setTradeFilter(trade.id)}
            className={tradeFilter === trade.id ? '' : 'bg-white/10 text-white border-white/20'}
          />
        ))}
        {availableJobs.some((j) => j.preferWomanWorker) && (
          <Chip
            size="sm"
            label={t('workerJobs.womanPreferred')}
            icon={<UserRound className="w-3.5 h-3.5" />}
            selected={womanPreferredOnly}
            onClick={() => setWomanPreferredOnly((prev) => !prev)}
            className={womanPreferredOnly ? '' : 'bg-white/10 text-white border-white/20'}
          />
        )}
      </div>

      {/* Scrollable, snap-to-card reel viewport — swipe/scroll to move between jobs,
          exactly like a short-video feed. Each job is one full-height snap point. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        // pb-16 (64px) reserves the exact height of the fixed BottomNav below, so a
        // card's own bottom action buttons land just above it instead of being
        // clipped underneath it.
        className="relative flex-1 w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-16 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {visibleJobs.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-surface-canvas">
            <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4">
              <RotateCcw className="w-8 h-8" />
            </div>
            <h2 className="text-headline-sm font-bold text-on-surface mb-2">
              {tradeFilter === 'all' ? t('workerJobs.noMoreJobs') : t('workerJobs.noJobsForTrade')}
            </h2>
            <p className="text-body-md text-text-secondary max-w-xs mb-6">
              {t('workerJobs.checkBackLater')}
            </p>
            {tradeFilter !== 'all' && (
              <Button variant="secondary" onClick={() => setTradeFilter('all')}>
                {t('workerJobs.allTrades')}
              </Button>
            )}
          </div>
        ) : (
          <>
            {visibleJobs.map((job, index) => (
              <div key={job.id} className="w-full h-full snap-start snap-always">
                <JobReelCard
                  job={job}
                  isActive={index === activeIndex}
                  onSkip={() => handleSkipClick(job.id)}
                  onInterested={() => handleInterestedClick(job)}
                  showSwipeHint={index === 0 && activeIndex === 0 && visibleJobs.length > 1}
                  onEmployerBlocked={refreshJobs}
                />
              </div>
            ))}

            {/* End-of-feed card — reached by scrolling past the last job, same as any reel app */}
            <div className="w-full h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-surface-canvas">
              <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h2 className="text-headline-sm font-bold text-on-surface mb-2">
                {t('workerJobs.noMoreJobs')}
              </h2>
              <p className="text-body-md text-text-secondary max-w-xs mb-6">
                {t('workerJobs.checkBackLater')}
              </p>
              <Button variant="secondary" onClick={handleResetFeed}>
                {t('common.browseAgain')}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Skip Reason Overlay Chips (One-tap selection, no typing required) */}
      {skipTargetJob && (
        <div className="absolute inset-x-0 bottom-20 z-30 p-4 bg-gradient-to-t from-black/95 to-transparent flex flex-col items-center gap-2.5">
          <div className="text-body-sm font-bold text-white bg-black/60 px-3 py-1 rounded-pill backdrop-blur-md">
            {t('workerJobs.skipWhy')}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SKIP_REASONS.map((reason) => (
              <Chip
                key={reason.id}
                label={language === 'hi' ? reason.labelHi : reason.labelEn}
                icon={REASON_ICONS[reason.id]}
                onClick={() => handleSkipReasonSelect(reason.id)}
                className="bg-white/95 text-on-surface hover:bg-white active:scale-95 shadow-md"
              />
            ))}
            <button
              type="button"
              onClick={() => setSkipTargetJobId(null)}
              className="text-white/80 text-xs px-2 py-1 underline"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      <QuoteSheet
        job={selectedJobForQuote}
        isOpen={!!selectedJobForQuote}
        onClose={() => setSelectedJobForQuote(null)}
        onQuoteSubmitted={handleQuoteSubmitted}
      />

      <BottomNav />
    </div>
  );
};
