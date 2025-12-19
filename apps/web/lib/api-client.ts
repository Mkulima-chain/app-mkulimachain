/**
 * Client API centralisé
 *
 * Configure l'URL de base de l'API et les headers par défaut
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5600/api/";

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Classe d'erreur personnalisée pour les erreurs API
 */
export class ApiClientError extends Error {
  status?: number;
  errors?: Record<string, string[]>;

  constructor(
    message: string,
    status?: number,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Client API avec gestion d'erreurs améliorée
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Construire l'URL finale
  let url: string;

  if (endpoint.startsWith("http")) {
    url = endpoint;
  } else {
    // Normaliser l'URL de base en retirant le slash final s'il existe
    const baseUrl = API_BASE_URL.endsWith("/")
      ? API_BASE_URL.slice(0, -1)
      : API_BASE_URL;

    // Normaliser l'endpoint pour s'assurer qu'il commence par /
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

    // Construire l'URL finale
    url = `${baseUrl}${normalizedEndpoint}`;
  }

  // Debug: logger l'URL construite (à retirer en production)
  if (process.env.NODE_ENV === "development") {
    console.log("[API Client] Request URL:", url);
  }

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    // Gérer les réponses non-JSON (comme 204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiClientError(
        data.message || `Erreur ${response.status}`,
        response.status,
        data.errors
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Erreur réseau ou autre
    throw new ApiClientError(
      error instanceof Error ? error.message : "Erreur réseau inconnue",
      0
    );
  }
}

/**
 * Méthodes HTTP helpers
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiClient<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiClient<T>(endpoint, { ...options, method: "DELETE" }),
};
