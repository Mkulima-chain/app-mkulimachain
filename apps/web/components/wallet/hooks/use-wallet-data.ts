"use client";

import { useEffect, useState, useCallback } from "react";
import { Lucid } from "lucid-cardano";
import { STORAGE_KEYS, LOVELACE_TO_ADA } from "../constants";
import type { WalletData } from "../types";

interface Asset {
  unit?: string;
  quantity?: string | number;
  [key: string]: unknown;
}

// Support both Lucid and legacy Mesh-style wallets
interface LegacyWalletInstance {
  getLovelace?: () => Promise<string | number>;
  getBalance?: () => Promise<
    { lovelace?: string | number; amount?: string | number } | Asset[]
  >;
  getUsedAddresses?: () => Promise<string[]>;
  getChangeAddress?: () => Promise<string>;
  getRewardAddresses?: () => Promise<string[]>;
  getNetworkId?: () => Promise<number>;
  getNetwork?: () => Promise<string>;
}

type WalletInstance = Lucid | LegacyWalletInstance | null | undefined;

interface UseWalletDataProps {
  connected: boolean;
  wallet: WalletInstance;
  saveToStorage: (key: keyof typeof STORAGE_KEYS, value: string) => void;
}

/**
 * Check if the wallet is a Lucid instance
 */
function isLucidInstance(wallet: WalletInstance): wallet is Lucid {
  return (
    wallet !== null &&
    wallet !== undefined &&
    typeof (wallet as Lucid).wallet === "object" &&
    typeof (wallet as Lucid).wallet?.getUtxos === "function"
  );
}

/**
 * Hook pour récupérer et gérer les données du wallet (balance, adresse, réseau)
 * Supporte Lucid-Cardano et les wallets compatibles Mesh SDK
 */
export function useWalletData({
  connected,
  wallet,
  saveToStorage,
}: UseWalletDataProps) {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: null,
    address: null,
    network: null,
    isLoadingBalance: false,
    isLoadingAddress: false,
  });

  // Charger les données depuis localStorage au montage si connecté
  useEffect(() => {
    if (typeof window === "undefined" || !connected) return;

    const savedAddress = localStorage.getItem(STORAGE_KEYS.WALLET_ADDRESS);
    const savedNetwork = localStorage.getItem(STORAGE_KEYS.NETWORK);
    const savedBalance = localStorage.getItem(STORAGE_KEYS.BALANCE);

    if (savedAddress || savedNetwork || savedBalance) {
      setWalletData((prev) => ({
        ...prev,
        ...(savedAddress && { address: savedAddress }),
        ...(savedNetwork && { network: savedNetwork }),
        ...(savedBalance && { balance: Number(savedBalance) }),
      }));
    }
  }, [connected]);

  const updateWalletData = useCallback((updates: Partial<WalletData>) => {
    setWalletData((prev) => ({ ...prev, ...updates }));
  }, []);

  const fetchBalanceLucid = useCallback(
    async (lucid: Lucid) => {
      try {
        const utxos = await lucid.wallet.getUtxos();

        // Sum up all lovelace in UTxOs
        const totalLovelace = utxos.reduce((sum, utxo) => {
          return sum + (utxo.assets.lovelace || 0n);
        }, 0n);

        const adaBalance = Number(totalLovelace) / LOVELACE_TO_ADA;
        updateWalletData({ balance: adaBalance });
        saveToStorage("BALANCE", adaBalance.toString());
      } catch (error) {
        console.error("Error fetching balance (Lucid):", error);
        updateWalletData({ balance: null });
      }
    },
    [updateWalletData, saveToStorage]
  );

  const fetchBalanceLegacy = useCallback(
    async (walletInstance: LegacyWalletInstance) => {
      try {
        let lovelace: string | number = "0";

        if (typeof walletInstance.getLovelace === "function") {
          lovelace = await walletInstance.getLovelace();
        } else if (typeof walletInstance.getBalance === "function") {
          const balance = await walletInstance.getBalance();

          // Gérer le cas où getBalance retourne un tableau d'assets (Mesh SDK)
          if (Array.isArray(balance)) {
            // Chercher l'asset avec l'unit "lovelace" ou le premier asset
            const lovelaceAsset =
              balance.find(
                (asset: Asset) => asset.unit === "lovelace" || asset.unit === ""
              ) || balance[0];
            lovelace = lovelaceAsset?.quantity || "0";
          } else {
            // Gérer le cas où getBalance retourne un objet
            lovelace = balance.lovelace || balance.amount || "0";
          }
        }

        const adaBalance = Number(lovelace) / LOVELACE_TO_ADA;
        updateWalletData({ balance: adaBalance });
        saveToStorage("BALANCE", adaBalance.toString());
      } catch (error) {
        console.error("Error fetching balance (legacy):", error);
        updateWalletData({ balance: null });
      }
    },
    [updateWalletData, saveToStorage]
  );

  const fetchAddressLucid = useCallback(
    async (lucid: Lucid) => {
      try {
        const address = await lucid.wallet.address();
        if (address) {
          updateWalletData({ address });
          saveToStorage("WALLET_ADDRESS", address);
        }
      } catch (error) {
        console.error("Error fetching address (Lucid):", error);
      }
    },
    [updateWalletData, saveToStorage]
  );

  const fetchAddressLegacy = useCallback(
    async (walletInstance: LegacyWalletInstance) => {
      try {
        let address: string | null = null;

        if (typeof walletInstance.getUsedAddresses === "function") {
          const addresses = await walletInstance.getUsedAddresses();
          if (addresses && addresses.length > 0) {
            address = addresses[0];
          }
        } else if (typeof walletInstance.getChangeAddress === "function") {
          address = await walletInstance.getChangeAddress();
        } else if (typeof walletInstance.getRewardAddresses === "function") {
          const addresses = await walletInstance.getRewardAddresses();
          if (addresses && addresses.length > 0) {
            address = addresses[0];
          }
        }

        if (address) {
          updateWalletData({ address });
          saveToStorage("WALLET_ADDRESS", address);
        }
      } catch (error) {
        console.error("Error fetching address (legacy):", error);
      }
    },
    [updateWalletData, saveToStorage]
  );

  const fetchNetworkLucid = useCallback(
    async (lucid: Lucid) => {
      try {
        // Lucid stores network in its instance
        const network = lucid.network;
        if (network) {
          updateWalletData({ network });
          saveToStorage("NETWORK", network);
        } else {
          updateWalletData({ network: "Unknown" });
        }
      } catch (error) {
        console.error("Error fetching network (Lucid):", error);
        updateWalletData({ network: "Unknown" });
      }
    },
    [updateWalletData, saveToStorage]
  );

  const fetchNetworkLegacy = useCallback(
    async (walletInstance: LegacyWalletInstance) => {
      try {
        let networkName: string | null = null;

        if (typeof walletInstance.getNetworkId === "function") {
          const networkId = await walletInstance.getNetworkId();
          networkName =
            networkId === 1
              ? "Mainnet"
              : networkId === 0
                ? "Testnet"
                : `Network ${networkId}`;
        } else if (typeof walletInstance.getNetwork === "function") {
          networkName = await walletInstance.getNetwork();
        }

        if (networkName) {
          updateWalletData({ network: networkName });
          saveToStorage("NETWORK", networkName);
        } else {
          updateWalletData({ network: "Unknown" });
        }
      } catch (error) {
        console.error("Error fetching network (legacy):", error);
        updateWalletData({ network: "Unknown" });
      }
    },
    [updateWalletData, saveToStorage]
  );

  useEffect(() => {
    const fetchWalletInfo = async () => {
      if (!connected || !wallet) {
        setWalletData({
          balance: null,
          address: null,
          network: null,
          isLoadingBalance: false,
          isLoadingAddress: false,
        });
        return;
      }

      try {
        setWalletData((prev) => ({
          ...prev,
          isLoadingBalance: true,
          isLoadingAddress: true,
        }));

        // Check if wallet is Lucid instance
        if (isLucidInstance(wallet)) {
          await Promise.all([
            fetchBalanceLucid(wallet),
            fetchAddressLucid(wallet),
            fetchNetworkLucid(wallet),
          ]);
        } else {
          // Fall back to legacy methods
          const legacyWallet = wallet as LegacyWalletInstance;
          await Promise.all([
            fetchBalanceLegacy(legacyWallet),
            fetchAddressLegacy(legacyWallet),
            fetchNetworkLegacy(legacyWallet),
          ]);
        }
      } catch (error) {
        console.error("Error fetching wallet info:", error);
      } finally {
        setWalletData((prev) => ({
          ...prev,
          isLoadingBalance: false,
          isLoadingAddress: false,
        }));
      }
    };

    fetchWalletInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, wallet]);

  return { walletData, updateWalletData };
}
