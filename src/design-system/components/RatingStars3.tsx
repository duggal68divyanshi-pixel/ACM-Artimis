import React from 'react';
import { Frown, Meh, Smile } from 'lucide-react';

export type RatingLevel = 1 | 2 | 3;

export interface RatingStars3Props {
  value?: RatingLevel;
  onChange?: (level: RatingLevel) => void;
  readOnly?: boolean;
  size?: 'default' | 'sm';
  labels?: {
    bad: string;
    okay: string;
    great: string;
  };
}

export const RatingStars3: React.FC<RatingStars3Props> = ({
  value,
  onChange,
  readOnly = false,
  size = 'default',
  labels = { bad: 'Bad', okay: 'Okay', great: 'Great' },
}) => {
  const options: { level: RatingLevel; label: string; icon: React.ReactNode; color: string }[] = [
    {
      level: 1,
      label: labels.bad,
      icon: <Frown className={size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'} />,
      color: 'text-danger hover:border-danger/60',
    },
    {
      level: 2,
      label: labels.okay,
      icon: <Meh className={size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'} />,
      color: 'text-[#FFA000] hover:border-[#FFA000]/60',
    },
    {
      level: 3,
      label: labels.great,
      icon: <Smile className={size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'} />,
      color: 'text-success hover:border-success/60',
    },
  ];

  return (
    <div className="flex items-center gap-3 w-full justify-between" role="radiogroup" aria-label="3-level rating">
      {options.map((opt) => {
        const isSelected = value === opt.level;
        return (
          <button
            key={opt.level}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(opt.level)}
            className={`flex-1 flex flex-col items-center justify-center p-3 rounded-card border-[2px] transition-all select-none min-h-[56px] ${
              readOnly ? 'cursor-default' : 'cursor-pointer active:scale-95'
            } ${
              isSelected
                ? 'bg-white border-secondary shadow-md scale-102 ring-2 ring-secondary/20'
                : 'bg-surface-card border-border-subtle opacity-75 hover:opacity-100'
            }`}
          >
            <span className={`transition-colors ${isSelected ? opt.color : 'text-text-secondary'}`}>
              {opt.icon}
            </span>
            <span
              className={`text-label-md mt-1 font-bold ${
                isSelected ? 'text-on-surface' : 'text-text-secondary'
              }`}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
