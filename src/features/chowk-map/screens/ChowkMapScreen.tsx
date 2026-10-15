import React, { useState } from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useProfile } from '../../profile/state/ProfileContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { Card } from '../../../design-system/components/Card';
import { Toggle } from '../../../design-system/components/Toggle';
import { Badge } from '../../../design-system/components/Badge';
import {
  MapPin,
  Users,
  Briefcase,
  Compass,
  Navigation,
  Crosshair,
  TrendingUp,
} from 'lucide-react';

export const ChowkMapScreen: React.FC = () => {
  const { t } = useLanguage();
  const { currentUserId } = useMockAuthSession();
  const { getProfile, setAvailability } = useProfile();

  const profile = getProfile(currentUserId);
  const [mapMode, setMapMode] = useState<'find' | 'give'>('find');
  const [isFreeToday, setIsFreeToday] = useState(profile?.availableToday ?? true);

  const handleToggleAvailability = (checked: boolean) => {
    setIsFreeToday(checked);
    setAvailability(currentUserId, checked);
  };

  // Mock pins on the illustrated map canvas
  const pins = [
    { id: 'pin_1', label: '₹650', trade: 'Plumber', top: '35%', left: '42%', active: true },
    { id: 'pin_2', label: '₹800', trade: 'Electrician', top: '22%', left: '68%', active: true },
    { id: 'pin_3', label: '₹500', trade: 'Carpenter', top: '58%', left: '30%', active: false },
    { id: 'pin_4', label: '₹1200', trade: 'Painter', top: '72%', left: '60%', active: true },
    { id: 'pin_5', label: '₹450', trade: 'Plumber', top: '48%', left: '78%', active: true },
  ];

  return (
    <div className="min-h-screen bg-surface-canvas pb-20 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={t('chowkMap.title')} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Control Bar: Mode Toggle ('Find work' / 'Give work') */}
        <div className="p-3 bg-white border-b border-border-subtle shadow-xs z-10 flex items-center justify-between">
          <div
            className="inline-flex p-1 bg-surface-canvas rounded-pill border border-border-subtle"
            role="group"
          >
            <button
              type="button"
              onClick={() => setMapMode('find')}
              className={`px-4 py-1.5 rounded-pill text-body-md font-bold transition-all ${
                mapMode === 'find'
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              {t('chowkMap.findWork')}
            </button>
            <button
              type="button"
              onClick={() => setMapMode('give')}
              className={`px-4 py-1.5 rounded-pill text-body-md font-bold transition-all ${
                mapMode === 'give'
                  ? 'bg-secondary text-white shadow-sm'
                  : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              {t('chowkMap.giveWork')}
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-text-secondary">
            <Compass className="w-4 h-4 text-primary" />
            <span>Delhi / NCR Chowk</span>
          </div>
        </div>

        {/* Map Canvas (Illustrated map graphic with SVG streets, radial range circle, and pins) */}
        <div className="relative flex-1 w-full min-h-[380px] bg-[#E5ECE9] overflow-hidden">
          {/* Simulated Map Streets & Grid SVG */}
          <svg
            className="absolute inset-0 w-full h-full opacity-60"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#C4D1CB" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            {/* Major Arterial Roads */}
            <path
              d="M -20 180 Q 150 220 450 140"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 160 -20 Q 220 200 180 500"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 0 350 L 400 280"
              fill="none"
              stroke="#FFF8E7"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>

          {/* Worker's Radius as a Visible Circle per §9 Flow I */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border-2 border-secondary/40 bg-secondary/10 pointer-events-none flex items-center justify-center">
            <span className="text-[11px] font-extrabold text-secondary bg-white/80 px-2.5 py-0.5 rounded-pill shadow-xs">
              {profile?.radiusKm || 10} km range
            </span>
          </div>

          {/* User's Center Location Beacon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-8 h-8 rounded-full bg-secondary/30 animate-ping" />
              <div className="w-5 h-5 rounded-full bg-secondary border-2 border-white shadow-md flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-white bg-primary px-2 py-0.5 rounded-pill shadow-sm mt-1">
              You are here
            </span>
          </div>

          {/* Absolutely Positioned Price-Bubble Pins */}
          {pins.map((pin) => (
            <div
              key={pin.id}
              style={{ top: pin.top, left: pin.left }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer group active:scale-95 transition-transform"
              onClick={() => alert(`Job hotspot: ${pin.trade} (${pin.label})`)}
            >
              <div className="relative flex flex-col items-center">
                <div className="px-2.5 py-1 rounded-pill bg-accent text-[#111B21] font-extrabold text-xs shadow-tier-2 flex items-center gap-1 border border-white tabular-nums">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>{pin.label}</span>
                </div>
                {/* Pointer tail */}
                <div className="w-2 h-2 bg-accent rotate-45 -mt-1 shadow-xs border-r border-b border-white" />
              </div>
            </div>
          ))}

          {/* Floating Re-center button */}
          <button
            type="button"
            onClick={() => alert('GPS centered on your current trade location')}
            aria-label="Re-center map"
            className="absolute top-3 right-3 z-20 w-11 h-11 rounded-full bg-white text-on-surface shadow-tier-2 flex items-center justify-center border border-border-subtle active:scale-95"
          >
            <Navigation className="w-5 h-5 text-secondary" />
          </button>
        </div>

        {/* Bottom Overlay Summary Card */}
        <div className="p-3 bg-white border-t border-border-subtle shadow-tier-2 z-20 flex flex-col gap-2.5">
          {/* "I'm free today" Toggle (mirrors profile's availableToday) */}
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
            <Toggle
              checked={isFreeToday}
              onChange={handleToggleAvailability}
              label={t('chowkMap.availableSwitch')}
              sublabel="Instant notification when employers post in your radius"
            />
          </div>

          {/* Area Activity Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-body-md font-extrabold text-on-surface">
                  {t('chowkMap.workersNearbyCount')}
                </span>
                <span className="text-body-sm text-text-secondary">
                  {t('chowkMap.jobsNearbyCount')}
                </span>
              </div>
            </div>

            <Badge type="verified" label="Live GPS" />
          </div>

          <p className="text-[11px] text-text-secondary italic">
            {t('chowkMap.hotspots')}
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
