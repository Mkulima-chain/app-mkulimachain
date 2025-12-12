import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { BrowserWallet } from "@meshsdk/core";

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
export const walletInstanceAtom = atom<BrowserWallet | null>(null);

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
      wallet: BrowserWallet | null;
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

        // Enable the browser wallet
        const browserWallet = await BrowserWallet.enable(action.walletId);

        // Log the wallet object to help debugging
        console.log("Wallet enabled:", {
          hasWallet: !!browserWallet,
          methods: Object.keys(browserWallet).filter(
            (key) => typeof (browserWallet as any)[key] === "function"
          ),
        });

        // Validate wallet has required methods
        if (typeof browserWallet.getUsedAddresses !== "function") {
          throw new Error("Wallet does not support getUsedAddresses method");
        }

        if (typeof browserWallet.signData !== "function") {
          throw new Error("Wallet does not support signData method");
        }

        // Get the addresses
        const addresses = await browserWallet.getUsedAddresses();
        console.log("Got addresses:", addresses);

        if (addresses && addresses.length > 0) {
          // Preserve a direct reference to the browserWallet instance without serializing it
          set(walletInstanceAtom, browserWallet);

          // Update the persisted state
          set(walletStateAtom, {
            connected: true,
            address: addresses[0],
            walletName: action.walletId,
          });

          return {
            success: true,
            address: addresses[0],
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
      // Ensure message meets minimum length for wallet signing (at least 6 characters)
      let processedMessage = payload.message;
      if (processedMessage.length < 6) {
        console.warn(
          "Message is too short, padding to meet minimum length requirement"
        );
        processedMessage = processedMessage.padEnd(6, " ");
      }

      // Check message length and handle if too long
      if (processedMessage.length > 64) {
        console.warn("Message is long, truncating for wallet signature");
        // Truncate the message
        processedMessage = processedMessage.substring(0, 64);
      }

      // Use lowercase as required by the error message
      const lowercaseMessage = processedMessage.toLowerCase();
      console.log("Using lowercase message:", lowercaseMessage);

      // Try multiple approaches to handle different wallet implementations
      try {
        // First try: lowercase message directly
        return await wallet.signData(payload.address, lowercaseMessage);
      } catch (plainTextError) {
        console.log(
          "Lowercase text signing failed, trying hex format:",
          plainTextError
        );

        // Second try: hex-encoded lowercase message
        const messageHex = Buffer.from(lowercaseMessage).toString("hex");
        return await wallet.signData(payload.address, messageHex);
      }
    } catch (error) {
      console.error("Error signing data:", error);
      throw error;
    }
  }
);
