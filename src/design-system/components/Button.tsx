import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  size?: 'default' | 'sm' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  icon,
  iconRight,
  size = 'default',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base styling adhering to Bharat Kinetic Tactile:
  // - Minimum touch target 48x48px
  // - Primary buttons 56px+ tall
  // - Button press feedback: scale(0.98) on active
  // - Minimum font-weight 500
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-accent text-[#111B21] font-bold shadow-sm hover:brightness-105 active:scale-[0.98] focus:ring-2 focus:ring-secondary';
      break;
    case 'secondary':
      variantClasses =
        'bg-white text-secondary border-[1.5px] border-secondary font-semibold hover:bg-[#F0F2F5] active:scale-[0.98] focus:ring-2 focus:ring-secondary';
      break;
    case 'destructive':
      variantClasses =
        'bg-transparent text-danger font-semibold border-[1.5px] border-danger/30 hover:bg-danger/5 active:scale-[0.98] focus:ring-2 focus:ring-danger';
      break;
    case 'outline':
      variantClasses =
        'bg-white text-on-surface border-[1.5px] border-border-subtle font-semibold hover:bg-[#F0F2F5] active:scale-[0.98]';
      break;
    case 'ghost':
      variantClasses =
        'bg-transparent text-text-secondary hover:text-on-surface hover:bg-border-subtle/40 active:scale-[0.98]';
      break;
  }

  let sizeClasses = '';
  switch (size) {
    case 'lg':
    case 'default':
      // 56px minimum height for primary / default actions
      sizeClasses = 'min-h-[56px] px-5 py-3 text-body-lg rounded-button';
      break;
    case 'sm':
      sizeClasses = 'min-h-[48px] px-3.5 py-2 text-body-md rounded-button';
      break;
  }

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
  const widthClasses = fullWidth ? 'w-full' : 'inline-flex';

  return (
    <button
      className={`relative select-none items-center justify-center gap-2.5 transition-transform duration-100 ease-out font-sans ${widthClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="inline-flex shrink-0">{icon}</span>}
          <span className="truncate">{children}</span>
          {iconRight && <span className="inline-flex shrink-0 ml-auto">{iconRight}</span>}
        </>
      )}
    </button>
  );
};
