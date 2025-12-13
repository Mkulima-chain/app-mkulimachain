"use client"

import { useMutation, UseMutationOptions, useQueryClient } from "@tanstack/react-query"
import { api, ApiClientError } from "@/lib/api-client"
import { toast } from "sonner"

export function useApiMutation<TData = unknown, TVariables = unknown>(
  endpoint: string | ((variables: TVariables) => string),
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  options?: Omit<UseMutationOptions<TData, ApiClientError, TVariables>, "mutationFn" | "onSuccess" | "onError"> & {
    onSuccess?: (data: TData, variables: TVariables, context: unknown) => void
    onError?: (error: ApiClientError, variables: TVariables, context: unknown) => void
  }
) {
  const queryClient = useQueryClient()

  const { onSuccess, onError, ...restOptions } = options || {}

  return useMutation<TData, ApiClientError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const url = typeof endpoint === "function" ? endpoint(variables) : endpoint

      switch (method) {
        case "POST":
          return api.post<TData>(url, variables)
        case "PUT":
          return api.put<TData>(url, variables)
        case "PATCH":
          return api.patch<TData>(url, variables)
        case "DELETE":
          return api.delete<TData>(url)
        default:
          throw new Error(`Méthode HTTP non supportée: ${method}`)
      }
    },
    onSuccess: (data, variables, context) => {
      // Invalider les queries pour rafraîchir les données
      queryClient.invalidateQueries()
      onSuccess?.(data, variables, context)
    },
    onError: (error, variables, context) => {
      // Afficher les erreurs de validation de manière détaillée
      if (error.errors && Object.keys(error.errors).length > 0) {
        const errorMessages = Object.entries(error.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n')
        toast.error(`Erreurs de validation:\n${errorMessages}`, {
          duration: 5000,
        })
      } else {
        toast.error(error.message || "Une erreur est survenue")
      }
      console.error('API Error:', error)
      onError?.(error, variables, context)
    },
    ...restOptions,
  })
}

