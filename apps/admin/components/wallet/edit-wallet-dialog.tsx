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

export type UpdateWalletDto = {
  adaAddress?: string;
  mobileMoneyNumber?: string;
  balanceADA?: number;
};

interface EditWalletDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UpdateWalletDto;
  onFormDataChange: (data: UpdateWalletDto) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function EditWalletDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isPending,
}: EditWalletDialogProps) {
  const handleChange = (
    field: keyof UpdateWalletDto,
    value: string | number
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
          <DialogTitle>Modifier le portefeuille</DialogTitle>
          <DialogDescription>
            Modifiez les informations du portefeuille
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-adaAddress">Adresse Cardano</Label>
              <Input
                id="edit-adaAddress"
                value={formData.adaAddress || ""}
                onChange={(e) => handleChange("adaAddress", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-mobileMoneyNumber">
                Numéro Mobile Money
              </Label>
              <Input
                id="edit-mobileMoneyNumber"
                value={formData.mobileMoneyNumber || ""}
                onChange={(e) =>
                  handleChange("mobileMoneyNumber", e.target.value)
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-balanceADA">Solde (ADA)</Label>
              <Input
                id="edit-balanceADA"
                type="number"
                step="0.01"
                min="0"
                value={formData.balanceADA || ""}
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
