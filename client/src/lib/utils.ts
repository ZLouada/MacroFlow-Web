import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for scroll/resize handlers
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Format date relative to now (for i18n, use with translations)
 */
export function getRelativeTimeKey(
  date: Date
): { key: string; count?: number } {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return { key: 'time.justNow' };
  if (diffMins < 60) return { key: 'time.minutesAgo', count: diffMins };
  if (diffHours < 24) return { key: 'time.hoursAgo', count: diffHours };
  if (diffDays < 7) return { key: 'time.daysAgo', count: diffDays };

  return { key: 'time.daysAgo', count: diffDays };
}

/**
 * Check if we're in RTL mode
 */
export function isRTL(): boolean {
  return document.documentElement.dir === 'rtl';
}

/**
 * Get logical direction-aware transform for animations
 */
export function getDirectionalTransform(value: number): string {
  const direction = isRTL() ? -1 : 1;
  return `translateX(${value * direction}px)`;
}
