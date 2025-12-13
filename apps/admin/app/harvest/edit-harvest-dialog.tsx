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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CreateHarvestDto = {
  farmerId: string;
  productId: string;
  quantity: number;
  harvestAt: string;
  latitude?: number;
  longitude?: number;
  proofHash: string;
};

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
};

type Farmer = {
  id: string;
  name: string;
  phone: string;
  city: string;
  state: string;
};

interface EditHarvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateHarvestDto;
  onFormDataChange: (data: CreateHarvestDto) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  farmers: Farmer[];
  products: Product[];
}

export function EditHarvestDialog({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  isLoading,
  farmers,
  products,
}: EditHarvestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Modifier la récolte</DialogTitle>
          <DialogDescription>
            Mettez à jour les informations de la récolte
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-farmerId">Agriculteur *</Label>
              <Select
                value={formData.farmerId}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, farmerId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un agriculteur" />
                </SelectTrigger>
                <SelectContent>
                  {farmers.map((farmer) => (
                    <SelectItem key={farmer.id} value={farmer.id}>
                      {farmer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-productId">Produit *</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, productId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un produit" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-quantity">Quantité (kg) *</Label>
              <Input
                id="edit-quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    quantity: Number(e.target.value),
                  })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-harvestAt">Date/heure *</Label>
              <Input
                id="edit-harvestAt"
                type="datetime-local"
                value={formData.harvestAt}
                onChange={(e) =>
                  onFormDataChange({ ...formData, harvestAt: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  value={formData.latitude ?? ""}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      latitude:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  value={formData.longitude ?? ""}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      longitude:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-proofHash">Proof hash *</Label>
              <Input
                id="edit-proofHash"
                value={formData.proofHash}
                onChange={(e) =>
                  onFormDataChange({ ...formData, proofHash: e.target.value })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
              disabled={isLoading}
            >
              {isLoading ? (
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

