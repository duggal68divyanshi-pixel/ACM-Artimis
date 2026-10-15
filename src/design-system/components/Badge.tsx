import React from 'react';
import { ShieldCheck, Award, Clock, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';

export type BadgeType =
  | 'verified'
  | 'skillCertified'
  | 'pending'
  | 'negotiating'
  | 'confirmed'
  | 'declined'
  | 'trust'
  | 'custom';

export interface BadgeProps {
  type?: BadgeType;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type = 'custom', label, icon, className = '' }) => {
  let defaultIcon: React.ReactNode = icon;
  let defaultLabel = label;
  let styleClasses = '';

  switch (type) {
    case 'verified':
      defaultIcon = defaultIcon || <ShieldCheck className="w-3.5 h-3.5" />;
      defaultLabel = defaultLabel || 'Aadhaar Verified';
      styleClasses = 'bg-[rgba(18,140,126,0.1)] text-[#075E54] border border-[#075E54]/20';
      break;
    case 'skillCertified':
      defaultIcon = defaultIcon || <Award className="w-3.5 h-3.5 text-[#B87400]" />;
      defaultLabel = defaultLabel || 'Skill Certified';
      styleClasses = 'bg-[rgba(255,160,0,0.12)] text-[#B87400] border border-[#FFA000]/30';
      break;
    case 'pending':
      defaultIcon = defaultIcon || <Clock className="w-3.5 h-3.5 text-text-secondary" />;
      defaultLabel = defaultLabel || 'Pending';
      styleClasses = 'bg-border-subtle/70 text-text-secondary';
      break;
    case 'negotiating':
      defaultIcon = defaultIcon || <MessageSquare className="w-3.5 h-3.5 text-secondary" />;
      defaultLabel = defaultLabel || 'Negotiating';
      styleClasses = 'bg-secondary/10 text-secondary border border-secondary/20';
      break;
    case 'confirmed':
      defaultIcon = defaultIcon || <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
      defaultLabel = defaultLabel || 'Confirmed';
      styleClasses = 'bg-success/15 text-success font-bold border border-success/30';
      break;
    case 'declined':
      defaultIcon = defaultIcon || <XCircle className="w-3.5 h-3.5 text-text-secondary" />;
      defaultLabel = defaultLabel || 'Not selected';
      styleClasses = 'bg-[#F0F2F5] text-text-secondary border border-border-subtle';
      break;
    case 'trust':
      defaultIcon = defaultIcon || <Award className="w-3.5 h-3.5 text-[#FFA000]" />;
      styleClasses = 'bg-[rgba(255,160,0,0.12)] text-[#B87400] font-bold';
      break;
    default:
      styleClasses = 'bg-border-subtle text-on-surface';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-label-md font-semibold shrink-0 select-none ${styleClasses} ${className}`}
    >
      {defaultIcon && <span className="inline-flex shrink-0">{defaultIcon}</span>}
      {defaultLabel && <span>{defaultLabel}</span>}
    </span>
  );
};
