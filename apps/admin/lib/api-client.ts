/**
 * Client API centralisé pour l'admin
 */

import { getAccessToken } from "./auth-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5600/api";

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export class ApiClientError extends Error {
  status?: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status?: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const token =
    typeof window !== "undefined" ? getAccessToken() : undefined;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 204) {
      return undefined as T;
    }

    let data: any = {};
    let responseText = '';
    try {
      // Cloner la réponse pour pouvoir la lire plusieurs fois si nécessaire
      const clonedResponse = response.clone();
      responseText = await clonedResponse.text();
      
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          // Si ce n'est pas du JSON, utiliser le texte comme message
          data = { message: responseText || `Erreur ${response.status}` };
        }
      } else {
        // Réponse vide
        data = { message: `Réponse vide du serveur (${response.status})` };
      }
    } catch (e) {
      // Si la lecture échoue, utiliser un message par défaut
      console.error('Erreur lors de la lecture de la réponse:', e);
      data = { message: `Erreur ${response.status}: ${response.statusText}` };
    }

    if (!response.ok) {
      // Logger l'erreur pour déboguer avec plus de détails
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url,
        data,
        responseText: responseText.substring(0, 500), // Limiter la longueur pour l'affichage
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      // Extraire le message d'erreur de manière plus robuste
      const errorMessage = 
        data?.message || 
        data?.error?.message || 
        data?.error || 
        (typeof data?.error === 'string' ? data.error : null) ||
        `Erreur ${response.status}: ${response.statusText}`;
      
      throw new ApiClientError(
        errorMessage,
        response.status,
        data?.errors || data?.error?.details || data?.error
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    throw new ApiClientError(
      error instanceof Error ? error.message : "Erreur réseau inconnue",
      0
    );
  }
}

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

