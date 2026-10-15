import React from 'react';
import { formatCurrency } from '../../../utils/currency';
import { Button } from '../../../design-system/components/Button';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Handshake, Check } from 'lucide-react';

export interface OfferCardProps {
  amount: number;
  text?: string;
  senderName: string;
  isMe: boolean;
  timeString: string;
  isLocked?: boolean;
  onAcceptOffer?: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  amount,
  text,
  senderName,
  isMe,
  timeString,
  isLocked = false,
  onAcceptOffer,
}) => {
  const { t } = useLanguage();

  return (
    <div
      className={`p-3.5 rounded-card max-w-[88%] flex flex-col gap-2.5 shadow-tier-1 border ${
        isMe
          ? 'bg-primary/5 border-primary/30 rounded-tr-none ml-auto text-on-surface'
          : 'bg-[rgba(255,160,0,0.08)] border-[#FFA000]/40 rounded-tl-none mr-auto text-on-surface'
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle/80 pb-2">
        <span className="text-xs uppercase font-extrabold tracking-wide text-text-secondary flex items-center gap-1">
          <Handshake className="w-3.5 h-3.5 text-trust-amber" />
          <span>{isMe ? 'Your Proposal' : `${senderName}'s Offer`}</span>
        </span>
        <span className="text-[10px] text-text-secondary">{timeString}</span>
      </div>

      <div className="flex items-baseline justify-between gap-3">
        <span className="text-body-sm text-text-secondary">Proposed price:</span>
        <span className="text-headline-md font-extrabold text-accent tabular-nums">
          {formatCurrency(amount)}
        </span>
      </div>

      {text && <p className="text-body-sm text-on-surface/90 italic">"{text}"</p>}

      {!isMe && !isLocked && onAcceptOffer && (
        <div className="pt-1">
          <Button
            size="sm"
            variant="primary"
            fullWidth
            onClick={onAcceptOffer}
            icon={<Check className="w-4 h-4 text-[#111B21]" />}
          >
            {t('negotiation.acceptOffer')} ({formatCurrency(amount)})
          </Button>
        </div>
      )}
    </div>
  );
};
