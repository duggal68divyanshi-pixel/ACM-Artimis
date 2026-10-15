import React from 'react';

export interface StatTileProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  highlight?: boolean;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  icon,
  subtitle,
  highlight = false,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col p-3 rounded-card border ${
        highlight
          ? 'bg-[rgba(255,160,0,0.08)] border-[#FFA000]/30 text-on-surface'
          : 'bg-surface-card border-border-subtle shadow-tier-1'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-1 text-text-secondary text-label-md mb-1">
        <span className="truncate">{label}</span>
        {icon && <span className="shrink-0">{icon}</span>}
      </div>
      <div className="text-headline-md font-extrabold text-on-surface tabular-nums truncate">
        {value}
      </div>
      {subtitle && <div className="text-body-sm text-text-secondary mt-0.5">{subtitle}</div>}
    </div>
  );
};
