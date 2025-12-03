"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCardanoWallet } from "@/hooks";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useWalletStorage } from "./hooks/use-wallet-storage";
import { useWalletData } from "./hooks/use-wallet-data";
import { WalletGrid } from "./components/wallet-grid";
import { WalletInfoCard } from "./components/wallet-info-card";
import { PopularWallets } from "./components/popular-wallets";
import { ModalHeader } from "./components/modal-header";
import { ModalFooter } from "./components/modal-footer";
import { WalletTriggerButton } from "./components/wallet-trigger-button";
import { STORAGE_KEYS } from "./constants";

export function ModalWallet() {
  const {
    wallets,
    connect,
    disconnect,
    connected,
    wallet,
    name: walletName,
  } = useCardanoWallet();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingWalletName, setConnectingWalletName] = useState<
    string | null
  >(null);
  const [copied, setCopied] = useState(false);

  const { saveToStorage, clearStorage } = useWalletStorage();

  const { walletData: displayWalletData } = useWalletData({
    connected,
    wallet,
    saveToStorage,
  });

  const handleConnect = useCallback(
    async (name: string) => {
      try {
        setIsConnecting(true);
        setConnectingWalletName(name);
        await connect(name);

        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.WALLET_NAME, name);
        }

        setIsOpen(false);
        if (isLoginPage) {
          router.push("/");
        }
      } catch (error) {
        console.error("Error connecting wallet:", error);
      } finally {
        setIsConnecting(false);
        setConnectingWalletName(null);
      }
    },
    [connect, isLoginPage, router]
  );

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      clearStorage();
      setIsOpen(false);
      router.push("/login");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  }, [disconnect, clearStorage, router]);

  const handleCopyAddress = useCallback(async () => {
    if (displayWalletData.address) {
      try {
        await navigator.clipboard.writeText(displayWalletData.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Error copying address:", error);
      }
    }
  }, [displayWalletData.address]);

  // Redirection automatique si connecté sur la page de login
  useEffect(() => {
    if (connected && isLoginPage) {
      router.push("/");
    }
  }, [connected, isLoginPage, router]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <WalletTriggerButton 
          onClick={() => setIsOpen(true)} 
          connected={connected} 
          walletName={walletName}
          address={displayWalletData.address}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        <div className="p-4 space-y-4">
          <ModalHeader />

          {connected ? (
            <WalletInfoCard
              walletName={walletName || "Unknown"}
              walletData={displayWalletData}
              onCopyAddress={handleCopyAddress}
              copied={copied}
              onDisconnect={handleDisconnect}
            />
          ) : (
            <div className="space-y-3">
              {wallets.length === 0 ? (
                <PopularWallets />
              ) : (
                <WalletGrid
                  wallets={wallets}
                  onConnect={handleConnect}
                  isConnecting={isConnecting}
                  connectingWalletName={connectingWalletName}
                />
              )}
            </div>
          )}
        </div>

        <ModalFooter />
      </DialogContent>
    </Dialog>
  );
}
