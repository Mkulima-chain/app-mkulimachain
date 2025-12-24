"use client";

import { useState, useCallback } from "react";
import { AuthContractService } from "@/services/lucid/auth-contract.service";
import { AuthDatum, UserRole } from "@/types/contracts";
import { initLucid } from "@/lib/lucid";
import { Lucid } from "lucid-cardano";

/**
 * Get the Lucid instance from the connected wallet banner
 */
function getLucidFromWindow(): Lucid | null {
  if (typeof window === "undefined") return null;
  return (window as any).__lucidInstance || null;
}

/**
 * React Hook for Auth Contract operations
 * Manages user registration, verification, and role management on-chain
 */
export function useAuthContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  /**
   * Initialize Lucid and Auth Service
   */
  const getService = useCallback(async () => {
    let lucid = getLucidFromWindow();

    if (!lucid) {
      lucid = await initLucid();

      if (typeof window !== "undefined" && (window as any).cardano) {
        const cardano = (window as any).cardano;
        const walletNames = ["nami", "eternl", "flint", "lace"];

        for (const name of walletNames) {
          if (cardano[name]) {
            try {
              const walletApi = await cardano[name].enable();
              lucid.selectWallet(walletApi);
              break;
            } catch (e) {
              continue;
            }
          }
        }
      } else {
        throw new Error(
          "No Cardano wallet found. Please install Nami or Eternl."
        );
      }
    }

    return new AuthContractService(lucid);
  }, []);

  /**
   * Register a new user on-chain
   */
  const registerUser = useCallback(
    async (params: {
      role: UserRole;
      metadataHash?: string;
      signature: string;
    }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.registerUser(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to register user";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Verify a signed action
   */
  const verifyAction = useCallback(
    async (params: { authUtxo: any; datum: AuthDatum; actionHash: string }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.verifyAction(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to verify action";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Deactivate a user account
   */
  const deactivateUser = useCallback(
    async (params: { authUtxo: any; datum: AuthDatum }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.deactivateUser(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to deactivate user";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Update user role (admin/platform only)
   */
  const updateUserRole = useCallback(
    async (params: { authUtxo: any; datum: AuthDatum; newRole: UserRole }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.updateUserRole(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to update user role";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Get all auth registrations
   */
  const getAuthRegistrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const service = await getService();
      const utxos = await service.getAuthUtxos();
      return utxos;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch auth registrations";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  /**
   * Find a specific user's auth registration
   */
  const findUserAuth = useCallback(
    async (userAddress: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const service = await getService();
        const utxo = await service.findUserAuth(userAddress);
        return utxo;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to find user auth";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  return {
    // State
    isLoading,
    error,
    txHash,

    // Methods
    registerUser,
    verifyAction,
    deactivateUser,
    updateUserRole,
    getAuthRegistrations,
    findUserAuth,
  };
}
