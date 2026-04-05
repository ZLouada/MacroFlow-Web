import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface UseDebounceOptions {
  /** Debounce delay in milliseconds */
  delay?: number;
  /** Leading edge trigger - fire immediately on first call */
  leading?: boolean;
  /** Trailing edge trigger - fire after delay (default: true) */
  trailing?: boolean;
  /** Max wait time before forced execution */
  maxWait?: number;
}

export interface UseDebouncedSliderOptions<T> extends UseDebounceOptions {
  /** Callback for immediate visual updates (runs synchronously) */
  onVisualUpdate?: (value: T) => void;
  /** Callback for heavy computation (runs after debounce) */
  onDebouncedUpdate: (value: T) => void;
  /** Initial value */
  initialValue: T;
}

export interface UseDebouncedSliderReturn<T> {
  /** Current visual value (updates immediately) */
  value: T;
  /** Set value - updates visual immediately, debounces heavy computation */
  setValue: (value: T) => void;
  /** Whether a debounced update is pending */
  isPending: boolean;
  /** Force immediate execution of pending update */
  flush: () => void;
  /** Cancel pending update */
  cancel: () => void;
  /** Reset to initial value */
  reset: () => void;
}

// ============================================================================
// Basic Debounce Hook
// ============================================================================

/**
 * useDebounce
 * 
 * A basic debounce hook that returns a debounced value.
 * Updates are delayed until after the specified delay has passed
 * since the last change.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Debounced Callback Hook
// ============================================================================

/**
 * useDebouncedCallback
 * 
 * Returns a debounced version of the provided callback.
 * Supports leading/trailing edge triggers and max wait time.
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  options: UseDebounceOptions = {}
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  isPending: boolean;
  flush: () => void;
  cancel: () => void;
} {
  const { 
    delay = 300, 
    leading = false, 
    trailing = true,
    maxWait,
  } = options;

  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  const lastCallTimeRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const invokeCallback = useCallback(() => {
    if (lastArgsRef.current !== null) {
      const args = lastArgsRef.current as Parameters<T>;
      callbackRef.current(...args);
      lastArgsRef.current = null;
      setIsPending(false);
    }
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    lastArgsRef.current = null;
    setIsPending(false);
  }, []);

  const flush = useCallback(() => {
    cancel();
    invokeCallback();
  }, [cancel, invokeCallback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      lastArgsRef.current = args;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Leading edge
      if (leading && lastCallTimeRef.current === null) {
        invokeCallback();
        lastCallTimeRef.current = now;
        return;
      }

      setIsPending(true);
      lastCallTimeRef.current = now;

      // Set up max wait timeout if specified
      if (maxWait !== undefined && !maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          invokeCallback();
          maxTimeoutRef.current = null;
        }, maxWait);
      }

      // Trailing edge
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          invokeCallback();
          lastCallTimeRef.current = null;
          if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
            maxTimeoutRef.current = null;
          }
        }, delay);
      }
    },
    [delay, leading, trailing, maxWait, invokeCallback]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    debouncedCallback,
    isPending,
    flush,
    cancel,
  };
}

// ============================================================================
// Debounced Slider Hook (Main Feature)
// ============================================================================

/**
 * useDebouncedSlider
 * 
 * A specialized hook for slider inputs that maintains 60 FPS visual updates
 * while deferring heavy calculations (like equilibrium recalculations).
 * 
 * Key features:
 * - Immediate visual state updates (synced to RAF for 60 FPS)
 * - Debounced heavy computation callbacks
 * - Support for drag-end detection
 * - Flush/cancel controls
 * 
 * @example
 * ```tsx
 * const { value, setValue, isPending } = useDebouncedSlider({
 *   initialValue: 100,
 *   onVisualUpdate: (v) => setLocalDisplay(v), // Optional: extra visual callback
 *   onDebouncedUpdate: (v) => recalculateEquilibrium(v), // Heavy computation
 *   delay: 300,
 * });
 * 
 * return (
 *   <input
 *     type="range"
 *     value={value}
 *     onChange={(e) => setValue(Number(e.target.value))}
 *   />
 * );
 * ```
 */
export function useDebouncedSlider<T>({
  initialValue,
  onVisualUpdate,
  onDebouncedUpdate,
  delay = 300,
  leading = false,
  trailing = true,
  maxWait,
}: UseDebouncedSliderOptions<T>): UseDebouncedSliderReturn<T> {
  const [value, setValueState] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const latestValueRef = useRef<T>(initialValue);
  const onDebouncedUpdateRef = useRef(onDebouncedUpdate);
  const onVisualUpdateRef = useRef(onVisualUpdate);

  // Keep refs updated
  useEffect(() => {
    onDebouncedUpdateRef.current = onDebouncedUpdate;
    onVisualUpdateRef.current = onVisualUpdate;
  }, [onDebouncedUpdate, onVisualUpdate]);

  const invokeDebounced = useCallback(() => {
    onDebouncedUpdateRef.current(latestValueRef.current);
    setIsPending(false);
  }, []);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsPending(false);
  }, []);

  const flush = useCallback(() => {
    cancel();
    invokeDebounced();
  }, [cancel, invokeDebounced]);

  const reset = useCallback(() => {
    cancel();
    setValueState(initialValue);
    latestValueRef.current = initialValue;
    onDebouncedUpdateRef.current(initialValue);
  }, [cancel, initialValue]);

  const setValue = useCallback(
    (newValue: T) => {
      latestValueRef.current = newValue;

      // Use RAF for smooth 60 FPS visual updates
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        setValueState(newValue);
        onVisualUpdateRef.current?.(newValue);
        rafRef.current = null;
      });

      // Clear existing debounce timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Leading edge trigger
      if (leading && !isPending) {
        invokeDebounced();
        return;
      }

      setIsPending(true);

      // Max wait timeout
      if (maxWait !== undefined && !maxTimeoutRef.current) {
        maxTimeoutRef.current = setTimeout(() => {
          invokeDebounced();
          maxTimeoutRef.current = null;
        }, maxWait);
      }

      // Trailing edge trigger
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          invokeDebounced();
          if (maxTimeoutRef.current) {
            clearTimeout(maxTimeoutRef.current);
            maxTimeoutRef.current = null;
          }
        }, delay);
      }
    },
    [delay, leading, trailing, maxWait, isPending, invokeDebounced]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    value,
    setValue,
    isPending,
    flush,
    cancel,
    reset,
  };
}

// ============================================================================
// Throttle Hook (Alternative for constant rate updates)
// ============================================================================

/**
 * useThrottle
 * 
 * Returns a throttled value that updates at most once per delay period.
 * Useful for rate-limiting frequent updates while still getting regular updates.
 */
export function useThrottle<T>(value: T, delay: number = 100): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRanRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastRanRef.current;

    if (elapsed >= delay) {
      lastRanRef.current = now;
      setThrottledValue(value);
    } else {
      const handler = setTimeout(() => {
        lastRanRef.current = Date.now();
        setThrottledValue(value);
      }, delay - elapsed);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [value, delay]);

  return throttledValue;
}

// ============================================================================
// Specialized Slider Range Hook
// ============================================================================

export interface SliderRangeConfig {
  min: number;
  max: number;
  step?: number;
  initialValue: number;
}

export interface UseSliderRangeOptions {
  config: SliderRangeConfig;
  onDebouncedChange: (value: number) => void;
  debounceDelay?: number;
}

/**
 * useSliderRange
 * 
 * A convenience hook specifically for numeric range sliders with bounds validation.
 */
export function useSliderRange({
  config,
  onDebouncedChange,
  debounceDelay = 300,
}: UseSliderRangeOptions) {
  const { min, max, step = 1, initialValue } = config;

  const clampValue = useCallback(
    (value: number) => {
      const clamped = Math.min(max, Math.max(min, value));
      // Round to step
      return Math.round(clamped / step) * step;
    },
    [min, max, step]
  );

  const { value, setValue, isPending, flush, reset } = useDebouncedSlider({
    initialValue: clampValue(initialValue),
    onDebouncedUpdate: onDebouncedChange,
    delay: debounceDelay,
  });

  const setClampedValue = useCallback(
    (newValue: number) => {
      setValue(clampValue(newValue));
    },
    [setValue, clampValue]
  );

  // Percentage helpers
  const percentage = ((value - min) / (max - min)) * 100;
  
  const setPercentage = useCallback(
    (pct: number) => {
      const newValue = min + (pct / 100) * (max - min);
      setClampedValue(newValue);
    },
    [min, max, setClampedValue]
  );

  return {
    value,
    setValue: setClampedValue,
    percentage,
    setPercentage,
    isPending,
    flush,
    reset,
    config: { min, max, step },
  };
}

// ============================================================================
// Multi-Slider Coordination Hook
// ============================================================================

export interface MultiSliderConfig {
  [key: string]: SliderRangeConfig;
}

export interface UseMultiSliderOptions<T extends MultiSliderConfig> {
  config: T;
  onDebouncedChange: (values: { [K in keyof T]: number }) => void;
  debounceDelay?: number;
}

/**
 * useMultiSlider
 * 
 * Coordinates multiple sliders with a single debounced callback.
 * Useful for Mundell-Fleming model with multiple parameter sliders.
 * 
 * @example
 * ```tsx
 * const sliders = useMultiSlider({
 *   config: {
 *     governmentSpending: { min: 0, max: 500, initialValue: 100 },
 *     taxRate: { min: 0, max: 0.5, step: 0.01, initialValue: 0.2 },
 *     moneySupply: { min: 500, max: 2000, initialValue: 1000 },
 *   },
 *   onDebouncedChange: (values) => recalculateEquilibrium(values),
 *   debounceDelay: 300,
 * });
 * 
 * return (
 *   <>
 *     <input
 *       type="range"
 *       {...sliders.governmentSpending.inputProps}
 *     />
 *     <span>{sliders.governmentSpending.value}</span>
 *   </>
 * );
 * ```
 */
export function useMultiSlider<T extends MultiSliderConfig>({
  config,
  onDebouncedChange,
  debounceDelay = 300,
}: UseMultiSliderOptions<T>) {
  type Values = { [K in keyof T]: number };
  
  // Initialize values from config
  const getInitialValues = useCallback(() => {
    const values: Partial<Values> = {};
    for (const key in config) {
      values[key] = config[key].initialValue;
    }
    return values as Values;
  }, [config]);

  const [values, setValues] = useState<Values>(getInitialValues);
  const valuesRef = useRef<Values>(values);

  // Keep ref updated
  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  // Debounced callback
  const { debouncedCallback, isPending, flush, cancel } = useDebouncedCallback(
    onDebouncedChange,
    { delay: debounceDelay }
  );

  // Create setter for each slider
  const createSliderProps = useCallback(
    (key: keyof T) => {
      const sliderConfig = config[key];
      const { min, max, step = 1 } = sliderConfig;
      
      const clampValue = (value: number) => {
        const clamped = Math.min(max, Math.max(min, value));
        return Math.round(clamped / step) * step;
      };

      return {
        value: values[key],
        setValue: (newValue: number) => {
          const clamped = clampValue(newValue);
          setValues((prev) => {
            const next = { ...prev, [key]: clamped };
            // Schedule debounced callback with updated values
            requestAnimationFrame(() => {
              debouncedCallback(next);
            });
            return next;
          });
        },
        percentage: ((values[key] - min) / (max - min)) * 100,
        config: sliderConfig,
        inputProps: {
          type: 'range' as const,
          min,
          max,
          step,
          value: values[key],
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = clampValue(Number(e.target.value));
            setValues((prev) => {
              const next = { ...prev, [key]: newValue };
              requestAnimationFrame(() => {
                debouncedCallback(next);
              });
              return next;
            });
          },
        },
      };
    },
    [config, values, debouncedCallback]
  );

  // Build sliders object
  const sliders = {} as {
    [K in keyof T]: ReturnType<typeof createSliderProps>;
  };
  
  for (const key in config) {
    sliders[key as keyof T] = createSliderProps(key);
  }

  const reset = useCallback(() => {
    cancel();
    const initial = getInitialValues();
    setValues(initial);
    onDebouncedChange(initial);
  }, [cancel, getInitialValues, onDebouncedChange]);

  return {
    sliders,
    values,
    isPending,
    flush,
    cancel,
    reset,
  };
}

export default useDebouncedSlider;
