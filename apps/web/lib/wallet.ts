"use client";

import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { Lucid } from "lucid-cardano";
import { initLucid } from "./lucid";

export interface WalletState {
  connected: boolean;
  address: string;
  walletName: string;
}

// Create a custom storage that doesn't try to serialize the wallet object
const walletStateStorage = createJSONStorage<WalletState>(() => localStorage);

// Store wallet state without the actual wallet instance
export const walletStateAtom = atomWithStorage<WalletState>(
  "wallet-state",
  {
    connected: false,
    address: "",
    walletName: "",
  },
  walletStateStorage
);

// Store the Lucid instance in a separate atom (non-persisted)
export const lucidInstanceAtom = atom<Lucid | null>(null);

// Combined atom that provides complete wallet state
export const walletAtom = atom(
  (get) => {
    const state = get(walletStateAtom);
    const lucid = get(lucidInstanceAtom);
    return {
      ...state,
      lucid,
    };
  },
  (
    get,
    set,
    newState: {
      connected: boolean;
      address: string;
      lucid: Lucid | null;
      walletName: string;
    }
  ) => {
    // Update the persisted state
    set(walletStateAtom, {
      connected: newState.connected,
      address: newState.address,
      walletName: newState.walletName,
    });

    // Update the lucid instance
    set(lucidInstanceAtom, newState.lucid);
  }
);

/**
 * Get available Cardano wallets from window.cardano
 */
export function getAvailableWallets(): string[] {
  if (typeof window === "undefined") return [];

  const cardano = (window as any).cardano;
  if (!cardano) return [];

  const knownWallets = [
    "nami",
    "eternl",
    "flint",
    "lace",
    "yoroi",
    "typhon",
    "gerowallet",
  ];
  return knownWallets.filter((name) => cardano[name] !== undefined);
}

// Derived atom for wallet operations
export const walletOperationsAtom = atom(
  (get) => get(walletAtom),
  async (
    get,
    set,
    action:
      | {
          type: "connect";
          walletId: string;
        }
      | {
          type: "disconnect";
        }
  ) => {
    if (action.type === "connect") {
      try {
        console.log("Connecting wallet with Lucid:", action.walletId);

        // Initialize Lucid
        const lucid = await initLucid();

        // Get wallet API from window.cardano
        const cardano = (window as any).cardano;
        if (!cardano || !cardano[action.walletId]) {
          throw new Error(`Wallet ${action.walletId} not found`);
        }

        // Enable the wallet and get its API
        const walletApi = await cardano[action.walletId].enable();

        // Select the wallet in Lucid
        lucid.selectWallet(walletApi);

        // Get the wallet address
        const address = await lucid.wallet.address();
        console.log("Connected to address:", address);

        // Store on window for other services to access
        (window as any).__lucidInstance = lucid;

        // Update the lucid instance
        set(lucidInstanceAtom, lucid);

        // Update the persisted state
        set(walletStateAtom, {
          connected: true,
          address,
          walletName: action.walletId,
        });

        return {
          success: true,
          address,
        };
      } catch (error) {
        console.error("Error connecting wallet:", error);

        // Reset state on error
        set(lucidInstanceAtom, null);
        set(walletStateAtom, {
          connected: false,
          address: "",
          walletName: "",
        });

        throw error;
      }
    } else if (action.type === "disconnect") {
      // Clear lucid instance
      set(lucidInstanceAtom, null);

      // Clear window reference
      if (typeof window !== "undefined") {
        (window as any).__lucidInstance = null;
      }

      // Update persisted state
      set(walletStateAtom, {
        connected: false,
        address: "",
        walletName: "",
      });

      return { success: true };
    }
  }
);

// Helper atom for signing data
export const signDataAtom = atom(
  null,
  async (get, set, payload: { address: string; message: string }) => {
    const { lucid } = get(walletAtom);

    if (!lucid) {
      throw new Error("Wallet not connected");
    }

    try {
      // Lucid uses signMessage for data signing
      const signature = await lucid.wallet.signMessage(
        payload.address,
        payload.message
      );

      return signature;
    } catch (error) {
      console.error("Error signing data:", error);
      throw error;
    }
  }
);

// Legacy export for backward compatibility
export const walletInstanceAtom = lucidInstanceAtom;
