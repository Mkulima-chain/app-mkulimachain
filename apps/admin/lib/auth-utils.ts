import { getAuth } from "./auth-storage"

/**
 * Vérifie si l'utilisateur est authentifié
 */
export function isAuthenticated(): boolean {
  const auth = getAuth()
  return !!auth && !!auth.accessToken && !!auth.user
}

/**
 * Vérifie si l'utilisateur est un administrateur
 */
export function isAdmin(): boolean {
  const auth = getAuth()
  return auth?.user?.role === "admin"
}

/**
 * Vérifie si l'utilisateur est authentifié ET est admin
 */
export function isAuthenticatedAdmin(): boolean {
  return isAuthenticated() && isAdmin()
}

/**
 * Récupère l'utilisateur actuel
 */
export function getCurrentUser() {
  const auth = getAuth()
  return auth?.user
}

