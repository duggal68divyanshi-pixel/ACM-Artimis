import React, { useState, useEffect } from 'react';
import { Job } from '../../../data/types';
import { BottomSheet } from '../../../design-system/components/BottomSheet';
import { Button } from '../../../design-system/components/Button';
import { VoiceButton } from '../../../design-system/components/VoiceButton';
import { formatCurrency } from '../../../utils/currency';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useQuotes } from '../state/QuotesContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { Send, Shield, CheckCircle2 } from 'lucide-react';

export interface QuoteSheetProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onQuoteSubmitted: () => void;
}

export const QuoteSheet: React.FC<QuoteSheetProps> = ({
  job,
  isOpen,
  onClose,
  onQuoteSubmitted,
}) => {
  const { t } = useLanguage();
  const { currentUserId } = useMockAuthSession();
  const { submitQuote } = useQuotes();

  const [price, setPrice] = useState<number>(500);
  const [voiceNoteUrl, setVoiceNoteUrl] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (job) {
      setPrice(job.suggestedPrice || 500);
      setVoiceNoteUrl(undefined);
      setSubmitted(false);
    }
  }, [job]);

  if (!job) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || price <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitQuote({
        jobId: job.id,
        workerId: currentUserId,
        quotedPrice: price,
        voiceNoteUrl,
      });
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onQuoteSubmitted();
        onClose();
      }, 1000);
    }, 400);
  };

  const handleVoiceRecorded = (mockUrl: string) => {
    setVoiceNoteUrl(mockUrl);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('workerJobs.sendQuoteTitle')}>
      {submitted ? (
        <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
          <div className="w-16 h-16 rounded-full bg-success/15 text-success flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-title-lg font-bold text-on-surface">
            {t('workerJobs.quoteSentSuccess')}
          </h3>
          <p className="text-body-md text-text-secondary">
            {formatCurrency(price)} • {t('quotes.statusPending')}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Privacy Guarantee Banner */}
          <div className="p-3 rounded-card bg-secondary/10 border border-secondary/20 flex items-start gap-2.5">
            <Shield className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            <p className="text-body-sm text-secondary font-medium">
              {t('workerJobs.quoteDescription')}
            </p>
          </div>

          {/* Price Input (Prefilled with suggested, but fully editable) */}
          <div>
            <label
              htmlFor="quote-price-input"
              className="block text-label-lg font-bold text-on-surface mb-1"
            >
              {t('workerJobs.yourQuotePrice')}
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-headline-sm font-bold text-text-secondary">
                ₹
              </span>
              <input
                id="quote-price-input"
                type="number"
                min="50"
                step="50"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full min-h-[56px] pl-9 pr-4 rounded-button bg-surface-canvas border-[1.5px] border-border-subtle focus:border-secondary focus:ring-2 focus:ring-secondary text-headline-sm font-extrabold text-on-surface tabular-nums"
                required
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-body-sm text-text-secondary">Quick adjust:</span>
              <button
                type="button"
                onClick={() => setPrice((p) => Math.max(50, p - 50))}
                className="px-2.5 py-1 rounded-pill bg-border-subtle/50 text-body-sm font-bold active:scale-95"
              >
                - ₹50
              </button>
              <button
                type="button"
                onClick={() => setPrice(job.suggestedPrice)}
                className="px-2.5 py-1 rounded-pill bg-border-subtle/50 text-body-sm font-bold active:scale-95"
              >
                Reset ({formatCurrency(job.suggestedPrice)})
              </button>
              <button
                type="button"
                onClick={() => setPrice((p) => p + 50)}
                className="px-2.5 py-1 rounded-pill bg-border-subtle/50 text-body-sm font-bold active:scale-95"
              >
                + ₹50
              </button>
            </div>
          </div>

          {/* Voice note recorder (optional) */}
          <div className="pt-2 border-t border-border-subtle">
            <span className="block text-label-md font-bold text-on-surface mb-1.5">
              {t('workerJobs.voiceNoteOptional')}
            </span>
            <div className="flex items-center gap-3">
              <VoiceButton
                onRecordingComplete={handleVoiceRecorded}
                label={voiceNoteUrl ? 'Voice note recorded ✓' : t('workerJobs.tapToRecord')}
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={isSubmitting}
              icon={<Send className="w-5 h-5" />}
            >
              {t('workerJobs.sendQuote')}
            </Button>
          </div>
        </form>
      )}
    </BottomSheet>
  );
};
