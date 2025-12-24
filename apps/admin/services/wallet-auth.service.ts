import { Lucid } from "lucid-cardano";
import { createDidProof } from "@/lib/did-generator";

interface AuthSession {
  accessToken: string;
  did: string;
  userId?: string;
  timestamp: number;
}

const SESSION_KEY = "wallet_session";
const DID_KEY = "user_did";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export const walletAuthService = {
  async createSession(lucid: Lucid, did: string): Promise<AuthSession> {
    try {
      const proof = await createDidProof(lucid, did);
      const proofString = JSON.stringify(proof);

      // Send DID and proof to backend
      const response = await fetch(`${API_URL}/auth/wallet-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          did,
          didProof: proofString,
        }),
      });

      if (!response.ok) {
        throw new Error("Authentication failed");
      }

      const session = await response.json();
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      if (session.did) {
        localStorage.setItem(DID_KEY, session.did);
      }

      return session;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  },

  async verifySession(): Promise<boolean> {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (!sessionData) return false;

      const session: AuthSession = JSON.parse(sessionData);

      const did = localStorage.getItem(DID_KEY);
      if (!did) return false;

      const now = Date.now();
      if (now - session.timestamp > 24 * 60 * 60 * 1000) {
        this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error verifying session:", error);
      return false;
    }
  },

  getDID(): string | null {
    return localStorage.getItem(DID_KEY);
  },

  getAccessToken(): string | null {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    const session: AuthSession = JSON.parse(sessionData);
    return session.accessToken;
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(DID_KEY);
    // userService.clearUserData();
  },
};
