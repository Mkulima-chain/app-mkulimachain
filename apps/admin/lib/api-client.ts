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

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const token = typeof window !== "undefined" ? getAccessToken() : undefined;

  // Ne pas ajouter Content-Type pour FormData (le navigateur le fera automatiquement)
  const isFormData = options?.body instanceof FormData;

  const config: RequestInit = {
    ...options,
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  };

  try {
    // Log pour débogage (uniquement en développement et côté client)
    if (
      typeof window !== "undefined" &&
      typeof console !== "undefined" &&
      console.log &&
      process.env.NODE_ENV === "development"
    ) {
      try {
        console.log("API Request:", {
          url,
          method: config.method || "GET",
          hasBody: !!config.body,
          isFormData: config.body instanceof FormData,
          headers: config.headers,
        });
      } catch (logError) {
        // Ignorer les erreurs de logging
      }
    }

    const response = await fetch(url, config);

    if (response.status === 204) {
      return undefined as T;
    }

    let data: Record<string, unknown>;
    try {
      const text = await response.text();
      data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      // Log pour débogage (uniquement en développement et côté client)
      if (
        typeof window !== "undefined" &&
        typeof console !== "undefined" &&
        console.error &&
        process.env.NODE_ENV === "development"
      ) {
        try {
          console.error("API Error Response:", {
            status: response.status,
            data,
            dataType: typeof data,
            hasMessage: !!data.message,
            hasErrors: !!data.errors,
          });
        } catch (logError) {
          // Ignorer les erreurs de logging
        }
      }

      // Pour les erreurs 400, essayer de récupérer le message de validation
      let errorMessage: string =
        (typeof data.message === "string" ? data.message : null) ||
        (typeof data.error === "string" ? data.error : null) ||
        `Erreur ${response.status}`;
      let errorDetails: Record<string, string[]> | undefined =
        data.errors &&
        typeof data.errors === "object" &&
        !Array.isArray(data.errors)
          ? (data.errors as Record<string, string[]>)
          : undefined;

      // NestJS peut formater les erreurs de différentes manières
      // Format 1: { statusCode: 400, message: "...", error: "Bad Request" }
      // Format 2: { message: "...", errors: {...} }
      // Format 3: { message: ["error1", "error2"] }

      // Si le message est un tableau (erreurs de validation NestJS)
      if (Array.isArray(data.message)) {
        errorMessage = data.message.join(", ");
      }
      // Si c'est une chaîne simple
      else if (typeof data.message === "string") {
        errorMessage = data.message;
        // Si errors existe séparément au niveau racine, l'utiliser
        if (
          data.errors &&
          typeof data.errors === "object" &&
          !Array.isArray(data.errors) &&
          Object.keys(data.errors).length > 0
        ) {
          errorDetails = data.errors as Record<string, string[]>;
        }
      }
      // Si c'est un objet avec un message
      else if (
        data.message &&
        typeof data.message === "object" &&
        !Array.isArray(data.message)
      ) {
        const messageObj = data.message as Record<string, unknown>;
        // Si l'objet a un champ message, l'extraire
        if (typeof messageObj.message === "string") {
          errorMessage = messageObj.message;
        } else {
          errorMessage = JSON.stringify(data.message);
        }
        // Si l'objet a un champ errors, l'utiliser
        if (
          messageObj.errors &&
          typeof messageObj.errors === "object" &&
          !Array.isArray(messageObj.errors)
        ) {
          errorDetails = messageObj.errors as Record<string, string[]>;
        }
      }

      // Si errorDetails est vide mais qu'on a un message avec des détails (format "property: message")
      if (
        (!errorDetails || Object.keys(errorDetails).length === 0) &&
        typeof errorMessage === "string" &&
        errorMessage.includes(":")
      ) {
        // Le message contient déjà les détails de validation
        if (
          typeof window !== "undefined" &&
          typeof console !== "undefined" &&
          console.log &&
          process.env.NODE_ENV === "development"
        ) {
          try {
            console.log("Message contient les détails:", errorMessage);
          } catch (logError) {
            // Ignorer les erreurs de logging
          }
        }
        // Extraire les détails du message
        const messageParts = errorMessage.split("; ");
        if (messageParts.length > 0) {
          errorDetails = {};
          messageParts.forEach((part: string) => {
            const [field, ...messageParts] = part.split(": ");
            if (field && messageParts.length > 0) {
              errorDetails![field] = [messageParts.join(": ")];
            }
          });
        }
      }

      // Si toujours pas de détails, utiliser le message complet
      if (
        (!errorDetails || Object.keys(errorDetails).length === 0) &&
        errorMessage
      ) {
        errorDetails = { general: [errorMessage] };
      }

      throw new ApiClientError(errorMessage, response.status, errorDetails);
    }

    return data as T;
  } catch (error) {
    // Gérer les erreurs réseau (Failed to fetch, CORS, etc.)
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      if (
        typeof window !== "undefined" &&
        typeof console !== "undefined" &&
        console.error &&
        process.env.NODE_ENV === "development"
      ) {
        try {
          console.error("Network Error:", {
            url,
            error: error.message,
            possibleCauses: [
              "Le serveur API n'est pas en cours d'exécution",
              "Problème CORS",
              "URL incorrecte",
              "Problème de connexion réseau",
            ],
            apiUrl: API_BASE_URL,
            endpoint,
            fullUrl: url,
          });
        } catch (logError) {
          // Ignorer les erreurs de logging
        }
      }

      throw new ApiClientError(
        `Impossible de se connecter au serveur API (${API_BASE_URL}). Vérifiez que le serveur est en cours d'exécution.`,
        0,
        undefined
      );
    }

    // Si c'est déjà une ApiClientError, la relancer
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Autres erreurs
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
      body:
        data instanceof FormData
          ? data
          : data
            ? JSON.stringify(data)
            : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) =>
    apiClient<T>(endpoint, {
      ...options,
      method: "PUT",
      body:
        data instanceof FormData
          ? data
          : data
            ? JSON.stringify(data)
            : undefined,
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
