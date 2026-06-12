// src/lib/i18n/index.ts
import { en } from './translations/en';
import { bn } from './translations/bn';

export type Language = 'en' | 'bn';

export const translations = {
  en,
  bn,
} as const;

export type TranslationKeys = typeof en;

export const getTranslations = (language: Language): TranslationKeys => {
  return translations[language];
};

export const DEFAULT_LANGUAGE: Language = 'en';

// Get language from localStorage or system preference
export const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    // Check localStorage first
    const stored = localStorage.getItem('app_language');
    if (stored === 'en' || stored === 'bn') {
      return stored;
    }
    
    // Check browser language preference
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'bn' || browserLang === 'বন') {
      return 'bn';
    }
  }
  
  return DEFAULT_LANGUAGE;
};

// Save language preference
export const saveLanguagePreference = (language: Language): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_language', language);
  }
};
