import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 1,
  interactive = false,
  className = '',
  onClick,
  ...props
}) => {
  let elevationClasses = '';
  switch (elevation) {
    case 0:
      elevationClasses = 'bg-surface-canvas border-0';
      break;
    case 1:
      elevationClasses = 'bg-surface-card border border-border-subtle shadow-tier-1';
      break;
    case 2:
      elevationClasses = 'bg-surface-card border border-border-subtle shadow-tier-2';
      break;
  }

  const interactiveClasses = interactive
    ? 'cursor-pointer active:scale-[0.99] transition-transform hover:border-secondary/40'
    : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-card p-4 transition-all duration-150 ${elevationClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
