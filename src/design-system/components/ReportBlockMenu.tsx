import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMockAuthSession } from '../../hooks/useMockAuthSession';
import { REPORT_REASONS } from '../../config/constants';
import * as repo from '../../data/repository';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';
import {
  MoreVertical,
  Flag,
  UserX,
  EyeOff,
  ShieldAlert,
  Banknote,
  MoreHorizontal,
  CheckCircle2,
} from 'lucide-react';

const REASON_ICONS: Record<string, React.ReactNode> = {
  fake_misleading: <EyeOff className="w-4 h-4" />,
  inappropriate: <ShieldAlert className="w-4 h-4" />,
  advance_payment: <Banknote className="w-4 h-4" />,
  other: <MoreHorizontal className="w-4 h-4" />,
};

export interface ReportBlockMenuProps {
  /** The user this report/block applies to — never the viewer themself. */
  targetUserId: string;
  targetUserName?: string;
  context: 'job' | 'worker_profile' | 'negotiation';
  contextId?: string;
  /** Called after a block completes — e.g. to navigate out of a now-hidden chat. */
  onBlocked?: () => void;
  /** Visual variant: 'dark' for overlays on video/photo backdrops, 'light' for white cards. */
  variant?: 'dark' | 'light';
  className?: string;
}

export const ReportBlockMenu: React.FC<ReportBlockMenuProps> = ({
  targetUserId,
  targetUserName,
  context,
  contextId,
  onBlocked,
  variant = 'light',
  className = '',
}) => {
  const { t, language } = useLanguage();
  const { currentUserId } = useMockAuthSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [reportDone, setReportDone] = useState(false);
  const [blockDone, setBlockDone] = useState(false);

  const resetAndClose = () => {
    setMenuOpen(false);
    setReportOpen(false);
    setBlockConfirmOpen(false);
    setSelectedReason(null);
    setNote('');
    setReportDone(false);
  };

  const handleSubmitReport = () => {
    if (!selectedReason) return;
    repo.submitReport({
      reporterId: currentUserId,
      targetUserId,
      context,
      contextId,
      reason: selectedReason,
      note: note.trim() || undefined,
    });
    setReportDone(true);
  };

  const handleConfirmBlock = () => {
    repo.blockUser(currentUserId, targetUserId);
    setBlockDone(true);
    setTimeout(() => {
      resetAndClose();
      onBlocked?.();
    }, 900);
  };

  const triggerClasses =
    variant === 'dark'
      ? 'w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white active:scale-90'
      : 'w-9 h-9 rounded-full bg-surface-canvas border border-border-subtle text-text-secondary active:scale-90';

  return (
    <>
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        aria-label={t('reportBlock.moreOptions')}
        className={`flex items-center justify-center shrink-0 ${triggerClasses} ${className}`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {/* Step 1: action menu */}
      <BottomSheet isOpen={menuOpen && !reportOpen && !blockConfirmOpen} onClose={resetAndClose}>
        <div className="flex flex-col gap-1">
          {targetUserName && (
            <p className="text-body-sm text-text-secondary px-1 pb-2">{targetUserName}</p>
          )}
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="min-h-[56px] rounded-button flex items-center gap-3 px-3 text-body-lg font-bold text-on-surface hover:bg-surface-canvas active:scale-[0.99]"
          >
            <Flag className="w-5 h-5 text-secondary" />
            {t('reportBlock.report')}
          </button>
          <button
            type="button"
            onClick={() => setBlockConfirmOpen(true)}
            className="min-h-[56px] rounded-button flex items-center gap-3 px-3 text-body-lg font-bold text-danger hover:bg-danger/5 active:scale-[0.99]"
          >
            <UserX className="w-5 h-5" />
            {t('reportBlock.block')}
          </button>
        </div>
      </BottomSheet>

      {/* Step 2a: report reasons */}
      <BottomSheet isOpen={reportOpen} onClose={resetAndClose} title={t('reportBlock.reportTitle')}>
        {reportDone ? (
          <div className="flex flex-col items-center text-center gap-2 py-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
            <p className="text-body-lg font-bold text-on-surface">{t('reportBlock.reportThanks')}</p>
            <Button variant="secondary" onClick={resetAndClose} className="mt-2">
              {t('common.done')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelectedReason(reason.id)}
                  className={`min-h-[52px] rounded-button border-[1.5px] flex items-center gap-2.5 px-3.5 text-body-md font-bold transition-all text-left ${
                    selectedReason === reason.id
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-border-subtle bg-white text-on-surface'
                  }`}
                >
                  {REASON_ICONS[reason.id]}
                  {language === 'hi' ? reason.labelHi : reason.labelEn}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('reportBlock.notePlaceholder')}
              className="w-full p-3 rounded-card bg-white border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-md text-on-surface"
            />
            <Button
              variant="primary"
              fullWidth
              size="lg"
              disabled={!selectedReason}
              onClick={handleSubmitReport}
              icon={<Flag className="w-5 h-5 text-[#111B21]" />}
            >
              {t('reportBlock.submitReport')}
            </Button>
          </div>
        )}
      </BottomSheet>

      {/* Step 2b: block confirmation */}
      <BottomSheet isOpen={blockConfirmOpen} onClose={resetAndClose} title={t('reportBlock.blockTitle')}>
        {blockDone ? (
          <div className="flex flex-col items-center text-center gap-2 py-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
            <p className="text-body-lg font-bold text-on-surface">{t('reportBlock.blockDone')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-body-md text-text-secondary">
              {t('reportBlock.blockExplain', { name: targetUserName || '' })}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" fullWidth onClick={resetAndClose}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                fullWidth
                onClick={handleConfirmBlock}
                icon={<UserX className="w-5 h-5" />}
              >
                {t('reportBlock.confirmBlock')}
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>
    </>
  );
};
