"use client";

import { useWalletAtom } from "@/hooks/useWalletAtom";
import { getAvailableWallets } from "@/lib/wallet";
import { useMemo } from "react";

interface WalletInfo {
  name: string;
  icon: string;
}

/**
 * Hook for Cardano wallet integration using Lucid-Cardano
 * Provides wallet connection, disconnection, and state management
 */
export function useCardanoWallet() {
  const { connect, disconnect, connected, lucid, walletName, address } =
    useWalletAtom();

  // Get available wallets with their icons from window.cardano
  const wallets = useMemo<WalletInfo[]>(() => {
    if (typeof window === "undefined") return [];

    const availableWallets = getAvailableWallets();
    const cardano = (window as any).cardano;

    return availableWallets.map((name) => ({
      name,
      // Get the real icon from window.cardano[walletName].icon (base64 data URL)
      icon: cardano?.[name]?.icon || "",
    }));
  }, []);

  return {
    wallets,
    connect,
    disconnect,
    connected,
    wallet: lucid,
    name: walletName,
    address,
  };
}
