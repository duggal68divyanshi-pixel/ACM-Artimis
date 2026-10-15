import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNegotiation } from '../state/NegotiationContext';
import { useJobs } from '../../worker-jobs/state/JobsContext';
import { useProfile } from '../../profile/state/ProfileContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { formatCurrency } from '../../../utils/currency';
import { formatTimeAgo } from '../../../utils/time';
import { MessageSquare, ChevronRight, Lock } from 'lucide-react';

export const MessagesInboxScreen: React.FC = () => {
  const { t } = useLanguage();
  const { currentUserId } = useMockAuthSession();
  const { threads } = useNegotiation();
  const { getJobById } = useJobs();
  const { getUser } = useProfile();
  const navigate = useNavigate();

  // Employer active threads
  const employerThreads = threads.filter((t) => t.employerId === currentUserId);

  return (
    <div className="min-h-screen bg-surface-canvas pb-24 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={t('nav.messages')} />

      <main className="p-4 flex-1">
        <div className="mb-4">
          <h1 className="text-headline-sm font-extrabold text-on-surface">
            {t('nav.messages')}
          </h1>
          <p className="text-body-sm text-text-secondary">
            Active negotiation threads across your posted jobs
          </p>
        </div>

        {employerThreads.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {employerThreads.map((thread) => {
              const job = getJobById(thread.jobId);
              const worker = getUser(thread.workerId);
              const lastMessage = thread.messages[thread.messages.length - 1];

              return (
                <Card
                  key={thread.id}
                  interactive
                  onClick={() => navigate(`/negotiation/${thread.id}`)}
                  className="p-3.5 flex items-center justify-between gap-3 border-border-subtle bg-white shadow-tier-1"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold text-headline-sm shrink-0">
                    {worker?.name ? worker.name[0] : 'W'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-body-md font-bold text-on-surface truncate">
                        {worker?.name || 'Worker'}
                      </h4>
                      {thread.locked ? (
                        <Badge type="confirmed" label="Locked" />
                      ) : (
                        <Badge type="negotiating" label="Active" />
                      )}
                    </div>

                    <p className="text-xs text-text-secondary truncate">
                      Job: {job?.description || 'Service job'}
                    </p>

                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className="text-text-secondary truncate max-w-[150px]">
                        {lastMessage ? lastMessage.text || 'Voice note' : 'Negotiation started'}
                      </span>
                      <span className="font-extrabold text-primary tabular-nums">
                        {formatCurrency(thread.currentOfferAmount)}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-text-secondary/60 shrink-0" />
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-card border border-border-subtle flex flex-col items-center">
            <MessageSquare className="w-12 h-12 text-border-strong mb-2" />
            <p className="text-body-md text-text-secondary font-medium">
              No active conversations yet.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};
