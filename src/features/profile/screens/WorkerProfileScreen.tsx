import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useProfile } from '../state/ProfileContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { Toggle } from '../../../design-system/components/Toggle';
import { Chip } from '../../../design-system/components/Chip';
import { RADIUS_OPTIONS } from '../../../config/constants';
import {
  User,
  Star,
  Briefcase,
  MapPin,
  ShieldCheck,
  Video,
  Wallet,
  Repeat,
  Phone,
  CheckCircle2,
  Play,
  UserRound,
  LifeBuoy,
} from 'lucide-react';

export const WorkerProfileScreen: React.FC = () => {
  const { t } = useLanguage();
  const { currentUserId, currentRole, switchRole, resetOnboarding } = useMockAuthSession();
  const { getProfile, getUser, updateProfile, setAvailability, setRadius } = useProfile();
  const navigate = useNavigate();

  const user = getUser(currentUserId);
  const profile = getProfile(currentUserId);

  const [isEditingRadius, setIsEditingRadius] = useState(false);
  const [emergencyName, setEmergencyName] = useState(profile?.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergencyContactPhone || '');

  const handleRoleSwitch = () => {
    switchRole(currentRole === 'worker' ? 'employer' : 'worker');
    if (currentRole === 'worker') {
      navigate('/my-jobs');
    } else {
      navigate('/jobs');
    }
  };

  const handleRadiusChange = (newRadius: number) => {
    setRadius(currentUserId, newRadius);
    setIsEditingRadius(false);
  };

  return (
    <div className="min-h-screen bg-surface-canvas pb-24 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={t('profile.title')} />

      <main className="p-4 flex-1 flex flex-col gap-4">
        {/* Profile Header Card */}
        <Card className="p-4 bg-white border-border-subtle shadow-tier-1 flex flex-col gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-primary/10 border-2 border-secondary shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-headline-sm text-primary">
                  {user?.name?.[0] || 'U'}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-headline-sm font-extrabold text-on-surface truncate">
                  {user?.name || 'Ramesh Kumar'}
                </h2>
                {user?.verified && <Badge type="verified" />}
              </div>

              <div className="flex items-center gap-2 text-body-sm text-text-secondary mt-0.5">
                <span className="capitalize font-bold text-secondary">
                  {currentRole === 'worker' ? profile?.trade || 'Plumber' : 'Employer'}
                </span>
                <span>•</span>
                <span className="tabular-nums flex items-center gap-1 font-bold text-on-surface">
                  <Star className="w-3.5 h-3.5 text-trust-amber fill-current" />
                  {profile?.rating || 4.9}
                </span>
                <span>•</span>
                <span className="tabular-nums">{profile?.jobsCompleted || 142} jobs</span>
              </div>

              <span className="text-xs text-text-secondary mt-0.5 block">
                {user?.locationLabel || 'Lajpat Nagar, New Delhi'}
              </span>
            </div>
          </div>

          {/* Skill Certified Trust Badge */}
          <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
            <Badge type="skillCertified" label="NSDC Skill Certified" />
            <span className="text-xs text-text-secondary font-semibold">
              {profile?.experienceYears || 8} years experience
            </span>
          </div>
        </Card>

        {/* Mock Role Switcher per §6 */}
        <div className="p-3.5 rounded-card bg-secondary/10 border border-secondary/30 flex items-center justify-between">
          <div className="flex flex-col pr-2">
            <span className="text-title-md font-bold text-on-surface">
              {currentRole === 'worker'
                ? t('profile.switchRolePrompt')
                : t('profile.switchBackToWorker')}
            </span>
            <span className="text-xs text-text-secondary mt-0.5">
              Active role: {currentRole === 'worker' ? 'Worker' : 'Employer'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRoleSwitch}
            className="px-3.5 py-2 rounded-pill bg-secondary text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 shadow-sm shrink-0"
          >
            <Repeat className="w-4 h-4" />
            <span>Switch</span>
          </button>
        </div>

        {/* Worker Controls: Availability & Radius */}
        {currentRole === 'worker' && (
          <Card className="p-4 bg-white border-border-subtle shadow-tier-1 flex flex-col gap-3">
            <Toggle
              checked={profile?.availableToday ?? true}
              onChange={(val) => setAvailability(currentUserId, val)}
              label={t('profile.todayAvailability')}
              sublabel="Show profile as active on Chowk map today"
            />

            <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
              <div>
                <span className="text-body-md font-bold text-on-surface block">
                  {t('profile.radiusSetting')}
                </span>
                <span className="text-body-sm text-text-secondary">
                  Current: {profile?.radiusKm || 10} km
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingRadius(!isEditingRadius)}
                className="text-xs font-bold text-secondary underline"
              >
                {isEditingRadius ? 'Done' : 'Change'}
              </button>
            </div>

            {isEditingRadius && (
              <div className="flex flex-wrap gap-2 pt-1 animate-in fade-in">
                {RADIUS_OPTIONS.map((r) => (
                  <Chip
                    key={r}
                    label={`${r} km`}
                    selected={profile?.radiusKm === r}
                    onClick={() => handleRadiusChange(r)}
                  />
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Women's safety — self-ID unlocks an optional safety mode */}
        {currentRole === 'worker' && (
          <Card className="p-4 bg-white border-border-subtle shadow-tier-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <LifeBuoy className="w-4 h-4 text-secondary" />
              <h3 className="text-title-md font-bold text-on-surface">{t('profile.safetyTitle')}</h3>
            </div>

            <Toggle
              checked={profile?.isWoman ?? false}
              onChange={(val) => updateProfile(currentUserId, { isWoman: val, safetyMode: val ? profile?.safetyMode : false })}
              label={t('profile.isWomanLabel')}
              sublabel={t('profile.isWomanHelp')}
            />

            {profile?.isWoman && (
              <>
                <div className="pt-2 border-t border-border-subtle">
                  <Toggle
                    checked={profile?.safetyMode ?? false}
                    onChange={(val) => updateProfile(currentUserId, { safetyMode: val })}
                    label={t('profile.safetyModeLabel')}
                    sublabel={t('profile.safetyModeHelp')}
                  />
                </div>

                {profile?.safetyMode && (
                  <div className="flex flex-col gap-2.5 pt-2 border-t border-border-subtle">
                    <label className="text-label-md font-bold text-text-secondary">
                      {t('profile.emergencyContact')}
                    </label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      onBlur={() => updateProfile(currentUserId, { emergencyContactName: emergencyName })}
                      placeholder={t('profile.emergencyNamePlaceholder')}
                      className="w-full min-h-[48px] px-3.5 rounded-button bg-surface-canvas border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-md text-on-surface"
                    />
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      onBlur={() => updateProfile(currentUserId, { emergencyContactPhone: emergencyPhone })}
                      placeholder={t('profile.emergencyPhonePlaceholder')}
                      className="w-full min-h-[48px] px-3.5 rounded-button bg-surface-canvas border-[1.5px] border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-md text-on-surface tabular-nums"
                    />
                    <p className="text-[11px] text-text-secondary">{t('profile.emergencyContactHelp')}</p>
                  </div>
                )}
              </>
            )}
          </Card>
        )}

        {/* Earnings Diary Shortcut Card */}
        {currentRole === 'worker' && (
          <Card
            interactive
            onClick={() => navigate('/diary')}
            className="p-3.5 bg-white border-border-subtle shadow-tier-1 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 text-[#111B21] flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-title-md font-bold text-on-surface">
                  {t('profile.diarySummary')}
                </h3>
                <span className="text-xs text-text-secondary">Track payments and dues</span>
              </div>
            </div>
            <Button size="sm" variant="outline">
              {t('profile.viewDiary')}
            </Button>
          </Card>
        )}

        {/* Work Reel Portfolio Grid */}
        {currentRole === 'worker' && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-title-lg font-bold text-on-surface">
                {t('profile.portfolioTitle')}
              </h3>
              <span className="text-xs text-secondary font-bold">2 videos</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {profile?.portfolioReels?.map((reel) => (
                <div
                  key={reel.id}
                  className="relative aspect-[9/14] rounded-card overflow-hidden bg-black shadow-tier-1 group cursor-pointer"
                  onClick={() => alert(`Playing portfolio video: ${reel.caption}`)}
                >
                  <img
                    src={reel.thumbUrl}
                    alt={reel.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center text-white/90">
                    <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <p className="absolute bottom-2 inset-x-2 text-white text-[11px] font-semibold line-clamp-2">
                    {reel.caption}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset Onboarding Walkthrough (Demo Helper) */}
        <div className="pt-2 pb-4 text-center">
          <button
            type="button"
            onClick={() => {
              resetOnboarding();
              navigate('/onboarding');
            }}
            className="text-xs text-text-secondary/70 hover:text-text-secondary underline"
          >
            Restart onboarding walkthrough
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
