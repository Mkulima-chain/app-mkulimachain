"use client";

import { WalletIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WalletInfo } from "../types";

interface WalletGridProps {
  wallets: WalletInfo[];
  onConnect: (walletName: string) => void;
  isConnecting: boolean;
  connectingWalletName: string | null;
}

export function WalletGrid({
  wallets,
  onConnect,
  isConnecting,
  connectingWalletName,
}: WalletGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {wallets.map((wallet) => {
        const isThisWalletConnecting = connectingWalletName === wallet.name;
        const isAvailable = !isThisWalletConnecting;

        return (
          <button
            key={wallet.name}
            onClick={() => onConnect(wallet.name)}
            disabled={isConnecting}
            className={cn(
              "relative group flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all",
              "hover:border-[#004D73]/50 dark:hover:border-[#004D73]/50 hover:bg-muted/50",
              "bg-card border-border",
              isThisWalletConnecting &&
                "border-[#004D73] dark:border-[#004D73] bg-muted/50",
              isConnecting &&
                !isThisWalletConnecting &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {isAvailable && (
              <div className="absolute top-2 right-2 flex size-2.5 items-center justify-center rounded-full bg-[#3A8F4C] dark:bg-[#3A8F4C] border border-background">
                <div className="size-1 rounded-full bg-white" />
              </div>
            )}

            {wallet.icon ? (
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-xl bg-muted/30 p-2 transition-all",
                  isThisWalletConnecting && "opacity-50"
                )}
              >
                {/* Use native img for base64 data URLs from wallet extensions */}
                <img
                  src={wallet.icon}
                  alt={wallet.name}
                  width={40}
                  height={40}
                  className="rounded-lg object-contain"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-xl bg-muted transition-all",
                  isThisWalletConnecting && "opacity-50"
                )}
              >
                <WalletIcon className="size-6 text-foreground" />
              </div>
            )}

            <p
              className={cn(
                "text-xs font-medium text-white dark:text-white/90 text-center leading-tight transition-all",
                isThisWalletConnecting && "opacity-50"
              )}
            >
              {wallet.name}
            </p>

            {isThisWalletConnecting && (
              <div className="absolute inset-0 flex items-center justify-center bg-card/90 dark:bg-card/90 rounded-xl backdrop-blur-sm">
                <div className="size-6 animate-spin rounded-full border-2 border-[#004D73] dark:border-white/50 border-t-transparent" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
