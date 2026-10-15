import React, { useState } from 'react';
import { Volume2, VolumeX, UserCheck } from 'lucide-react';
import { APP_NAME, APP_NAME_DEVANAGARI } from '../../config/constants';
import { useLanguage } from '../../i18n/LanguageContext';
import { useMockAuthSession } from '../../hooks/useMockAuthSession';
import { useNavigate } from 'react-router-dom';

export interface TopBarProps {
  title?: string;
  readAloudText?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  readAloudText,
  showBack = false,
  onBack,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { currentRole } = useMockAuthSession();
  const navigate = useNavigate();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleReadAloud = () => {
    // TODO: wire TTS with full local Indic voice model when backend is integrated
    console.log('[Chowk TopBar] Read aloud triggered for content:', readAloudText || title || APP_NAME);

    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const textToSpeak =
        readAloudText ||
        (language === 'hi'
          ? `चौक ऐप। ${title || 'काम और कारीगर सेतु'}`
          : `Chowk app. ${title || 'Work and skilled trades network'}`);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.95;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="sticky top-0 z-40 bg-primary text-white h-14 px-3 flex items-center justify-between shadow-tier-2 select-none border-b border-[#064e46]">
      {/* Left: App Logo/Name or Back Button */}
      <div className="flex items-center gap-2 min-w-0">
        {showBack ? (
          <button
            type="button"
            onClick={onBack || (() => navigate(-1))}
            className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg hover:bg-white/10 active:scale-95 text-white"
            aria-label={t('common.back')}
          >
            <span className="text-body-lg font-bold">←</span>
            <span className="text-body-md font-semibold truncate">{title || t('common.back')}</span>
          </button>
        ) : (
          <div
            onClick={() => navigate(currentRole === 'worker' ? '/jobs' : '/my-jobs')}
            className="flex items-center gap-2 cursor-pointer py-1"
            role="button"
            tabIndex={0}
            aria-label={`${APP_NAME} home`}
          >
            <div className="w-8 h-8 rounded-lg bg-accent text-[#111B21] flex items-center justify-center font-extrabold text-title-lg shadow-sm">
              च
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-title-lg tracking-tight leading-none text-white">
                {language === 'hi' ? APP_NAME_DEVANAGARI : APP_NAME}
              </span>
              <span className="text-[10px] text-accent font-medium leading-none tracking-wider uppercase mt-0.5">
                {currentRole === 'worker' ? 'Worker' : 'Employer'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right controls: 🔊 listen button · language toggle (EN · हिं) · profile avatar */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* 🔊 Speaker / Listen Button */}
        <button
          type="button"
          onClick={handleReadAloud}
          aria-label={t('common.listen')}
          title={t('common.listen')}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-pill text-body-sm font-semibold transition-colors ${
            isSpeaking
              ? 'bg-accent text-[#111B21] animate-pulse ring-2 ring-accent/50'
              : 'bg-white/10 text-white hover:bg-white/20 active:scale-95'
          }`}
        >
          {isSpeaking ? (
            <VolumeX className="w-4 h-4 shrink-0 text-[#111B21]" />
          ) : (
            <Volume2 className="w-4 h-4 shrink-0" />
          )}
          <span className="text-xs hidden sm:inline">{t('common.listen')}</span>
        </button>

        {/* Language Toggle (EN · हिं) as two tappable segments */}
        <div
          className="inline-flex items-center bg-[#054039] p-0.5 rounded-pill border border-white/15"
          role="group"
          aria-label="Language selection"
        >
          <button
            type="button"
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
            className={`px-2 py-1 rounded-pill text-xs font-bold transition-all min-h-[30px] ${
              language === 'en'
                ? 'bg-accent text-[#111B21] shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            EN
          </button>
          <span className="text-white/40 text-xs px-0.5 select-none">·</span>
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            aria-pressed={language === 'hi'}
            className={`px-2 py-1 rounded-pill text-xs font-bold transition-all min-h-[30px] ${
              language === 'hi'
                ? 'bg-accent text-[#111B21] shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            हिं
          </button>
        </div>

        {/* Profile Avatar / Quick Switcher */}
        <button
          type="button"
          onClick={handleProfileClick}
          aria-label="Profile and settings"
          className="w-9 h-9 rounded-full bg-secondary text-white border-2 border-white/30 flex items-center justify-center font-bold text-xs hover:border-accent active:scale-95 transition-all overflow-hidden"
        >
          <UserCheck className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
