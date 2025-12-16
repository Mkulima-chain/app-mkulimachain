"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCardanoWallet } from "@/hooks";
import { useWalletData } from "@/components/wallet/hooks/use-wallet-data";
import { useWalletStorage } from "@/components/wallet/hooks/use-wallet-storage";
import { useWalletAssets } from "@/components/wallet/hooks/use-wallet-assets";
import { useCopyAddress } from "@/components/wallet/hooks/use-copy-address";
import { toast } from "sonner";
import { WalletTriggerButton } from "./components/wallet-trigger-button";
import { WalletHeader } from "./components/wallet-header";
import { AssetItem } from "./components/asset-item";
import { WalletActions } from "./components/wallet-actions";

const POPOVER_WIDTH = "w-80";
const POPOVER_BG = "bg-[#2D3247]";
const POPOVER_BORDER = "border-white/10";
const MAX_VISIBLE_ASSETS = 2;

export function WalletPopover() {
  const { connected, wallet, disconnect } = useCardanoWallet();
  const { saveToStorage, clearStorage } = useWalletStorage();
  const { walletData } = useWalletData({
    connected,
    wallet: wallet as unknown as Parameters<typeof useWalletData>[0]["wallet"],
    saveToStorage,
  });

  const { adaBalance, otherAssets } = useWalletAssets({
    connected,
    wallet,
  });

  const { copied, copyAddress } = useCopyAddress();

  const handleCopyAddress = () => {
    copyAddress(walletData.address);
  };

  const handleDisconnect = () => {
    disconnect();
    clearStorage();
    toast.success("Wallet déconnecté");
  };

  const displayAdaBalance = adaBalance || walletData.balance || 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <WalletTriggerButton address={walletData.address} />
      </PopoverTrigger>
      <PopoverContent
        className={`${POPOVER_WIDTH} p-0 ${POPOVER_BG} dark:${POPOVER_BG} ${POPOVER_BORDER}`}
        align="end"
      >
        <div className="p-4 space-y-4">
          <WalletHeader
            network={walletData.network}
            address={walletData.address}
            copied={copied}
            onCopyAddress={handleCopyAddress}
          />

          <div className="space-y-2">
            <AssetItem
              asset={{
                unit: "lovelace",
                quantity: displayAdaBalance * 1_000_000,
                name: "ADA",
              }}
              balance={displayAdaBalance}
              isAda
            />

            {otherAssets.slice(0, MAX_VISIBLE_ASSETS).map((asset, index) => (
              <AssetItem
                key={asset.unit || `asset-${index}`}
                asset={asset}
                balance={Number(asset.quantity)}
              />
            ))}
          </div>

          <WalletActions
            address={walletData.address}
            onDisconnect={handleDisconnect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
