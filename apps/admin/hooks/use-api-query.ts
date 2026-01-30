"use client"

import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { ApiClientError } from "@/lib/api-client"

export function useApiQuery<TData = unknown, TError = ApiClientError>(
  queryKey: string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<TData, TError>, "queryKey" | "queryFn">
) {
  return useQuery<TData, TError>({
    queryKey,
    queryFn: () => api.get<TData>(endpoint),
    ...options,
  })
}

