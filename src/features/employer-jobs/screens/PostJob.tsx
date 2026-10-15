import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../worker-jobs/state/JobsContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { Button } from '../../../design-system/components/Button';
import { Chip } from '../../../design-system/components/Chip';
import {
  AVAILABLE_TRADES,
  URGENCY_OPTIONS,
  TIME_SLOT_OPTIONS,
  PAYMENT_TIMING_OPTIONS,
  CONTENT_GUIDELINES,
} from '../../../config/constants';
import {
  Video,
  CheckCircle2,
  MapPin,
  Clock,
  Banknote,
  Send,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  BrickWall,
  HardHat,
  Camera,
  Images,
  Plus,
  X,
  Music2,
  Timer,
} from 'lucide-react';

const GUIDELINE_ICONS: Record<string, React.ReactNode> = {
  show_work: <Camera className="w-3.5 h-3.5" />,
  no_music: <Music2 className="w-3.5 h-3.5" />,
  keep_short: <Timer className="w-3.5 h-3.5" />,
};

const TRADE_ICONS: Record<string, React.ReactNode> = {
  plumber: <Wrench className="w-5 h-5" />,
  electrician: <Zap className="w-5 h-5" />,
  carpenter: <Hammer className="w-5 h-5" />,
  painter: <Paintbrush className="w-5 h-5" />,
  mason: <BrickWall className="w-5 h-5" />,
  labourer: <HardHat className="w-5 h-5" />,
};

const AVAILABLE_PHOTO_PRESETS = [
  '/images/job-plumbing-1.jpeg',
  '/images/job-plumbing-2.jpeg',
  '/images/job-paint-1.jpeg',
  '/images/job-paint-2.jpeg',
];

export const PostJob: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUserId } = useMockAuthSession();
  const { postJob } = useJobs();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [mediaType, setMediaType] = useState<'video' | 'carousel'>('video');
  const [hasVideo, setHasVideo] = useState(true);
  const MAX_PHOTOS = 6;
  const [photos, setPhotos] = useState<string[]>([
    '/images/job-plumbing-1.jpeg',
    '/images/job-plumbing-2.jpeg',
  ]);
  const [selectedTrade, setSelectedTrade] = useState('plumber');
  const [description, setDescription] = useState(
    'Bathroom pipe joint leaking behind tiles. Need quick inspection and repair.'
  );
  const [urgency, setUrgency] = useState<'today' | 'tomorrow' | 'scheduled'>('today');
  const [timeSlot, setTimeSlot] = useState('Morning (8 AM - 12 PM)');
  const [scheduledDate, setScheduledDate] = useState('2026-10-18');
  const [locationLabel, setLocationLabel] = useState('Greater Kailash 1, New Delhi');
  const [suggestedPrice, setSuggestedPrice] = useState<number>(550);
  const [paymentTiming, setPaymentTiming] = useState<'same_day' | 'on_completion' | 'daily'>(
    'same_day'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [preferWomanWorker, setPreferWomanWorker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mediaType === 'video' && !hasVideo) {
      setMediaError(t('employerJobs.mediaRequiredVideo'));
      return;
    }
    if (mediaType === 'carousel' && photos.length === 0) {
      setMediaError(t('employerJobs.mediaRequiredPhotos'));
      return;
    }
    setMediaError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      postJob({
        employerId: currentUserId,
        trade: selectedTrade,
        mediaType,
        ...(mediaType === 'carousel' ? { images: photos } : {}),
        description,
        suggestedPrice: suggestedPrice || 500,
        location: {
          label: locationLabel,
          lat: 28.5524,
          lng: 77.2372,
          distanceKmFromViewer: 1.2,
        },
        urgency,
        timeSlot: urgency === 'scheduled' ? undefined : timeSlot,
        scheduledFor: urgency === 'scheduled' ? scheduledDate : undefined,
        paymentTiming,
        preferWomanWorker,
      });

      setIsSubmitting(false);
      navigate('/my-jobs');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-surface-canvas pb-28 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={t('employerJobs.postJob')} />

      <main className="p-4 flex-1">
        <div className="mb-4">
          <h1 className="text-headline-sm font-extrabold text-on-surface">
            {t('employerJobs.newJobTitle')}
          </h1>
          <p className="text-body-sm text-text-secondary">
            {t('employerJobs.videoHelp')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* 1. Media Attachment — a short video OR a photo carousel of the work needed,
              so workers can see what they'd be getting into before they quote. */}
          <div className="flex flex-col gap-2">
            <label className="text-label-lg font-bold text-on-surface">
              {t('employerJobs.showTheWork')}
            </label>
            <p className="text-body-sm text-text-secondary -mt-1">{t('employerJobs.mediaHelp')}</p>

            {/* Content guidelines — a reminder, not an enforced check, shown before
                recording so a post is more likely to actually show the work. */}
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_GUIDELINES.map((guideline) => (
                <span
                  key={guideline.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-secondary/10 text-secondary text-[11px] font-bold"
                >
                  {GUIDELINE_ICONS[guideline.id]}
                  {language === 'hi' ? guideline.labelHi : guideline.labelEn}
                </span>
              ))}
            </div>

            {/* Mode switcher: Record video / Add photos */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMediaType('video');
                  setMediaError(null);
                }}
                className={`min-h-[48px] rounded-button border-[1.5px] flex items-center justify-center gap-2 font-bold text-body-sm transition-all active:scale-[0.98] ${
                  mediaType === 'video'
                    ? 'border-secondary bg-secondary/10 text-secondary'
                    : 'border-border-subtle bg-white text-on-surface'
                }`}
              >
                <Video className="w-4 h-4" />
                {t('employerJobs.recordVideo')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaType('carousel');
                  setMediaError(null);
                }}
                className={`min-h-[48px] rounded-button border-[1.5px] flex items-center justify-center gap-2 font-bold text-body-sm transition-all active:scale-[0.98] ${
                  mediaType === 'carousel'
                    ? 'border-secondary bg-secondary/10 text-secondary'
                    : 'border-border-subtle bg-white text-on-surface'
                }`}
              >
                <Images className="w-4 h-4" />
                {t('employerJobs.addPhotos')}
              </button>
            </div>

            {mediaType === 'video' ? (
              <div
                onClick={() => {
                  setHasVideo(!hasVideo);
                  setMediaError(null);
                }}
                className="relative w-full h-36 rounded-card border-2 border-dashed border-secondary/50 bg-secondary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-secondary/10 transition-colors overflow-hidden"
              >
                {hasVideo ? (
                  <div className="flex flex-col items-center text-success gap-1.5 p-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className="text-body-md font-bold text-on-surface">
                      {t('employerJobs.videoAttached')}
                    </span>
                    <span className="text-body-sm text-text-secondary flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5" /> {t('employerJobs.tapToRetake')}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-secondary gap-1 p-4 text-center">
                    <Video className="w-8 h-8" />
                    <span className="text-body-md font-bold">{t('employerJobs.recordVideo')}</span>
                    <span className="text-body-sm text-text-secondary">{t('employerJobs.videoLengthHint')}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const dataUrl = event.target?.result as string;
                      if (dataUrl) {
                        setPhotos((prev) => [...prev, dataUrl]);
                        setMediaError(null);
                      }
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, i) => (
                    <div
                      key={`${photo}-${i}`}
                      className="relative aspect-square rounded-card bg-secondary/10 border-[1.5px] border-secondary/30 overflow-hidden flex flex-col items-center justify-center gap-1 text-secondary"
                    >
                      {photo.startsWith('/') || photo.startsWith('data:') || photo.startsWith('http') ? (
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Images className="w-6 h-6" />
                          <span className="text-[11px] font-bold">{i + 1}</span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                        aria-label={t('employerJobs.removePhoto')}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center shadow-md active:scale-90"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextPreset = AVAILABLE_PHOTO_PRESETS.find((p) => !photos.includes(p));
                        if (nextPreset) {
                          setPhotos((prev) => [...prev, nextPreset]);
                          setMediaError(null);
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      className="aspect-square rounded-card border-2 border-dashed border-secondary/50 bg-secondary/5 flex flex-col items-center justify-center gap-1 text-secondary hover:bg-secondary/10 active:scale-[0.98]"
                    >
                      <Plus className="w-6 h-6" />
                      <span className="text-[11px] font-bold">{t('employerJobs.addPhoto')}</span>
                    </button>
                  )}
                </div>
                <span className="text-body-sm text-text-secondary">
                  {t('employerJobs.photosCountHint', { count: photos.length, max: MAX_PHOTOS })}
                </span>
              </div>
            )}

            {mediaError && (
              <p className="text-body-sm text-danger font-semibold">{mediaError}</p>
            )}
          </div>

          {/* 2. Trade Selector (Tap trade icon tile) */}
          <div>
            <label className="text-label-lg font-bold text-on-surface block mb-2">
              {t('employerJobs.selectTrade')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_TRADES.map((trade) => {
                const isSelected = selectedTrade === trade.id;
                return (
                  <button
                    key={trade.id}
                    type="button"
                    onClick={() => setSelectedTrade(trade.id)}
                    className={`p-3 rounded-card border-[1.5px] flex flex-col items-center gap-1.5 transition-all active:scale-95 min-h-[76px] ${
                      isSelected
                        ? 'border-secondary bg-white text-secondary shadow-sm ring-2 ring-secondary/20'
                        : 'border-border-subtle bg-white text-on-surface hover:border-secondary/40'
                    }`}
                  >
                    <span>{TRADE_ICONS[trade.id]}</span>
                    <span className="text-label-md font-bold truncate max-w-[80px]">
                      {language === 'hi' ? trade.labelHi : trade.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Problem description */}
          <div>
            <label className="text-label-lg font-bold text-on-surface block mb-1">
              Short description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-card bg-white border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-md text-on-surface"
              placeholder="Describe the problem..."
              required
            />
          </div>

          {/* 3. Urgency Picker with time-slot chooser */}
          <div>
            <label className="text-label-lg font-bold text-on-surface block mb-2">
              {t('employerJobs.urgency')}
            </label>
            <div className="flex gap-2">
              {URGENCY_OPTIONS.map((urg) => (
                <Chip
                  key={urg.id}
                  label={language === 'hi' ? urg.labelHi : urg.labelEn}
                  selected={urgency === urg.id}
                  onClick={() => setUrgency(urg.id as any)}
                />
              ))}
            </div>

            {/* Time Slot Chooser (for Today / Tomorrow) */}
            {urgency !== 'scheduled' ? (
              <div className="mt-3">
                <span className="text-body-sm text-text-secondary block mb-1.5">
                  {t('employerJobs.timeSlot')}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOT_OPTIONS.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setTimeSlot(language === 'hi' ? slot.labelHi : slot.labelEn)}
                      className={`p-2.5 rounded-button text-xs font-bold border transition-all text-left ${
                        timeSlot === (language === 'hi' ? slot.labelHi : slot.labelEn)
                          ? 'border-secondary bg-secondary/10 text-secondary'
                          : 'border-border-subtle bg-white text-on-surface'
                      }`}
                    >
                      {language === 'hi' ? slot.labelHi : slot.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <span className="text-body-sm text-text-secondary block mb-1">Select date</span>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full min-h-[50px] px-3 rounded-button bg-white border border-border-subtle text-body-md font-semibold text-on-surface"
                />
              </div>
            )}
          </div>

          {/* 4. Location (Confirm auto-detected location, editable) */}
          <div>
            <label className="text-label-lg font-bold text-on-surface block mb-1">
              {t('employerJobs.location')}
            </label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3.5 w-5 h-5 text-secondary shrink-0" />
              <input
                type="text"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="w-full min-h-[54px] pl-11 pr-4 rounded-button bg-white border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-md text-on-surface font-semibold"
                placeholder="Greater Kailash, New Delhi"
                required
              />
            </div>
            <span className="text-xs text-text-secondary mt-1 block">
              Auto-detected from GPS • Tap to edit address
            </span>
          </div>

          {/* 5. Suggested price (Optional, numeric input with hint) */}
          <div>
            <label className="text-label-lg font-bold text-on-surface block mb-1">
              {t('employerJobs.suggestedPrice')}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-headline-sm font-bold text-text-secondary">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="50"
                value={suggestedPrice}
                onChange={(e) => setSuggestedPrice(Number(e.target.value))}
                className="w-full min-h-[54px] pl-9 pr-4 rounded-button bg-white border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-headline-sm font-bold text-on-surface tabular-nums"
                placeholder="500"
              />
            </div>
            <p className="text-xs text-text-secondary mt-1">{t('employerJobs.priceHint')}</p>
          </div>

          {/* 6. Payment timing */}
          <div>
            <label className="text-label-lg font-bold text-on-surface block mb-2">
              {t('employerJobs.paymentTiming')}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PAYMENT_TIMING_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentTiming(opt.id as any)}
                  className={`p-3 rounded-button border text-left flex items-center justify-between transition-all ${
                    paymentTiming === opt.id
                      ? 'border-secondary bg-secondary/10 text-secondary font-bold'
                      : 'border-border-subtle bg-white text-on-surface'
                  }`}
                >
                  <span className="text-body-md">
                    {language === 'hi' ? opt.labelHi : opt.labelEn}
                  </span>
                  {paymentTiming === opt.id && <CheckCircle2 className="w-5 h-5 text-secondary" />}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Woman worker preference (optional, informational — surfaced as a
              feed filter for interested workers, never used to exclude anyone) */}
          <button
            type="button"
            onClick={() => setPreferWomanWorker((prev) => !prev)}
            className={`p-3.5 rounded-button border-[1.5px] flex items-center justify-between text-left transition-all ${
              preferWomanWorker
                ? 'border-secondary bg-secondary/10'
                : 'border-border-subtle bg-white'
            }`}
          >
            <div>
              <span className="text-body-md font-bold text-on-surface block">
                {t('employerJobs.preferWoman')}
              </span>
              <span className="text-body-sm text-text-secondary">{t('employerJobs.preferWomanHelp')}</span>
            </div>
            {preferWomanWorker && <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />}
          </button>

          {/* Post Job Button (56px+ height pinned to bottom) */}
          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={isSubmitting}
              icon={<Send className="w-5 h-5 text-[#111B21]" />}
            >
              {t('employerJobs.submitPost')}
            </Button>
          </div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};
