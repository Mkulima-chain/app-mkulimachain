import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { api, ApiClientError } from "@/lib/api-client";

/**
 * Hook personnalisé pour les requêtes GET avec React Query
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useApiQuery('/users', {
 *   queryKey: ['users'],
 * });
 * ```
 */
export function useApiQuery<TData = unknown, TError = ApiClientError>(
  endpoint: string,
  options?: Omit<
    UseQueryOptions<TData, TError>,
    "queryKey" | "queryFn"
  > & {
    queryKey: (string | number | boolean | null | undefined)[];
    enabled?: boolean;
  }
): UseQueryResult<TData, TError> {
  return useQuery<TData, TError>({
    ...options,
    queryKey: options?.queryKey || [endpoint],
    queryFn: async () => {
      return api.get<TData>(endpoint);
    },
    ...options,
  });
}

