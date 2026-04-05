import { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

interface ResponsiveChartWrapperProps {
  children: ReactNode;
  height?: number | string;
  minHeight?: number;
  className?: string;
}

/**
 * A wrapper around Recharts ResponsiveContainer that ensures charts
 * don't overflow on mobile and handle sidebar toggles gracefully.
 */
export function ResponsiveChartWrapper({
  children,
  height = 300,
  minHeight = 250,
  className = '',
}: ResponsiveChartWrapperProps) {
  return (
    <div className={`w-full relative ${className}`} style={{ height, minHeight }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}
