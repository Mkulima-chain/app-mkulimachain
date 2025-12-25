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
import { SearchableSelect } from "@/components/ui/searchable-select";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("@/components/location-picker").then(mod => ({ default: mod.LocationPicker })), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/30">
      <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
    </div>
  ),
});

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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
              <SearchableSelect
                value={formData.farmerId}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, farmerId: value })
                }
                options={farmers}
                getOptionValue={(farmer) => farmer.id}
                getOptionLabel={(farmer) => `${farmer.name}${farmer.phone ? ` - ${farmer.phone}` : ""}`}
                placeholder="Sélectionner un agriculteur"
                searchPlaceholder="Rechercher un agriculteur..."
                emptyMessage="Aucun agriculteur trouvé"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-productId">Produit *</Label>
              <SearchableSelect
                value={formData.productId}
                onValueChange={(value) =>
                  onFormDataChange({ ...formData, productId: value })
                }
                options={products}
                getOptionValue={(product) => product.id}
                getOptionLabel={(product) => `${product.name}${product.sku ? ` (${product.sku})` : ""}`}
                placeholder="Sélectionner un produit"
                searchPlaceholder="Rechercher un produit..."
                emptyMessage="Aucun produit trouvé"
              />
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
            <div className="grid gap-2">
              <Label>Géolocalisation</Label>
              <LocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(lat, lng) =>
                  onFormDataChange({
                    ...formData,
                    latitude: lat,
                    longitude: lng,
                  })
                }
                height="h-64"
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
                readOnly
                className="bg-muted cursor-not-allowed"
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

