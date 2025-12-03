import {
    useMutation,
    UseMutationOptions,
    UseMutationResult,
} from "@tanstack/react-query";
import { api, ApiClientError } from "@/lib/api-client";

/**
 * Hook personnalisé pour les mutations (POST, PUT, PATCH, DELETE) avec React Query
 * 
 * @example
 * ```tsx
 * const mutation = useApiMutation({
 *   mutationFn: (data) => api.post('/users', data),
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ['users'] });
 *   },
 * });
 * ```
 */
export function useApiMutation<
  TData = unknown,
  TVariables = unknown,
  TError = ApiClientError,
>(
  options: UseMutationOptions<TData, TError, TVariables>
): UseMutationResult<TData, TError, TVariables> {
  return useMutation<TData, TError, TVariables>(options);
}

/**
 * Hook helper pour les mutations POST
 */
export function useApiPost<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<
    UseMutationOptions<TData, ApiClientError, TVariables>,
    "mutationFn"
  >
) {
  return useApiMutation<TData, TVariables>({
    ...options,
    mutationFn: async (data: TVariables) => {
      return api.post<TData>(endpoint, data);
    },
  });
}

/**
 * Hook helper pour les mutations PUT
 */
export function useApiPut<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<
    UseMutationOptions<TData, ApiClientError, TVariables>,
    "mutationFn"
  >
) {
  return useApiMutation<TData, TVariables>({
    ...options,
    mutationFn: async (data: TVariables) => {
      return api.put<TData>(endpoint, data);
    },
  });
}

/**
 * Hook helper pour les mutations PATCH
 */
export function useApiPatch<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<
    UseMutationOptions<TData, ApiClientError, TVariables>,
    "mutationFn"
  >
) {
  return useApiMutation<TData, TVariables>({
    ...options,
    mutationFn: async (data: TVariables) => {
      return api.patch<TData>(endpoint, data);
    },
  });
}

/**
 * Hook helper pour les mutations DELETE
 */
export function useApiDelete<TData = unknown>(
  endpoint: string,
  options?: Omit<
    UseMutationOptions<TData, ApiClientError, void>,
    "mutationFn"
  >
) {
  return useApiMutation<TData, void>({
    ...options,
    mutationFn: async () => {
      return api.delete<TData>(endpoint);
    },
  });
}

