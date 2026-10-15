import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNegotiation } from '../state/NegotiationContext';
import { useJobs } from '../../worker-jobs/state/JobsContext';
import { useProfile } from '../../profile/state/ProfileContext';
import { useMockAuthSession } from '../../../hooks/useMockAuthSession';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TopBar } from '../../../design-system/components/TopBar';
import { Button } from '../../../design-system/components/Button';
import { BottomSheet } from '../../../design-system/components/BottomSheet';
import { ReportBlockMenu } from '../../../design-system/components/ReportBlockMenu';
import { VoiceButton } from '../../../design-system/components/VoiceButton';
import { MessageBubble } from '../components/MessageBubble';
import { OfferCard } from '../components/OfferCard';
import { VoiceNoteBubble } from '../components/VoiceNoteBubble';
import { formatCurrency } from '../../../utils/currency';
import { formatMessageTime } from '../../../utils/time';
import {
  Send,
  Lock,
  Handshake,
  CheckCircle2,
  Shield,
  CreditCard,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Banknote,
} from 'lucide-react';

export const NegotiationThreadScreen: React.FC = () => {
  const { threadId } = useParams<{ threadId: string }>();
  const { t } = useLanguage();
  const { currentUserId, currentRole } = useMockAuthSession();
  const {
    getThreadById,
    sendMessage,
    sendCounterOffer,
    lockTerms,
    refreshThreads,
  } = useNegotiation();
  const { getJobById, refreshJobs } = useJobs();
  const { getUser } = useProfile();
  const navigate = useNavigate();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const thread = getThreadById(threadId || '');
  const job = thread ? getJobById(thread.jobId) : undefined;

  const otherUserId = thread
    ? currentUserId === thread.workerId
      ? thread.employerId
      : thread.workerId
    : undefined;
  const otherUser = otherUserId ? getUser(otherUserId) : undefined;

  // Local composer states
  const [textInput, setTextInput] = useState('');
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [counterAmount, setCounterAmount] = useState<number>(thread?.currentOfferAmount || 500);
  const [showConfirmationSummary, setShowConfirmationSummary] = useState(false);

  // Terms customization for lock step
  const [agreedTime, setAgreedTime] = useState('Tomorrow 10:00 AM');
  const [agreedPayment, setAgreedPayment] = useState<'same_day' | 'on_completion'>('same_day');

  // Check agreement condition:
  // Both sides have agreed if latest offer matches or was accepted
  const latestOffer = useMemo(() => {
    if (!thread) return 500;
    const offerMsgs = thread.messages.filter((m) => m.type === 'offer');
    if (offerMsgs.length === 0) return thread.currentOfferAmount;
    return offerMsgs[offerMsgs.length - 1].offerAmount || thread.currentOfferAmount;
  }, [thread]);

  const canConfirmTerms = useMemo(() => {
    if (!thread || thread.locked) return false;
    // If there is an offer proposal on table and at least 2 messages exchanged
    return thread.messages.length >= 2;
  }, [thread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages]);

  if (!thread || !job) {
    return (
      <div className="min-h-screen bg-surface-canvas p-6 text-center max-w-md mx-auto">
        <p className="text-body-lg text-text-secondary">Negotiation thread not found.</p>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">
          Go back
        </Button>
      </div>
    );
  }

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    sendMessage(thread.id, currentRole, textInput.trim());
    setTextInput('');
  };

  const handleSendVoice = (mockUrl: string) => {
    sendMessage(thread.id, currentRole, 'Audio voice note', mockUrl);
  };

  const handleSendCounter = () => {
    if (!counterAmount || counterAmount <= 0) return;
    sendCounterOffer(thread.id, currentRole, counterAmount);
    setShowCounterInput(false);
  };

  const handleAcceptThisOffer = (amount: number) => {
    // Post acceptance message and open confirmation summary
    sendMessage(thread.id, currentRole, `I accept the offer of ₹${amount}. Let's finalize terms!`);
    setShowConfirmationSummary(true);
  };

  const handleLockAgreement = () => {
    lockTerms(thread.id, {
      price: thread.currentOfferAmount || latestOffer,
      time: agreedTime,
      paymentMethod: agreedPayment,
    });
    refreshJobs();
    refreshThreads();
    setShowConfirmationSummary(false);
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col max-w-md mx-auto select-none">
      {/* Top Bar with Context */}
      <TopBar
        title={otherUser?.name || t('negotiation.chatTitle')}
        showBack
        onBack={() => navigate(-1)}
      />

      {/* Subheader: Job Trade Context & Private Notice */}
      <div className="bg-white border-b border-border-subtle p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
            <span className="text-body-md font-extrabold text-on-surface truncate">
              {otherUser?.name}
            </span>
            <span className="text-xs text-text-secondary shrink-0">({job.trade})</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-primary">
              Job anchor: {formatCurrency(job.suggestedPrice)}
            </span>
            {otherUserId && (
              <ReportBlockMenu
                targetUserId={otherUserId}
                targetUserName={otherUser?.name}
                context="negotiation"
                contextId={thread.id}
                onBlocked={() => navigate(currentRole === 'worker' ? '/jobs' : '/my-jobs')}
              />
            )}
          </div>
        </div>

        {/* Small non-alarming notice per §9 Flow E */}
        <p className="text-[11px] text-text-secondary mt-1 flex items-center gap-1">
          <Shield className="w-3 h-3 text-secondary" />
          <span>{t('negotiation.parallelNote')}</span>
        </p>
      </div>

      {/* Locked Terms Banner (if thread locked) */}
      {thread.locked && (
        <div className="bg-success/15 border-b border-success/30 p-3 flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-title-md font-bold text-success">
                {t('negotiation.lockedBanner')}
              </h4>
              <span className="text-title-lg font-extrabold text-accent tabular-nums">
                {formatCurrency(thread.lockedTerms?.price || thread.currentOfferAmount)}
              </span>
            </div>
            <p className="text-body-sm text-text-secondary mt-0.5">
              {t('negotiation.lockedSub')}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs font-bold text-on-surface">
              <span>📅 {thread.lockedTerms?.time || 'Scheduled'}</span>
              <span>💵 {thread.lockedTerms?.paymentMethod || 'Same day cash/UPI'}</span>
            </div>
            <p className="flex items-start gap-1.5 mt-2 text-[11px] text-text-secondary">
              <Banknote className="w-3.5 h-3.5 text-secondary shrink-0 mt-0.5" />
              <span>{t('negotiation.honourDisclosure')}</span>
            </p>
            <button
              type="button"
              onClick={() => navigate(`/job-execution/${job.id}`)}
              className="mt-2 text-xs font-bold text-primary underline flex items-center gap-1"
            >
              Go to job progress tracker <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
        {thread.messages.map((msg) => {
          const isMe = msg.sender === currentRole;
          const time = formatMessageTime(msg.createdAt);

          if (msg.type === 'offer') {
            return (
              <OfferCard
                key={msg.id}
                amount={msg.offerAmount || thread.currentOfferAmount}
                text={msg.text}
                senderName={otherUser?.name || 'Other Party'}
                isMe={isMe}
                timeString={time}
                isLocked={thread.locked}
                onAcceptOffer={() => handleAcceptThisOffer(msg.offerAmount || thread.currentOfferAmount)}
              />
            );
          }

          if (msg.type === 'voice') {
            return <VoiceNoteBubble key={msg.id} isMe={isMe} timeString={time} />;
          }

          return <MessageBubble key={msg.id} text={msg.text || ''} isMe={isMe} timeString={time} />;
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Current Offer Card & Confirm Button (Pinned just above composer per §9 Flow E) */}
      {!thread.locked && (
        <div className="sticky bottom-[72px] z-20 px-3 py-2 bg-surface-card border-t border-border-subtle shadow-tier-2 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent/20 text-[#111B21] flex items-center justify-center font-bold">
                ₹
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-text-secondary uppercase">
                  {t('negotiation.currentOffer')}
                </span>
                <span className="text-title-lg font-extrabold text-accent tabular-nums">
                  {formatCurrency(thread.currentOfferAmount)}
                </span>
              </div>
            </div>

            {/* Counter offer button affordance */}
            <button
              type="button"
              onClick={() => setShowCounterInput(!showCounterInput)}
              className="px-3 py-1.5 rounded-pill bg-white border border-secondary text-secondary font-bold text-body-sm active:scale-95 shadow-xs flex items-center gap-1"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('negotiation.counterAffordance')}</span>
            </button>
          </div>

          {/* Inline Counter Proposal Input */}
          {showCounterInput && (
            <div className="p-2.5 rounded-card bg-surface-canvas border border-secondary/40 flex items-center gap-2 animate-in fade-in">
              <span className="text-body-md font-bold text-on-surface">₹</span>
              <input
                type="number"
                step="50"
                value={counterAmount}
                onChange={(e) => setCounterAmount(Number(e.target.value))}
                className="w-28 min-h-[44px] px-2 rounded-button bg-white border border-border-subtle font-extrabold text-on-surface tabular-nums text-body-lg"
              />
              <Button size="sm" variant="primary" onClick={handleSendCounter} className="flex-1 min-h-[44px]">
                {t('negotiation.counterButton')}
              </Button>
            </div>
          )}

          {/* Full-width Confirm Terms Button: becomes active once agreement reached */}
          <Button
            variant="primary"
            fullWidth
            size="lg"
            disabled={!canConfirmTerms}
            onClick={() => setShowConfirmationSummary(true)}
            icon={<Lock className="w-5 h-5 text-[#111B21]" />}
          >
            {t('negotiation.confirmTerms')} ({formatCurrency(thread.currentOfferAmount)})
          </Button>
        </div>
      )}

      {/* Composer (Text input + Mic button) */}
      <footer className="sticky bottom-0 z-30 p-2.5 bg-white border-t border-border-subtle shadow-tier-2 flex items-center gap-2">
        <form onSubmit={handleSendText} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={
              thread.locked
                ? 'Chat for directions and arrival...'
                : t('negotiation.typeMessage')
            }
            className="flex-1 min-h-[50px] px-4 rounded-button bg-surface-canvas border border-border-subtle focus:border-secondary focus:ring-1 focus:ring-secondary text-body-md text-on-surface"
          />

          {textInput.trim() ? (
            <button
              type="submit"
              aria-label="Send message"
              className="w-12 h-12 rounded-full bg-accent text-[#111B21] flex items-center justify-center font-bold active:scale-95 shadow-sm"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <VoiceButton isCompact onRecordingComplete={handleSendVoice} />
          )}
        </form>
      </footer>

      {/* Confirmation Summary Sheet */}
      {showConfirmationSummary && (
        <BottomSheet
          isOpen={showConfirmationSummary}
          onClose={() => setShowConfirmationSummary(false)}
          title={t('negotiation.summaryTitle')}
        >
          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-card bg-secondary/10 border border-secondary/30 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-secondary">
                  {t('negotiation.summaryPrice')}
                </span>
                <p className="text-2xl font-extrabold text-accent tabular-nums">
                  {formatCurrency(thread.currentOfferAmount)}
                </p>
              </div>
              <Handshake className="w-8 h-8 text-secondary" />
            </div>

            <div>
              <label className="text-label-md font-bold text-on-surface block mb-1">
                {t('negotiation.summaryTime')}
              </label>
              <input
                type="text"
                value={agreedTime}
                onChange={(e) => setAgreedTime(e.target.value)}
                className="w-full min-h-[50px] px-3 rounded-button bg-surface-canvas border border-border-subtle text-body-md font-semibold text-on-surface"
              />
            </div>

            <div>
              <label className="text-label-md font-bold text-on-surface block mb-1">
                {t('negotiation.summaryPayment')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAgreedPayment('same_day')}
                  className={`p-2.5 rounded-button text-xs font-bold border transition-all ${
                    agreedPayment === 'same_day'
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-border-subtle bg-white text-on-surface'
                  }`}
                >
                  Same day cash/UPI
                </button>
                <button
                  type="button"
                  onClick={() => setAgreedPayment('on_completion')}
                  className={`p-2.5 rounded-button text-xs font-bold border transition-all ${
                    agreedPayment === 'on_completion'
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-border-subtle bg-white text-on-surface'
                  }`}
                >
                  On completion
                </button>
              </div>
            </div>

            <p className="text-xs text-text-secondary">
              Once confirmed, terms cannot be altered. Both parties receive confirmation on Chowk.
            </p>

            <div className="p-2.5 rounded-card bg-secondary/10 border border-secondary/20 flex items-start gap-2">
              <Banknote className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
              <p className="text-xs text-secondary font-medium">
                {t('negotiation.honourDisclosure')}
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleLockAgreement}
                icon={<CheckCircle2 className="w-5 h-5 text-[#111B21]" />}
              >
                {t('negotiation.confirmAgreement')}
              </Button>
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  );
};
