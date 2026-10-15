import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../i18n/LanguageContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useProfile } from '../state/ProfileContext';
import { getReviewsForUser } from '../../../data/repository';
import { TopBar } from '../../../design-system/components/TopBar';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { ReportBlockMenu } from '../../../design-system/components/ReportBlockMenu';
import { AVAILABLE_TRADES } from '../../../config/constants';
import {
  Star,
  Briefcase,
  Users,
  Phone,
  Play,
  UserPlus,
  UserCheck,
  MessageSquareQuote,
} from 'lucide-react';

export const WorkerPublicProfileScreen: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const { t, language } = useLanguage();
  const { currentUserId } = useMockAuthSession();
  const { getUser, getProfile, isFollowing, getFollowerCount, toggleFollow } = useProfile();
  const navigate = useNavigate();

  const user = getUser(workerId || '');
  const profile = getProfile(workerId || '');
  const reviews = useMemo(() => getReviewsForUser(workerId || ''), [workerId]);

  const tradeMeta = AVAILABLE_TRADES.find((trade) => trade.id === profile?.trade);
  const tradeLabel = tradeMeta ? (language === 'hi' ? tradeMeta.labelHi : tradeMeta.labelEn) : profile?.trade;

  const following = isFollowing(currentUserId, workerId || '');
  const followerCount = getFollowerCount(workerId || '');

  // Group the portfolio grid into labeled sections by `category`, so different
  // kinds of work (e.g. "Repairs" vs "Installations") get their own box
  // instead of one undifferentiated grid.
  const portfolioSections = useMemo(() => {
    const sections = new Map<string, NonNullable<typeof profile>['portfolioReels']>();
    (profile?.portfolioReels || []).forEach((reel) => {
      const key = reel.category || t('profile.generalWork');
      if (!sections.has(key)) sections.set(key, []);
      sections.get(key)!.push(reel);
    });
    return Array.from(sections.entries());
  }, [profile, t]);

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-surface-canvas p-6 text-center max-w-md mx-auto">
        <p className="text-body-lg text-text-secondary">{t('profile.workerNotFound')}</p>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">
          {t('common.back')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-canvas pb-10 select-none max-w-md mx-auto flex flex-col">
      <TopBar title={user.name} showBack onBack={() => navigate(-1)} />

      <main className="p-4 flex-1 flex flex-col gap-4">
        {/* Header — jobs done + rating sit right up top, next to the name, per spec */}
        <Card className="p-4 bg-white border-border-subtle shadow-tier-1 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-secondary flex items-center justify-center font-bold text-headline-sm text-primary shrink-0">
                {user.name[0]}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-headline-sm font-extrabold text-on-surface truncate">
                    {user.name}
                  </h2>
                  {user.verified && <Badge type="verified" />}
                </div>
                <span className="text-body-sm font-bold text-secondary capitalize">{tradeLabel}</span>
              </div>
            </div>
            <ReportBlockMenu
              targetUserId={user.id}
              targetUserName={user.name}
              context="worker_profile"
              contextId={user.id}
              onBlocked={() => navigate(-1)}
            />
          </div>

          {/* Jobs done + rating + followers — all up top, big numbers */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle">
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-title-lg font-extrabold text-on-surface tabular-nums">
                <Star className="w-4 h-4 text-trust-amber fill-current" />
                {profile.rating}
              </span>
              <span className="text-[11px] text-text-secondary font-semibold">{t('profile.rating')}</span>
            </div>
            <div className="flex flex-col items-center border-x border-border-subtle">
              <span className="flex items-center gap-1 text-title-lg font-extrabold text-on-surface tabular-nums">
                <Briefcase className="w-4 h-4 text-secondary" />
                {profile.jobsCompleted}
              </span>
              <span className="text-[11px] text-text-secondary font-semibold">{t('profile.jobsDone')}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-title-lg font-extrabold text-on-surface tabular-nums">
                <Users className="w-4 h-4 text-secondary" />
                {followerCount}
              </span>
              <span className="text-[11px] text-text-secondary font-semibold">{t('profile.followers')}</span>
            </div>
          </div>

          {/* Follow + Call */}
          <div className="flex items-center gap-2">
            <Button
              variant={following ? 'secondary' : 'primary'}
              fullWidth
              onClick={() => toggleFollow(currentUserId, user.id)}
              icon={
                following ? (
                  <UserCheck className="w-4 h-4 text-secondary" />
                ) : (
                  <UserPlus className="w-4 h-4 text-[#111B21]" />
                )
              }
            >
              {following ? t('profile.following') : t('profile.follow')}
            </Button>
            <Button variant="outline" fullWidth icon={<Phone className="w-4 h-4 text-on-surface" />}>
              {t('profile.call')}
            </Button>
          </div>
        </Card>

        {/* Categorized work-reel portfolio — one box per category */}
        {portfolioSections.length > 0 && (
          <div className="flex flex-col gap-4">
            {portfolioSections.map(([category, reels]) => (
              <div key={category} className="flex flex-col gap-2">
                <h3 className="text-title-md font-bold text-on-surface">{category}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {reels.map((reel) => (
                    <div
                      key={reel.id}
                      className="relative aspect-[9/14] rounded-card overflow-hidden bg-black shadow-tier-1 cursor-pointer"
                    >
                      <img
                        src={reel.thumbUrl}
                        alt={reel.caption}
                        className="w-full h-full object-cover"
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
            ))}
          </div>
        )}

        {/* Reviews — below the fold, letterboxd-style: rating + note per entry */}
        <div className="flex flex-col gap-2">
          <h3 className="text-title-lg font-bold text-on-surface flex items-center gap-1.5">
            <MessageSquareQuote className="w-4 h-4 text-secondary" />
            {t('profile.reviews')}
          </h3>
          {reviews.length === 0 ? (
            <p className="text-body-sm text-text-secondary">{t('profile.noReviewsYet')}</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {reviews.map((review) => (
                <Card key={review.id} className="p-3 bg-white border-border-subtle shadow-tier-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating ? 'text-trust-amber fill-current' : 'text-border-subtle'
                        }`}
                      />
                    ))}
                    {review.paidOnTime && (
                      <span className="text-[11px] font-bold text-success ml-1">
                        {t('profile.paidOnTime')}
                      </span>
                    )}
                  </div>
                  {review.note && <p className="text-body-sm text-on-surface">{review.note}</p>}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
