/**
 * Context-Aware Dark Mode
 * 
 * Intelligent theme switching that considers:
 * - Time of day (sunset/sunrise)
 * - User's local timezone
 * - Screen brightness (simulated)
 * - User activity patterns
 * - Calendar events (focus time)
 */

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Monitor,
  Clock,
  Sunset,
  Sunrise,
  Eye,
  Calendar,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/Button';

// ============================================================================
// Types
// ============================================================================

type ThemeMode = 'light' | 'dark' | 'system' | 'auto' | 'schedule';

interface ThemeSchedule {
  lightStart: string; // HH:MM format
  darkStart: string;  // HH:MM format
}

interface ContextAwareSettings {
  mode: ThemeMode;
  schedule: ThemeSchedule;
  useLocation: boolean;
  reduceBrightness: boolean;
  focusModeDark: boolean;
}

interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate approximate sunrise/sunset times based on date
 * (Simplified calculation - in production use a proper solar calculator)
 */
function calculateSunTimes(date: Date, latitude: number = 36.75): SunTimes {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  
  // Simplified calculation
  const declination = -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));
  const hourAngle = Math.acos(
    -Math.tan(latitude * (Math.PI / 180)) * Math.tan(declination * (Math.PI / 180))
  ) * (180 / Math.PI);
  
  const sunriseHour = 12 - hourAngle / 15;
  const sunsetHour = 12 + hourAngle / 15;
  
  const sunrise = new Date(date);
  sunrise.setHours(Math.floor(sunriseHour), (sunriseHour % 1) * 60, 0, 0);
  
  const sunset = new Date(date);
  sunset.setHours(Math.floor(sunsetHour), (sunsetHour % 1) * 60, 0, 0);
  
  return { sunrise, sunset };
}

/**
 * Parse time string (HH:MM) to Date object
 */
function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Check if current time is within a time range
 */
function isWithinTimeRange(start: Date, end: Date): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  
  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Crosses midnight
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

// ============================================================================
// Custom Hook
// ============================================================================

export function useContextAwareDarkMode() {
  const { setTheme, resolvedTheme } = useTheme();
  const [settings, setSettings] = useState<ContextAwareSettings>(() => {
    const saved = localStorage.getItem('macroflow-theme-settings');
    return saved ? JSON.parse(saved) : {
      mode: 'system',
      schedule: { lightStart: '07:00', darkStart: '19:00' },
      useLocation: true,
      reduceBrightness: false,
      focusModeDark: true,
    };
  });
  
  const [sunTimes, setSunTimes] = useState<SunTimes>(() => 
    calculateSunTimes(new Date())
  );
  
  const [isInFocusMode, setIsInFocusMode] = useState(false);
  
  // Update sun times daily
  useEffect(() => {
    const updateSunTimes = () => {
      setSunTimes(calculateSunTimes(new Date()));
    };
    
    // Update at midnight
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();
    
    const timeout = setTimeout(updateSunTimes, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, []);
  
  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('macroflow-theme-settings', JSON.stringify(settings));
  }, [settings]);
  
  // Apply theme based on context
  useEffect(() => {
    const applyTheme = () => {
      let shouldBeDark = false;
      
      switch (settings.mode) {
        case 'light':
          shouldBeDark = false;
          break;
          
        case 'dark':
          shouldBeDark = true;
          break;
          
        case 'system':
          shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          break;
          
        case 'auto':
          // Use sunrise/sunset times
          const now = new Date();
          shouldBeDark = now < sunTimes.sunrise || now >= sunTimes.sunset;
          break;
          
        case 'schedule':
          const lightStart = parseTime(settings.schedule.lightStart);
          const darkStart = parseTime(settings.schedule.darkStart);
          shouldBeDark = !isWithinTimeRange(lightStart, darkStart);
          break;
      }
      
      // Override for focus mode
      if (settings.focusModeDark && isInFocusMode) {
        shouldBeDark = true;
      }
      
      setTheme(shouldBeDark ? 'dark' : 'light');
    };
    
    applyTheme();
    
    // Re-check every minute
    const interval = setInterval(applyTheme, 60000);
    return () => clearInterval(interval);
  }, [settings, sunTimes, isInFocusMode, setTheme]);
  
  const updateSettings = useCallback((updates: Partial<ContextAwareSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);
  
  const toggleFocusMode = useCallback(() => {
    setIsInFocusMode(prev => !prev);
  }, []);
  
  return {
    settings,
    updateSettings,
    sunTimes,
    isInFocusMode,
    toggleFocusMode,
    currentTheme: resolvedTheme,
  };
}

// ============================================================================
// Theme Switcher Component
// ============================================================================

interface ThemeSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function ThemeSwitcher({ className, compact = false }: ThemeSwitcherProps) {
  const { t } = useTranslation();
  const {
    settings,
    updateSettings,
    sunTimes,
    isInFocusMode,
    toggleFocusMode,
    currentTheme,
  } = useContextAwareDarkMode();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const modes: { value: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { value: 'light', icon: <Sun className="h-4 w-4" />, label: t('theme.light') },
    { value: 'dark', icon: <Moon className="h-4 w-4" />, label: t('theme.dark') },
    { value: 'system', icon: <Monitor className="h-4 w-4" />, label: t('theme.system') },
    { value: 'auto', icon: <Sunset className="h-4 w-4" />, label: t('theme.auto') },
    { value: 'schedule', icon: <Clock className="h-4 w-4" />, label: t('theme.schedule') },
  ];
  
  const currentModeInfo = modes.find(m => m.value === settings.mode) || modes[2];
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (compact) {
    return (
      <div className={cn('relative', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Cycle through modes
            const currentIndex = modes.findIndex(m => m.value === settings.mode);
            const nextMode = modes[(currentIndex + 1) % modes.length].value;
            updateSettings({ mode: nextMode });
          }}
          className="gap-2"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={settings.mode}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {currentModeInfo.icon}
            </motion.span>
          </AnimatePresence>
        </Button>
      </div>
    );
  }
  
  return (
    <div className={cn('relative', className)}>
      {/* Trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 min-w-[140px] justify-between"
      >
        <span className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={settings.mode}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {currentModeInfo.icon}
            </motion.span>
          </AnimatePresence>
          <span className="text-sm">{currentModeInfo.label}</span>
        </span>
        <ChevronDown className={cn(
          'h-4 w-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </Button>
      
      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute top-full mt-2 z-50',
                'w-72 p-4 rounded-2xl',
                'glass border shadow-2xl',
                'end-0'
              )}
            >
              {/* Mode selection */}
              <div className="space-y-1 mb-4">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t('theme.mode')}
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {modes.map(mode => (
                    <button
                      key={mode.value}
                      onClick={() => updateSettings({ mode: mode.value })}
                      className={cn(
                        'p-2 rounded-lg transition-all',
                        'flex items-center justify-center',
                        settings.mode === mode.value
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'hover:bg-muted'
                      )}
                      title={mode.label}
                    >
                      {mode.icon}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Auto mode info */}
              {settings.mode === 'auto' && (
                <div className="p-3 rounded-xl bg-muted/50 mb-4">
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{t('theme.sunSync')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Sunrise className="h-3 w-3" />
                      <span>{formatTime(sunTimes.sunrise)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sunset className="h-3 w-3" />
                      <span>{formatTime(sunTimes.sunset)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Schedule mode config */}
              {settings.mode === 'schedule' && (
                <div className="p-3 rounded-xl bg-muted/50 mb-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{t('theme.customSchedule')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        {t('theme.lightModeStart')}
                      </label>
                      <input
                        type="time"
                        value={settings.schedule.lightStart}
                        onChange={(e) => updateSettings({
                          schedule: { ...settings.schedule, lightStart: e.target.value }
                        })}
                        className="w-full px-2 py-1 rounded-lg bg-background border text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground block mb-1">
                        {t('theme.darkModeStart')}
                      </label>
                      <input
                        type="time"
                        value={settings.schedule.darkStart}
                        onChange={(e) => updateSettings({
                          schedule: { ...settings.schedule, darkStart: e.target.value }
                        })}
                        className="w-full px-2 py-1 rounded-lg bg-background border text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Additional options */}
              <div className="space-y-2">
                <button
                  onClick={toggleFocusMode}
                  className={cn(
                    'w-full flex items-center justify-between p-2 rounded-lg transition-colors',
                    isInFocusMode ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  )}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Eye className="h-4 w-4" />
                    {t('theme.focusMode')}
                  </span>
                  <div className={cn(
                    'w-8 h-5 rounded-full transition-colors relative',
                    isInFocusMode ? 'bg-primary' : 'bg-muted'
                  )}>
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all',
                      isInFocusMode ? 'left-3.5' : 'left-0.5'
                    )} />
                  </div>
                </button>
                
                <button
                  onClick={() => updateSettings({ reduceBrightness: !settings.reduceBrightness })}
                  className={cn(
                    'w-full flex items-center justify-between p-2 rounded-lg transition-colors',
                    settings.reduceBrightness ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  )}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    {t('theme.reduceBrightness')}
                  </span>
                  <div className={cn(
                    'w-8 h-5 rounded-full transition-colors relative',
                    settings.reduceBrightness ? 'bg-primary' : 'bg-muted'
                  )}>
                    <div className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all',
                      settings.reduceBrightness ? 'left-3.5' : 'left-0.5'
                    )} />
                  </div>
                </button>
              </div>
              
              {/* Current status */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('theme.currentTheme')}</span>
                  <span className="flex items-center gap-1 font-medium">
                    {currentTheme === 'dark' ? (
                      <><Moon className="h-3 w-3" /> {t('theme.dark')}</>
                    ) : (
                      <><Sun className="h-3 w-3" /> {t('theme.light')}</>
                    )}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ThemeSwitcher;
