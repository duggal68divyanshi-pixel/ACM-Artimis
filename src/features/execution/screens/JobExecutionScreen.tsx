import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../worker-jobs/state/JobsContext';
import { useNegotiation } from '../../negotiation/state/NegotiationContext';
import { useProfile } from '../../profile/state/ProfileContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { Card } from '../../../design-system/components/Card';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import { BottomSheet } from '../../../design-system/components/BottomSheet';
import { formatCurrency } from '../../../utils/currency';
import { getJobDescription } from '../../../utils/localizedJob';
import {
  CheckCircle2,
  Clock,
  Play,
  Check,
  Star,
  MapPin,
  Calendar,
  CreditCard,
  MessageSquare,
  QrCode,
  ScanLine,
  LifeBuoy,
  Navigation,
} from 'lucide-react';

export const JobExecutionScreen: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { t, language } = useLanguage();
  const { currentRole, currentUserId } = useMockAuthSession();
  const { getJobById, updateJobStatus, refreshJobs } = useJobs();
  const { getThreadByJobAndWorker } = useNegotiation();
  const { getUser, getProfile } = useProfile();
  const navigate = useNavigate();

  const job = getJobById(jobId || '');
  const [internalStatus, setInternalStatus] = useState<
    'confirmed' | 'in_progress' | 'completed'
  >(job?.status === 'completed' ? 'completed' : 'confirmed');

  // QR check-in/check-out — a lightweight "proof of presence" step before each
  // status jump, instead of just tapping a button with nothing behind it.
  const [qrStep, setQrStep] = useState<'start' | 'end' | null>(null);
  const [qrConfirming, setQrConfirming] = useState(false);

  // Women's safety — share-live-location is a mock toggle, offered only when
  // the worker has opted into safety mode on their profile.
  const workerProfile = currentRole === 'worker' ? getProfile(currentUserId) : undefined;
  const [locationShared, setLocationShared] = useState(false);

  if (!job) {
    return (
      <div className="min-h-screen bg-surface-canvas p-6 text-center max-w-md mx-auto">
        <p className="text-body-lg text-text-secondary">Job not found.</p>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">
          Go back
        </Button>
      </div>
    );
  }

  // Stepper progress index
  const stepIndex =
    internalStatus === 'confirmed' ? 0 : internalStatus === 'in_progress' ? 1 : 2;

  // Tapping the step button opens the QR sheet first — the actual status jump
  // only happens once that's "scanned" (handleQrConfirm).
  const handleAdvance = () => {
    if (internalStatus === 'confirmed') {
      setQrStep('start');
    } else if (internalStatus === 'in_progress') {
      setQrStep('end');
    }
  };

  const handleQrConfirm = () => {
    setQrConfirming(true);
    setTimeout(() => {
      if (qrStep === 'start') {
        setInternalStatus('in_progress');
        setQrStep(null);
        setQrConfirming(false);
      } else if (qrStep === 'end') {
        setInternalStatus('completed');
        updateJobStatus(job.id, 'completed');
        refreshJobs();
        setQrStep(null);
        setQrConfirming(false);
        // On completion, open rating prompt
        navigate(`/rate/${job.id}`);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-surface-canvas pb-24 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={t('execution.progressTitle')} showBack onBack={() => navigate(-1)} />

      <main className="p-4 flex-1 flex flex-col gap-4">
        {/* Job Details Card */}
        <Card className="p-4 bg-white border-border-subtle shadow-tier-1 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold text-primary tracking-wide">
              {job.trade}
            </span>
            <Badge type="confirmed" label={internalStatus.replace('_', ' ').toUpperCase()} />
          </div>

          <h2 className="text-title-lg font-bold text-on-surface">{getJobDescription(job, language)}</h2>

          <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-body-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-secondary" />
              {job.location.label}
            </span>
            <span className="font-extrabold text-accent text-headline-sm tabular-nums">
              {formatCurrency(job.suggestedPrice)}
            </span>
          </div>
        </Card>

        {/* Status Stepper: Confirmed → In Progress → Completed */}
        <Card className="p-4 bg-white border-border-subtle shadow-tier-1">
          <h3 className="text-label-lg font-bold text-on-surface mb-4">Live Status Tracker</h3>

          <div className="relative flex items-center justify-between px-2">
            {/* Connecting line */}
            <div className="absolute left-6 right-6 top-4 h-1 bg-border-subtle z-0">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${(stepIndex / 2) * 100}%` }}
              />
            </div>

            {/* Step 1: Confirmed */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  stepIndex >= 0 ? 'bg-accent text-[#111B21] shadow-sm' : 'bg-border-subtle text-text-secondary'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[11px] font-bold mt-1 text-on-surface">
                {t('execution.stepConfirmed')}
              </span>
            </div>

            {/* Step 2: In Progress */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  stepIndex >= 1 ? 'bg-accent text-[#111B21] shadow-sm' : 'bg-surface-canvas text-text-secondary border border-border-subtle'
                }`}
              >
                {stepIndex >= 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
              </div>
              <span className="text-[11px] font-bold mt-1 text-on-surface">
                {t('execution.stepInProgress')}
              </span>
            </div>

            {/* Step 3: Completed */}
            <div className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  stepIndex >= 2 ? 'bg-accent text-[#111B21] shadow-sm' : 'bg-surface-canvas text-text-secondary border border-border-subtle'
                }`}
              >
                {stepIndex >= 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
              </div>
              <span className="text-[11px] font-bold mt-1 text-on-surface">
                {t('execution.stepCompleted')}
              </span>
            </div>
          </div>
        </Card>

        {/* Women's safety — share-live-location, only while the job is actually
            in progress and only for workers who opted into safety mode */}
        {workerProfile?.safetyMode && internalStatus === 'in_progress' && (
          <Card className="p-4 bg-white border-border-subtle shadow-tier-1 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-secondary" />
              <h3 className="text-title-md font-bold text-on-surface">{t('execution.safetyTitle')}</h3>
            </div>
            {locationShared ? (
              <div className="flex items-center gap-2 p-3 rounded-card bg-success/10 border border-success/30 text-success font-bold text-body-sm">
                <Navigation className="w-4 h-4 shrink-0" />
                <span>
                  {t('execution.sharingWith', {
                    name: workerProfile.emergencyContactName || t('execution.emergencyContactFallback'),
                  })}
                </span>
              </div>
            ) : (
              <p className="text-body-sm text-text-secondary">{t('execution.shareLocationHelp')}</p>
            )}
            <Button
              variant={locationShared ? 'secondary' : 'primary'}
              fullWidth
              onClick={() => setLocationShared((prev) => !prev)}
              icon={<Navigation className="w-4 h-4 text-[#111B21]" />}
            >
              {locationShared ? t('execution.stopSharing') : t('execution.shareLocation')}
            </Button>
          </Card>
        )}

        {/* Step Action Button */}
        <div className="mt-auto pt-4 flex flex-col gap-2">
          {internalStatus === 'confirmed' && (
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleAdvance}
              icon={<Play className="w-5 h-5 text-[#111B21]" />}
            >
              {t('execution.markStarted')}
            </Button>
          )}

          {internalStatus === 'in_progress' && (
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleAdvance}
              icon={<CheckCircle2 className="w-5 h-5 text-[#111B21]" />}
            >
              {t('execution.markCompleted')}
            </Button>
          )}

          {internalStatus === 'completed' && (
            <Button
              variant="secondary"
              fullWidth
              size="lg"
              onClick={() => navigate(`/rate/${job.id}`)}
              icon={<Star className="w-5 h-5 text-trust-amber" />}
            >
              {t('rating.title')}
            </Button>
          )}
        </div>
      </main>

      {/* QR check-in / check-out — a lightweight "proof of presence" step before
          each status jump. No real camera dependency: this is a mock scan. */}
      <BottomSheet
        isOpen={qrStep !== null}
        onClose={() => !qrConfirming && setQrStep(null)}
        title={qrStep === 'start' ? t('execution.qrStartTitle') : t('execution.qrEndTitle')}
      >
        <div className="flex flex-col items-center gap-4 py-2">
          <p className="text-body-sm text-text-secondary text-center">
            {currentRole === 'worker' ? t('execution.qrWorkerHelp') : t('execution.qrEmployerHelp')}
          </p>

          {/* Mock QR pattern — a stand-in visual, not a real scannable code */}
          <div className="w-44 h-44 rounded-card border-2 border-border-subtle bg-white p-3 grid grid-cols-5 grid-rows-5 gap-1 shadow-tier-1">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-sm ${
                  // Deterministic pseudo-random fill from the job id + cell index,
                  // so the pattern differs per job but renders the same every time.
                  (job.id.charCodeAt(i % job.id.length) + i) % 3 === 0 ? 'bg-[#111B21]' : 'bg-transparent'
                }`}
              />
            ))}
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary">
            <QrCode className="w-4 h-4" />
            {t('execution.qrCodeFor', { job: job.trade })}
          </span>

          <Button
            variant="primary"
            fullWidth
            size="lg"
            loading={qrConfirming}
            onClick={handleQrConfirm}
            icon={<ScanLine className="w-5 h-5 text-[#111B21]" />}
          >
            {qrStep === 'start' ? t('execution.qrSimulateStart') : t('execution.qrSimulateEnd')}
          </Button>
        </div>
      </BottomSheet>

      <BottomNav />
    </div>
  );
};
