import React, { useState } from 'react';
import { Job } from '../../../data/types';
import { formatCurrency } from '../../../utils/currency';
import { formatDistance } from '../../../utils/distance';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Button } from '../../../design-system/components/Button';
import { ReportBlockMenu } from '../../../design-system/components/ReportBlockMenu';
import { AVAILABLE_TRADES } from '../../../config/constants';
import {
  MapPin,
  Clock,
  Banknote,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  BrickWall,
  HardHat,
  ShieldCheck,
  ThumbsUp,
  XCircle,
  Video,
  Images,
  ChevronLeft,
  ChevronRight,
  ChevronsDown,
} from 'lucide-react';

const TRADE_ICONS: Record<string, React.ReactNode> = {
  plumber: <Wrench className="w-full h-full" strokeWidth={1.25} />,
  electrician: <Zap className="w-full h-full" strokeWidth={1.25} />,
  carpenter: <Hammer className="w-full h-full" strokeWidth={1.25} />,
  painter: <Paintbrush className="w-full h-full" strokeWidth={1.25} />,
  mason: <BrickWall className="w-full h-full" strokeWidth={1.25} />,
  labourer: <HardHat className="w-full h-full" strokeWidth={1.25} />,
};

const TRADE_ICONS_SM: Record<string, React.ReactNode> = {
  plumber: <Wrench className="w-4 h-4" />,
  electrician: <Zap className="w-4 h-4" />,
  carpenter: <Hammer className="w-4 h-4" />,
  painter: <Paintbrush className="w-4 h-4" />,
  mason: <BrickWall className="w-4 h-4" />,
  labourer: <HardHat className="w-4 h-4" />,
};

// Deterministic, network-free "video" backdrop per trade — two design-token colors
// blended so every card still reads as the same teal/green system, never a blank
// black frame if a real clip isn't available yet (mock data has no real video files).
const TRADE_GRADIENTS: Record<string, string> = {
  plumber: 'from-[#0B4A6F] via-[#075E54] to-[#0B2B26]',
  electrician: 'from-[#5C4200] via-[#8C6D1F] to-[#1A1300]',
  carpenter: 'from-[#4A2E14] via-[#6B4423] to-[#1C1008]',
  painter: 'from-[#5A1540] via-[#8C2F63] to-[#1F0A17]',
  mason: 'from-[#2E3A40] via-[#4A5A60] to-[#10161A]',
  labourer: 'from-[#14532D] via-[#128C7E] to-[#0B2B26]',
};

export interface JobReelCardProps {
  job: Job;
  isActive: boolean;
  onSkip: () => void;
  onInterested: () => void;
  /** First-card-only "swipe for more" nudge. Anchored inside this card so it can
   *  never collide with the top badges or bottom info block regardless of how
   *  those wrap in a given language/screen width. */
  showSwipeHint?: boolean;
  /** Called after the worker blocks this job's employer, so the feed can drop it. */
  onEmployerBlocked?: () => void;
}

export const JobReelCard: React.FC<JobReelCardProps> = ({
  job,
  isActive,
  onSkip,
  onInterested,
  showSwipeHint = false,
  onEmployerBlocked,
}) => {
  const { t, language } = useLanguage();
  const tradeMeta = AVAILABLE_TRADES.find((trade) => trade.id === job.trade);
  const tradeLabel = tradeMeta ? (language === 'hi' ? tradeMeta.labelHi : tradeMeta.labelEn) : job.trade;

  const isCarousel = job.mediaType === 'carousel' && !!job.images?.length;
  const images = job.images || [];
  const [photoIndex, setPhotoIndex] = useState(0);
  const safePhotoIndex = Math.min(photoIndex, Math.max(images.length - 1, 0));

  const goToPhoto = (e: React.MouseEvent, direction: 1 | -1) => {
    e.stopPropagation();
    setPhotoIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  const paymentTimingLabel =
    job.paymentTiming === 'same_day'
      ? t('common.sameDay')
      : job.paymentTiming === 'on_completion'
      ? t('common.onCompletion')
      : t('common.daily');

  const urgencyLabel =
    job.urgency === 'today'
      ? `${t('common.today')}${job.timeSlot ? ` • ${job.timeSlot}` : ''}`
      : job.urgency === 'tomorrow'
      ? `${t('common.tomorrow')}${job.timeSlot ? ` • ${job.timeSlot}` : ''}`
      : `${t('common.scheduled')} (${job.scheduledFor || ''})`;

  const gradient = TRADE_GRADIENTS[job.trade] || TRADE_GRADIENTS.labourer;

  return (
    <div className="relative w-full h-full bg-[#111B21] text-white flex flex-col overflow-hidden select-none">
      {/* Backdrop — stands in for the job video/photos, zero network dependency */}
      <div
        className={`absolute inset-0 z-0 bg-gradient-to-br ${gradient} transition-opacity duration-150`}
        key={isCarousel ? `photo-${safePhotoIndex}` : 'video'}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-40 h-40 text-white/10 ${isActive && !isCarousel ? 'animate-pulse' : ''}`}
            style={isCarousel ? { transform: `scale(${1 + safePhotoIndex * 0.06}) rotate(${safePhotoIndex * 4}deg)` } : undefined}
            aria-hidden="true"
          >
            {TRADE_ICONS[job.trade] || TRADE_ICONS.labourer}
          </div>
        </div>
        {/* Scrim so every overlaid label stays readable in bright sunlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#111B21]/70 via-transparent to-[#111B21]/95" />
      </div>

      {/* Carousel side tap targets — absolutely centered on the edges only, so they
          never compete with the top-stack's vertical space below. */}
      {isCarousel && images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => goToPhoto(e, -1)}
            aria-label={t('workerJobs.previousPhoto')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => goToPhoto(e, 1)}
            aria-label={t('workerJobs.nextPhoto')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Top stack — badges, carousel dots, and the swipe hint all live in ONE
          normal-flow flex column, so each pushes the next one down instead of
          floating independently and risking an overlap when text wraps. */}
      <div className="relative z-10 flex flex-col gap-2 p-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill bg-primary text-white font-bold text-label-md shadow-md border border-white/20">
              {TRADE_ICONS_SM[job.trade] || <Wrench className="w-4 h-4" />}
              <span>{tradeLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-pill bg-black/50 backdrop-blur-md text-white font-semibold text-label-md border border-white/10 tabular-nums">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span>{formatDistance(job.location.distanceKmFromViewer)}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-pill bg-black/50 backdrop-blur-md text-white/80 font-semibold text-[11px] border border-white/10 tabular-nums">
              {isCarousel ? (
                <>
                  <Images className="w-3.5 h-3.5" />
                  {t('workerJobs.photoCount', { current: safePhotoIndex + 1, total: images.length })}
                </>
              ) : (
                <>
                  <Video className="w-3.5 h-3.5" />
                  {t('workerJobs.demoReel')}
                </>
              )}
            </span>
            <ReportBlockMenu
              targetUserId={job.employerId}
              context="job"
              contextId={job.id}
              variant="dark"
              onBlocked={onEmployerBlocked}
            />
          </div>
        </div>

        {/* Carousel position dots — second row of the same in-flow stack, so it
            always sits directly under the badges, never on top of them. */}
        {isCarousel && images.length > 1 && (
          <div className="flex items-center justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-pill transition-all ${
                  i === safePhotoIndex ? 'w-5 bg-accent' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

        {/* Swipe hint — third row of the same stack, first card only */}
        {showSwipeHint && (
          <div className="flex justify-center pointer-events-none">
            <div className="flex items-center gap-1 px-3 py-1 rounded-pill bg-black/40 backdrop-blur-md text-white/80 text-[11px] font-semibold animate-bounce">
              <ChevronsDown className="w-3.5 h-3.5" />
              {t('workerJobs.swipeHint')}
            </div>
          </div>
        )}
      </div>

      {/* Bottom overlay — info stacked directly above the action buttons in ONE flex
          column so they can never overlap each other regardless of text length. */}
      <div className="relative z-10 mt-auto flex flex-col gap-3 p-4 pt-10 bg-gradient-to-t from-[#111B21] via-[#111B21]/90 to-transparent">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-baseline gap-2 flex-wrap">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold tracking-wide uppercase text-white/70">
                {t('workerJobs.suggestedPay')}
              </span>
              <span className="text-3xl font-extrabold text-accent tabular-nums tracking-tight">
                {formatCurrency(job.suggestedPrice)}
              </span>
            </div>
            <span className="text-body-sm text-white/80">({t('workerJobs.anchorNote')})</span>
          </div>

          <p className="text-body-lg font-semibold text-white line-clamp-2">{job.description}</p>

          <div className="flex items-center gap-2 flex-wrap text-body-sm text-white/90">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>{urgencyLabel}</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-trust-amber" />
              <span>{paymentTimingLabel}</span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-body-sm text-white/85">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>{t('common.noAdvanceNeeded')}</span>
          </div>
        </div>

        {/* Two big bottom action buttons — always directly below the info block, never floating separately */}
        <div className="flex items-center gap-3 pb-1">
          <Button
            type="button"
            variant="destructive"
            onClick={onSkip}
            className="flex-1 bg-white/90 text-danger border-white/50 backdrop-blur-md shadow-md"
            icon={<XCircle className="w-5 h-5 text-danger" />}
          >
            {t('workerJobs.skip')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onInterested}
            className="flex-1 shadow-tier-2"
            icon={<ThumbsUp className="w-5 h-5 text-[#111B21]" />}
          >
            {t('workerJobs.interested')}
          </Button>
        </div>
      </div>
    </div>
  );
};
