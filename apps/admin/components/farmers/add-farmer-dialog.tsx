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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWalletAtom } from "@/hooks/useWalletAtom";
import { BrowserWallet } from "@meshsdk/core";

type CreateFarmerDto = {
  name: string;
  phone: string;
  walletAddress?: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  cooperativeId?: string;
};

interface AddFarmerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateFarmerDto;
  onFormDataChange: (data: CreateFarmerDto) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function AddFarmerDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
}: AddFarmerDialogProps) {
  const [currentStep, setCurrentStep] = React.useState<1 | 2>(1);
  const [availableWallets, setAvailableWallets] = React.useState<string[]>([]);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const { connected, address, connect, disconnect, walletName } =
    useWalletAtom();

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

  // Update formData with wallet address when connected
  React.useEffect(() => {
    if (connected && address) {
      onFormDataChange({
        ...formData,
        walletAddress: address,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, address]);

  // Reset step when dialog closes
  React.useEffect(() => {
    if (!open) {
      setCurrentStep(1);
    }
  }, [open]);

  const handleWalletConnect = async (name: string) => {
    try {
      setIsConnecting(true);
      await connect(name);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletDisconnect = async () => {
    try {
      await disconnect();
      setCurrentStep(1);
      // Clear wallet address from form
      onFormDataChange({
        ...formData,
        walletAddress: "",
      });
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  const handleChange = (
    field: keyof CreateFarmerDto,
    value: string | number
  ) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 1
              ? "Connexion du portefeuille"
              : "Ajouter un agriculteur"}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1
              ? "Connectez votre portefeuille Cardano pour continuer"
              : "Remplissez les informations pour ajouter un nouvel agriculteur"}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 1 ? (
          // Step 1: Wallet Connection
          <div className="space-y-4 py-4">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-[#3A8F4C]/10">
                  <Wallet className="h-8 w-8 text-[#3A8F4C]" />
                </div>
              </div>
              <h3 className="text-lg font-semibold">
                Connectez votre portefeuille Cardano
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Connectez votre portefeuille pour sécuriser votre compte
              </p>
              {connected && address && (
                <div className="mt-4 p-3 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">
                          Wallet connecté : {walletName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {address.slice(0, 10)}...{address.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleWalletDisconnect}
                      className="h-8"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Déconnecter
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {connected && address ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                  <p className="font-medium mb-1">
                    Wallet connecté avec succès !
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {walletName} • {address.slice(0, 10)}...{address.slice(-8)}
                  </p>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
                  >
                    Continuer
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : availableWallets.length === 0 ? (
                <div className="text-center py-6">
                  <Wallet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm font-medium mb-1">
                    Aucun portefeuille Cardano détecté
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Veuillez installer un portefeuille Cardano (Nami, Eternl,
                    etc.)
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(2)}
                  >
                    Continuer sans wallet
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <>
                  {availableWallets.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleWalletConnect(name)}
                      disabled={isConnecting}
                      className="w-full p-4 rounded-lg border hover:bg-accent transition-colors text-left flex items-center justify-between group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <Wallet className="h-5 w-5 text-[#3A8F4C]" />
                        <span className="font-medium">{name}</span>
                      </div>
                      {isConnecting ? (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-transform" />
                      )}
                    </button>
                  ))}
                  <div className="pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCurrentStep(2)}
                      className="w-full"
                    >
                      Continuer sans wallet
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Sécurisé par la blockchain Cardano
              </p>
            </div>
          </div>
        ) : (
          // Step 2: Farmer Form
          <form onSubmit={onSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+243812345678"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="walletAddress">
                    Adresse du portefeuille Cardano
                  </Label>
                  {connected && address && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleWalletDisconnect}
                      className="h-7 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <LogOut className="h-3 w-3 mr-1" />
                      Déconnecter
                    </Button>
                  )}
                </div>
                <Input
                  id="walletAddress"
                  value={formData.walletAddress || ""}
                  onChange={(e) =>
                    handleChange("walletAddress", e.target.value)
                  }
                  placeholder="addr1..."
                  disabled
                />
                {connected && address && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Wallet connecté et vérifié ({walletName})
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">Province *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      handleChange("latitude", parseFloat(e.target.value) || 0)
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      handleChange("longitude", parseFloat(e.target.value) || 0)
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isPending}
              >
                Retour
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Ajout...
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
