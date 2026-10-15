import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatTile } from '../../../design-system/components/StatTile';
import { getDiaryEntries, updateDiaryEntryPayment } from '../../../data/repository';
import { formatCurrency } from '../../../utils/currency';
import {
  Banknote,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  CreditCard,
  QrCode,
  Wallet,
  Info,
} from 'lucide-react';

export const DiaryScreen: React.FC = () => {
  const { t } = useLanguage();
  const { currentUserId } = useMockAuthSession();
  const navigate = useNavigate();

  const [entries, setEntries] = useState(() => getDiaryEntries(currentUserId));

  // Compute totals
  const totalTracked = entries.reduce((acc, curr) => acc + curr.amount, 0);
  const totalPaid = entries
    .filter((e) => e.paid)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalPending = entries
    .filter((e) => !e.paid)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleTogglePaid = (id: string, currentStatus: boolean) => {
    updateDiaryEntryPayment(id, !currentStatus);
    setEntries(getDiaryEntries(currentUserId));
  };

  return (
    <div className="min-h-screen bg-surface-canvas pb-24 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={t('diary.title')} showBack onBack={() => navigate(-1)} />

      <main className="p-4 flex-1 flex flex-col gap-4">
        {/* Header Summary Tiles */}
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label={t('diary.totalEarnings')}
            value={formatCurrency(totalTracked)}
            icon={<Wallet className="w-5 h-5 text-primary" />}
            highlight
          />
          <StatTile
            label={t('diary.pendingTotal')}
            value={formatCurrency(totalPending)}
            icon={<Clock className="w-5 h-5 text-danger" />}
          />
        </div>

        {/* Received Banner */}
        <div className="p-3.5 rounded-card bg-success/10 border border-success/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-body-md font-bold text-success">
              {t('diary.paidTotal')}
            </span>
          </div>
          <span className="text-headline-sm font-extrabold text-success tabular-nums">
            {formatCurrency(totalPaid)}
          </span>
        </div>

        {/* Payment-honour disclosure — cash never passes through Chowk, so every
            paid/pending status here is the worker's own word, not a platform record. */}
        <div className="p-3 rounded-card bg-secondary/10 border border-secondary/20 flex items-start gap-2">
          <Info className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <p className="text-xs text-secondary font-medium">{t('diary.honourDisclosure')}</p>
        </div>

        {/* Entries List */}
        <div>
          <h2 className="text-title-lg font-bold text-on-surface mb-2.5">Recent Ledger</h2>
          <div className="flex flex-col gap-2.5">
            {entries.map((entry) => (
              <Card
                key={entry.id}
                className="p-3.5 bg-white border-border-subtle shadow-tier-1 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-pill ${
                        entry.paid ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                      }`}
                    >
                      {entry.paid ? t('diary.statusPaid') : t('diary.statusPending')}
                    </span>
                    <span className="text-xs text-text-secondary">{entry.date}</span>
                    <span className="text-xs text-text-secondary uppercase">
                      • {entry.paymentMethod}
                    </span>
                  </div>

                  <h4 className="text-body-md font-bold text-on-surface truncate">
                    {entry.jobTitle || 'Trade service assignment'}
                  </h4>

                  <span className="text-title-md font-extrabold text-accent tabular-nums">
                    {formatCurrency(entry.amount)}
                  </span>
                </div>

                {/* Mark as paid button */}
                <button
                  type="button"
                  onClick={() => handleTogglePaid(entry.id, entry.paid)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-bold border transition-all active:scale-95 shrink-0 ${
                    entry.paid
                      ? 'border-border-subtle bg-surface-canvas text-text-secondary'
                      : 'border-success bg-success/15 text-success'
                  }`}
                >
                  {entry.paid ? 'Mark pending' : t('diary.markAsPaid')}
                </button>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
