"use client";

import { useState, useCallback } from "react";
import { OrderContractService } from "@/services/lucid/order-contract.service";
import { OrderDatum } from "@/types/contracts";
import { initLucid } from "@/lib/lucid";
import { Lucid, UTxO } from "lucid-cardano";

/**
 * Get the Lucid instance from the connected wallet
 */
function getLucidFromWindow(): Lucid | null {
  if (typeof window === "undefined") return null;
  return (window as any).__lucidInstance || null;
}

export function useOrderContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

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

    return new OrderContractService(lucid);
  }, []);

  const shipOrder = useCallback(
    async (params: {
      orderUtxo: UTxO;
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

  const completeOrder = useCallback(
    async (params: { orderUtxo: UTxO; datum: OrderDatum }) => {
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

  const getOrderUtxos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const service = await getService();
      const utxos = await service.getOrderUtxos();
      return utxos;
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch order utxos";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  const findOrderUtxoByItemId = useCallback(
    async (itemId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const service = await getService();
        // This is a naive implementation, ideally we should filter by datum content
        // But since we can't easily decode datum in the hook without more logic,
        // we might rely on the service's findOrderByItemId if it was robust.
        // For now, let's use getOrderUtxos and try to match properties if possible
        const utxos = await service.getOrderUtxos();
        // Return all for now and filter in component, or rely on service.
        // Actually, the service has findOrderByItemId.
        const utxo = await service.findOrderByItemId(itemId);
        return utxo;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to find order utxo";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getService]
  );

  return {
    isLoading,
    error,
    txHash,
    shipOrder,
    completeOrder,
    getOrderUtxos,
    findOrderUtxoByItemId,
  };
}
