import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language } from '../data/types';
import { LOCAL_STORAGE_KEYS } from '../config/constants';
import enTranslations from './en.json';
import hiTranslations from './hi.json';

const translationsRecord: Record<Language, Record<string, any>> = {
  en: enTranslations,
  hi: hiTranslations,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (keyPath: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.LANG);
      if (saved === 'en' || saved === 'hi') {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read language preference:', e);
    }
    return 'hi'; // Default friendly default for domestic trades / onboarding
  });

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LANG, newLang);
      document.documentElement.lang = newLang;
    } catch (e) {
      console.warn('Could not save language preference:', e);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (keyPath: string, variables?: Record<string, string | number>): string => {
      const dict = translationsRecord[language] || translationsRecord.en;
      const parts = keyPath.split('.');
      let current: any = dict;

      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          // Fallback to English if missing in target language
          let fallback: any = translationsRecord.en;
          for (const fallbackPart of parts) {
            if (fallback && typeof fallback === 'object' && fallbackPart in fallback) {
              fallback = fallback[fallbackPart];
            } else {
              fallback = null;
              break;
            }
          }
          current = fallback !== null ? fallback : keyPath;
          break;
        }
      }

      if (typeof current !== 'string') {
        return keyPath;
      }

      if (variables) {
        return Object.entries(variables).reduce((str, [k, v]) => {
          return str.replace(new RegExp(`{${k}}`, 'g'), String(v));
        }, current);
      }

      return current;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
