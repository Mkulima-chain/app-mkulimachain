"use client";
import { useState, useEffect } from "react";
import { useWalletAtom } from "./useWalletAtom";
import { walletAuthService } from "@/services/wallet-auth.service";
import { useRouter } from "next/navigation";

export function useWalletAuth() {
  const { wallet, connected, disconnect } = useWalletAtom();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userDid, setUserDid] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const router = useRouter();

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const isValid = await walletAuthService.verifySession();
      setIsAuthenticated(isValid);

      if (isValid) {
        const did = walletAuthService.getDID();
        setUserDid(did);
      } else {
        setUserDid(null);
      }

      setIsLoading(false);
      setIsInitialized(true);
    };

    checkAuth();
  }, [wallet, connected]);

  // Login with wallet
  const login = async (did?: string) => {
    if (!wallet || !connected) {
      throw new Error("Wallet not connected");
    }

    if (!did) {
      throw new Error("DID is required");
    }

    setIsLoading(true);
    try {
      console.log("login did", did);
      const session = await walletAuthService.createSession(wallet, did);
      setIsAuthenticated(true);
      setUserDid(session.did || null);
      return session;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    walletAuthService.clearSession();
    setIsAuthenticated(false);
    setUserDid(null);
    disconnect();
  };

  const navigateToDashboard = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  };

  const isRouteProtected = () => {
    return !isLoading && isInitialized && !isAuthenticated;
  };

  return {
    isAuthenticated,
    isLoading,
    isInitialized,
    userDid,
    login,
    logout,
    navigateToDashboard,
    isRouteProtected,
  };
}

/**
 * Hook pour protéger une route en redirigeant vers la page de login si non authentifié
 */
export function useProtectRoute(redirectPath: string = "/login") {
  const { isLoading, isInitialized, isAuthenticated } = useWalletAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isInitialized && !isAuthenticated) {
      router.push(redirectPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, isInitialized]);
}
