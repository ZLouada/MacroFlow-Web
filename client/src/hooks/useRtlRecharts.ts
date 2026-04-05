import { useLanguage } from '@/lib/i18n';

/**
 * Hook to dynamically adjust Recharts components for RTL languages.
 * Returns the correct 'orientation' prop for YAxis components.
 */
export function useRtlRecharts() {
  const { currentLanguage, languages } = useLanguage();
  const isRtl = languages[currentLanguage]?.dir === 'rtl';

  return {
    isRtl,
    yAxisOrientation: isRtl ? ('right' as const) : ('left' as const),
    margin: isRtl
      ? { top: 5, right: 30, left: 20, bottom: 5 } // inverted margins
      : { top: 5, right: 20, left: 30, bottom: 5 },
  };
}
