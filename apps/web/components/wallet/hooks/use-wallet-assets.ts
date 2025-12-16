import { useState, useEffect } from "react";
import type { Asset, WalletInstance } from "@/components/wallet/types";

interface UseWalletAssetsProps {
  connected: boolean;
  wallet: unknown;
}

const LOVELACE_TO_ADA = 1_000_000;
const ADA_UNIT = "lovelace";

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
        const walletInstance = wallet as WalletInstance;

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
