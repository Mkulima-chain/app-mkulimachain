"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
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

export enum OwnerType {
  FARMER = "farmer",
  BUYER = "buyer",
  COOPERATIVE = "cooperative",
}

export type CreateWalletDto = {
  ownerType: OwnerType;
  ownerId: string;
  adaAddress: string;
  mobileMoneyNumber?: string;
  balanceADA?: number;
};

interface AddWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateWalletDto;
  onFormDataChange: (data: CreateWalletDto) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function AddWalletDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
}: AddWalletDialogProps) {
  const handleChange = (
    field: keyof CreateWalletDto,
    value: string | number | OwnerType
  ) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un portefeuille</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour ajouter un nouveau portefeuille
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ownerType">Type de propriétaire *</Label>
              <select
                id="ownerType"
                value={formData.ownerType}
                onChange={(e) =>
                  handleChange("ownerType", e.target.value as OwnerType)
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                required
              >
                <option value={OwnerType.FARMER}>Agriculteur</option>
                <option value={OwnerType.BUYER}>Acheteur</option>
                <option value={OwnerType.COOPERATIVE}>Coopérative</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ownerId">ID du propriétaire *</Label>
              <Input
                id="ownerId"
                value={formData.ownerId}
                onChange={(e) => handleChange("ownerId", e.target.value)}
                placeholder="UUID du propriétaire"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adaAddress">Adresse Cardano *</Label>
              <Input
                id="adaAddress"
                value={formData.adaAddress}
                onChange={(e) => handleChange("adaAddress", e.target.value)}
                placeholder="addr1..."
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobileMoneyNumber">Numéro Mobile Money</Label>
              <Input
                id="mobileMoneyNumber"
                value={formData.mobileMoneyNumber || ""}
                onChange={(e) =>
                  handleChange("mobileMoneyNumber", e.target.value)
                }
                placeholder="+243812345678"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="balanceADA">Solde initial (₳)</Label>
              <Input
                id="balanceADA"
                type="number"
                step="0.01"
                min="0"
                value={formData.balanceADA || 0}
                onChange={(e) =>
                  handleChange("balanceADA", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>
          <DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
}
