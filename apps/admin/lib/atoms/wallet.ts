import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { Lucid } from "lucid-cardano";
import { initLucid, connectWallet } from "@/lib/lucid";

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

// Store the actual wallet instance in a separate atom (non-persisted)
export const walletInstanceAtom = atom<Lucid | null>(null);

// Combined atom that provides complete wallet state
export const walletAtom = atom(
  (get) => {
    const state = get(walletStateAtom);
    const wallet = get(walletInstanceAtom);
    return {
      ...state,
      wallet,
    };
  },
  (
    get,
    set,
    newState: {
      connected: boolean;
      address: string;
      wallet: Lucid | null;
      walletName: string;
    }
  ) => {
    // Update the persisted state
    set(walletStateAtom, {
      connected: newState.connected,
      address: newState.address,
      walletName: newState.walletName,
    });

    // Update the wallet instance
    set(walletInstanceAtom, newState.wallet);
  }
);

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
        console.log("Connecting wallet:", action.walletId);

        // Get the wallet API from window.cardano
        if (!window.cardano || !window.cardano[action.walletId]) {
          throw new Error(`Wallet ${action.walletId} not found`);
        }

        const walletApi = await window.cardano[action.walletId].enable();

        // Initialize Lucid
        const lucid = await initLucid();

        // Connect wallet to Lucid using our helper that handles types
        await connectWallet(lucid, walletApi);

        // Get address
        const address = await lucid.wallet.address();
        console.log("Got address:", address);

        if (address) {
          // Preserve a direct reference to the Lucid instance
          set(walletInstanceAtom, lucid);

          // Update the persisted state
          set(walletStateAtom, {
            connected: true,
            address: address,
            walletName: action.walletId,
          });

          return {
            success: true,
            address: address,
          };
        } else {
          throw new Error("No addresses found in wallet");
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);

        // Reset state on error
        set(walletInstanceAtom, null);
        set(walletStateAtom, {
          connected: false,
          address: "",
          walletName: "",
        });

        throw error;
      }
    } else if (action.type === "disconnect") {
      // Clear wallet instance first
      set(walletInstanceAtom, null);

      // Then update persisted state
      set(walletStateAtom, {
        connected: false,
        address: "",
        walletName: "",
      });

      return { success: true };
    }
  }
);

// Helper atom for wallet operations
export const signDataAtom = atom(
  null,
  async (get, set, payload: { address: string; message: string }) => {
    const { wallet } = get(walletAtom);

    if (!wallet) {
      throw new Error("Wallet not connected");
    }

    try {
      // Ensure message meets minimum length
      let processedMessage = payload.message;

      // Use lowercase as required
      const lowercaseMessage = processedMessage.toLowerCase();

      // Lucid expects hex string for signMessage
      const messageHex = Buffer.from(lowercaseMessage).toString("hex");

      return await wallet.wallet.signMessage(payload.address, messageHex);
    } catch (error) {
      console.error("Error signing data:", error);
      throw error;
    }
  }
);
