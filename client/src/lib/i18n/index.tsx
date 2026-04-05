import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Import translations
import enTranslations from '@/locales/en';
import frTranslations from '@/locales/fr';
import arTranslations from '@/locales/ar';

// Supported languages configuration - Only EN (US), FR (France), AR (Saudi Arabia)
export const SUPPORTED_LANGUAGES = {
  en: { 
    name: 'English', 
    dir: 'ltr', 
    nativeName: 'English',
    flag: 'US',
    flagEmoji: '\u{1F1FA}\u{1F1F8}', // US flag
  },
  fr: { 
    name: 'French', 
    dir: 'ltr', 
    nativeName: 'Francais',
    flag: 'FR',
    flagEmoji: '\u{1F1EB}\u{1F1F7}', // France flag
  },
  ar: { 
    name: 'Arabic', 
    dir: 'rtl', 
    nativeName: '\u{0627}\u{0644}\u{0639}\u{0631}\u{0628}\u{064A}\u{0629}',
    flag: 'SA',
    flagEmoji: '\u{1F1F8}\u{1F1E6}', // Saudi Arabia flag
  },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      fr: { translation: frTranslations },
      ar: { translation: arTranslations },
    },
    fallbackLng: 'en',
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'macroflow-language',
    },
  });

// Hook to get current language direction
export function useLanguageDirection() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language as SupportedLanguage;
  return SUPPORTED_LANGUAGES[currentLang]?.dir || 'ltr';
}

// Hook to change language and update document direction
export function useLanguage() {
  const { i18n } = useTranslation();

  const changeLanguage = async (lang: SupportedLanguage) => {
    await i18n.changeLanguage(lang);
    const dir = SUPPORTED_LANGUAGES[lang].dir;
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  };

  return {
    currentLanguage: i18n.language as SupportedLanguage,
    changeLanguage,
    languages: SUPPORTED_LANGUAGES,
  };
}

// Provider component to handle RTL setup
interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { i18n } = useTranslation();

  // Set initial direction on mount and when language changes
  useEffect(() => {
    const currentLang = i18n.language as SupportedLanguage;
    const langConfig = SUPPORTED_LANGUAGES[currentLang];

    if (langConfig) {
      document.documentElement.dir = langConfig.dir;
      document.documentElement.lang = currentLang;
    }

    const handleLanguageChange = (lng: string) => {
      const config = SUPPORTED_LANGUAGES[lng as SupportedLanguage];
      if (config) {
        document.documentElement.dir = config.dir;
        document.documentElement.lang = lng;
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return <>{children}</>;
}

export default i18n;
