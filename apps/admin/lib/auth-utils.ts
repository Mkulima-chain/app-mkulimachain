import { getAuth } from "./auth-storage";

/**
 * Vérifie si l'utilisateur est authentifié
 */
export function isAuthenticated(): boolean {
  const auth = getAuth();
  return !!auth && !!auth.accessToken && !!auth.user;
}

/**
 * Vérifie si l'utilisateur est un administrateur
 */
export function isAdmin(): boolean {
  const auth = getAuth();
  return auth?.user?.role === "admin";
}

/**
 * Vérifie si l'utilisateur est un agriculteur
 */
export function isFarmer(): boolean {
  const auth = getAuth();
  return auth?.user?.role === "farmer";
}

/**
 * Vérifie si l'utilisateur est une coopérative
 */
export function isCooperative(): boolean {
  const auth = getAuth();
  return auth?.user?.role === "cooperative";
}

/**
 * Vérifie si l'utilisateur a accès à l'admin (admin, farmer, ou cooperative)
 */
export function hasAdminAccess(): boolean {
  const auth = getAuth();
  const role = auth?.user?.role;
  return role === "admin" || role === "farmer" || role === "cooperative";
}

/**
 * Vérifie si l'utilisateur est authentifié ET est admin
 */
export function isAuthenticatedAdmin(): boolean {
  return isAuthenticated() && isAdmin();
}

/**
 * Vérifie si l'utilisateur est authentifié ET a accès à l'admin
 */
export function isAuthenticatedWithAdminAccess(): boolean {
  return isAuthenticated() && hasAdminAccess();
}

/**
 * Récupère l'utilisateur actuel
 */
export function getCurrentUser() {
  const auth = getAuth();
  return auth?.user;
}
