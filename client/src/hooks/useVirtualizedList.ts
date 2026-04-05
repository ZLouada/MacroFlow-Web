import { useRef, useCallback, useMemo } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';

interface UseVirtualizedListOptions<T> {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  horizontal?: boolean;
  getItemKey?: (index: number, item: T) => string | number;
}

interface VirtualizedListResult {
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => void;
  measureElement: (node: Element | null) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  getVirtualItemProps: (virtualItem: VirtualItem) => {
    style: React.CSSProperties;
    'data-index': number;
    ref: (node: Element | null) => void;
  };
}

/**
 * Hook for virtualized lists with 1000+ items while maintaining 60 FPS
 * Uses TanStack Virtual for efficient rendering
 */
export function useVirtualizedList<T>({
  items,
  estimateSize = 60,
  overscan = 5,
  horizontal = false,
  getItemKey,
}: UseVirtualizedListOptions<T>): VirtualizedListResult {
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateSize,
    overscan,
    horizontal,
    getItemKey: getItemKey
      ? (index) => getItemKey(index, items[index])
      : undefined,
  });

  const scrollToIndex = useCallback(
    (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => {
      virtualizer.scrollToIndex(index, options);
    },
    [virtualizer]
  );

  const getVirtualItemProps = useCallback(
    (virtualItem: VirtualItem) => ({
      style: {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        width: horizontal ? `${virtualItem.size}px` : '100%',
        height: horizontal ? '100%' : `${virtualItem.size}px`,
        transform: horizontal
          ? `translateX(${virtualItem.start}px)`
          : `translateY(${virtualItem.start}px)`,
      },
      'data-index': virtualItem.index,
      ref: virtualizer.measureElement,
    }),
    [virtualizer, horizontal]
  );

  return useMemo(
    () => ({
      virtualItems: virtualizer.getVirtualItems(),
      totalSize: virtualizer.getTotalSize(),
      scrollToIndex,
      measureElement: virtualizer.measureElement,
      containerRef,
      getVirtualItemProps,
    }),
    [virtualizer, scrollToIndex, getVirtualItemProps]
  );
}

/**
 * Hook for infinite scrolling virtualized list
 */
export function useInfiniteVirtualizedList<T>({
  items,
  estimateSize = 60,
  overscan = 5,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: UseVirtualizedListOptions<T> & {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: hasNextPage ? items.length + 1 : items.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Trigger fetch when scrolling near the end
  const lastItem = virtualItems[virtualItems.length - 1];
  if (
    lastItem &&
    lastItem.index >= items.length - 1 &&
    hasNextPage &&
    !isFetchingNextPage
  ) {
    fetchNextPage();
  }

  return {
    virtualItems,
    totalSize: virtualizer.getTotalSize(),
    containerRef,
    measureElement: virtualizer.measureElement,
  };
}
