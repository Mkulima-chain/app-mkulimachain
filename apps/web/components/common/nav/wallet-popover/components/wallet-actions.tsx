"use client";

import { Settings, ExternalLink, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface WalletActionsProps {
  address: string | null;
  onDisconnect: () => void;
}

const CARDANOSCAN_BASE_URL = "https://cardanoscan.io/address";
const DASHBOARD_PATH = "/dashboard";

export function WalletActions({ address, onDisconnect }: WalletActionsProps) {
  const router = useRouter();

  const handleViewAccount = () => {
    router.push(DASHBOARD_PATH);
  };

  const handleViewOnExplorer = () => {
    if (!address) return;
    const explorerUrl = `${CARDANOSCAN_BASE_URL}/${address}`;
    window.open(explorerUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-white/10">
      <Button
        variant="ghost"
        className="w-full justify-start text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 h-9"
        onClick={handleViewAccount}
        aria-label="View account settings"
      >
        <Settings className="w-4 h-4 mr-2" aria-hidden="true" />
        View Account
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 h-9"
        onClick={handleViewOnExplorer}
        disabled={!address}
        aria-label="View wallet on CardanoScan explorer"
      >
        <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
        View on Explorer
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/20 h-9"
        onClick={onDisconnect}
        aria-label="Disconnect wallet"
      >
        <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
        Disconnect
      </Button>
    </div>
  );
}
