"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  QrCode,
  Check,
  Eye,
  X,
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { Batch, CreateBatchDto, BatchStatus } from "@/types/batch";
import { Harvest } from "@/types/harvest";

const batchStatuses = [
  { value: "created", label: "Créé" },
  { value: "processed", label: "Traité" },
  { value: "exported", label: "Exporté" },
];

export default function BatchPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedBatch, setSelectedBatch] = React.useState<Batch | null>(null);

  // Structure pour stocker les quantités par récolte
  type HarvestQuantity = {
    harvestId: string;
    quantity: number;
  };

  // Utilisation directe du type CreateBatchDto importé
  const [formData, setFormData] = React.useState<CreateBatchDto>({
    harvestIds: [],
    qrCode: "",
    batchHash: "",
    status: BatchStatus.CREATED,
  });

  // Stocker les quantités par récolte
  const [harvestQuantities, setHarvestQuantities] = React.useState<
    Record<string, number>
  >({});

  // Récupération des lots
  const {
    data: batches = [],
    isLoading: isLoadingBatches,
    refetch,
  } = useApiQuery<Batch[]>(
    ["batches", searchQuery],
    `/batches${searchQuery ? `?qrCode=${encodeURIComponent(searchQuery)}` : ""}`
  );

  // Récupération des récoltes pour la sélection
  const { data: harvests = [], isLoading: isLoadingHarvests } = useApiQuery<
    Harvest[]
  >(["harvests"], "/harvests");

  const createMutation = useApiMutation<Batch, CreateBatchDto>(
    "/batches",
    "POST",
    {
      onSuccess: () => {
        toast.success("Lot créé avec succès");
        setIsAddDialogOpen(false);
        refetch();
      },
    }
  );

  const updateMutation = useApiMutation<Batch, CreateBatchDto>(
    () => `/batches/${selectedBatch?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Lot mis à jour avec succès");
        setIsEditDialogOpen(false);
        setSelectedBatch(null);
        refetch();
      },
      onError: (error: any) => {
        console.error("Erreur lors de la mise à jour du lot:", error);
        toast.error(error?.message || "Erreur lors de la mise à jour du lot");
      },
    }
  );

  const deleteMutation = useApiMutation<void, void>(
    () => `/batches/${selectedBatch?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Lot supprimé avec succès");
        setIsDeleteDialogOpen(false);
        setSelectedBatch(null);
        refetch();
      },
    }
  );

  const handleAdd = () => {
    // Générer un QR code et un hash par défaut pour faciliter la saisie
    const timestamp = Date.now();
    setFormData({
      harvestIds: [],
      qrCode: `BATCH-${timestamp}`,
      batchHash: `HASH-${timestamp}`,
      status: BatchStatus.CREATED,
    });
    setHarvestQuantities({});
    setIsAddDialogOpen(true);
  };

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch);

    // Utiliser batchHarvests si disponible (avec quantités partielles), sinon utiliser harvests
    let harvestIds: string[] = [];
    const quantities: Record<string, number> = {};

    if (batch.batchHarvests && batch.batchHarvests.length > 0) {
      harvestIds = batch.batchHarvests.map((bh) => bh.harvestId);
      batch.batchHarvests.forEach((bh) => {
        quantities[bh.harvestId] = Number(bh.quantity || 0);
      });
    } else if (batch.harvests) {
      harvestIds = batch.harvests.map((h) => h.id);
      // Initialiser avec les quantités totales par défaut
      harvestIds.forEach((id) => {
        const harvest = harvests.find((h) => h.id === id);
        if (harvest) {
          quantities[id] = Number(harvest.quantity || 0);
        }
      });
    }

    setFormData({
      harvestIds,
      qrCode: batch.qrCode,
      batchHash: batch.batchHash,
      // @ts-ignore - Le type status de l'API peut ne pas correspondre exactement à l'enum local si pas strict
      status: batch.status,
    });
    setHarvestQuantities(quantities);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsViewDialogOpen(true);
  };

  // Fonction pour calculer la quantité totale utilisée d'une récolte dans tous les lots
  // Utilise les quantités partielles stockées dans batchHarvests
  const getTotalUsedQuantity = (
    harvestId: string,
    excludeBatchId?: string
  ): number => {
    let total = 0;
    batches.forEach((batch) => {
      // Exclure le lot en cours d'édition
      if (excludeBatchId && batch.id === excludeBatchId) {
        return;
      }

      // Utiliser batchHarvests si disponible (avec quantités partielles)
      if (batch.batchHarvests && batch.batchHarvests.length > 0) {
        const batchHarvest = batch.batchHarvests.find(
          (bh) => bh.harvestId === harvestId
        );
        if (batchHarvest) {
          total += Number(batchHarvest.quantity || 0);
        }
      } else if (batch.harvests) {
        // Fallback: si batchHarvests n'est pas disponible, vérifier dans harvests
        const isInBatch = batch.harvests.some((h) => h.id === harvestId);
        if (isInBatch) {
          // Si on n'a pas les quantités partielles, on considère que toute la quantité est utilisée
          const harvest = harvests.find((h) => h.id === harvestId);
          if (harvest) {
            total += Number(harvest.quantity || 0);
          }
        }
      }
    });
    return total;
  };

  // Fonction pour obtenir la quantité disponible d'une récolte
  const getAvailableQuantity = (
    harvestId: string,
    excludeBatchId?: string
  ): number => {
    const harvest = harvests.find((h) => h.id === harvestId);
    if (!harvest) return 0;

    const harvestQty = Number(harvest.quantity || 0);

    // Calculer la quantité utilisée dans les AUTRES lots (excluant le lot en cours d'édition)
    const totalUsedElsewhere = getTotalUsedQuantity(harvestId, excludeBatchId);

    // Si on est en mode édition et que la récolte est déjà dans ce lot,
    // on peut utiliser jusqu'à : quantité totale - quantité utilisée ailleurs
    // (car la quantité actuellement dans ce lot sera remplacée)
    if (excludeBatchId && formData.harvestIds?.includes(harvestId)) {
      // La quantité disponible = quantité totale - quantité utilisée dans les autres lots
      return Math.max(0, harvestQty - totalUsedElsewhere);
    }

    // Sinon, la quantité disponible = quantité totale - quantité utilisée partout
    const available = harvestQty - totalUsedElsewhere;

    // Retourner la quantité disponible (peut être 0 si déjà entièrement utilisée)
    return Math.max(0, available);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.harvestIds || formData.harvestIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une récolte");
      return;
    }

    // Valider les quantités
    for (const harvestId of formData.harvestIds) {
      const harvest = harvests.find((h) => h.id === harvestId);
      if (!harvest) continue;

      const requestedQuantity =
        harvestQuantities[harvestId] || harvest.quantity;
      const availableQuantity = getAvailableQuantity(harvestId);

      if (requestedQuantity <= 0) {
        toast.error(
          `La quantité pour la récolte "${harvest.product?.name || harvestId}" doit être supérieure à 0`
        );
        return;
      }

      if (requestedQuantity > harvest.quantity) {
        toast.error(
          `La quantité demandée (${requestedQuantity}kg) pour "${harvest.product?.name || harvestId}" dépasse la quantité totale de la récolte (${harvest.quantity}kg)`
        );
        return;
      }

      if (requestedQuantity > availableQuantity) {
        const usedQty = getTotalUsedQuantity(harvestId);
        toast.error(
          `La quantité demandée (${requestedQuantity}kg) pour "${harvest.product?.name || harvestId}" dépasse la quantité disponible (${availableQuantity}kg). ` +
            `Quantité totale: ${harvest.quantity}kg, déjà utilisée: ${usedQty}kg`
        );
        return;
      }
    }

    // Préparer les données avec les quantités
    const batchData = {
      ...formData,
      harvests: (formData.harvestIds ?? []).map((harvestId) => ({
        harvestId,
        quantity:
          harvestQuantities[harvestId] ||
          harvests.find((h) => h.id === harvestId)?.quantity ||
          0,
      })),
    };

    createMutation.mutate(batchData);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    if (!formData.harvestIds || formData.harvestIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une récolte");
      return;
    }

    // Valider les quantités
    for (const harvestId of formData.harvestIds) {
      const harvest = harvests.find((h) => h.id === harvestId);
      if (!harvest) continue;

      const requestedQuantity = Number(
        harvestQuantities[harvestId] || harvest.quantity || 0
      );
      const availableQuantity = getAvailableQuantity(
        harvestId,
        selectedBatch.id
      );
      const harvestQty = Number(harvest.quantity || 0);

      console.log(`Validation pour récolte ${harvestId}:`, {
        requestedQuantity,
        availableQuantity,
        harvestQty,
        harvestQuantities: harvestQuantities[harvestId],
      });

      if (requestedQuantity <= 0) {
        toast.error(
          `La quantité pour la récolte "${harvest.product?.name || harvestId}" doit être supérieure à 0`
        );
        return;
      }

      if (requestedQuantity > harvestQty) {
        toast.error(
          `La quantité demandée (${requestedQuantity}kg) pour "${harvest.product?.name || harvestId}" dépasse la quantité totale de la récolte (${harvestQty}kg)`
        );
        return;
      }

      // Vérifier que la quantité demandée ne dépasse pas la quantité disponible
      if (requestedQuantity > availableQuantity) {
        const usedQty = getTotalUsedQuantity(harvestId, selectedBatch.id);
        toast.error(
          `La quantité demandée (${requestedQuantity}kg) pour "${harvest.product?.name || harvestId}" dépasse la quantité disponible (${availableQuantity.toFixed(2)}kg). ` +
            `Quantité totale: ${harvestQty}kg, déjà utilisée ailleurs: ${usedQty.toFixed(2)}kg`
        );
        return;
      }
    }

    // Préparer les données avec les quantités
    const batchData = {
      ...formData,
      harvests: (formData.harvestIds ?? []).map((harvestId) => {
        const qty =
          harvestQuantities[harvestId] ||
          harvests.find((h) => h.id === harvestId)?.quantity ||
          0;
        return {
          harvestId,
          quantity: Number(qty),
        };
      }),
    };

    console.log("Données envoyées pour la mise à jour:", batchData);
    updateMutation.mutate(batchData);
  };

  const handleConfirmDelete = () => {
    if (!selectedBatch) return;
    deleteMutation.mutate(undefined);
  };

  const toggleHarvestSelection = (harvestId: string) => {
    // Vérifier si la récolte est disponible avant de permettre la sélection
    const availableQty = getAvailableQuantity(harvestId, selectedBatch?.id);
    if (Number(availableQty) === 0) {
      // Ne pas permettre la sélection si la quantité disponible est 0
      return;
    }

    setFormData((prev) => {
      const currentHarvestIds = prev.harvestIds ?? [];
      const isSelected = currentHarvestIds.includes(harvestId);
      if (isSelected) {
        // Désélectionner : retirer de la liste et supprimer la quantité
        const newQuantities = { ...harvestQuantities };
        delete newQuantities[harvestId];
        setHarvestQuantities(newQuantities);
        return {
          ...prev,
          harvestIds: currentHarvestIds.filter((id) => id !== harvestId),
        };
      } else {
        // Sélectionner : ajouter à la liste et initialiser la quantité avec la quantité disponible
        const harvest = harvests.find((h) => h.id === harvestId);
        // Initialiser avec la quantité disponible (ou la quantité totale si tout est disponible)
        const initialQty = Math.min(harvest?.quantity || 0, availableQty);
        setHarvestQuantities((prev) => ({
          ...prev,
          [harvestId]: initialQty,
        }));
        return { ...prev, harvestIds: [...currentHarvestIds, harvestId] };
      }
    });
  };

  const updateHarvestQuantity = (harvestId: string, quantity: number) => {
    setHarvestQuantities((prev) => ({
      ...prev,
      [harvestId]: quantity,
    }));
  };

  const renderHarvestSelection = () => {
    return (
      <div className="grid gap-2">
        <Label>Sélectionner les récoltes à inclure *</Label>
        {isLoadingHarvests ? (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" /> Chargement des
            récoltes...
          </div>
        ) : harvests.length === 0 ? (
          <div className="p-4 border rounded-md text-sm text-center text-muted-foreground bg-muted/20">
            Aucune récolte disponible. Veuillez d'abord ajouter des récoltes.
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto border rounded-md p-2 space-y-2 bg-muted/10">
            {harvests.map((harvest) => {
              const isSelected =
                formData.harvestIds?.includes(harvest.id) ?? false;
              const availableQty = getAvailableQuantity(
                harvest.id,
                selectedBatch?.id
              );
              const usedQty = getTotalUsedQuantity(
                harvest.id,
                selectedBatch?.id
              );
              const isPartiallyUsed =
                Number(usedQty) > 0 &&
                Number(usedQty) < Number(harvest.quantity);
              const isDisabled = Number(availableQty) === 0;

              return (
                <div key={harvest.id}>
                  <div
                    className={`flex items-start gap-3 p-2 rounded transition-colors ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed bg-muted/30"
                        : isSelected
                          ? "bg-primary/10 border-primary/20 cursor-pointer"
                          : "hover:bg-muted cursor-pointer"
                    }`}
                    onClick={() => {
                      if (!isDisabled) {
                        toggleHarvestSelection(harvest.id);
                      }
                    }}
                  >
                    <div
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${
                        isDisabled
                          ? "border-muted-foreground/50 bg-muted"
                          : isSelected
                            ? "bg-[#3A8F4C] border-[#3A8F4C] text-white"
                            : "border-muted-foreground"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {isDisabled && (
                        <X className="h-3 w-3 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex-1 text-sm">
                      <div
                        className={`font-medium ${isDisabled ? "text-muted-foreground" : "text-foreground"}`}
                      >
                        {harvest.quantity}kg -{" "}
                        {harvest.product?.name || "Produit inconnu"}
                        {isPartiallyUsed && !isDisabled && (
                          <span className="ml-2 text-xs text-blue-600">
                            ({Number(availableQty).toFixed(2)}kg disponibles)
                          </span>
                        )}
                        {isDisabled && (
                          <span className="ml-2 text-xs text-red-600 font-medium">
                            (Non disponible - 0.00kg)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Du {new Date(harvest.harvestAt).toLocaleDateString()}
                        {harvest.farmer?.name && ` • ${harvest.farmer.name}`}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="ml-7 mt-2 mb-2 p-2 bg-background border rounded-md">
                      <Label className="text-xs text-muted-foreground">
                        Quantité à utiliser (max:{" "}
                        {Number(availableQty).toFixed(2)}kg disponible
                        {Number(availableQty) < Number(harvest.quantity)
                          ? ` sur ${harvest.quantity}kg`
                          : ""}
                        )
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={Number(availableQty)}
                        value={
                          harvestQuantities[harvest.id] ??
                          Math.min(
                            Number(harvest.quantity),
                            Number(availableQty)
                          )
                        }
                        onChange={(e) => {
                          const qty = parseFloat(e.target.value) || 0;
                          // Limiter à la quantité disponible (qui est déjà <= à la quantité totale)
                          const finalQty = Math.max(
                            0,
                            Math.min(qty, Number(availableQty))
                          );
                          updateHarvestQuantity(harvest.id, finalQty);
                        }}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <div>
                          Quantité totale de la récolte:{" "}
                          <span className="font-medium">
                            {harvest.quantity}kg
                          </span>
                        </div>
                        {usedQty > 0 && (
                          <div className="text-orange-600">
                            Déjà utilisée dans d'autres lots:{" "}
                            <span className="font-medium">
                              {usedQty.toFixed(2)}kg
                            </span>
                          </div>
                        )}
                        <div
                          className={
                            Number(availableQty) < Number(harvest.quantity)
                              ? "text-blue-600 font-medium"
                              : ""
                          }
                        >
                          Quantité disponible:{" "}
                          <span className="font-medium">
                            {Number(availableQty).toFixed(2)}kg
                          </span>
                        </div>
                        {Number(availableQty) === 0 && (
                          <div className="text-red-600 font-medium">
                            ⚠️ Cette récolte est entièrement utilisée dans
                            d'autres lots
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="text-xs text-muted-foreground text-right">
          {formData.harvestIds?.length ?? 0} récolte(s) sélectionnée(s)
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lots</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les lots de produits (Batches)
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Créer un lot
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des lots</CardTitle>
              <CardDescription>
                Recherchez, ajoutez ou modifiez les lots
              </CardDescription>
            </div>
            <QrCode className="h-5 w-5 text-[#3A8F4C]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par QR code..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoadingBatches ? (
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
                        QR Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Hash
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Récoltes
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
                    {batches.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Aucun lot trouvé
                        </td>
                      </tr>
                    ) : (
                      batches.map((batch) => (
                        <tr key={batch.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            {batch.qrCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-muted-foreground">
                            {batch.batchHash.substring(0, 12)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {batch.harvests?.length || 0} récolte(s)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                batch.status === "created"
                                  ? "bg-blue-100 text-blue-800"
                                  : batch.status === "processed"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {batchStatuses.find(
                                (s) => s.value === batch.status
                              )?.label || batch.status}
                            </span>
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
                                    onClick={() => handleEdit(batch)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleView(batch)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Détails
                                  </button>
                                  <button
                                    onClick={() => handleDelete(batch)}
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
            <DialogTitle>Créer un lot</DialogTitle>
            <DialogDescription>
              Sélectionnez les récoltes à grouper dans ce lot
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              {renderHarvestSelection()}

              <div className="grid gap-2">
                <Label htmlFor="qrCode">QR Code *</Label>
                <Input
                  id="qrCode"
                  value={formData.qrCode}
                  onChange={(e) =>
                    setFormData({ ...formData, qrCode: e.target.value })
                  }
                  placeholder="BATCH-..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batchHash">Batch hash *</Label>
                <Input
                  id="batchHash"
                  value={formData.batchHash}
                  onChange={(e) =>
                    setFormData({ ...formData, batchHash: e.target.value })
                  }
                  placeholder="Hash unique du lot"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  className="border rounded-md px-3 py-2 bg-background w-full"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                >
                  {batchStatuses.map((status) => (
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
                disabled={
                  createMutation.isPending ||
                  !formData.harvestIds ||
                  formData.harvestIds.length === 0
                }
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer le lot"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Modifier le lot</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du lot
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              {renderHarvestSelection()}

              <div className="grid gap-2">
                <Label htmlFor="edit-qrCode">QR Code *</Label>
                <Input
                  id="edit-qrCode"
                  value={formData.qrCode}
                  onChange={(e) =>
                    setFormData({ ...formData, qrCode: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-batchHash">Batch hash *</Label>
                <Input
                  id="edit-batchHash"
                  value={formData.batchHash}
                  onChange={(e) =>
                    setFormData({ ...formData, batchHash: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Statut</Label>
                <select
                  id="edit-status"
                  className="border rounded-md px-3 py-2 bg-background w-full"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as any })
                  }
                >
                  {batchStatuses.map((status) => (
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
            <DialogTitle>Supprimer le lot</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce lot ? Cette action est
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-[#3A8F4C]" />
              Détails du lot
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur le lot et ses récoltes
            </DialogDescription>
          </DialogHeader>

          {selectedBatch &&
            (() => {
              // Calculer la quantité totale du lot
              // Utiliser batchHarvests si disponible (avec quantités partielles), sinon utiliser harvests
              let totalQuantity = 0;

              if (
                selectedBatch.batchHarvests &&
                selectedBatch.batchHarvests.length > 0
              ) {
                // Utiliser les quantités stockées dans batchHarvests
                totalQuantity = Number(
                  selectedBatch.batchHarvests.reduce((total, bh) => {
                    return total + Number(bh.quantity || 0);
                  }, 0)
                );
              } else if (selectedBatch.harvests) {
                // Fallback: utiliser les quantités complètes des récoltes
                totalQuantity = Number(
                  selectedBatch.harvests.reduce((total, harvestRef) => {
                    const harvestDetails = harvests.find(
                      (h) => h.id === harvestRef.id
                    );
                    return total + Number(harvestDetails?.quantity || 0);
                  }, 0)
                );
              }

              return (
                <div className="space-y-6">
                  {/* Informations principales */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        QR Code
                      </Label>
                      <div className="font-mono font-semibold text-base">
                        {selectedBatch.qrCode}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Statut
                      </Label>
                      <div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            selectedBatch.status === "created"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              : selectedBatch.status === "processed"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          }`}
                        >
                          {batchStatuses.find(
                            (s) => s.value === selectedBatch.status
                          )?.label || selectedBatch.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Quantité totale
                      </Label>
                      <div className="text-2xl font-bold text-[#3A8F4C]">
                        {totalQuantity.toFixed(2)} kg
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {selectedBatch.harvests?.length || 0} récolte(s)
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Date de création
                      </Label>
                      <div className="text-sm">
                        {new Date(selectedBatch.createdAt).toLocaleDateString(
                          "fr-FR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Hash
                      </Label>
                      <div className="font-mono text-xs break-all p-2 bg-muted rounded-md">
                        {selectedBatch.batchHash}
                      </div>
                    </div>
                  </div>

                  {/* Liste des récoltes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <div className="h-4 w-1 bg-[#3A8F4C] rounded-full" />
                        Récoltes incluses
                      </h4>
                      <div className="text-sm text-muted-foreground">
                        {selectedBatch.harvests?.length || 0} récolte(s) •{" "}
                        {totalQuantity.toFixed(2)} kg
                      </div>
                    </div>

                    <div className="max-h-[300px] overflow-y-auto border rounded-md p-3 space-y-2 bg-muted/10">
                      {(() => {
                        // Utiliser batchHarvests si disponible, sinon fallback sur harvests
                        const harvestsToDisplay =
                          selectedBatch.batchHarvests &&
                          selectedBatch.batchHarvests.length > 0
                            ? selectedBatch.batchHarvests.map((bh) => ({
                                id: bh.harvestId,
                                quantity: bh.quantity,
                                harvest:
                                  bh.harvest ||
                                  harvests.find((h) => h.id === bh.harvestId),
                              }))
                            : selectedBatch.harvests?.map((h) => ({
                                id: h.id,
                                quantity:
                                  harvests.find((hr) => hr.id === h.id)
                                    ?.quantity || 0,
                                harvest: harvests.find((hr) => hr.id === h.id),
                              })) || [];

                        return harvestsToDisplay.length > 0 ? (
                          harvestsToDisplay.map((harvestItem, index) => {
                            // Toujours chercher dans harvests pour obtenir le type complet Harvest
                            const harvestDetails: Harvest | undefined =
                              harvests.find((h) => h.id === harvestItem.id);
                            const displayQuantity =
                              harvestItem.quantity ||
                              harvestDetails?.quantity ||
                              0;

                            return (
                              <div
                                key={harvestItem.id}
                                className="flex items-start gap-3 p-3 bg-background rounded-lg border hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#3A8F4C]/10 flex items-center justify-center text-xs font-medium text-[#3A8F4C]">
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  {harvestDetails ? (
                                    <>
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="font-medium text-foreground">
                                          {harvestDetails.product?.name ||
                                            "Produit inconnu"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="font-semibold text-[#3A8F4C] whitespace-nowrap">
                                            {Number(displayQuantity).toFixed(2)}{" "}
                                            kg
                                          </div>
                                          {harvestDetails.quantity &&
                                            Number(displayQuantity) <
                                              Number(
                                                harvestDetails.quantity
                                              ) && (
                                              <span className="text-xs text-muted-foreground">
                                                /{" "}
                                                {Number(
                                                  harvestDetails.quantity
                                                ).toFixed(2)}{" "}
                                                kg
                                              </span>
                                            )}
                                        </div>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                        <div>
                                          Récolté le{" "}
                                          {new Date(
                                            harvestDetails.harvestAt
                                          ).toLocaleDateString("fr-FR", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          })}
                                        </div>
                                        {harvestDetails.farmer?.name && (
                                          <div>
                                            Agriculteur:{" "}
                                            <span className="font-medium">
                                              {harvestDetails.farmer.name}
                                            </span>
                                          </div>
                                        )}
                                        {harvestDetails.proofHash && (
                                          <div className="font-mono text-[10px] break-all mt-1 opacity-70">
                                            Hash:{" "}
                                            {harvestDetails.proofHash.substring(
                                              0,
                                              20
                                            )}
                                            ...
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-sm text-muted-foreground">
                                      ID: {harvestItem.id} (Détails non
                                      disponibles)
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-8">
                            <QrCode className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p>Aucune récolte associée à ce lot</p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })()}

          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
