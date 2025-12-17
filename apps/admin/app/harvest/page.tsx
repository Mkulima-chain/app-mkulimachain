"use client";

import * as React from "react";
import { CalendarClock, Loader2, Plus, Search } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { AddHarvestDialog } from "./add-harvest-dialog";
import { EditHarvestDialog } from "./edit-harvest-dialog";
import { DeleteHarvestDialog } from "./delete-harvest-dialog";
import { HarvestActionsMenu } from "./harvest-actions-menu";

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
    setFormData({
      farmerId: harvest.farmerId || "",
      productId: harvest.productId || "",
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
    updateMutation.mutate({
      ...formData,
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
        onFormDataChange={setFormData}
        onSubmit={handleSubmitAdd}
        isLoading={createMutation.isPending}
        farmers={farmers}
        products={products}
      />

      <EditHarvestDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
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
    </div>
  );
}
