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
  endpointOrOptions: string | {
    queryKey: (string | number | boolean | null | undefined)[];
    endpoint: string;
    enabled?: boolean;
  },
  options?: Omit<
    UseQueryOptions<TData, TError>,
    "queryKey" | "queryFn"
  > & {
    queryKey?: (string | number | boolean | null | undefined)[];
    enabled?: boolean;
  }
): UseQueryResult<TData, TError> {
  // Support both old and new API
  const isNewAPI = typeof endpointOrOptions === "object" && "endpoint" in endpointOrOptions;
  const endpoint = isNewAPI ? endpointOrOptions.endpoint : endpointOrOptions;
  const queryKey = isNewAPI ? endpointOrOptions.queryKey : (options?.queryKey || [endpoint]);
  const enabled = isNewAPI ? endpointOrOptions.enabled : options?.enabled;

  return useQuery<TData, TError>({
    ...options,
    queryKey,
    queryFn: async () => {
      return api.get<TData>(endpoint);
    },
    enabled,
  });
}

