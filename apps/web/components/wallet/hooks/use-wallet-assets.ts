"use client";

import { useState, useEffect } from "react";
import { Lucid } from "lucid-cardano";
import type { Asset } from "@/components/wallet/types";

interface UseWalletAssetsProps {
  connected: boolean;
  wallet: unknown;
}

const LOVELACE_TO_ADA = 1_000_000;
const ADA_UNIT = "lovelace";

/**
 * Check if the wallet is a Lucid instance
 */
function isLucidInstance(wallet: unknown): wallet is Lucid {
  return (
    wallet !== null &&
    wallet !== undefined &&
    typeof (wallet as Lucid).wallet === "object" &&
    typeof (wallet as Lucid).wallet?.getUtxos === "function"
  );
}

export function useWalletAssets({ connected, wallet }: UseWalletAssetsProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAssets = async () => {
      if (!connected || !wallet) {
        setAssets([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check if it's a Lucid instance
        if (isLucidInstance(wallet)) {
          const utxos = await wallet.wallet.getUtxos();
          const assetsArray: Asset[] = [];

          // Aggregate all assets from all UTxOs
          const assetMap = new Map<string, bigint>();

          for (const utxo of utxos) {
            for (const [unit, quantity] of Object.entries(utxo.assets)) {
              const existing = assetMap.get(unit) || 0n;
              assetMap.set(unit, existing + quantity);
            }
          }

          // Convert to Asset array
          for (const [unit, quantity] of assetMap.entries()) {
            if (unit === "lovelace") {
              assetsArray.push({
                unit: ADA_UNIT,
                quantity: quantity.toString(),
                name: "ADA",
              });
            } else {
              // For native tokens, extract policy ID and asset name
              const policyId = unit.slice(0, 56);
              const assetNameHex = unit.slice(56);
              let assetName = assetNameHex;

              // Try to decode hex to string
              try {
                assetName = Buffer.from(assetNameHex, "hex").toString("utf-8");
              } catch {
                // Keep hex if decoding fails
              }

              assetsArray.push({
                unit,
                quantity: quantity.toString(),
                name: assetName || policyId.slice(0, 8) + "...",
              });
            }
          }

          setAssets(assetsArray);
        } else {
          // Fall back to legacy wallet behavior
          const walletInstance = wallet as {
            getBalance?: () => Promise<
              Asset[] | { lovelace?: string | number }
            >;
          };

          if (typeof walletInstance.getBalance !== "function") {
            setIsLoading(false);
            return;
          }

          const balance = await walletInstance.getBalance();

          if (Array.isArray(balance)) {
            setAssets(balance);
          } else {
            // Si le balance est un objet avec lovelace
            const assetsArray: Asset[] = [];
            if (balance.lovelace) {
              assetsArray.push({
                unit: ADA_UNIT,
                quantity: balance.lovelace,
                name: "ADA",
              });
            }
            setAssets(assetsArray);
          }
        }
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load assets");
        setError(error);
        console.error("Error loading wallet assets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, [connected, wallet]);

  const adaAsset = assets.find(
    (asset) => asset.unit === ADA_UNIT || asset.unit === ""
  );

  const otherAssets = assets.filter(
    (asset) => asset.unit !== ADA_UNIT && asset.unit !== ""
  );

  const adaBalance = adaAsset ? Number(adaAsset.quantity) / LOVELACE_TO_ADA : 0;

  return {
    assets,
    adaAsset,
    otherAssets,
    adaBalance,
    isLoading,
    error,
  };
}
