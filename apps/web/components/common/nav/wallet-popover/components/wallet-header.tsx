"use client";

import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WalletHeaderProps {
  network: string | null;
  address: string | null;
  copied: boolean;
  onCopyAddress: () => void;
}

const DEFAULT_NETWORK = "Mainnet";
const NETWORK_STATUS_COLOR = "bg-green-500";

export function WalletHeader({
  network,
  address,
  copied,
  onCopyAddress,
}: WalletHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${NETWORK_STATUS_COLOR}`}
          aria-label="Network status"
        />
        <span className="text-sm text-gray-900 dark:text-white font-medium">
          {network || DEFAULT_NETWORK}
        </span>
      </div>
      {address && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
          onClick={onCopyAddress}
          aria-label={copied ? "Address copied" : "Copy address"}
        >
          {copied ? (
            <Check className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Copy className="w-4 h-4" aria-hidden="true" />
          )}
        </Button>
      )}
    </div>
  );
}
