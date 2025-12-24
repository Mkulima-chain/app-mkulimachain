"use client";

import * as React from "react";
import {
  Store,
  Package,
  TrendingUp,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { Batch } from "@/types/batch";
import { Farmer } from "@/types/farmer";
import { Harvest } from "@/types/harvest";

type MarketplaceItem = {
  id: string;
  batchId: string;
  farmerId: string;
  title: string;
  description?: string;
  priceADA: number;
  stockKg: number;
  status: string;
  imageUrls?: string[];
  createdAt: string;
  batch?: { id: string; qrCode: string; batchHash: string };
  farmer?: { id: string; name: string };
};

type CreateMarketplaceItemDto = {
  batchId: string;
  farmerId: string;
  title: string;
  description?: string;
  priceADA: number;
  stockKg: number;
  imageUrls?: string[];
  status?: string;
};

const statuses = [
  { value: "draft", label: "Brouillon" },
  { value: "active", label: "Actif" },
  { value: "sold_out", label: "Rupture" },
  { value: "archived", label: "Archivé" },
];

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] =
    React.useState<MarketplaceItem | null>(null);
  const [formData, setFormData] = React.useState<CreateMarketplaceItemDto>({
    batchId: "",
    farmerId: "",
    title: "",
    description: "",
    priceADA: 0,
    stockKg: 0,

    imageUrls: [],
    status: "draft",
  });

  const {
    data: items = [],
    isLoading,
    refetch,
  } = useApiQuery<MarketplaceItem[]>(
    ["marketplace", searchQuery],
    `/marketplace${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`
  );

  const { data: batches = [] } = useApiQuery<Batch[]>(["batches"], "/batches");
  const { data: farmers = [] } = useApiQuery<Farmer[]>(["farmers"], "/farmers");
  const { data: harvests = [] } = useApiQuery<Harvest[]>(
    ["harvests"],
    "/harvests"
  );

  const createMutation = useApiMutation<
    MarketplaceItem,
    CreateMarketplaceItemDto
  >("/marketplace", "POST", {
    onSuccess: () => {
      toast.success("Article créé avec succès");
      setIsAddDialogOpen(false);
      refetch();
    },
  });

  const updateMutation = useApiMutation<
    MarketplaceItem,
    CreateMarketplaceItemDto
  >(() => `/marketplace/${selectedItem?.id}`, "PUT", {
    onSuccess: () => {
      toast.success("Article mis à jour avec succès");
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      refetch();
    },
  });

  const deleteMutation = useApiMutation<void, void>(
    () => `/marketplace/${selectedItem?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Article supprimé avec succès");
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
        refetch();
      },
    }
  );

  const handleAdd = () => {
    setFormData({
      batchId: "",
      farmerId: "",
      title: "",
      description: "",
      priceADA: 0,
      stockKg: 0,

      imageUrls: [],
      status: "draft",
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setFormData({
      batchId: item.batchId,
      farmerId: item.farmerId,
      title: item.title,
      description: item.description || "",
      priceADA: item.priceADA,
      stockKg: item.stockKg,

      imageUrls: item.imageUrls || [],
      status: item.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (item: MarketplaceItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { status, ...dataToSend } = formData;
    createMutation.mutate({
      ...dataToSend,
      priceADA: Number(formData.priceADA),
      stockKg: Number(formData.stockKg),

      imageUrls: formData.imageUrls,
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    updateMutation.mutate({
      ...formData,
      priceADA: Number(formData.priceADA),
      stockKg: Number(formData.stockKg),

      imageUrls: formData.imageUrls,
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedItem) return;
    deleteMutation.mutate(undefined);
  };

  const activeItems = items.filter((i) => i.status === "active");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les produits et items de la marketplace
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un article
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Items actifs</CardTitle>
            <Store className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : activeItems.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">En vente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total items</CardTitle>
            <Package className="h-5 w-5 text-[#004D73]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : items.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Référencés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Statut courant
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : statuses.find(
                    (s) => s.value === (items[0]?.status || "draft")
                  )?.label || "-"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Premier item</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des articles</CardTitle>
              <CardDescription>
                Recherchez, ajoutez ou modifiez les articles
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un article..."
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
                        Titre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Prix (ADA/kg)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Stock (kg)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Aucun article trouvé
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              {item.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Lot: {item.batch?.qrCode || item.batchId} •
                              Vendeur: {item.farmer?.name || item.farmerId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.priceADA}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {item.stockKg}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                            {item.status}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-48 p-2">
                                <div className="space-y-1">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleView(item)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Détails
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Supprimer
                                  </button>
                                </div>
                              </PopoverContent>
                            </Popover>
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Ajouter un article</DialogTitle>
            <DialogDescription>
              Renseignez les informations de l'article
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="batchId">Batch *</Label>
                <select
                  id="batchId"
                  className="border rounded-md px-3 py-2 bg-background w-full"
                  value={formData.batchId}
                  onChange={(e) => {
                    const batchId = e.target.value;
                    // Reset dependant fields
                    const updates: any = { batchId, title: "", stockKg: 0 };

                    if (batchId) {
                      const batch = batches.find((b) => b.id === batchId);
                      if (batch) {
                        // Find associated harvests
                        const batchHarvests =
                          batch.harvests
                            ?.map((hRef) =>
                              harvests.find((h) => h.id === hRef.id)
                            )
                            .filter(Boolean) || [];

                        // Auto-select farmer if unique
                        const startFarmerIds = Array.from(
                          new Set(
                            batchHarvests
                              .map((h) => h?.farmerId)
                              .filter(Boolean)
                          )
                        );
                        if (startFarmerIds.length === 1) {
                          updates.farmerId = startFarmerIds[0] as string;
                        }
                      }
                    }

                    setFormData({ ...formData, ...updates });
                  }}
                  required
                >
                  <option value="">Sélectionner un lot</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.qrCode} ({batch.batchHash.substring(0, 8)}...)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="farmerId">Agriculteur *</Label>
                <select
                  id="farmerId"
                  className="border rounded-md px-3 py-2 bg-background w-full"
                  value={formData.farmerId}
                  onChange={(e) =>
                    setFormData({ ...formData, farmerId: e.target.value })
                  }
                  required
                >
                  <option value="">Sélectionner un agriculteur</option>
                  {farmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Selection from Batch */}
              {formData.batchId &&
                (() => {
                  const batch = batches.find((b) => b.id === formData.batchId);
                  const batchHarvests =
                    batch?.harvests
                      ?.map((hRef) => harvests.find((h) => h.id === hRef.id))
                      .filter(Boolean) || [];
                  const products = Array.from(
                    new Set(
                      batchHarvests.map((h) => h?.product?.name).filter(Boolean)
                    )
                  ) as string[];

                  if (products.length > 0) {
                    return (
                      <div className="grid gap-2 p-3 bg-muted/20 rounded-md border border-dashed">
                        <Label className="text-[#3A8F4C]">
                          Sélection rapide : Produit du lot
                        </Label>
                        <select
                          className="border rounded-md px-3 py-2 bg-background w-full"
                          onChange={(e) => {
                            const productName = e.target.value;
                            if (!productName) return;

                            // Calculate total stock for this product in the batch
                            const totalStock = batchHarvests
                              .filter((h) => h?.product?.name === productName)
                              .reduce((sum, h) => sum + (h?.quantity || 0), 0);

                            setFormData((prev) => ({
                              ...prev,
                              title: productName,
                              stockKg: totalStock,
                            }));
                          }}
                          defaultValue=""
                        >
                          <option value="">
                            -- Choisir un produit pour remplir --
                          </option>
                          {products.map((p, i) => (
                            <option key={i} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return null;
                })()}

              <div className="grid gap-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="priceADA">Prix (₳/kg) *</Label>
                  <Input
                    id="priceADA"
                    type="number"
                    step="0.000001"
                    value={formData.priceADA}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceADA: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stockKg">Stock (kg) *</Label>
                  <Input
                    id="stockKg"
                    type="number"
                    step="0.01"
                    value={formData.stockKg}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockKg: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Images du produit</Label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {formData.imageUrls?.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden border"
                    >
                      <img
                        src={url}
                        alt={`Produit ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newUrls = [...(formData.imageUrls || [])];
                          newUrls.splice(index, 1);
                          setFormData({ ...formData, imageUrls: newUrls });
                        }}
                        className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <FileUpload
                  value={undefined}
                  onChange={(url) => {
                    if (url) {
                      setFormData({
                        ...formData,
                        imageUrls: [...(formData.imageUrls || []), url],
                      });
                    }
                  }}
                  placeholder="Ajouter une image"
                  label="Ajouter une image"
                  accept="image/*"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  className="border rounded-md px-3 py-2 bg-background"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de l'article
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-batchId">Batch *</Label>
                <select
                  id="edit-batchId"
                  className="border rounded-md px-3 py-2 bg-background w-full"
                  value={formData.batchId}
                  onChange={(e) =>
                    setFormData({ ...formData, batchId: e.target.value })
                  }
                  required
                >
                  <option value="">Sélectionner un lot</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.qrCode} ({batch.batchHash.substring(0, 8)}...)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-farmerId">Agriculteur *</Label>
                <select
                  id="edit-farmerId"
                  className="border rounded-md px-3 py-2 bg-background w-full"
                  value={formData.farmerId}
                  onChange={(e) =>
                    setFormData({ ...formData, farmerId: e.target.value })
                  }
                  required
                >
                  <option value="">Sélectionner un agriculteur</option>
                  {farmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Titre *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-priceADA">Prix (₳/kg) *</Label>
                  <Input
                    id="edit-priceADA"
                    type="number"
                    step="0.000001"
                    value={formData.priceADA}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceADA: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-stockKg">Stock (kg) *</Label>
                  <Input
                    id="edit-stockKg"
                    type="number"
                    step="0.01"
                    value={formData.stockKg}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockKg: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Images du produit</Label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {formData.imageUrls?.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden border"
                    >
                      <img
                        src={url}
                        alt={`Produit ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newUrls = [...(formData.imageUrls || [])];
                          newUrls.splice(index, 1);
                          setFormData({ ...formData, imageUrls: newUrls });
                        }}
                        className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <FileUpload
                  value={undefined}
                  onChange={(url) => {
                    if (url) {
                      setFormData({
                        ...formData,
                        imageUrls: [...(formData.imageUrls || []), url],
                      });
                    }
                  }}
                  placeholder="Ajouter une image"
                  label="Ajouter une image"
                  accept="image/*"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Statut</Label>
                <select
                  id="edit-status"
                  className="border rounded-md px-3 py-2 bg-background"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'article</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Détails de l'article</DialogTitle>
            <DialogDescription>
              Informations complètes sur l'article de la marketplace
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {selectedItem?.imageUrls &&
                selectedItem.imageUrls.length > 0 ? (
                  <div className="w-24 h-24 rounded-lg border bg-muted flex-shrink-0 overflow-hidden">
                    <img
                      src={selectedItem.imageUrls[0]}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg border bg-muted flex items-center justify-center flex-shrink-0">
                    <Store className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-lg">
                    {selectedItem.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.description || "Aucune description"}
                  </p>
                  <div className="pt-2 flex gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {statuses.find((s) => s.value === selectedItem.status)
                        ?.label || selectedItem.status}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {selectedItem.priceADA} ADA/kg
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Stock disponible
                  </Label>
                  <div className="font-medium">{selectedItem.stockKg} kg</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">
                    Date de création
                  </Label>
                  <div>{new Date(selectedItem.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {selectedItem?.imageUrls && selectedItem.imageUrls.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Galerie photos
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedItem.imageUrls.map((url, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-md overflow-hidden border bg-muted"
                      >
                        <img
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border rounded-lg p-4 bg-muted/10 space-y-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <Package className="h-4 w-4 text-[#004D73]" />
                  Informations de traçabilité
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Logic to find product from batch -> harvests */}
                  {(() => {
                    const fullBatch = batches.find(
                      (b) =>
                        b.id ===
                        (selectedItem.batch?.id || selectedItem.batchId)
                    );
                    const batchHarvests =
                      fullBatch?.harvests
                        ?.map((hRef) => harvests.find((h) => h.id === hRef.id))
                        .filter(Boolean) || [];
                    const products = Array.from(
                      new Set(
                        batchHarvests.map((h) => h?.product?.name || "Inconnu")
                      )
                    );

                    return (
                      <div className="col-span-2 space-y-2 pb-3 mb-2 border-b border-border/50">
                        <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                          Produit(s) du lot
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {products.length > 0 ? (
                            products.map((p, i) => (
                              <div
                                key={i}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#3A8F4C]/10 text-[#3A8F4C] border border-[#3A8F4C]/20"
                              >
                                {/* We can import Sprout from lucide-react if needed, or just use text/icon */}
                                <span className="font-medium text-sm">{p}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              Non spécifié
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Lot (Batch)
                    </Label>
                    <div className="text-sm font-medium">
                      {selectedItem.batch?.qrCode || selectedItem.batchId}
                    </div>
                    {selectedItem.batch?.batchHash && (
                      <div className="text-xs font-mono text-muted-foreground break-all">
                        {selectedItem.batch.batchHash}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Agriculteur
                    </Label>
                    <div className="text-sm font-medium">
                      {selectedItem.farmer?.name || selectedItem.farmerId}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
