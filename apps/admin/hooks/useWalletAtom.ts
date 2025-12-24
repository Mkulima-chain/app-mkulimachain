import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect } from "react";

import {
  signDataAtom,
  walletInstanceAtom,
  walletOperationsAtom,
  walletStateAtom,
} from "@/lib/atoms/wallet";
import { initLucid, connectWallet } from "@/lib/lucid";

export function useWalletAtom() {
  const walletState = useAtomValue(walletStateAtom);
  const [wallet, setWalletInstance] = useAtom(walletInstanceAtom);
  const [_, dispatch] = useAtom(walletOperationsAtom);
  const [__, signData] = useAtom(signDataAtom);

  // Attempt to reconnect wallet from saved state on component mount
  useEffect(() => {
    const reconnectWallet = async () => {
      // Only attempt to reconnect if we have a stored connection state but no wallet instance
      if (walletState.connected && walletState.walletName && !wallet) {
        try {
          console.log(
            "Attempting to reconnect wallet:",
            walletState.walletName
          );
          // Connect using standard CIP-30 approach then initialize Lucid
          // @ts-ignore
          const walletApi =
            await window.cardano[walletState.walletName].enable();

          if (walletApi) {
            // Initialize Lucid
            const lucid = await initLucid();

            // Connect wallet to Lucid
            await connectWallet(lucid, walletApi);

            const address = await lucid.wallet.address();

            if (address !== walletState.address) {
              console.log("Address changed since last connection");
            }

            // Update the wallet instance
            setWalletInstance(lucid);

            console.log("Wallet reconnected successfully");
          } else {
            console.warn("Could not enable wallet during reconnection");
            // Reset the stored state since we couldn't reconnect properly
            dispatch({ type: "disconnect" });
          }
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
    wallet,
    dispatch,
    setWalletInstance,
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
      // TODO: Implement sign message
    },
    [walletState.connected, walletState.address, wallet, signData]
  );

  // The complete wallet state to return (combination of persisted state and in-memory wallet instance)
  const fullWalletState = {
    connected: walletState.connected,
    address: walletState.address,
    walletName: walletState.walletName,
    wallet,
  };

  return {
    ...fullWalletState,
    connect,
    disconnect,
    signMessage,
  };
}
