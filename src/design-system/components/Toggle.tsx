import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  sublabel?: string;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  sublabel,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      className={`inline-flex items-center justify-between gap-3 cursor-pointer select-none min-h-[48px] py-1 ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      } ${className}`}
    >
      {(label || sublabel) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-body-lg font-semibold text-on-surface">{label}</span>}
          {sublabel && <span className="text-body-sm text-text-secondary">{sublabel}</span>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary ${
          checked ? 'bg-secondary' : 'bg-border-strong/50'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
};
