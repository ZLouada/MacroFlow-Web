import { useCallback, useRef } from 'react';
import {
  useQueryClient,
  QueryKey,
  MutationFunction,
  useMutation,
} from '@tanstack/react-query';

interface OptimisticUpdateOptions<TData, TVariables> {
  queryKey: QueryKey;
  mutationFn: MutationFunction<TData, TVariables>;
  // Function to optimistically update the cache
  updateCache: (oldData: TData | undefined, variables: TVariables) => TData;
  // Optional: custom rollback logic
  onRollback?: (context: { previousData: TData | undefined }) => void;
  // Optional: success callback
  onSuccess?: (data: TData, variables: TVariables) => void;
  // Optional: error callback
  onError?: (error: Error, variables: TVariables) => void;
}

/**
 * Hook for optimistic updates with automatic rollback on failure
 * Provides an "instant" feel by updating UI before server response
 */
export function useOptimisticUpdate<TData, TVariables>({
  queryKey,
  mutationFn,
  updateCache,
  onRollback,
  onSuccess,
  onError,
}: OptimisticUpdateOptions<TData, TVariables>) {
  const queryClient = useQueryClient();
  const rollbackRef = useRef<TData | undefined>(undefined);

  const mutation = useMutation({
    mutationFn,
    // Before mutation: optimistically update the cache
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);
      rollbackRef.current = previousData;

      // Optimistically update cache
      queryClient.setQueryData<TData>(queryKey, (old) =>
        updateCache(old, variables)
      );

      return { previousData };
    },
    // On error: rollback to previous value
    onError: (error: Error, variables: TVariables, context) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      onRollback?.(context || { previousData: undefined });
      onError?.(error, variables);
    },
    // On success: optionally invalidate to sync with server
    onSuccess: (data: TData, variables: TVariables) => {
      onSuccess?.(data, variables);
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const mutateOptimistically = useCallback(
    (variables: TVariables) => {
      return mutation.mutateAsync(variables);
    },
    [mutation]
  );

  return {
    mutate: mutation.mutate,
    mutateAsync: mutateOptimistically,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook for batch optimistic updates (e.g., reordering multiple items)
 */
export function useBatchOptimisticUpdate<TData, TVariables extends unknown[]>({
  queryKey,
  mutationFn,
  updateCache,
}: {
  queryKey: QueryKey;
  mutationFn: (variables: TVariables) => Promise<TData>;
  updateCache: (oldData: TData | undefined, variables: TVariables) => TData;
}) {
  const queryClient = useQueryClient();

  const batchMutate = useCallback(
    async (variablesList: TVariables[]) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey });

      // Snapshot
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Apply all optimistic updates
      let currentData = previousData;
      for (const variables of variablesList) {
        currentData = updateCache(currentData, variables);
      }
      queryClient.setQueryData(queryKey, currentData);

      try {
        // Execute all mutations
        const results = await Promise.all(
          variablesList.map((vars) => mutationFn(vars))
        );
        return results;
      } catch (error) {
        // Rollback on any failure
        queryClient.setQueryData(queryKey, previousData);
        throw error;
      } finally {
        queryClient.invalidateQueries({ queryKey });
      }
    },
    [queryClient, queryKey, mutationFn, updateCache]
  );

  return { batchMutate };
}
