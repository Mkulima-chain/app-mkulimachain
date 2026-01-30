"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wallet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Lucid } from "lucid-cardano";
import { initLucid } from "@/lib/lucid";

interface WalletInfo {
  name: string;
  icon: string;
  api: any;
}

/**
 * Wallet Connection Banner for Test Contracts Page
 * Uses Lucid-Cardano directly for wallet connection
 */
export function WalletConnectionBanner() {
  const [lucid, setLucid] = useState<Lucid | null>(null);
  const [connected, setConnected] = useState(false);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detect available wallets
  useEffect(() => {
    if (typeof window === "undefined") return;

    const detectWallets = () => {
      const wallets: WalletInfo[] = [];
      const cardano = (window as any).cardano;

      if (!cardano) {
        setAvailableWallets([]);
        setInitializing(false);
        return;
      }

      // Check for common wallets
      const walletNames = [
        "nami",
        "eternl",
        "flint",
        "lace",
        "yoroi",
        "nufi",
        "gerowallet",
        "typhoncip30",
      ];

      for (const name of walletNames) {
        if (cardano[name]) {
          wallets.push({
            name,
            icon: cardano[name].icon || "",
            api: cardano[name],
          });
        }
      }

      setAvailableWallets(wallets);
      setInitializing(false);
    };

    // Wait a bit for wallet extensions to inject
    setTimeout(detectWallets, 500);
  }, []);

  const formatWalletName = (name: string): string => {
    const walletNameMap: Record<string, string> = {
      eternl: "Eternl",
      nami: "Nami",
      flint: "Flint",
      typhoncip30: "Typhon",
      gerowallet: "Gero",
      nufi: "NuFi",
      yoroi: "Yoroi",
      cardwallet: "CardWallet",
      lace: "Lace",
    };
    return (
      walletNameMap[name.toLowerCase()] ||
      name.charAt(0).toUpperCase() + name.slice(1)
    );
  };

  const handleWalletSelect = useCallback(async (walletInfo: WalletInfo) => {
    try {
      setConnecting(true);
      setError(null);
      setShowWalletModal(false);

      console.log(`Connecting to ${walletInfo.name} wallet...`);

      // Initialize Lucid
      const lucidInstance = await initLucid();

      // Enable the wallet
      const walletApi = await walletInfo.api.enable();

      // Select wallet in Lucid
      lucidInstance.selectWallet(walletApi);

      // Get wallet address
      const walletAddress = await lucidInstance.wallet.address();

      console.log(`Connected to ${walletInfo.name}, address: ${walletAddress}`);

      setLucid(lucidInstance);
      setConnected(true);
      setWalletName(walletInfo.name);
      setAddress(walletAddress);

      // Store in localStorage for reconnection
      localStorage.setItem("connectedWallet", walletInfo.name);
    } catch (err: any) {
      console.error("Error connecting wallet:", err);
      setError(err.message || "Failed to connect wallet");
      setConnected(false);
      setLucid(null);
    } finally {
      setConnecting(false);
    }
  }, []);

  // Auto-reconnect on mount
  useEffect(() => {
    const savedWallet = localStorage.getItem("connectedWallet");
    if (savedWallet && availableWallets.length > 0) {
      const wallet = availableWallets.find((w) => w.name === savedWallet);
      if (wallet && !connected && !connecting) {
        handleWalletSelect(wallet);
      }
    }
  }, [availableWallets, connected, connecting, handleWalletSelect]);

  const disconnect = useCallback(() => {
    setLucid(null);
    setConnected(false);
    setWalletName(null);
    setAddress(null);
    localStorage.removeItem("connectedWallet");
    console.log("Wallet disconnected");
  }, []);

  // Export lucid instance for use by other components
  useEffect(() => {
    if (lucid && connected) {
      (window as any).__lucidInstance = lucid;
    } else {
      delete (window as any).__lucidInstance;
    }
  }, [lucid, connected]);

  if (initializing) {
    return (
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center gap-4">
          <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">
            Detecting wallets...
          </p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="mb-8 p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-2 border-orange-200 dark:border-orange-800 rounded-lg">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Wallet Connection Required
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              To interact with smart contracts on Cardano Preprod Testnet, you
              need to connect your wallet. Make sure you have Nami, Eternl, or
              another compatible wallet installed and configured for testnet.
            </p>

            <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
              <DialogTrigger asChild>
                <Button size="lg" disabled={connecting}>
                  {connecting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-2 h-5 w-5" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Select Your Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {availableWallets.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-gray-500 mb-2">No wallets found</p>
                      <p className="text-sm text-gray-400">
                        Please install a Cardano wallet extension like Nami or
                        Eternl
                      </p>
                      <div className="mt-4 space-y-2">
                        <a
                          href="https://namiwallet.io/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:underline"
                        >
                          Install Nami →
                        </a>
                        <a
                          href="https://eternl.io/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:underline"
                        >
                          Install Eternl →
                        </a>
                      </div>
                    </div>
                  ) : (
                    availableWallets.map((walletInfo) => (
                      <button
                        key={walletInfo.name}
                        onClick={() => handleWalletSelect(walletInfo)}
                        disabled={connecting}
                        className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-accent transition-colors disabled:opacity-50"
                      >
                        {walletInfo.icon ? (
                          <img
                            src={walletInfo.icon}
                            alt={`${walletInfo.name} icon`}
                            className="w-10 h-10"
                          />
                        ) : (
                          <Wallet className="w-10 h-10 text-gray-400" />
                        )}
                        <span className="font-medium text-lg">
                          {formatWalletName(walletInfo.name)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 rounded-md">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200 dark:border-green-800 rounded-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Wallet Connected (Lucid)
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Wallet:</span>{" "}
                {walletName ? formatWalletName(walletName) : "Unknown"}
              </p>
              {address && (
                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                  <span className="font-medium">Address:</span>{" "}
                  {address.slice(0, 20)}...{address.slice(-10)}
                </p>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnect}
          className="flex-shrink-0"
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
}

/**
 * Get the Lucid instance from the connected wallet
 * Can be used by other components/hooks
 */
export function getLucidInstance(): Lucid | null {
  if (typeof window === "undefined") return null;
  return (window as any).__lucidInstance || null;
}
