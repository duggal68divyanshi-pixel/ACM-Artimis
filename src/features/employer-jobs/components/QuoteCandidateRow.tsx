import React from 'react';
import { Quote, User, WorkerProfile } from '../../../data/types';
import { formatCurrency } from '../../../utils/currency';
import { formatDistance } from '../../../utils/distance';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { ReportBlockMenu } from '../../../design-system/components/ReportBlockMenu';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Star, MapPin, Briefcase, MessageSquare, Check, X } from 'lucide-react';

export interface QuoteCandidateRowProps {
  quote: Quote;
  worker?: User;
  profile?: WorkerProfile;
  onSelect: () => void;
  onNegotiate: () => void;
  onDecline: () => void;
  onBlocked?: () => void;
}

export const QuoteCandidateRow: React.FC<QuoteCandidateRowProps> = ({
  quote,
  worker,
  profile,
  onSelect,
  onNegotiate,
  onDecline,
  onBlocked,
}) => {
  const { t } = useLanguage();

  // Work-reel thumbnail (not a headshot per §9 Flow D)
  const workReelThumb =
    profile?.portfolioReels?.[0]?.thumbUrl ||
    profile?.introVideoUrl ||
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=300&auto=format&fit=crop&q=80';

  return (
    <Card className="p-3.5 flex flex-col gap-3 border-border-subtle shadow-tier-1 bg-white">
      {/* Top row: Worker Reel Thumbnail + Details + Quoted Price */}
      <div className="flex items-start gap-3">
        {/* Work-reel thumbnail */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-border-subtle">
          <img
            src={workReelThumb}
            alt={worker?.name || 'Work reel thumbnail'}
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center font-bold py-0.5">
            Work Reel
          </span>
        </div>

        {/* Worker Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-body-lg font-extrabold text-on-surface truncate">
              {worker?.name || 'Skilled Tradesperson'}
            </h4>
            {worker?.verified && <Badge type="verified" />}
          </div>

          <div className="flex items-center gap-2 text-body-sm text-text-secondary mt-0.5 flex-wrap">
            {/* Rating */}
            <span className="inline-flex items-center gap-1 font-bold text-on-surface tabular-nums">
              <Star className="w-3.5 h-3.5 text-trust-amber fill-current" />
              <span>{profile?.rating || 4.8}</span>
            </span>
            <span>•</span>
            {/* Experience */}
            <span className="inline-flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-text-secondary" />
              <span>{profile?.experienceYears || 5}y exp</span>
            </span>
            <span>•</span>
            {/* Distance */}
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MapPin className="w-3.5 h-3.5 text-text-secondary" />
              <span>{formatDistance(profile?.radiusKm ? profile.radiusKm * 0.3 : 2.1)}</span>
            </span>
          </div>

          {/* Voice note indicator if present */}
          {quote.voiceNoteUrl && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary mt-1">
              🎤 Voice note attached
            </span>
          )}
        </div>

        {/* Quoted Price */}
        <div className="text-right shrink-0">
          <span className="text-[11px] uppercase tracking-wide text-text-secondary block font-semibold">
            Quote
          </span>
          <span className="text-headline-sm font-extrabold text-primary tabular-nums">
            {formatCurrency(quote.quotedPrice)}
          </span>
        </div>

        {worker && (
          <ReportBlockMenu
            targetUserId={worker.id}
            targetUserName={worker.name}
            context="worker_profile"
            contextId={worker.id}
            onBlocked={onBlocked}
          />
        )}
      </div>

      {/* Action Buttons: Select (direct lock) | Negotiate (open thread) | Decline */}
      <div className="flex items-center gap-2 pt-2 border-t border-border-subtle">
        {/* Select */}
        <Button
          variant="primary"
          size="sm"
          onClick={onSelect}
          className="flex-1 min-h-[44px] text-body-sm"
          icon={<Check className="w-4 h-4 text-[#111B21]" />}
        >
          {t('employerJobs.candidateActionSelect')}
        </Button>

        {/* Negotiate */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onNegotiate}
          className="flex-1 min-h-[44px] text-body-sm"
          icon={<MessageSquare className="w-4 h-4 text-secondary" />}
        >
          {t('employerJobs.candidateActionNegotiate')}
        </Button>

        {/* Decline (low visual weight, transparent bg, danger text per §3) */}
        <button
          type="button"
          onClick={onDecline}
          aria-label={t('employerJobs.candidateActionDecline')}
          className="px-3 py-2 rounded-button text-body-sm font-semibold text-danger/80 hover:text-danger hover:bg-danger/5 active:scale-95 transition-all min-h-[44px]"
        >
          {t('employerJobs.candidateActionDecline')}
        </button>
      </div>
    </Card>
  );
};
