import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../worker-jobs/state/JobsContext';
import { useQuotes } from '../../worker-jobs/state/QuotesContext';
import { useNegotiation } from '../../negotiation/state/NegotiationContext';
import { useProfile } from '../../profile/state/ProfileContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { QuoteCandidateRow } from '../components/QuoteCandidateRow';
import { BottomSheet } from '../../../design-system/components/BottomSheet';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import { formatCurrency } from '../../../utils/currency';
import { getJobDescription } from '../../../utils/localizedJob';
import { isBlocked } from '../../../data/repository';
import { Quote } from '../../../data/types';
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  Lock,
  Calendar,
  CreditCard,
  SlidersHorizontal,
} from 'lucide-react';

export const JobQuotesList: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { t, language } = useLanguage();
  const { currentUserId } = useMockAuthSession();
  const { getJobById, refreshJobs } = useJobs();
  const { getQuotesForJob, declineQuote, refreshQuotes } = useQuotes();
  const { openOrGetThread, lockTerms, getThreadByJobAndWorker } = useNegotiation();
  const { getUser, getProfile } = useProfile();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance'>('price');
  const [selectedQuoteForDirectLock, setSelectedQuoteForDirectLock] = useState<Quote | null>(null);
  const [agreeMethod, setAgreeMethod] = useState<'same_day' | 'on_completion'>('same_day');
  const [agreeTime, setAgreeTime] = useState('Tomorrow 10:00 AM');
  const [isLocking, setIsLocking] = useState(false);
  const [blockVersion, setBlockVersion] = useState(0);

  const job = getJobById(jobId || '');
  const quotes = getQuotesForJob(jobId || '');

  // Filter out declined quotes, and anyone either side has blocked, from the
  // employer's active candidate view. blockVersion forces a re-check right
  // after a block action, since blocks live outside quote/job state.
  const activeQuotes = useMemo(() => {
    return quotes.filter((q) => q.status !== 'declined' && !isBlocked(currentUserId, q.workerId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes, currentUserId, blockVersion]);

  // Sort candidates
  const sortedQuotes = useMemo(() => {
    return [...activeQuotes].sort((a, b) => {
      if (sortBy === 'price') {
        return a.quotedPrice - b.quotedPrice;
      }
      const profA = getProfile(a.workerId);
      const profB = getProfile(b.workerId);
      if (sortBy === 'rating') {
        return (profB?.rating || 0) - (profA?.rating || 0);
      }
      if (sortBy === 'distance') {
        return (profA?.radiusKm || 0) - (profB?.radiusKm || 0);
      }
      return 0;
    });
  }, [activeQuotes, sortBy, getProfile]);

  if (!job) {
    return (
      <div className="min-h-screen bg-surface-canvas p-4 text-center">
        <p className="text-body-lg text-text-secondary">Job not found.</p>
        <Button variant="secondary" onClick={() => navigate('/my-jobs')} className="mt-4">
          Back to my jobs
        </Button>
      </div>
    );
  }

  // Handle Actions: Select, Negotiate, Decline
  const handleSelectDirectLock = (quote: Quote) => {
    setSelectedQuoteForDirectLock(quote);
  };

  const handleConfirmDirectLock = () => {
    if (!selectedQuoteForDirectLock) return;
    setIsLocking(true);

    const thread = openOrGetThread(
      job.id,
      selectedQuoteForDirectLock.workerId,
      currentUserId,
      selectedQuoteForDirectLock.quotedPrice
    );

    setTimeout(() => {
      lockTerms(thread.id, {
        price: selectedQuoteForDirectLock.quotedPrice,
        time: agreeTime,
        paymentMethod: agreeMethod,
      });

      refreshJobs();
      refreshQuotes();
      setIsLocking(false);
      setSelectedQuoteForDirectLock(null);
      navigate(`/job-execution/${job.id}`);
    }, 400);
  };

  const handleNegotiate = (quote: Quote) => {
    const thread = openOrGetThread(
      job.id,
      quote.workerId,
      currentUserId,
      quote.quotedPrice
    );
    navigate(`/negotiation/${thread.id}`);
  };

  const handleDecline = (quote: Quote) => {
    declineQuote(quote.id);
    refreshQuotes();
  };

  return (
    <div className="min-h-screen bg-surface-canvas pb-24 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={t('employerJobs.quotesReceived')} showBack onBack={() => navigate('/my-jobs')} />

      <main className="p-4 flex-1">
        {/* Job Summary Banner */}
        <div className="p-3.5 rounded-card bg-surface-card border border-border-subtle shadow-tier-1 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs uppercase font-extrabold text-primary tracking-wide">
              {job.trade}
            </span>
            <span className="text-xs font-semibold text-text-secondary">
              Suggested: {formatCurrency(job.suggestedPrice)}
            </span>
          </div>
          <h2 className="text-body-md font-bold text-on-surface line-clamp-2">{getJobDescription(job, language)}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              type={job.status === 'filled' ? 'confirmed' : 'pending'}
              label={job.status === 'filled' ? 'Filled • Hire locked' : 'Open for quotes'}
            />
            <span className="text-xs text-text-secondary">{activeQuotes.length} active quotes</span>
          </div>
        </div>

        {/* Private Quotes Notice */}
        <div className="p-2.5 rounded-card bg-secondary/10 border border-secondary/20 flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-secondary shrink-0" />
          <p className="text-xs text-secondary font-medium">{t('employerJobs.parallelNotice')}</p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-body-sm text-text-secondary font-semibold flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {t('employerJobs.sortBy')}:
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setSortBy('price')}
              className={`px-2.5 py-1 rounded-pill text-xs font-bold transition-all ${
                sortBy === 'price'
                  ? 'bg-secondary text-white'
                  : 'bg-white text-on-surface border border-border-subtle'
              }`}
            >
              {t('employerJobs.sortPrice')}
            </button>
            <button
              type="button"
              onClick={() => setSortBy('rating')}
              className={`px-2.5 py-1 rounded-pill text-xs font-bold transition-all ${
                sortBy === 'rating'
                  ? 'bg-secondary text-white'
                  : 'bg-white text-on-surface border border-border-subtle'
              }`}
            >
              {t('employerJobs.sortRating')}
            </button>
            <button
              type="button"
              onClick={() => setSortBy('distance')}
              className={`px-2.5 py-1 rounded-pill text-xs font-bold transition-all ${
                sortBy === 'distance'
                  ? 'bg-secondary text-white'
                  : 'bg-white text-on-surface border border-border-subtle'
              }`}
            >
              {t('employerJobs.sortDistance')}
            </button>
          </div>
        </div>

        {/* Candidate List */}
        {sortedQuotes.length > 0 ? (
          <div className="flex flex-col gap-3">
            {sortedQuotes.map((quote) => {
              const worker = getUser(quote.workerId);
              const profile = getProfile(quote.workerId);
              return (
                <QuoteCandidateRow
                  key={quote.id}
                  quote={quote}
                  worker={worker}
                  profile={profile}
                  onSelect={() => handleSelectDirectLock(quote)}
                  onNegotiate={() => handleNegotiate(quote)}
                  onDecline={() => handleDecline(quote)}
                  onBlocked={() => setBlockVersion((v) => v + 1)}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-card border border-border-subtle">
            <p className="text-body-md text-text-secondary font-medium">
              {t('employerJobs.noQuotesYet')}
            </p>
          </div>
        )}
      </main>

      {/* Direct Lock Confirmation Sheet */}
      {selectedQuoteForDirectLock && (
        <BottomSheet
          isOpen={!!selectedQuoteForDirectLock}
          onClose={() => setSelectedQuoteForDirectLock(null)}
          title="Confirm & Lock Hire"
        >
          <div className="flex flex-col gap-4">
            <div className="p-3 rounded-card bg-primary/10 border border-primary/20">
              <span className="text-xs uppercase font-extrabold text-primary">Pre-filled terms</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-body-md text-text-secondary">Agreed worker quote:</span>
                <span className="text-headline-md font-extrabold text-accent tabular-nums">
                  {formatCurrency(selectedQuoteForDirectLock.quotedPrice)}
                </span>
              </div>
            </div>

            <div>
              <label className="text-label-md font-bold text-on-surface block mb-1">
                Arrival timing
              </label>
              <input
                type="text"
                value={agreeTime}
                onChange={(e) => setAgreeTime(e.target.value)}
                className="w-full min-h-[50px] px-3 rounded-button bg-surface-canvas border border-border-subtle text-body-md font-semibold text-on-surface"
              />
            </div>

            <div>
              <label className="text-label-md font-bold text-on-surface block mb-1">
                Payment timing
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAgreeMethod('same_day')}
                  className={`p-2.5 rounded-button text-xs font-bold border transition-all ${
                    agreeMethod === 'same_day'
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-border-subtle bg-white text-on-surface'
                  }`}
                >
                  Same day cash/UPI
                </button>
                <button
                  type="button"
                  onClick={() => setAgreeMethod('on_completion')}
                  className={`p-2.5 rounded-button text-xs font-bold border transition-all ${
                    agreeMethod === 'on_completion'
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-border-subtle bg-white text-on-surface'
                  }`}
                >
                  On completion
                </button>
              </div>
            </div>

            <p className="text-xs text-text-secondary">
              Locking will mark this job filled. Other open candidate quotes will be closed
              neutrally.
            </p>

            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                loading={isLocking}
                onClick={handleConfirmDirectLock}
                icon={<Lock className="w-5 h-5 text-[#111B21]" />}
              >
                Confirm & Lock Hire
              </Button>
            </div>
          </div>
        </BottomSheet>
      )}

      <BottomNav />
    </div>
  );
};
