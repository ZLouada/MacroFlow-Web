import { useCallback, useRef, useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useRTL } from '@/components/i18n/LanguageSwitcher';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export type ChartType = 'line' | 'area' | 'composed';

export interface ChartLine {
  dataKey: string;
  name: string;
  color: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: boolean;
  activeDot?: boolean | { r: number };
  opacity?: number;
  type?: 'linear' | 'monotone' | 'step' | 'natural';
  /** For ghost/comparison lines */
  isGhost?: boolean;
}

export interface ChartArea extends ChartLine {
  fillOpacity?: number;
  gradientId?: string;
}

export interface ReferenceLineConfig {
  value: number;
  axis: 'x' | 'y';
  label?: string;
  stroke?: string;
  strokeDasharray?: string;
}

export interface ResponsiveChartWrapperProps<T = Record<string, unknown>> {
  /** Chart data array */
  data: T[];
  /** Lines/areas to render */
  lines: (ChartLine | ChartArea)[];
  /** Chart type */
  type?: ChartType;
  /** X-axis data key */
  xAxisKey: string;
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Chart title */
  title?: string;
  /** Subtitle */
  subtitle?: string;
  /** Reference lines */
  referenceLines?: ReferenceLineConfig[];
  /** Minimum height in pixels */
  minHeight?: number;
  /** Aspect ratio for responsive sizing */
  aspectRatio?: number;
  /** Show grid */
  showGrid?: boolean;
  /** Show legend */
  showLegend?: boolean;
  /** Show tooltip */
  showTooltip?: boolean;
  /** Custom tooltip formatter */
  tooltipFormatter?: (value: number, name: string) => [string, string];
  /** Y-axis domain */
  yDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  /** X-axis domain */
  xDomain?: [number | 'auto' | 'dataMin' | 'dataMax', number | 'auto' | 'dataMin' | 'dataMax'];
  /** Custom class name */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
  /** Animate on mount */
  animate?: boolean;
  /** Allow zoom/pan (future feature placeholder) */
  interactive?: boolean;
  /** Debounce resize events (ms) */
  resizeDebounce?: number;
  /** Callback when chart is clicked */
  onChartClick?: (data: T | null) => void;
  /** Ghost data for comparison (Phase 2 placeholder) */
  ghostData?: T[];
  /** Ghost lines configuration */
  ghostLines?: ChartLine[];
}

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook to detect container size changes with debouncing
 */
function useContainerSize(debounceMs: number = 100) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        const entry = entries[0];
        if (entry) {
          setSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }, debounceMs);
    });

    observer.observe(container);
    
    // Initial size
    setSize({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debounceMs]);

  return { containerRef, size };
}

// ============================================================================
// Sub-components
// ============================================================================

interface ChartLoadingProps {
  height: number;
}

function ChartLoading({ height }: ChartLoadingProps) {
  return (
    <div 
      className="flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full" />
          <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading chart...</span>
      </div>
    </div>
  );
}

interface ChartErrorProps {
  message: string;
  height: number;
  onRetry?: () => void;
}

function ChartError({ message, height, onRetry }: ChartErrorProps) {
  return (
    <div 
      className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-3 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

interface ChartEmptyProps {
  height: number;
  message?: string;
}

function ChartEmpty({ height, message = 'No data available' }: ChartEmptyProps) {
  return (
    <div 
      className="flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

// Custom tooltip component
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  formatter?: (value: number, name: string) => [string, string];
  isRTL?: boolean;
}

function CustomTooltip({ active, payload, label, formatter, isRTL }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3',
        'min-w-[150px]',
        isRTL && 'text-right'
      )}
    >
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
        {label}
      </p>
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const [formattedValue, formattedName] = formatter
            ? formatter(entry.value, entry.name)
            : [entry.value.toFixed(2), entry.name];
          
          return (
            <div 
              key={`tooltip-${index}`}
              className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}
            >
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-300 flex-1">
                {formattedName}:
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-white">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ResponsiveChartWrapper
 * 
 * A responsive chart component that:
 * 1. Uses Recharts' ResponsiveContainer to prevent overflow on mobile
 * 2. Automatically flips Y-axis to right side when RTL is active
 * 3. Handles loading, error, and empty states
 * 4. Supports line, area, and composed chart types
 * 5. Optimized for 60 FPS with debounced resize handling
 */
export function ResponsiveChartWrapper<T extends Record<string, unknown>>({
  data,
  lines,
  type = 'line',
  xAxisKey,
  xAxisLabel,
  yAxisLabel,
  title,
  subtitle,
  referenceLines = [],
  minHeight = 300,
  aspectRatio,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  tooltipFormatter,
  yDomain = ['auto', 'auto'],
  xDomain = ['auto', 'auto'],
  className,
  isLoading = false,
  error = null,
  animate = true,
  resizeDebounce = 100,
  onChartClick,
  ghostData,
  ghostLines,
}: ResponsiveChartWrapperProps<T>) {
  const { isRTL, direction } = useRTL();
  const { containerRef, size } = useContainerSize(resizeDebounce);
  
  // Calculate responsive height
  const chartHeight = aspectRatio && size.width > 0
    ? Math.max(minHeight, size.width / aspectRatio)
    : minHeight;

  // Determine Y-axis orientation based on RTL
  const yAxisOrientation = isRTL ? 'right' : 'left';
  
  // Handle chart click - cast to any to avoid complex Recharts type issues
  const handleChartClick = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      if (onChartClick && data?.activePayload?.[0]) {
        onChartClick(data.activePayload[0].payload as T);
      }
    },
    [onChartClick]
  );

  // Render loading state
  if (isLoading) {
    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        <ChartLoading height={chartHeight} />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        <ChartError message={error} height={chartHeight} />
      </div>
    );
  }

  // Render empty state
  if (!data || data.length === 0) {
    return (
      <div ref={containerRef} className={cn('w-full', className)}>
        <ChartEmpty height={chartHeight} />
      </div>
    );
  }

  // Common axis props
  const xAxisProps = {
    dataKey: xAxisKey,
    domain: xDomain,
    tick: { fontSize: 12 },
    tickLine: false,
    axisLine: { stroke: '#e5e7eb' },
    label: xAxisLabel ? {
      value: xAxisLabel,
      position: 'insideBottom' as const,
      offset: -5,
      style: { fontSize: 12, fill: '#6b7280' }
    } : undefined,
    reversed: isRTL, // Reverse X-axis for RTL
  };

  const yAxisProps = {
    orientation: yAxisOrientation as 'left' | 'right',
    domain: yDomain,
    tick: { fontSize: 12 },
    tickLine: false,
    axisLine: { stroke: '#e5e7eb' },
    label: yAxisLabel ? {
      value: yAxisLabel,
      angle: isRTL ? 90 : -90,
      position: isRTL ? 'insideRight' as const : 'insideLeft' as const,
      style: { fontSize: 12, fill: '#6b7280', textAnchor: 'middle' as const }
    } : undefined,
  };

  // Render lines/areas based on type
  const renderChartElements = (chartLines: ChartLine[], dataKey: 'main' | 'ghost' = 'main') => {
    return chartLines.map((line, index) => {
      const key = `${dataKey}-${line.dataKey}-${index}`;
      const isGhost = line.isGhost || dataKey === 'ghost';
      
      const commonProps = {
        key,
        dataKey: line.dataKey,
        name: line.name,
        stroke: line.color,
        strokeWidth: line.strokeWidth ?? (isGhost ? 1.5 : 2),
        strokeDasharray: line.strokeDasharray ?? (isGhost ? '5 5' : undefined),
        dot: line.dot ?? false,
        activeDot: line.activeDot ?? { r: 4 },
        opacity: line.opacity ?? (isGhost ? 0.5 : 1),
        type: line.type ?? 'monotone',
        isAnimationActive: animate && !isGhost,
        animationDuration: 800,
        animationEasing: 'ease-out' as const,
      };

      if (type === 'area' || (line as ChartArea).fillOpacity !== undefined) {
        const areaLine = line as ChartArea;
        return (
          <Area
            {...commonProps}
            fill={areaLine.color}
            fillOpacity={areaLine.fillOpacity ?? (isGhost ? 0.1 : 0.3)}
          />
        );
      }

      return <Line {...commonProps} />;
    });
  };

  // Render reference lines
  const renderReferenceLines = () => {
    return referenceLines.map((refLine, index) => (
      <ReferenceLine
        key={`ref-${index}`}
        x={refLine.axis === 'x' ? refLine.value : undefined}
        y={refLine.axis === 'y' ? refLine.value : undefined}
        stroke={refLine.stroke ?? '#9ca3af'}
        strokeDasharray={refLine.strokeDasharray ?? '3 3'}
        label={refLine.label ? {
          value: refLine.label,
          position: 'top',
          style: { fontSize: 10, fill: '#6b7280' }
        } : undefined}
      />
    ));
  };

  // Select chart component based on type
  const ChartComponent = type === 'area' ? AreaChart : type === 'composed' ? ComposedChart : LineChart;

  return (
    <div 
      ref={containerRef} 
      className={cn('w-full', className)}
      dir={direction}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className={cn('mb-4', isRTL && 'text-right')}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Chart */}
      <AnimatePresence mode="wait">
        <motion.div
          key="chart"
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ height: chartHeight }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent
              data={data}
              onClick={onChartClick ? handleChartClick : undefined}
              margin={{
                top: 10,
                right: isRTL ? 30 : 20,
                left: isRTL ? 20 : 30,
                bottom: xAxisLabel ? 30 : 10,
              }}
            >
              {showGrid && (
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e5e7eb" 
                  className="dark:stroke-gray-700"
                />
              )}
              
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              
              {showTooltip && (
                <Tooltip
                  content={
                    <CustomTooltip 
                      formatter={tooltipFormatter}
                      isRTL={isRTL}
                    />
                  }
                  cursor={{ stroke: '#9ca3af', strokeDasharray: '3 3' }}
                />
              )}
              
              {showLegend && (
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{
                    paddingBottom: 10,
                    direction: direction as 'ltr' | 'rtl',
                  }}
                />
              )}

              {/* Ghost/comparison data (Phase 2) */}
              {ghostData && ghostLines && (
                <>
                  {renderChartElements(ghostLines.map(l => ({ ...l, isGhost: true })), 'ghost')}
                </>
              )}

              {/* Main data */}
              {renderChartElements(lines)}
              
              {/* Reference lines */}
              {renderReferenceLines()}
            </ChartComponent>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Specialized Chart Exports
// ============================================================================

/**
 * Pre-configured chart for IS-LM model visualization
 */
export interface ISLMChartProps {
  data: Array<{
    Y: number;
    IS: number;
    LM: number;
  }>;
  ghostData?: Array<{
    Y: number;
    IS: number;
    LM: number;
  }>;
  equilibriumY?: number;
  equilibriumR?: number;
  className?: string;
}

export function ISLMChart({ 
  data, 
  ghostData,
  equilibriumY, 
  equilibriumR,
  className 
}: ISLMChartProps) {
  const referenceLines: ReferenceLineConfig[] = [];
  
  if (equilibriumY !== undefined) {
    referenceLines.push({
      value: equilibriumY,
      axis: 'x',
      label: 'Y*',
      stroke: '#10b981',
      strokeDasharray: '4 4',
    });
  }
  
  if (equilibriumR !== undefined) {
    referenceLines.push({
      value: equilibriumR,
      axis: 'y',
      label: 'r*',
      stroke: '#10b981',
      strokeDasharray: '4 4',
    });
  }

  return (
    <ResponsiveChartWrapper
      data={data}
      lines={[
        {
          dataKey: 'IS',
          name: 'IS Curve',
          color: '#3b82f6',
          strokeWidth: 2.5,
          type: 'monotone',
        },
        {
          dataKey: 'LM',
          name: 'LM Curve',
          color: '#ef4444',
          strokeWidth: 2.5,
          type: 'monotone',
        },
      ]}
      ghostData={ghostData}
      ghostLines={ghostData ? [
        {
          dataKey: 'IS',
          name: 'IS (Previous)',
          color: '#3b82f6',
          isGhost: true,
        },
        {
          dataKey: 'LM',
          name: 'LM (Previous)',
          color: '#ef4444',
          isGhost: true,
        },
      ] : undefined}
      xAxisKey="Y"
      xAxisLabel="Output (Y)"
      yAxisLabel="Interest Rate (r)"
      title="IS-LM Model"
      subtitle="Goods and money market equilibrium"
      referenceLines={referenceLines}
      aspectRatio={1.5}
      minHeight={350}
      className={className}
    />
  );
}

/**
 * Pre-configured chart for Mundell-Fleming (IS-LM-BOP) model
 */
export interface MundellFlemingChartProps {
  data: Array<{
    Y: number;
    IS: number;
    LM: number;
    BOP: number;
  }>;
  ghostData?: Array<{
    Y: number;
    IS: number;
    LM: number;
    BOP: number;
  }>;
  equilibriumY?: number;
  equilibriumR?: number;
  className?: string;
}

export function MundellFlemingChart({ 
  data,
  ghostData,
  equilibriumY, 
  equilibriumR,
  className 
}: MundellFlemingChartProps) {
  const referenceLines: ReferenceLineConfig[] = [];
  
  if (equilibriumY !== undefined) {
    referenceLines.push({
      value: equilibriumY,
      axis: 'x',
      label: 'Y*',
      stroke: '#10b981',
      strokeDasharray: '4 4',
    });
  }
  
  if (equilibriumR !== undefined) {
    referenceLines.push({
      value: equilibriumR,
      axis: 'y',
      label: 'r*',
      stroke: '#10b981',
      strokeDasharray: '4 4',
    });
  }

  return (
    <ResponsiveChartWrapper
      data={data}
      lines={[
        {
          dataKey: 'IS',
          name: 'IS Curve',
          color: '#3b82f6',
          strokeWidth: 2.5,
          type: 'monotone',
        },
        {
          dataKey: 'LM',
          name: 'LM Curve',
          color: '#ef4444',
          strokeWidth: 2.5,
          type: 'monotone',
        },
        {
          dataKey: 'BOP',
          name: 'BOP Curve',
          color: '#8b5cf6',
          strokeWidth: 2.5,
          type: 'monotone',
        },
      ]}
      ghostData={ghostData}
      ghostLines={ghostData ? [
        {
          dataKey: 'IS',
          name: 'IS (Previous)',
          color: '#3b82f6',
          isGhost: true,
        },
        {
          dataKey: 'LM',
          name: 'LM (Previous)',
          color: '#ef4444',
          isGhost: true,
        },
        {
          dataKey: 'BOP',
          name: 'BOP (Previous)',
          color: '#8b5cf6',
          isGhost: true,
        },
      ] : undefined}
      xAxisKey="Y"
      xAxisLabel="Output (Y)"
      yAxisLabel="Interest Rate (r)"
      title="Mundell-Fleming Model"
      subtitle="Open economy IS-LM-BOP equilibrium"
      referenceLines={referenceLines}
      aspectRatio={1.5}
      minHeight={350}
      className={className}
    />
  );
}

export default ResponsiveChartWrapper;
