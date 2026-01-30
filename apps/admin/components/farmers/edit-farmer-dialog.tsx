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

type CreateFarmerDto = {
  name: string;
  phone: string;
  walletAddress?: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  mobileMoneyNumber?: string;
  mobileMoneyProvider?: string;
  cooperativeId?: string;
};

interface EditFarmerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateFarmerDto;
  onFormDataChange: (data: CreateFarmerDto) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function EditFarmerDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
}: EditFarmerDialogProps) {
  const handleChange = (
    field: keyof CreateFarmerDto,
    value: string | number
  ) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;agriculteur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l&apos;agriculteur
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nom complet *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Téléphone *</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-walletAddress">
                Adresse du portefeuille Cardano
              </Label>
              <Input
                id="edit-walletAddress"
                value={formData.walletAddress || ""}
                onChange={(e) => handleChange("walletAddress", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-mobileMoneyProvider">Réseau Mobile Money</Label>
                <select
                  id="edit-mobileMoneyProvider"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.mobileMoneyProvider || ""}
                  onChange={(e) => handleChange("mobileMoneyProvider", e.target.value)}
                >
                  <option value="">Sélectionner...</option>
                  <option value="Airtel">Airtel Money</option>
                  <option value="Orange">Orange Money</option>
                  <option value="Vodacom">M-Pesa</option>
                  <option value="Africell">Africell Money</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-mobileMoneyNumber">Numéro Mobile Money</Label>
                <Input
                  id="edit-mobileMoneyNumber"
                  type="tel"
                  placeholder="+243..."
                  value={formData.mobileMoneyNumber || ""}
                  onChange={(e) => handleChange("mobileMoneyNumber", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-address">Adresse *</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-city">Ville *</Label>
              <Input
                id="edit-city"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-state">Province *</Label>
              <Input
                id="edit-state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-latitude">Latitude *</Label>
                <Input
                  id="edit-latitude"
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
                <Label htmlFor="edit-longitude">Longitude *</Label>
                <Input
                  id="edit-longitude"
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
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
