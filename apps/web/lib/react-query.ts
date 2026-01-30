import { QueryClient } from "@tanstack/react-query";

/**
 * Configuration par défaut pour React Query
 * Optimisée pour une application de production
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Temps de cache par défaut: 5 minutes
      staleTime: 1000 * 60 * 5,
      // Temps de cache en mémoire: 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry automatique en cas d'erreur
      retry: (failureCount: number, error: unknown) => {
        // Ne pas retry pour les erreurs 4xx (erreurs client)
        if (error && typeof error === "object" && "status" in error) {
          const status = error.status as number;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        // Retry jusqu'à 3 fois pour les autres erreurs
        return failureCount < 3;
      },
      // Délai entre les retries (exponential backoff)
      retryDelay: (attemptIndex: number) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch automatique
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      // Retry pour les mutations
      retry: 1,
      // Retry delay pour les mutations
      retryDelay: 1000,
    },
  },
};

/**
 * Instance du QueryClient
 * Utilisée dans le provider React Query
 */
export const queryClient = new QueryClient(queryClientConfig);

