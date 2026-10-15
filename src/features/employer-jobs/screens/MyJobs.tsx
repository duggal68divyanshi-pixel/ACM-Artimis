import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../worker-jobs/state/JobsContext';
import { useQuotes } from '../../worker-jobs/state/QuotesContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { formatCurrency } from '../../../utils/currency';
import { formatTimeAgo } from '../../../utils/time';
import {
  Briefcase,
  Users,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const MyJobs: React.FC = () => {
  const { t } = useLanguage();
  const { currentUserId } = useMockAuthSession();
  const { getJobsForEmployer } = useJobs();
  const { getQuotesForJob } = useQuotes();
  const navigate = useNavigate();

  const employerJobs = getJobsForEmployer(currentUserId);

  return (
    <div className="min-h-screen bg-surface-canvas pb-24 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={t('employerJobs.title')} />

      <main className="p-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-headline-sm font-extrabold text-on-surface">
              {t('employerJobs.title')}
            </h1>
            <p className="text-body-sm text-text-secondary">{t('employerJobs.subtitle')}</p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => navigate('/post-job')}
            icon={<Plus className="w-4 h-4 text-[#111B21]" />}
          >
            {t('employerJobs.postJob')}
          </Button>
        </div>

        {/* Jobs list */}
        {employerJobs.length > 0 ? (
          <div className="flex flex-col gap-3">
            {employerJobs.map((job) => {
              const quotes = getQuotesForJob(job.id);
              const isFilled = job.status === 'filled';
              const isCompleted = job.status === 'completed';

              return (
                <Card
                  key={job.id}
                  interactive
                  onClick={() => {
                    if (isFilled || isCompleted) {
                      navigate(`/job-execution/${job.id}`);
                    } else {
                      navigate(`/employer/job/${job.id}`);
                    }
                  }}
                  className="p-4 flex flex-col gap-2.5 border-border-subtle bg-white shadow-tier-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-extrabold text-primary tracking-wide">
                      {job.trade}
                    </span>
                    <Badge
                      type={
                        isCompleted
                          ? 'confirmed'
                          : isFilled
                          ? 'confirmed'
                          : 'pending'
                      }
                      label={
                        isCompleted
                          ? t('employerJobs.jobCompleted')
                          : isFilled
                          ? 'Filled • In progress'
                          : `${quotes.length} Quotes`
                      }
                    />
                  </div>

                  <h3 className="text-body-lg font-bold text-on-surface line-clamp-2">
                    {job.description}
                  </h3>

                  <div className="flex items-center justify-between text-body-sm text-text-secondary pt-2 border-t border-border-subtle">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimeAgo(job.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-on-surface font-extrabold tabular-nums">
                      <span>Suggested:</span>
                      <span className="text-primary">{formatCurrency(job.suggestedPrice)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-xs text-secondary font-bold">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {quotes.length} worker quotes received
                    </span>
                    <span className="flex items-center gap-0.5">
                      Review quotes <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-card border border-border-subtle flex flex-col items-center">
            <Briefcase className="w-12 h-12 text-border-strong mb-2" />
            <p className="text-body-md text-text-secondary font-medium mb-4">
              You haven't posted any jobs yet.
            </p>
            <Button variant="primary" onClick={() => navigate('/post-job')}>
              {t('employerJobs.postJob')}
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};
