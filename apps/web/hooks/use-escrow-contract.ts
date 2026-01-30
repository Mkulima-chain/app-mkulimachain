"use client";

import { useState, useCallback } from "react";
import { EscrowContractService } from "@/services/lucid/escrow-contract.service";
import { EscrowDatum, DisputeDecision } from "@/types/contracts";
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
 * React Hook for Escrow Contract operations
 */
export function useEscrowContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  /**
   * Initialize Lucid and Escrow Service
   */
  const getService = useCallback(async () => {
    // First try to get the shared Lucid instance from wallet banner
    let lucid = getLucidFromWindow();

    if (!lucid) {
      // Fallback: initialize new Lucid and connect wallet
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

    return new EscrowContractService(lucid);
  }, []);

  /**
   * Lock funds in escrow
   */
  const lockFunds = useCallback(
    async (params: {
      amountADA: number;
      beneficiaryAddress: string;
      arbiterAddress: string;
      deadlineHours: number;
      description: string;
    }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.lockFunds(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to lock funds";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Release funds to beneficiary
   */
  const releaseFunds = useCallback(
    async (params: { escrowUtxo: any; datum: EscrowDatum }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.releaseFunds(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to release funds";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Refund to payer
   */
  const refundPayer = useCallback(
    async (params: { escrowUtxo: any; datum: EscrowDatum }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.refundPayer(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to refund";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Create a dispute
   */
  const createDispute = useCallback(
    async (params: { escrowUtxo: any; datum: EscrowDatum; reason: string }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.createDispute(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create dispute";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Resolve a dispute
   */
  const resolveDispute = useCallback(
    async (params: {
      escrowUtxo: any;
      datum: EscrowDatum;
      decision: DisputeDecision;
    }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.resolveDispute(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to resolve dispute";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Get all escrows
   */
  const getEscrows = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const service = await getService();
      const utxos = await service.getEscrowUtxos();
      return utxos;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch escrows";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  return {
    // State
    isLoading,
    error,
    txHash,

    // Methods
    lockFunds,
    releaseFunds,
    refundPayer,
    createDispute,
    resolveDispute,
    getEscrows,
  };
}
