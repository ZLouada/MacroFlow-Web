import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { SupportedLanguage, useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'inline' | 'compact';
  showFlag?: boolean;
  showNativeName?: boolean;
  className?: string;
}

// Language flags (using emoji for simplicity, could be replaced with flag icons)
const languageFlags: Record<SupportedLanguage, string> = {
  en: '🇺🇸',
  fr: '🇫🇷',
  ar: '🇸🇦',
};

/**
 * LanguageSwitcher Component
 * 
 * A reusable component for switching languages with automatic RTL support.
 * Supports dropdown, inline buttons, and compact modes.
 */
export function LanguageSwitcher({
  variant = 'dropdown',
  showFlag = true,
  showNativeName = true,
  className,
}: LanguageSwitcherProps) {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const { t } = useTranslation();

  const handleLanguageChange = useCallback(
    async (lang: SupportedLanguage) => {
      await changeLanguage(lang);
    },
    [changeLanguage]
  );

  const currentLangConfig = languages[currentLanguage];
  const languageList = Object.entries(languages) as [SupportedLanguage, typeof languages[SupportedLanguage]][];

  if (variant === 'inline') {
    return (
      <div className={cn('flex gap-2', className)} role="group" aria-label={t('settings.language')}>
        {languageList.map(([code, config]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-all',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              currentLanguage === code
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'text-gray-600 dark:text-gray-400'
            )}
            aria-pressed={currentLanguage === code}
            aria-label={config.name}
          >
            {showFlag && <span className="me-2">{languageFlags[code]}</span>}
            <span>{showNativeName ? config.nativeName : config.name}</span>
          </button>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex gap-1', className)} role="group" aria-label={t('settings.language')}>
        {languageList.map(([code, config]) => (
          <button
            key={code}
            onClick={() => handleLanguageChange(code)}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-primary-500',
              currentLanguage === code
                ? 'bg-primary-100 ring-2 ring-primary-500 dark:bg-primary-900'
                : ''
            )}
            aria-pressed={currentLanguage === code}
            aria-label={config.name}
            title={config.nativeName}
          >
            {languageFlags[code]}
          </button>
        ))}
      </div>
    );
  }

  // Default: dropdown variant
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
            'hover:bg-gray-50 dark:hover:bg-gray-700',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            'transition-all text-sm font-medium',
            className
          )}
          aria-label={t('settings.language')}
        >
          <Globe className="w-4 h-4 text-gray-500" />
          {showFlag && <span>{languageFlags[currentLanguage]}</span>}
          <span className="hidden sm:inline">
            {showNativeName ? currentLangConfig?.nativeName : currentLangConfig?.name}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>
      </DropdownMenu.Trigger>

      <AnimatePresence>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            asChild
            sideOffset={8}
            align="end"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'min-w-[180px] bg-white dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'rounded-lg shadow-lg overflow-hidden z-50'
              )}
            >
              <div className="p-1">
                {languageList.map(([code, config]) => (
                  <DropdownMenu.Item
                    key={code}
                    onSelect={() => handleLanguageChange(code)}
                    className={cn(
                      'flex items-center justify-between gap-3 px-3 py-2 rounded-md cursor-pointer',
                      'outline-none transition-colors',
                      'hover:bg-gray-100 dark:hover:bg-gray-700',
                      'focus:bg-gray-100 dark:focus:bg-gray-700',
                      currentLanguage === code && 'bg-primary-50 dark:bg-primary-900/30'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {showFlag && <span className="text-lg">{languageFlags[code]}</span>}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {config.nativeName}
                        </span>
                        {showNativeName && config.nativeName !== config.name && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {config.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {currentLanguage === code && (
                      <Check className="w-4 h-4 text-primary-500" />
                    )}
                  </DropdownMenu.Item>
                ))}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {currentLangConfig?.dir === 'rtl' ? 'RTL' : 'LTR'} • {currentLangConfig?.name}
                </p>
              </div>
            </motion.div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </AnimatePresence>
    </DropdownMenu.Root>
  );
}

// Hook for programmatic language/direction control
export function useRTL() {
  const { currentLanguage, languages } = useLanguage();
  const isRTL = languages[currentLanguage]?.dir === 'rtl';
  
  return {
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr',
    currentLanguage,
  };
}

// Utility component for conditional RTL/LTR content
interface DirectionalProps {
  children: React.ReactNode;
  rtl?: React.ReactNode;
  ltr?: React.ReactNode;
}

export function Directional({ children, rtl, ltr }: DirectionalProps) {
  const { isRTL } = useRTL();
  
  if (rtl && ltr) {
    return <>{isRTL ? rtl : ltr}</>;
  }
  
  return <>{children}</>;
}

// CSS utility classes for RTL-aware styling
export const rtlClasses = {
  // Margins
  ms: 'ms-', // margin-start (left in LTR, right in RTL)
  me: 'me-', // margin-end
  // Paddings
  ps: 'ps-', // padding-start
  pe: 'pe-', // padding-end
  // Positioning
  start: 'start-', // left in LTR, right in RTL
  end: 'end-',
  // Text alignment
  textStart: 'text-start',
  textEnd: 'text-end',
  // Flex direction
  flexRowReverse: 'rtl:flex-row-reverse',
};

export default LanguageSwitcher;
