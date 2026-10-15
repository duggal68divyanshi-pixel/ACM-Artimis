import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useProfile } from '../../profile/state/ProfileContext';
import { AVAILABLE_TRADES, RADIUS_OPTIONS, APP_NAME, APP_NAME_DEVANAGARI } from '../../../config/constants';
import { Button } from '../../../design-system/components/Button';
import { Chip } from '../../../design-system/components/Chip';
import { Card } from '../../../design-system/components/Card';
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  BrickWall,
  HardHat,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Users,
  Compass,
  Phone,
  IdCard,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { UserRole } from '../../../data/types';

const TRADE_ICONS: Record<string, React.ReactNode> = {
  plumber: <Wrench className="w-6 h-6" />,
  electrician: <Zap className="w-6 h-6" />,
  carpenter: <Hammer className="w-6 h-6" />,
  painter: <Paintbrush className="w-6 h-6" />,
  mason: <BrickWall className="w-6 h-6" />,
  labourer: <HardHat className="w-6 h-6" />,
};

export const OnboardingScreen: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { completeOnboarding, currentUserId } = useMockAuthSession();
  const { updateProfile, updateUser } = useProfile();
  const navigate = useNavigate();

  // Onboarding step index:
  // 0: Language selection
  // 1: Role selection (Worker vs Employer)
  // 2: Worker Trade selection OR Employer Info
  // 3: Phone verification (both roles) + Aadhaar verification (worker only)
  // 4: Worker Radius & Availability
  const [step, setStep] = useState(0);
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');
  const [selectedTrade, setSelectedTrade] = useState('plumber');
  const [selectedRadius, setSelectedRadius] = useState(10);
  const [availableToday, setAvailableToday] = useState(true);
  const [employerName, setEmployerName] = useState('Rajesh Singhania');
  const [employerLocation, setEmployerLocation] = useState('Greater Kailash, New Delhi');

  // Verification step state — mock: any non-empty code/number "verifies" instantly,
  // since there's no real SMS/UIDAI backend in this demo.
  const [phoneNumber, setPhoneNumber] = useState('98765 43210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const verificationUserId = currentUserId || (selectedRole === 'worker' ? 'worker_1' : 'emp_1');
  const verificationComplete = selectedRole === 'worker' ? otpVerified && aadhaarVerified : otpVerified;

  const handleSendOtp = () => {
    if (!phoneNumber.trim()) return;
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (otpValue.trim().length < 4) {
      setVerifyError(t('onboarding.otpInvalid'));
      return;
    }
    setVerifyError(null);
    setOtpVerified(true);
    updateUser(verificationUserId, { phone: phoneNumber.trim() });
  };

  const handleVerifyAadhaar = () => {
    if (aadhaarNumber.replace(/\s/g, '').length < 12) {
      setVerifyError(t('onboarding.aadhaarInvalid'));
      return;
    }
    setVerifyError(null);
    setAadhaarVerified(true);
    updateUser(verificationUserId, { verified: true });
  };

  const handleNext = () => {
    if (step === 0) {
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!verificationComplete) {
        setVerifyError(
          selectedRole === 'worker' ? t('onboarding.verifyBothNeeded') : t('onboarding.verifyPhoneNeeded')
        );
        return;
      }
      if (selectedRole === 'worker') {
        setStep(4);
      } else {
        // Employer finished
        completeOnboarding('employer');
        navigate('/my-jobs');
      }
    } else if (step === 4) {
      // Worker finished
      updateProfile('worker_1', {
        trade: selectedTrade,
        radiusKm: selectedRadius,
        availableToday,
      });
      completeOnboarding('worker');
      navigate('/jobs');
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col justify-between max-w-md mx-auto p-4 sm:p-6 select-none">
      {/* Brand Header */}
      <div className="pt-4 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-tier-2 mb-2">
          <span className="text-headline-md font-extrabold text-accent">च</span>
        </div>
        <h1 className="text-headline-lg font-extrabold text-on-surface">
          {language === 'hi' ? APP_NAME_DEVANAGARI : APP_NAME}
        </h1>
        <p className="text-body-md text-text-secondary mt-1 max-w-xs mx-auto">
          {t('onboarding.tagline')}
        </p>
      </div>

      {/* Step Contents */}
      <div className="my-auto py-6">
        {step === 0 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <h2 className="text-headline-sm font-bold text-center text-on-surface">
              {t('onboarding.chooseLanguage')}
            </h2>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`p-6 rounded-card border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 min-h-[120px] ${
                  language === 'hi'
                    ? 'border-secondary bg-white shadow-md ring-4 ring-secondary/15'
                    : 'border-border-subtle bg-surface-card'
                }`}
              >
                <span className="text-3xl font-extrabold text-primary">हिन्दी</span>
                <span className="text-body-md text-text-secondary font-semibold">Hindi</span>
                {language === 'hi' && (
                  <CheckCircle2 className="w-5 h-5 text-secondary mt-1" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`p-6 rounded-card border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 min-h-[120px] ${
                  language === 'en'
                    ? 'border-secondary bg-white shadow-md ring-4 ring-secondary/15'
                    : 'border-border-subtle bg-surface-card'
                }`}
              >
                <span className="text-3xl font-extrabold text-primary">English</span>
                <span className="text-body-md text-text-secondary font-semibold">English</span>
                {language === 'en' && (
                  <CheckCircle2 className="w-5 h-5 text-secondary mt-1" />
                )}
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <h2 className="text-headline-sm font-bold text-center text-on-surface">
              {t('onboarding.chooseRole')}
            </h2>

            <Card
              interactive
              onClick={() => setSelectedRole('worker')}
              className={`border-2 p-4 flex items-start gap-3.5 transition-all ${
                selectedRole === 'worker'
                  ? 'border-secondary bg-white shadow-md ring-2 ring-secondary/20'
                  : 'border-border-subtle'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-title-lg font-bold text-on-surface">
                    {t('onboarding.roleWorker')}
                  </h3>
                  {selectedRole === 'worker' && (
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                  )}
                </div>
                <p className="text-body-sm text-text-secondary mt-1">
                  {t('onboarding.roleWorkerSub')}
                </p>
              </div>
            </Card>

            <Card
              interactive
              onClick={() => setSelectedRole('employer')}
              className={`border-2 p-4 flex items-start gap-3.5 transition-all ${
                selectedRole === 'employer'
                  ? 'border-secondary bg-white shadow-md ring-2 ring-secondary/20'
                  : 'border-border-subtle'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-title-lg font-bold text-on-surface">
                    {t('onboarding.roleEmployer')}
                  </h3>
                  {selectedRole === 'employer' && (
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                  )}
                </div>
                <p className="text-body-sm text-text-secondary mt-1">
                  {t('onboarding.roleEmployerSub')}
                </p>
              </div>
            </Card>
          </div>
        )}

        {step === 2 && selectedRole === 'worker' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <h2 className="text-headline-sm font-bold text-center text-on-surface">
              {t('onboarding.chooseTrade')}
            </h2>
            <div className="grid grid-cols-2 gap-3 mt-1">
              {AVAILABLE_TRADES.map((trade) => {
                const isSelected = selectedTrade === trade.id;
                return (
                  <button
                    key={trade.id}
                    type="button"
                    onClick={() => setSelectedTrade(trade.id)}
                    className={`p-4 rounded-card border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 min-h-[96px] ${
                      isSelected
                        ? 'border-secondary bg-white shadow-md ring-2 ring-secondary/20 text-secondary'
                        : 'border-border-subtle bg-surface-card text-on-surface hover:border-secondary/40'
                    }`}
                  >
                    <span className="shrink-0">{TRADE_ICONS[trade.id]}</span>
                    <span className="text-body-md font-bold text-on-surface">
                      {language === 'hi' ? trade.labelHi : trade.labelEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && selectedRole === 'employer' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <h2 className="text-headline-sm font-bold text-center text-on-surface">
              Employer Details
            </h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-label-md font-bold text-text-secondary block mb-1">
                  Your name / Company
                </label>
                <input
                  type="text"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  className="w-full min-h-[54px] px-4 rounded-button bg-white border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-lg text-on-surface"
                  placeholder="Rajesh Singhania"
                />
              </div>
              <div>
                <label className="text-label-md font-bold text-text-secondary block mb-1">
                  Default location
                </label>
                <input
                  type="text"
                  value={employerLocation}
                  onChange={(e) => setEmployerLocation(e.target.value)}
                  className="w-full min-h-[54px] px-4 rounded-button bg-white border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-lg text-on-surface"
                  placeholder="Greater Kailash, New Delhi"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <h2 className="text-headline-sm font-bold text-center text-on-surface">
              {t('onboarding.verifyTitle')}
            </h2>

            {/* Phone / OTP verification — both roles */}
            <div className="flex flex-col gap-2.5">
              <label className="text-label-md font-bold text-text-secondary flex items-center gap-1.5">
                <Phone className="w-4 h-4" />
                {t('onboarding.phoneLabel')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setOtpSent(false);
                    setOtpVerified(false);
                  }}
                  disabled={otpVerified}
                  className="flex-1 min-h-[54px] px-4 rounded-button bg-white border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-lg text-on-surface disabled:bg-surface-canvas disabled:text-text-secondary"
                  placeholder="98765 43210"
                />
                {!otpVerified && (
                  <Button
                    variant="secondary"
                    onClick={handleSendOtp}
                    icon={<Send className="w-4 h-4" />}
                    className="shrink-0 min-h-[54px]"
                  >
                    {otpSent ? t('onboarding.resendOtp') : t('onboarding.sendOtp')}
                  </Button>
                )}
              </div>

              {otpVerified ? (
                <div className="flex items-center gap-2 p-3 rounded-card bg-success/10 border border-success/30 text-success font-bold text-body-md">
                  <CheckCircle2 className="w-5 h-5" />
                  {t('onboarding.phoneVerified')}
                </div>
              ) : (
                otpSent && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value)}
                      maxLength={4}
                      className="flex-1 min-h-[54px] px-4 rounded-button bg-white border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-lg text-on-surface tabular-nums tracking-[0.3em]"
                      placeholder={t('onboarding.otpPlaceholder')}
                    />
                    <Button
                      variant="primary"
                      onClick={handleVerifyOtp}
                      className="shrink-0 min-h-[54px]"
                      icon={<ShieldCheck className="w-4 h-4 text-[#111B21]" />}
                    >
                      {t('onboarding.verify')}
                    </Button>
                  </div>
                )
              )}
            </div>

            {/* Aadhaar verification — worker only, builds the trust badge employers see */}
            {selectedRole === 'worker' && (
              <div className="flex flex-col gap-2.5 pt-3 border-t border-border-subtle">
                <label className="text-label-md font-bold text-text-secondary flex items-center gap-1.5">
                  <IdCard className="w-4 h-4" />
                  {t('onboarding.aadhaarLabel')}
                </label>
                <p className="text-body-sm text-text-secondary -mt-1">{t('onboarding.aadhaarHelp')}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={aadhaarNumber}
                    onChange={(e) => setAadhaarNumber(e.target.value)}
                    disabled={aadhaarVerified}
                    maxLength={14}
                    className="flex-1 min-h-[54px] px-4 rounded-button bg-white border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-lg text-on-surface tabular-nums disabled:bg-surface-canvas disabled:text-text-secondary"
                    placeholder="XXXX XXXX XXXX"
                  />
                  {!aadhaarVerified && (
                    <Button
                      variant="primary"
                      onClick={handleVerifyAadhaar}
                      className="shrink-0 min-h-[54px]"
                      icon={<ShieldCheck className="w-4 h-4 text-[#111B21]" />}
                    >
                      {t('onboarding.verify')}
                    </Button>
                  )}
                </div>
                {aadhaarVerified && (
                  <div className="flex items-center gap-2 p-3 rounded-card bg-success/10 border border-success/30 text-success font-bold text-body-md">
                    <CheckCircle2 className="w-5 h-5" />
                    {t('onboarding.aadhaarVerified')}
                  </div>
                )}
              </div>
            )}

            {verifyError && <p className="text-body-sm text-danger font-semibold">{verifyError}</p>}
          </div>
        )}

        {step === 4 && selectedRole === 'worker' && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-headline-sm font-bold text-on-surface mb-1">
                {t('onboarding.setRadius')}
              </h2>
              <p className="text-body-sm text-text-secondary mb-3">
                {t('onboarding.radiusLabel')}: {selectedRadius} km
              </p>
              <div className="flex flex-wrap gap-2">
                {RADIUS_OPTIONS.map((radius) => (
                  <Chip
                    key={radius}
                    label={`${radius} km`}
                    selected={selectedRadius === radius}
                    onClick={() => setSelectedRadius(radius)}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <h2 className="text-headline-sm font-bold text-on-surface mb-3">
                {t('onboarding.availability')}
              </h2>
              <div className="grid grid-cols-1 gap-2.5">
                <Card
                  interactive
                  onClick={() => setAvailableToday(true)}
                  className={`border-2 p-3.5 flex items-center justify-between ${
                    availableToday ? 'border-secondary bg-white ring-2 ring-secondary/20' : 'border-border-subtle'
                  }`}
                >
                  <span className="text-body-lg font-bold text-on-surface">
                    {t('onboarding.availableYes')}
                  </span>
                  {availableToday && <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />}
                </Card>
                <Card
                  interactive
                  onClick={() => setAvailableToday(false)}
                  className={`border-2 p-3.5 flex items-center justify-between ${
                    !availableToday ? 'border-secondary bg-white ring-2 ring-secondary/20' : 'border-border-subtle'
                  }`}
                >
                  <span className="text-body-lg font-bold text-on-surface">
                    {t('onboarding.availableNo')}
                  </span>
                  {!availableToday && <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />}
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Button */}
      <div className="pt-4 border-t border-border-subtle/50">
        <Button
          fullWidth
          size="lg"
          variant="primary"
          onClick={handleNext}
          iconRight={<ArrowRight className="w-5 h-5" />}
        >
          {step === 0 ? t('common.confirm') : t('onboarding.getStarted')}
        </Button>
      </div>
    </div>
  );
};
