import React, { useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useProfile } from '../state/ProfileContext';
import { getUsers, isBlocked } from '../../../data/repository';
import { TopBar } from '../../../design-system/components/TopBar';
import { BottomNav } from '../../../design-system/components/BottomNav';
import { Button } from '../../../design-system/components/Button';
import { AVAILABLE_TRADES } from '../../../config/constants';
import {
  Star,
  Briefcase,
  Users,
  UserCheck,
  ThumbsUp,
  ChevronRight,
  RotateCcw,
  ChevronsDown,
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  BrickWall,
  HardHat,
} from 'lucide-react';

const TRADE_ICONS: Record<string, React.ReactNode> = {
  plumber: <Wrench className="w-full h-full" strokeWidth={1.25} />,
  electrician: <Zap className="w-full h-full" strokeWidth={1.25} />,
  carpenter: <Hammer className="w-full h-full" strokeWidth={1.25} />,
  painter: <Paintbrush className="w-full h-full" strokeWidth={1.25} />,
  mason: <BrickWall className="w-full h-full" strokeWidth={1.25} />,
  labourer: <HardHat className="w-full h-full" strokeWidth={1.25} />,
};

const TRADE_GRADIENTS: Record<string, string> = {
  plumber: 'from-[#0B4A6F] via-[#075E54] to-[#0B2B26]',
  electrician: 'from-[#5C4200] via-[#8C6D1F] to-[#1A1300]',
  carpenter: 'from-[#4A2E14] via-[#6B4423] to-[#1C1008]',
  painter: 'from-[#5A1540] via-[#8C2F63] to-[#1F0A17]',
  mason: 'from-[#2E3A40] via-[#4A5A60] to-[#10161A]',
  labourer: 'from-[#14532D] via-[#128C7E] to-[#0B2B26]',
};

export const DiscoverWorkersScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUserId } = useMockAuthSession();
  const { getProfile, isFollowing, getFollowerCount, toggleFollow } = useProfile();
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const workers = useMemo(() => {
    return getUsers().filter(
      (u) =>
        u.roles.includes('worker') &&
        u.id !== currentUserId &&
        !isBlocked(currentUserId, u.id)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  const getItemHeight = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return 0;
    const firstItem = container.firstElementChild as HTMLElement | null;
    return firstItem?.clientHeight || container.clientHeight;
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      const itemHeight = getItemHeight();
      if (!container || !itemHeight) return;
      container.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
    },
    [getItemHeight]
  );

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    const itemHeight = getItemHeight();
    if (!container || !itemHeight) return;
    const index = Math.round(container.scrollTop / itemHeight);
    setActiveIndex((prev) => (prev === index ? prev : index));
  }, [getItemHeight]);

  return (
    <div className="relative w-full max-w-md mx-auto h-[100dvh] flex flex-col bg-[#111B21] overflow-hidden select-none">
      <TopBar title={t('discover.title')} />

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex-1 w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth pb-16 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {workers.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-surface-canvas">
            <p className="text-body-md text-text-secondary">{t('discover.empty')}</p>
          </div>
        ) : (
          workers.map((worker, index) => {
            const profile = getProfile(worker.id);
            const tradeMeta = AVAILABLE_TRADES.find((trade) => trade.id === profile?.trade);
            const tradeLabel = tradeMeta
              ? language === 'hi'
                ? tradeMeta.labelHi
                : tradeMeta.labelEn
              : profile?.trade;
            const thumb = profile?.portfolioReels?.[0]?.thumbUrl;
            const gradient = TRADE_GRADIENTS[profile?.trade || ''] || TRADE_GRADIENTS.labourer;
            const following = isFollowing(currentUserId, worker.id);
            const followerCount = getFollowerCount(worker.id);

            return (
              <div key={worker.id} className="w-full h-full snap-start snap-always">
                <div className="relative w-full h-full text-white flex flex-col overflow-hidden">
                  {/* Backdrop — a real portfolio photo when one exists, else the trade gradient */}
                  {thumb ? (
                    <div className="absolute inset-0 z-0 bg-[#111B21]">
                      <img src={thumb} alt={worker.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-b from-[#111B21]/70 via-transparent to-[#111B21]/95" />
                    </div>
                  ) : (
                    <div className={`absolute inset-0 z-0 bg-gradient-to-br ${gradient}`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 text-white/10" aria-hidden="true">
                          {TRADE_ICONS[profile?.trade || ''] || TRADE_ICONS.labourer}
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-b from-[#111B21]/70 via-transparent to-[#111B21]/95" />
                    </div>
                  )}

                  {/* Top stack */}
                  <div className="relative z-10 flex flex-col gap-2 p-4 pt-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-pill bg-primary text-white font-bold text-label-md shadow-md border border-white/20 capitalize">
                        {tradeLabel}
                      </span>
                    </div>
                    {index === 0 && activeIndex === 0 && workers.length > 1 && (
                      <div className="flex justify-center pointer-events-none">
                        <div className="flex items-center gap-1 px-3 py-1 rounded-pill bg-black/40 backdrop-blur-md text-white/80 text-[11px] font-semibold animate-bounce">
                          <ChevronsDown className="w-3.5 h-3.5" />
                          {t('workerJobs.swipeHint')}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom info + actions, one in-flow stack */}
                  <div className="relative z-10 mt-auto flex flex-col gap-3 p-4 pt-10 bg-gradient-to-t from-[#111B21] via-[#111B21]/90 to-transparent">
                    <h2 className="text-headline-sm font-extrabold text-white">{worker.name}</h2>

                    <div className="flex items-center gap-3 text-body-sm text-white/90">
                      <span className="inline-flex items-center gap-1 font-bold tabular-nums">
                        <Star className="w-4 h-4 text-trust-amber fill-current" />
                        {profile?.rating}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Briefcase className="w-3.5 h-3.5" />
                        {t('discover.jobsCount', { count: profile?.jobsCompleted || 0 })}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Users className="w-3.5 h-3.5" />
                        {t('discover.followersCount', { count: followerCount })}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant={following ? 'secondary' : 'primary'}
                        className="flex-1 bg-white/90"
                        onClick={() => toggleFollow(currentUserId, worker.id)}
                        icon={
                          following ? (
                            <UserCheck className="w-5 h-5 text-secondary" />
                          ) : (
                            <ThumbsUp className="w-5 h-5 text-[#111B21]" />
                          )
                        }
                      >
                        {following ? t('profile.following') : t('profile.follow')}
                      </Button>
                      <Button
                        variant="primary"
                        className="flex-1 shadow-tier-2"
                        onClick={() => navigate(`/worker/${worker.id}`)}
                        icon={<ChevronRight className="w-5 h-5 text-[#111B21]" />}
                      >
                        {t('discover.viewProfile')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {workers.length > 0 && (
          <div className="w-full h-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center bg-surface-canvas">
            <div className="w-16 h-16 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-4">
              <RotateCcw className="w-8 h-8" />
            </div>
            <h2 className="text-headline-sm font-bold text-on-surface mb-2">{t('discover.endTitle')}</h2>
            <Button variant="secondary" onClick={() => scrollToIndex(0)}>
              {t('common.browseAgain')}
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};
