import React from 'react';

export interface IconTextProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
  iconPosition?: 'left' | 'right';
  tabular?: boolean;
}

export const IconText: React.FC<IconTextProps> = ({
  icon,
  text,
  className = '',
  iconPosition = 'left',
  tabular = false,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-body-md text-text-secondary select-none ${
        tabular ? 'tabular-nums' : ''
      } ${className}`}
    >
      {iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
      <span className="truncate">{text}</span>
      {iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
    </span>
  );
};
