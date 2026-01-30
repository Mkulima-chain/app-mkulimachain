"use client";

import * as React from "react";
import { CalendarClock, Loader2, Plus, Search, MapPin } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { AddHarvestDialog } from "./add-harvest-dialog";
import { EditHarvestDialog } from "./edit-harvest-dialog";
import { DeleteHarvestDialog } from "./delete-harvest-dialog";
import { HarvestActionsMenu } from "./harvest-actions-menu";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(
  () => import("@/components/location-picker").then((mod) => ({ default: mod.LocationPicker })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center border rounded-lg bg-muted/30">
        <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
      </div>
    ),
  }
);

type Harvest = {
  id: string;
  farmerId?: string;
  productId?: string;
  farmer?: { id: string; name?: string };
  product?: { id: string; name?: string };
  quantity: number;
  harvestAt: string;
  latitude?: number;
  longitude?: number;
  proofHash: string;
  createdAt: string;
};

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

export default function HarvestPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isMapDialogOpen, setIsMapDialogOpen] = React.useState(false);
  const [selectedHarvest, setSelectedHarvest] = React.useState<Harvest | null>(
    null
  );
  const [formData, setFormData] = React.useState<CreateHarvestDto>({
    farmerId: "",
    productId: "",
    quantity: 0,
    harvestAt: new Date().toISOString().slice(0, 16),
    latitude: undefined,
    longitude: undefined,
    proofHash: "",
  });

  const {
    data: harvests = [],
    isLoading,
    refetch,
  } = useApiQuery<Harvest[]>(
    ["harvests", searchQuery],
    `/harvests${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`
  );

  // Récupérer la liste des produits
  const { data: products = [] } = useApiQuery<Product[]>(
    ["products"],
    "/products"
  );

  const { data: farmers = [] } = useApiQuery<Farmer[]>(["farmers"], "/farmers");

  console.log(farmers);

  const createMutation = useApiMutation<Harvest, CreateHarvestDto>(
    "/harvests",
    "POST",
    {
      onSuccess: () => {
        toast.success("Récolte ajoutée avec succès");
        setIsAddDialogOpen(false);
        refetch();
      },
    }
  );

  const updateMutation = useApiMutation<Harvest, CreateHarvestDto>(
    () => `/harvests/${selectedHarvest?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Récolte mise à jour avec succès");
        setIsEditDialogOpen(false);
        setSelectedHarvest(null);
        refetch();
      },
    }
  );

  const deleteMutation = useApiMutation<void, void>(
    () => `/harvests/${selectedHarvest?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Récolte supprimée avec succès");
        setIsDeleteDialogOpen(false);
        setSelectedHarvest(null);
        refetch();
      },
    }
  );

  // Fonction pour générer un hash automatique
  const generateProofHash = async (data: CreateHarvestDto): Promise<string> => {
    const dataString = JSON.stringify({
      farmerId: data.farmerId,
      productId: data.productId,
      quantity: data.quantity,
      harvestAt: data.harvestAt,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: Date.now(),
    });
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  // Wrapper pour onFormDataChange qui génère automatiquement le hash
  const handleFormDataChange = React.useCallback(async (data: CreateHarvestDto) => {
    // Générer le hash seulement lors de l'ajout (quand le hash est vide ou lors de l'ajout) et si les champs requis sont remplis
    const shouldGenerateHash = isAddDialogOpen && !data.proofHash && data.farmerId && data.productId && data.quantity > 0 && data.harvestAt;
    
    if (shouldGenerateHash) {
      const hash = await generateProofHash(data);
      setFormData({ ...data, proofHash: hash });
    } else {
      setFormData(data);
    }
  }, [isAddDialogOpen]);

  const handleAdd = () => {
    setFormData({
      farmerId: "",
      productId: "",
      quantity: 0,
      harvestAt: new Date().toISOString().slice(0, 16),
      latitude: undefined,
      longitude: undefined,
      proofHash: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (harvest: Harvest) => {
    setSelectedHarvest(harvest);
    // Récupérer les IDs depuis farmerId/productId ou depuis les objets farmer/product
    const farmerId = harvest.farmerId || harvest.farmer?.id || "";
    const productId = harvest.productId || harvest.product?.id || "";
    
    setFormData({
      farmerId,
      productId,
      quantity: harvest.quantity,
      harvestAt: harvest.harvestAt?.slice(0, 16) || "",
      latitude: harvest.latitude,
      longitude: harvest.longitude,
      proofHash: harvest.proofHash,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (harvest: Harvest) => {
    setSelectedHarvest(harvest);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (harvest: Harvest) => {
    setSelectedHarvest(harvest);
    setIsViewDialogOpen(true);
  };

  const handleDuplicate = (harvest: Harvest) => {
    // Récupérer les IDs depuis farmerId/productId ou depuis les objets farmer/product
    const farmerId = harvest.farmerId || harvest.farmer?.id || "";
    const productId = harvest.productId || harvest.product?.id || "";
    
    setFormData({
      farmerId,
      productId,
      quantity: harvest.quantity,
      harvestAt: new Date().toISOString().slice(0, 16),
      latitude: harvest.latitude,
      longitude: harvest.longitude,
      proofHash: "", // Le hash sera généré automatiquement
    });
    setIsAddDialogOpen(true);
    toast.success("Récolte dupliquée, veuillez compléter les informations");
  };

  const handleViewMap = (harvest: Harvest) => {
    setSelectedHarvest(harvest);
    setIsMapDialogOpen(true);
  };

  const handleCopyHash = (harvest: Harvest) => {
    navigator.clipboard.writeText(harvest.proofHash);
    toast.success("Hash de preuve copié dans le presse-papiers");
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      quantity: Number(formData.quantity),
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHarvest) return;
    
    // Convertir harvestAt en format ISO si nécessaire
    let harvestAtValue = formData.harvestAt;
    if (harvestAtValue && !harvestAtValue.includes('Z') && !harvestAtValue.includes('+')) {
      // Si c'est un format datetime-local, le convertir en ISO
      harvestAtValue = new Date(harvestAtValue).toISOString();
    }
    
    updateMutation.mutate({
      ...formData,
      harvestAt: harvestAtValue,
      quantity: Number(formData.quantity),
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedHarvest) return;
    deleteMutation.mutate(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Récoltes</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les récoltes des agriculteurs
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une récolte
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des récoltes</CardTitle>
              <CardDescription>
                Recherchez, ajoutez ou modifiez les récoltes
              </CardDescription>
            </div>
            <CalendarClock className="h-5 w-5 text-[#3A8F4C]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par hash..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3A8F4C]" />
            </div>
          ) : (
            <div className="rounded-lg border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Farmer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Quantité (kg)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {harvests.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Aucune récolte trouvée
                        </td>
                      </tr>
                    ) : (
                      harvests.map((harvest) => (
                        <tr key={harvest.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {harvest.farmer?.name ||
                              farmers.find((f) => f.id === harvest.farmerId)
                                ?.name ||
                              harvest.farmerId ||
                              harvest.farmer?.id ||
                              "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {harvest.product?.name ||
                              products.find((p) => p.id === harvest.productId)
                                ?.name ||
                              harvest.productId ||
                              harvest.product?.id ||
                              "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {harvest.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(harvest.harvestAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <HarvestActionsMenu
                              onEdit={() => handleEdit(harvest)}
                              onDelete={() => handleDelete(harvest)}
                              onView={() => handleView(harvest)}
                              onDuplicate={() => handleDuplicate(harvest)}
                              onViewMap={() => handleViewMap(harvest)}
                              onCopyHash={() => handleCopyHash(harvest)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AddHarvestDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={handleSubmitAdd}
        isLoading={createMutation.isPending}
        farmers={farmers}
        products={products}
      />

      <EditHarvestDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={handleSubmitEdit}
        isLoading={updateMutation.isPending}
        farmers={farmers}
        products={products}
      />

      <DeleteHarvestDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-[#3A8F4C]" />
              Détails de la récolte
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur la récolte
            </DialogDescription>
          </DialogHeader>

          {selectedHarvest ? (
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Agriculteur</p>
                    <p className="text-base font-semibold">
                      {selectedHarvest.farmer?.name ||
                        farmers.find((f) => f.id === selectedHarvest.farmerId)?.name ||
                        selectedHarvest.farmerId ||
                        "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Produit</p>
                    <p className="text-base font-semibold">
                      {selectedHarvest.product?.name ||
                        products.find((p) => p.id === selectedHarvest.productId)?.name ||
                        selectedHarvest.productId ||
                        "-"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quantité</p>
                    <p className="text-base font-semibold">{selectedHarvest.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Date de récolte</p>
                    <p className="text-base">
                      {new Date(selectedHarvest.harvestAt).toLocaleString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                {(selectedHarvest.latitude && selectedHarvest.longitude) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Latitude</p>
                      <p className="text-base font-mono">{Number(selectedHarvest.latitude).toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Longitude</p>
                      <p className="text-base font-mono">{Number(selectedHarvest.longitude).toFixed(6)}</p>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Hash de preuve</p>
                  <div className="p-2 bg-muted rounded-md">
                    <p className="text-xs font-mono break-all">{selectedHarvest.proofHash}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                  <p className="text-base text-sm">
                    {new Date(selectedHarvest.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Chargement des détails...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Map Dialog */}
      <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#3A8F4C]" />
              Localisation de la récolte
            </DialogTitle>
            <DialogDescription>
              Position géographique de la récolte sur la carte
            </DialogDescription>
          </DialogHeader>

          {selectedHarvest && selectedHarvest.latitude && selectedHarvest.longitude ? (
            <div className="mt-4">
              <div className="h-96 rounded-lg border overflow-hidden">
                <LocationPicker
                  latitude={selectedHarvest.latitude}
                  longitude={selectedHarvest.longitude}
                  onLocationChange={() => {}}
                  height="h-full"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Latitude</p>
                  <p className="font-mono">{Number(selectedHarvest.latitude).toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Longitude</p>
                  <p className="font-mono">{Number(selectedHarvest.longitude).toFixed(6)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune localisation disponible pour cette récolte</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
