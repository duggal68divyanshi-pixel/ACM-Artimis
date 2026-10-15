import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuotes } from '../state/QuotesContext';
import { useJobs } from '../state/JobsContext';
import { useNegotiation } from '../../negotiation/state/NegotiationContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { QuoteStatusRow } from '../components/QuoteStatusRow';
import { BottomSheet } from '../../../design-system/components/BottomSheet';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import { formatCurrency } from '../../../utils/currency';
import { Quote, Job, NegotiationThread } from '../../../data/types';
import {
  FileText,
  PhoneCall,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
} from 'lucide-react';

export const MyQuotes: React.FC = () => {
  const { t } = useLanguage();
  const { currentUserId } = useMockAuthSession();
  const { getQuotesForWorker } = useQuotes();
  const { getJobById } = useJobs();
  const { getThreadByJobAndWorker } = useNegotiation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'negotiating' | 'confirmed'>('all');
  const [selectedConfirmedQuote, setSelectedConfirmedQuote] = useState<{
    quote: Quote;
    job: Job;
    thread?: NegotiationThread;
  } | null>(null);
  const [showCallToast, setShowCallToast] = useState(false);

  const workerQuotes = getQuotesForWorker(currentUserId);

  const filteredQuotes = workerQuotes.filter((quote) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'negotiating') return quote.status === 'negotiating' || quote.status === 'pending';
    if (activeTab === 'confirmed') return quote.status === 'accepted';
    return true;
  });

  const handleRowClick = (quote: Quote) => {
    const job = getJobById(quote.jobId);
    if (!job) return;

    if (quote.status === 'accepted') {
      // Show locked terms card
      const thread = getThreadByJobAndWorker(job.id, currentUserId);
      setSelectedConfirmedQuote({ quote, job, thread });
    } else if (quote.status === 'declined') {
      // Neutral notification per §9 Flow D: "This job has been filled" state
      alert(t('quotes.jobFilled'));
    } else {
      // Open negotiation thread
      const thread = getThreadByJobAndWorker(job.id, currentUserId);
      if (thread) {
        navigate(`/negotiation/${thread.id}`);
      } else {
        // Create/open thread with employer
        navigate(`/negotiation/job_${job.id}_worker_${currentUserId}`);
      }
    }
  };

  const handleCallClick = () => {
    setShowCallToast(true);
    setTimeout(() => setShowCallToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-surface-canvas pb-20 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={t('quotes.title')} />

      <main className="p-4 flex-1">
        {/* Header summary */}
        <div className="mb-3">
          <h1 className="text-headline-sm font-extrabold text-on-surface">
            {t('quotes.title')}
          </h1>
          <p className="text-body-sm text-text-secondary">{t('quotes.subtitle')}</p>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-pill text-body-md font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-secondary text-white'
                : 'bg-white text-on-surface border border-border-subtle'
            }`}
          >
            {t('quotes.all')} ({workerQuotes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('negotiating')}
            className={`px-3.5 py-1.5 rounded-pill text-body-md font-semibold transition-all ${
              activeTab === 'negotiating'
                ? 'bg-secondary text-white'
                : 'bg-white text-on-surface border border-border-subtle'
            }`}
          >
            {t('quotes.negotiating')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('confirmed')}
            className={`px-3.5 py-1.5 rounded-pill text-body-md font-semibold transition-all ${
              activeTab === 'confirmed'
                ? 'bg-secondary text-white'
                : 'bg-white text-on-surface border border-border-subtle'
            }`}
          >
            {t('quotes.confirmed')}
          </button>
        </div>

        {/* Quotes List */}
        {filteredQuotes.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {filteredQuotes.map((quote) => {
              const job = getJobById(quote.jobId);
              return (
                <QuoteStatusRow
                  key={quote.id}
                  quote={quote}
                  job={job}
                  onClick={() => handleRowClick(quote)}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center bg-white rounded-card border border-border-subtle">
            <FileText className="w-12 h-12 text-border-strong mb-2" />
            <p className="text-body-md text-text-secondary font-medium">
              {t('quotes.noQuotesYet')}
            </p>
          </div>
        )}
      </main>

      {/* Confirmed Job Locked Terms Modal */}
      {selectedConfirmedQuote && (
        <BottomSheet
          isOpen={!!selectedConfirmedQuote}
          onClose={() => setSelectedConfirmedQuote(null)}
          title={t('quotes.lockedCardTitle')}
        >
          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-card bg-success/10 border border-success/30 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
              <div>
                <h3 className="text-title-md font-bold text-success">
                  {t('quotes.statusConfirmed')}
                </h3>
                <p className="text-body-sm text-text-secondary">
                  Job is officially assigned to you. Price is locked.
                </p>
              </div>
            </div>

            {/* Terms Summary */}
            <div className="p-4 rounded-card bg-surface-canvas border border-border-subtle flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border-subtle/80 pb-2">
                <span className="text-body-md text-text-secondary flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-primary" />
                  {t('quotes.agreedPrice')}
                </span>
                <span className="text-headline-sm font-extrabold text-accent tabular-nums">
                  {formatCurrency(
                    selectedConfirmedQuote.thread?.lockedTerms?.price ||
                      selectedConfirmedQuote.quote.quotedPrice
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-border-subtle/80 pb-2">
                <span className="text-body-md text-text-secondary flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  {t('quotes.scheduledTime')}
                </span>
                <span className="text-body-md font-bold text-on-surface">
                  {selectedConfirmedQuote.thread?.lockedTerms?.time || 'Today'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-body-md text-text-secondary flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  {t('quotes.payoutMethod')}
                </span>
                <span className="text-body-md font-bold text-on-surface capitalize">
                  {selectedConfirmedQuote.thread?.lockedTerms?.paymentMethod ||
                    selectedConfirmedQuote.job.paymentTiming}
                </span>
              </div>
            </div>

            {/* Actions: Call button & View Job Progress */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="secondary"
                fullWidth
                size="lg"
                onClick={handleCallClick}
                icon={<PhoneCall className="w-5 h-5 text-secondary" />}
              >
                {t('quotes.callEmployer')}
              </Button>

              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={() => {
                  const jobId = selectedConfirmedQuote.job.id;
                  setSelectedConfirmedQuote(null);
                  navigate(`/job-execution/${jobId}`);
                }}
                iconRight={<ArrowRight className="w-5 h-5" />}
              >
                {t('quotes.viewProgress')}
              </Button>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Simulated Call Toast */}
      {showCallToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#111B21] text-white px-4 py-2.5 rounded-pill shadow-tier-3 text-body-md flex items-center gap-2 animate-in fade-in">
          <PhoneCall className="w-4 h-4 text-accent animate-pulse" />
          <span>Simulated Call: Dialing employer (+91 99100 11223)...</span>
        </div>
      )}

      <BottomNav />
    </div>
  );
};
