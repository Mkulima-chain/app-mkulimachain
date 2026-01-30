"use client";

import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";
import { initLucid } from "@/lib/lucid";
import {
  signDataAtom,
  lucidInstanceAtom,
  walletOperationsAtom,
  walletStateAtom,
} from "@/lib/wallet";

export function useWalletAtom() {
  const walletState = useAtomValue(walletStateAtom);
  const [lucid, setLucidInstance] = useAtom(lucidInstanceAtom);
  const [_, dispatch] = useAtom(walletOperationsAtom);
  const [__, signData] = useAtom(signDataAtom);

  // Attempt to reconnect wallet from saved state on component mount
  useEffect(() => {
    const reconnectWallet = async () => {
      // Only attempt to reconnect if we have a stored connection state but no lucid instance
      if (walletState.connected && walletState.walletName && !lucid) {
        try {
          console.log(
            "Attempting to reconnect wallet:",
            walletState.walletName
          );

          // Initialize Lucid
          const lucidInstance = await initLucid();

          // Get wallet API from window.cardano
          const cardano = (window as any).cardano;
          if (!cardano || !cardano[walletState.walletName]) {
            console.warn("Wallet not available for reconnection");
            dispatch({ type: "disconnect" });
            return;
          }

          // Enable the wallet
          const walletApi = await cardano[walletState.walletName].enable();
          lucidInstance.selectWallet(walletApi);

          // Verify the address
          const currentAddress = await lucidInstance.wallet.address();

          if (currentAddress !== walletState.address) {
            console.log("Address changed since last connection");
          }

          // Update the lucid instance
          setLucidInstance(lucidInstance);

          // Store on window for other services
          (window as any).__lucidInstance = lucidInstance;

          console.log("Wallet reconnected successfully");
        } catch (error) {
          console.error("Failed to reconnect wallet:", error);
          // Reset the stored state since we couldn't reconnect
          dispatch({ type: "disconnect" });
        }
      }
    };

    reconnectWallet();
  }, [
    walletState.connected,
    walletState.walletName,
    lucid,
    dispatch,
    setLucidInstance,
    walletState.address,
  ]);

  const connect = useCallback(
    async (walletId: string) => {
      try {
        return await dispatch({ type: "connect", walletId });
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const disconnect = useCallback(async () => {
    try {
      return await dispatch({ type: "disconnect" });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      throw error;
    }
  }, [dispatch]);

  const signMessage = useCallback(
    async (message: string) => {
      if (!walletState.address) {
        throw new Error("No address available for signing");
      }
      return await signData({ address: walletState.address, message });
    },
    [walletState.address, signData]
  );

  // The complete wallet state to return
  const fullWalletState = {
    connected: walletState.connected,
    address: walletState.address,
    walletName: walletState.walletName,
    wallet: lucid, // For backward compatibility
    lucid,
  };

  return {
    ...fullWalletState,
    connect,
    disconnect,
    signMessage,
  };
}
