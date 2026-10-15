import React from 'react';
import { Quote, Job } from '../../../data/types';
import { formatCurrency } from '../../../utils/currency';
import { formatTimeAgo } from '../../../utils/time';
import { Badge } from '../../../design-system/components/Badge';
import { Card } from '../../../design-system/components/Card';
import { useLanguage } from '../../../i18n/LanguageContext';
import { getJobDescription } from '../../../utils/localizedJob';
import {
  MessageSquare,
  Lock,
  ChevronRight,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  BrickWall,
  HardHat,
} from 'lucide-react';

const TRADE_ICONS: Record<string, React.ReactNode> = {
  plumber: <Wrench className="w-4 h-4" />,
  electrician: <Zap className="w-4 h-4" />,
  carpenter: <Hammer className="w-4 h-4" />,
  painter: <Paintbrush className="w-4 h-4" />,
  mason: <BrickWall className="w-4 h-4" />,
  labourer: <HardHat className="w-4 h-4" />,
};

export interface QuoteStatusRowProps {
  quote: Quote;
  job?: Job;
  onClick: () => void;
}

export const QuoteStatusRow: React.FC<QuoteStatusRowProps> = ({ quote, job, onClick }) => {
  const { t, language } = useLanguage();

  const getStatusBadge = () => {
    switch (quote.status) {
      case 'pending':
        return <Badge type="pending" label={t('quotes.statusPending')} />;
      case 'negotiating':
        return <Badge type="negotiating" label={t('quotes.statusNegotiating')} />;
      case 'accepted':
        return <Badge type="confirmed" label={t('quotes.statusConfirmed')} />;
      case 'declined':
        return <Badge type="declined" label={t('quotes.statusDeclined')} />;
    }
  };

  return (
    <Card
      interactive
      onClick={onClick}
      className="p-3.5 flex items-center justify-between gap-3 border-border-subtle"
    >
      {/* Left: Trade icon / thumbnail */}
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        {job ? TRADE_ICONS[job.trade] || <Wrench className="w-6 h-6" /> : <Wrench className="w-6 h-6" />}
      </div>

      {/* Middle info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          {getStatusBadge()}
          <span className="text-body-sm text-text-secondary">
            {formatTimeAgo(quote.createdAt)}
          </span>
        </div>

        <h4 className="text-body-md font-bold text-on-surface truncate">
          {job ? getJobDescription(job, language) : 'Job details'}
        </h4>

        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-body-sm text-text-secondary">Your quote:</span>
          <span className="text-title-md font-extrabold text-primary tabular-nums">
            {formatCurrency(quote.quotedPrice)}
          </span>
        </div>
      </div>

      {/* Right chevron */}
      <div className="text-text-secondary/60">
        <ChevronRight className="w-5 h-5" />
      </div>
    </Card>
  );
};
