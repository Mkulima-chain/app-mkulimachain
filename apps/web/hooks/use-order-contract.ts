"use client";

import { useState, useCallback } from "react";
import { OrderContractService } from "@/services/lucid/order-contract.service";
import { OrderDatum } from "@/types/contracts";
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
 * React Hook for Order Contract operations
 */
export function useOrderContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  /**
   * Initialize Lucid and Order Service
   */
  const getService = useCallback(async () => {
    // First try to get the shared Lucid instance from wallet banner
    let lucid = getLucidFromWindow();

    if (!lucid) {
      // Fallback: initialize new Lucid and connect wallet
      lucid = await initLucid();

      // Connect wallet (assumes window.cardano.nami or other wallet)
      if (typeof window !== "undefined" && (window as any).cardano) {
        // Try to find an enabled wallet
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

    return new OrderContractService(lucid);
  }, []);

  /**
   * Create a new order
   */
  const createOrder = useCallback(
    async (params: {
      itemId: string;
      quantityKg: number;
      pricePerKgADA: number;
      sellerAddress: string;
      platformAddress: string;
      platformFeePercent: number;
    }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.createOrder(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to create order";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Pay for an order
   */
  const payOrder = useCallback(
    async (params: { orderUtxo: any; datum: OrderDatum }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.payOrder(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to pay order";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Mark order as shipped
   */
  const shipOrder = useCallback(
    async (params: {
      orderUtxo: any;
      datum: OrderDatum;
      trackingNumber: string;
    }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.shipOrder(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to ship order";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Complete an order
   */
  const completeOrder = useCallback(
    async (params: { orderUtxo: any; datum: OrderDatum }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.completeOrder(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to complete order";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Cancel an order
   */
  const cancelOrder = useCallback(
    async (params: { orderUtxo: any; datum: OrderDatum }) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const service = await getService();
        const hash = await service.cancelOrder(params);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to cancel order";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  /**
   * Get all orders
   */
  const getOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const service = await getService();
      const utxos = await service.getOrderUtxos();
      return utxos;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch orders";
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
    createOrder,
    payOrder,
    shipOrder,
    completeOrder,
    cancelOrder,
    getOrders,
  };
}
