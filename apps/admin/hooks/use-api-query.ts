"use client"

import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { ApiClientError } from "@/lib/api-client"

export function useApiQuery<TData = unknown, TError = ApiClientError>(
  queryKey: string[],
  endpoint: string | null,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: () => {
      if (!endpoint) {
        throw new Error("Endpoint is required")
      }
      return api.get<TData>(endpoint)
    },
    enabled: endpoint !== null && (options?.enabled !== false),
    ...options,
  })
}

