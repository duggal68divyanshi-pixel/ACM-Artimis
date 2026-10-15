import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'max-h-[85vh]',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
      {/* Scrim: #111B21 @ 60% opacity per spec §3 */}
      <div
        className="fixed inset-0 bg-[#111B21]/60 transition-opacity backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content: Tier 3 elevation, rounded top, max-width phone width */}
      <div
        className={`relative z-10 w-full max-w-md bg-surface-card rounded-t-[20px] shadow-tier-3 flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200 ${maxHeight}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 cursor-grab" onClick={onClose}>
          <div className="w-12 h-1.5 bg-border-strong/40 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
          <h2 className="text-title-lg font-bold text-on-surface truncate">{title || ''}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sheet"
            className="w-10 h-10 flex items-center justify-center rounded-full text-text-secondary hover:text-on-surface hover:bg-border-subtle/50 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content with scrolling */}
        <div className="p-4 overflow-y-auto overscroll-contain flex-1">{children}</div>
      </div>
    </div>
  );
};
