import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useJobs } from '../../worker-jobs/state/JobsContext';
import { RatingStars3, RatingLevel } from '../../../design-system/components/RatingStars3';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { Button } from '../../../design-system/components/Button';
import { VoiceButton } from '../../../design-system/components/VoiceButton';
import { submitReview } from '../../../data/repository';
import { getJobDescription } from '../../../utils/localizedJob';
import { CheckCircle2, Camera, Clock, Check, Frown, Meh, Smile } from 'lucide-react';

export const RateJobScreen: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { t, language } = useLanguage();
  const { currentRole, currentUserId } = useMockAuthSession();
  const { getJobById } = useJobs();
  const navigate = useNavigate();

  const job = getJobById(jobId || '');

  const [rating, setRating] = useState<RatingLevel>(3);
  const [paidOnTime, setPaidOnTime] = useState<boolean>(true);
  const [note, setNote] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [voiceNoteRecorded, setVoiceNoteRecorded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    submitReview({
      jobId: job.id,
      fromUserId: currentUserId,
      toUserId: currentRole === 'worker' ? job.employerId : currentUserId,
      rating,
      paidOnTime: currentRole === 'worker' ? paidOnTime : undefined,
      note,
      mediaUrl: hasPhoto
        ? 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&auto=format&fit=crop&q=80'
        : undefined,
    });

    setSubmitted(true);
    setTimeout(() => {
      if (currentRole === 'worker') {
        navigate('/diary');
      } else {
        navigate('/my-jobs');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-surface-canvas pb-24 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={t('rating.title')} showBack onBack={() => navigate(-1)} />

      <main className="p-4 flex-1">
        {submitted ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3 bg-white rounded-card p-6 border border-border-subtle shadow-tier-1">
            <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-headline-sm font-extrabold text-on-surface">
              {t('rating.thankYou')}
            </h2>
            <p className="text-body-md text-text-secondary">
              Redirecting to your updated activity...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="text-center">
              <h1 className="text-headline-sm font-extrabold text-on-surface">
                {currentRole === 'worker' ? t('rating.workerPrompt') : t('rating.employerPrompt')}
              </h1>
              <p className="text-body-sm text-text-secondary mt-1">
                {job ? getJobDescription(job, language) : 'Service job completed'}
              </p>
            </div>

            {/* 3-Level Tappable Tiles (Bad / Okay / Great) */}
            <div className="p-4 bg-white rounded-card border border-border-subtle shadow-tier-1">
              <span className="text-label-md font-bold text-text-secondary block mb-3 text-center">
                Overall Experience
              </span>
              <RatingStars3
                value={rating}
                onChange={setRating}
                labels={{
                  bad: t('rating.bad'),
                  okay: t('rating.okay'),
                  great: t('rating.great'),
                }}
              />
            </div>

            {/* Worker Specific Prompt: "Paid on time?" per §9 Flow G */}
            {currentRole === 'worker' && (
              <div className="p-4 bg-white rounded-card border border-border-subtle shadow-tier-1">
                <span className="text-label-md font-bold text-on-surface block mb-2">
                  {t('rating.paidOnTimeQuestion')}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaidOnTime(true)}
                    className={`p-3.5 rounded-card border-2 flex items-center justify-center gap-2 font-bold text-body-md transition-all ${
                      paidOnTime
                        ? 'border-success bg-success/10 text-success'
                        : 'border-border-subtle bg-white text-text-secondary'
                    }`}
                  >
                    <Check className="w-5 h-5" />
                    <span>Yes, on time</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaidOnTime(false)}
                    className={`p-3.5 rounded-card border-2 flex items-center justify-center gap-2 font-bold text-body-md transition-all ${
                      !paidOnTime
                        ? 'border-danger bg-danger/10 text-danger'
                        : 'border-border-subtle bg-white text-text-secondary'
                    }`}
                  >
                    <span>Delayed / Pending</span>
                  </button>
                </div>
              </div>
            )}

            {/* Optional Photo / Voice note */}
            <div className="p-4 bg-white rounded-card border border-border-subtle shadow-tier-1 flex flex-col gap-3">
              <span className="text-label-md font-bold text-on-surface">Add Proof & Notes</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHasPhoto(!hasPhoto)}
                  className={`flex-1 min-h-[48px] rounded-button border flex items-center justify-center gap-2 text-body-md font-bold transition-all ${
                    hasPhoto
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-border-subtle bg-surface-canvas text-on-surface'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{hasPhoto ? 'Photo Attached ✓' : t('rating.attachPhoto')}</span>
                </button>
              </div>

              <div>
                <VoiceButton
                  onRecordingComplete={() => setVoiceNoteRecorded(true)}
                  label={voiceNoteRecorded ? 'Voice feedback recorded ✓' : 'Add voice comment'}
                />
              </div>

              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('rating.writeNote')}
                className="w-full p-3 rounded-button bg-surface-canvas border border-border-subtle text-body-md text-on-surface"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button type="submit" variant="primary" fullWidth size="lg">
                {t('rating.submit')}
              </Button>
            </div>
          </form>
        )}
      </main>

      <BottomNav />
    </div>
  );
};
