import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Film,
  FileText,
  MapPin,
  ShieldAlert,
  User as UserIcon,
  Briefcase,
  Plus,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMockAuthSession } from '../../hooks/useMockAuthSession';

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();
  const { currentRole } = useMockAuthSession();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  if (currentRole === 'worker') {
    const workerTabs = [
      {
        path: '/jobs',
        label: t('nav.jobs'),
        icon: Film,
      },
      {
        path: '/quotes',
        label: t('nav.quotes'),
        icon: FileText,
      },
      {
        path: '/chowk',
        label: t('nav.chowk'),
        icon: MapPin,
      },
      {
        path: '/rights',
        label: t('nav.rights'),
        icon: ShieldAlert,
      },
      {
        path: '/profile',
        label: t('nav.me'),
        icon: UserIcon,
      },
    ];

    return (
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-subtle shadow-tier-2 flex items-center justify-around h-16 max-w-md mx-auto"
        aria-label="Worker navigation"
      >
        {workerTabs.map((tab) => {
          const isActive = currentPath === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center h-full py-1 min-w-[48px] select-none transition-all active:scale-95 ${
                isActive ? 'text-secondary font-bold' : 'text-text-secondary hover:text-on-surface'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4px]' : 'stroke-[1.8px]'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-secondary rounded-full" />
                )}
              </div>
              <span className="text-[11px] mt-1 truncate max-w-[64px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Employer navigation: 5 tabs with big center post action
  const employerTabs = [
    {
      path: '/my-jobs',
      label: t('nav.myJobs'),
      icon: Briefcase,
    },
    {
      path: '/discover-workers',
      label: t('nav.discover'),
      icon: Compass,
    },
    {
      path: '/post-job',
      label: t('nav.post'),
      icon: Plus,
      isCenterAction: true,
    },
    {
      path: '/messages',
      label: t('nav.messages'),
      icon: MessageSquare,
    },
    {
      path: '/profile',
      label: t('nav.me'),
      icon: UserIcon,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-subtle shadow-tier-2 flex items-center justify-around h-16 max-w-md mx-auto"
      aria-label="Employer navigation"
    >
      {employerTabs.map((tab) => {
        const isActive = currentPath === tab.path;
        const Icon = tab.icon;

        if (tab.isCenterAction) {
          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              className="flex-1 flex flex-col items-center justify-center relative -top-3 min-w-[56px] select-none active:scale-95"
            >
              <div className="w-14 h-14 rounded-full bg-accent text-[#111B21] shadow-tier-2 flex items-center justify-center border-4 border-white transition-transform hover:scale-105">
                <Plus className="w-7 h-7 stroke-[2.6px]" />
              </div>
              <span className="text-[11px] font-bold text-on-surface mt-0.5">{tab.label}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => navigate(tab.path)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center h-full py-1 min-w-[48px] select-none transition-all active:scale-95 ${
              isActive ? 'text-secondary font-bold' : 'text-text-secondary hover:text-on-surface'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'scale-110 stroke-[2.4px]' : 'stroke-[1.8px]'
                }`}
              />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-secondary rounded-full" />
              )}
            </div>
            <span className="text-[11px] mt-1 truncate max-w-[64px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
