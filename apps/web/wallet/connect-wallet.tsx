"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWalletAtom } from "@/hooks/useWalletAtom";
import { getAvailableWallets } from "@/lib/wallet";

interface ConnectWalletProps {
  onConnect?: (address: string) => void;
  buttonText?: string;
}

export function ConnectWallet({
  onConnect,
  buttonText = "Connect Wallet to Register",
}: ConnectWalletProps) {
  const { connect, disconnect, connected, address, walletName } =
    useWalletAtom();

  const [connecting, setConnecting] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);

  // Load available wallets
  useEffect(() => {
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);
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
      begin: "Begin",
      vespr: "Vespr",
    };

    if (name.toLowerCase() in walletNameMap) {
      return walletNameMap[name.toLowerCase()];
    }

    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  useEffect(() => {
    // Notify parent component when wallet is connected
    if (connected && address) {
      onConnect?.(address);
    }
  }, [connected, address, onConnect]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (showWalletModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [showWalletModal]);

  const handleWalletSelect = async (walletId: string) => {
    try {
      setConnecting(true);
      setConnectionError(null);
      setShowWalletModal(false);

      const result = await connect(walletId);

      // Check if we got a valid result with an address
      if (!result || !result.address) {
        throw new Error("Failed to connect to wallet: No address returned");
      }
    } catch (err) {
      console.error(`Error connecting to wallet:`, err);
      setConnectionError(
        err instanceof Error ? err.message : "Failed to connect wallet"
      );
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowDisconnect(false);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <div>
      {!connected ? (
        <div className="relative">
          <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
            <DialogTrigger asChild>
              <button
                className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl
                  hover:from-violet-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/20
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-lg font-medium"
                disabled={connecting}
              >
                {connecting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg
                      className="mr-3 h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    {buttonText}
                  </div>
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="p-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 text-white rounded-xl shadow-2xl border border-white/20 overflow-hidden relative">
              <DialogHeader className="px-6 py-4 border-b border-white/20">
                <div className="flex items-center justify-center w-full">
                  <DialogTitle className="text-2xl font-bold text-white">
                    Select Wallet
                  </DialogTitle>
                </div>
              </DialogHeader>
              <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {availableWallets.length === 0 ? (
                  <div className="py-10 text-center">
                    <svg
                      className="mx-auto h-20 w-20 text-white/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="mt-5 text-white/60 text-xl font-medium">
                      No wallets found
                    </p>
                    <p className="mt-2 text-white/40 text-sm">
                      Install Nami, Eternl, or another Cardano wallet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableWallets.map((walletId) => (
                      <button
                        key={walletId}
                        onClick={() => handleWalletSelect(walletId)}
                        className="w-full flex items-center p-5 rounded-xl text-white bg-white/10 hover:bg-white/20 transition-all border border-white/20 hover:border-white/40 hover:shadow-lg"
                      >
                        <div className="w-12 h-12 mr-5 bg-white/20 rounded-lg flex items-center justify-center">
                          <span className="text-2xl font-bold">
                            {formatWalletName(walletId)[0]}
                          </span>
                        </div>
                        <span className="font-medium text-xl">
                          {formatWalletName(walletId)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {connectionError && (
            <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-500/30">
              <p className="text-sm text-white">
                <span className="font-medium">Error:</span> {connectionError}
              </p>
              <p className="text-xs text-white/70 mt-1">
                Please make sure your wallet extension is installed and enabled.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <button
            className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl
              hover:from-violet-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/20
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 text-lg font-medium"
            onClick={() => setShowDisconnect(!showDisconnect)}
          >
            <div className="flex items-center justify-center">
              <svg
                className="mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="truncate max-w-[180px]">
                {walletName ? formatWalletName(walletName) : "Wallet Connected"}
              </span>
            </div>
          </button>

          {showDisconnect && (
            <div className="absolute w-full mt-2 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg overflow-hidden z-10">
              <button
                onClick={handleDisconnect}
                className="w-full py-3 px-4 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              >
                <svg
                  className="mr-2 h-5 w-5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      )}

      {connected && (
        <div className="mt-4 bg-white/5 backdrop-blur p-3 rounded-xl border border-white/10">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
            <p className="text-sm text-white/80">
              <span className="font-medium">Wallet Connected: </span>
              {address.slice(0, 8)}...{address.slice(-6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
