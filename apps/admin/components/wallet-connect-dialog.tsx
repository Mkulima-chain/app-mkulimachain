"use client";

import * as React from "react";
import {
    Loader2,
    Wallet,
    ChevronRight,
    LogOut,
    CheckCircle2,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWalletAtom } from "@/hooks/useWalletAtom";
import { BrowserWallet } from "@meshsdk/core";

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletConnectDialog({
  open,
  onOpenChange,
}: WalletConnectDialogProps) {
  const [availableWallets, setAvailableWallets] = React.useState<string[]>([]);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const { connected, address, connect, disconnect, walletName } = useWalletAtom();

  // Load available wallets
  React.useEffect(() => {
    const loadWallets = async () => {
      try {
        const wallets = await BrowserWallet.getInstalledWallets();
        setAvailableWallets(wallets.map((w) => w.name));
      } catch (error) {
        console.error("Error loading wallets:", error);
      }
    };
    if (open) {
      loadWallets();
    }
  }, [open]);

  const handleWalletConnect = async (name: string) => {
    try {
      setIsConnecting(true);
      await connect(name);
      // Don't close immediately to show success state or let user decide
      // onOpenChange(false); 
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connexion du portefeuille</DialogTitle>
          <DialogDescription>
            Connectez votre portefeuille Cardano pour effectuer des transactions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-[#3A8F4C]/10">
                <Wallet className="h-8 w-8 text-[#3A8F4C]" />
              </div>
            </div>
            {connected && address ? (
              <div className="space-y-2">
                 <h3 className="text-lg font-semibold text-green-600 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Connecté
                 </h3>
                 <div className="bg-muted p-3 rounded-md text-sm">
                    <p className="font-medium">{walletName}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {address.slice(0, 10)}...{address.slice(-8)}
                    </p>
                 </div>
                 <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleWalletDisconnect}
                    className="mt-2"
                 >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnecter
                 </Button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold">
                  Choisissez votre portefeuille
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Sélectionnez un portefeuille installé pour vous connecter
                </p>
              </>
            )}
          </div>

          {!connected && (
            <div className="space-y-3">
              {availableWallets.length === 0 ? (
                <div className="text-center py-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">
                    Aucun portefeuille détecté
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Installez Nami, Eternl ou Flint pour continuer
                  </p>
                  <Button
                    variant="link"
                    className="text-xs mt-2"
                    onClick={() => window.open('https://namiwallet.io/', '_blank')}
                  >
                    Installer Nami
                  </Button>
                </div>
              ) : (
                availableWallets.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleWalletConnect(name)}
                    disabled={isConnecting}
                    className="w-full p-4 rounded-lg border hover:bg-accent transition-colors text-left flex items-center justify-between group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-[#3A8F4C]" />
                      <span className="font-medium capitalize">{name}</span>
                    </div>
                    {isConnecting ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {connected ? (
             <Button onClick={() => onOpenChange(false)} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
                Terminer
             </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
