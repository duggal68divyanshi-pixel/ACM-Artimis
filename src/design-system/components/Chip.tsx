import React from 'react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  size = 'md',
  className = '',
  disabled = false,
}) => {
  const isClickable = !!onClick && !disabled;
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-body-sm min-h-[36px]' : 'px-4 py-2.5 text-body-md min-h-[44px]';

  const stateClasses = selected
    ? 'bg-secondary text-white font-semibold shadow-sm'
    : 'bg-white text-on-surface border-[1.5px] border-border-subtle hover:border-secondary/60';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      aria-pressed={selected}
      className={`inline-flex items-center justify-center gap-2 rounded-pill transition-all duration-100 ease-out select-none ${
        isClickable ? 'cursor-pointer active:scale-95' : 'cursor-default'
      } ${sizeClasses} ${stateClasses} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span className="truncate">{label}</span>
    </button>
  );
};
