"use client";

import { useState, useCallback } from "react";
import { LoanContractService } from "@/services/lucid/loan-contract.service";
import { LoanDatum } from "@/types/contracts";
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
 * React Hook for Loan Contract operations
 */
export function useLoanContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  /**
   * Initialize Lucid and Loan Service
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

    return new LoanContractService(lucid);
  }, []);

  /**
   * Request a new loan
   */
  const requestLoan = useCallback(
    async (params: {
      amountADA: number;
      interestRate: number;
      durationDays: number;
      lenderAddress: string;
      platformAddress: string;
    }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.requestLoan(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to request loan";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Approve a loan
   */
  const approveLoan = useCallback(
    async (params: {
      loanUtxo: any;
      datum: LoanDatum;
      approverSignature: string;
    }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.approveLoan(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to approve loan";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Activate a loan
   */
  const activateLoan = useCallback(
    async (params: {
      loanUtxo: any;
      datum: LoanDatum;
      transactionHash: string;
    }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.activateLoan(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to activate loan";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Repay a loan
   */
  const repayLoan = useCallback(
    async (params: { loanUtxo: any; datum: LoanDatum }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.repayLoan(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to repay loan";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Mark loan as defaulted
   */
  const markDefaulted = useCallback(
    async (params: { loanUtxo: any; datum: LoanDatum }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.markDefaulted(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to mark as defaulted";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Reject a loan
   */
  const rejectLoan = useCallback(
    async (params: { loanUtxo: any; datum: LoanDatum; reason: string }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.rejectLoan(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to reject loan";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Get all loans
   */
  const getLoans = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const service = await getService();
      const utxos = await service.getLoanUtxos();
      return utxos;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch loans";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  /**
   * Calculate repayment amount
   */
  const calculateRepayment = useCallback(
    async (amountLovelace: bigint, interestRate: number) => {
      const service = await getService();
      return service.calculateRepaymentAmount(amountLovelace, interestRate);
    },
    [getService]
  );

  return {
    // State
    isLoading,
    error,
    txHash,

    // Methods
    requestLoan,
    approveLoan,
    activateLoan,
    repayLoan,
    markDefaulted,
    rejectLoan,
    getLoans,
    calculateRepayment,
  };
}
