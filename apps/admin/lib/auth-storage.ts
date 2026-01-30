const STORAGE_KEY = "mkulima-admin-auth";

export type StoredUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
};

export type AuthPayload = {
  accessToken: string;
  refreshToken: string;
  user?: StoredUser;
};

export function saveAuth(data: AuthPayload) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as AuthPayload;
    return parsed.accessToken;
  } catch {
    return undefined;
  }
}

export function getAuth(): AuthPayload | undefined {
  if (typeof window === "undefined") return undefined;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as AuthPayload;
  } catch {
    return undefined;
  }
}

