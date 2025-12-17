"use client"

import * as React from "react"
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  QrCode,
  Check,
  Eye
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "sonner"
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"
import { Batch, CreateBatchDto, BatchStatus } from "@/types/batch"
import { Harvest } from "@/types/harvest"

const batchStatuses = [
  { value: "created", label: "Créé" },
  { value: "processed", label: "Traité" },
  { value: "exported", label: "Exporté" },
]

export default function BatchPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedBatch, setSelectedBatch] = React.useState<Batch | null>(null)
  
  // Utilisation directe du type CreateBatchDto importé
  const [formData, setFormData] = React.useState<CreateBatchDto>({
    harvestIds: [],
    qrCode: "",
    batchHash: "",
    status: BatchStatus.CREATED,
  })

  // Récupération des lots
  const { data: batches = [], isLoading: isLoadingBatches, refetch } = useApiQuery<Batch[]>(
    ["batches", searchQuery],
    `/batches${searchQuery ? `?qrCode=${encodeURIComponent(searchQuery)}` : ""}`
  )

  // Récupération des récoltes pour la sélection
  const { data: harvests = [], isLoading: isLoadingHarvests } = useApiQuery<Harvest[]>(
    ["harvests"],
    "/harvests"
  )

  const createMutation = useApiMutation<Batch, CreateBatchDto>(
    "/batches",
    "POST",
    {
      onSuccess: () => {
        toast.success("Lot créé avec succès")
        setIsAddDialogOpen(false)
        refetch()
      },
    }
  )

  const updateMutation = useApiMutation<Batch, CreateBatchDto>(
    () => `/batches/${selectedBatch?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Lot mis à jour avec succès")
        setIsEditDialogOpen(false)
        setSelectedBatch(null)
        refetch()
      },
    }
  )

  const deleteMutation = useApiMutation<void, void>(
    () => `/batches/${selectedBatch?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Lot supprimé avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedBatch(null)
        refetch()
      },
    }
  )

  const handleAdd = () => {
    // Générer un QR code et un hash par défaut pour faciliter la saisie
    const timestamp = Date.now();
    setFormData({
      harvestIds: [],
      qrCode: `BATCH-${timestamp}`,
      batchHash: `HASH-${timestamp}`,
      status: BatchStatus.CREATED,
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch)
    setFormData({
      harvestIds: batch.harvests?.map((h) => h.id) || [],
      qrCode: batch.qrCode,
      batchHash: batch.batchHash,
      // @ts-ignore - Le type status de l'API peut ne pas correspondre exactement à l'enum local si pas strict
      status: batch.status, 
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (batch: Batch) => {
    setSelectedBatch(batch)
    setIsDeleteDialogOpen(true)
  }

  const handleView = (batch: Batch) => {
    setSelectedBatch(batch)
    setIsViewDialogOpen(true)
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.harvestIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une récolte")
      return
    }
    createMutation.mutate(formData)
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBatch) return
    updateMutation.mutate(formData)
  }

  const handleConfirmDelete = () => {
    if (!selectedBatch) return
    deleteMutation.mutate(undefined)
  }

  const toggleHarvestSelection = (harvestId: string) => {
    setFormData(prev => {
      const isSelected = prev.harvestIds.includes(harvestId);
      if (isSelected) {
        return { ...prev, harvestIds: prev.harvestIds.filter(id => id !== harvestId) };
      } else {
        return { ...prev, harvestIds: [...prev.harvestIds, harvestId] };
      }
    });
  }

  const renderHarvestSelection = () => (
    <div className="grid gap-2">
      <Label>Sélectionner les récoltes à inclure *</Label>
      {isLoadingHarvests ? (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" /> Chargement des récoltes...
        </div>
      ) : harvests.length === 0 ? (
        <div className="p-4 border rounded-md text-sm text-center text-muted-foreground bg-muted/20">
          Aucune récolte disponible. Veuillez d'abord ajouter des récoltes.
        </div>
      ) : (
        <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 space-y-2 bg-muted/10">
          {harvests.map((harvest) => {
            const isSelected = formData.harvestIds.includes(harvest.id);
            return (
              <div 
                key={harvest.id} 
                className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${isSelected ? "bg-primary/10 border-primary/20" : "hover:bg-muted"}`}
                onClick={() => toggleHarvestSelection(harvest.id)}
              >
                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "bg-[#3A8F4C] border-[#3A8F4C] text-white" : "border-muted-foreground"}`}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div className="flex-1 text-sm">
                  <div className="font-medium text-foreground">
                    {harvest.quantity}kg - {harvest.product?.name || "Produit inconnu"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Du {new Date(harvest.harvestAt).toLocaleDateString()}
                    {harvest.farmer?.name && ` • ${harvest.farmer.name}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="text-xs text-muted-foreground text-right">
        {formData.harvestIds.length} récolte(s) sélectionnée(s)
      </div>
    </div>
  );

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
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
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
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              batch.status === 'created' ? 'bg-blue-100 text-blue-800' :
                              batch.status === 'processed' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {batchStatuses.find(s => s.value === batch.status)?.label || batch.status}
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
                  onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                  placeholder="BATCH-..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batchHash">Batch hash *</Label>
                <Input
                  id="batchHash"
                  value={formData.batchHash}
                  onChange={(e) => setFormData({ ...formData, batchHash: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
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
                disabled={createMutation.isPending || formData.harvestIds.length === 0}
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
                  onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-batchHash">Batch hash *</Label>
                <Input
                  id="edit-batchHash"
                  value={formData.batchHash}
                  onChange={(e) => setFormData({ ...formData, batchHash: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Statut</Label>
                <select
                  id="edit-status"
                  className="border rounded-md px-3 py-2 bg-background w-full"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
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
              Êtes-vous sûr de vouloir supprimer ce lot ? Cette action est irréversible.
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
            <DialogTitle>Détails du lot</DialogTitle>
            <DialogDescription>
              Informations complètes sur le lot et ses récoltes
            </DialogDescription>
          </DialogHeader>
          
          {selectedBatch && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">QR Code</Label>
                  <div className="font-mono font-medium">{selectedBatch.qrCode}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="capitalize">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedBatch.status === 'created' ? 'bg-blue-100 text-blue-800' :
                      selectedBatch.status === 'processed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {batchStatuses.find(s => s.value === selectedBatch.status)?.label || selectedBatch.status}
                    </span>
                  </div>
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-muted-foreground">Hash</Label>
                  <div className="font-mono text-sm break-all">{selectedBatch.batchHash}</div>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Date de création</Label>
                  <div>{new Date(selectedBatch.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <div className="h-4 w-1 bg-[#3A8F4C] rounded-full" />
                  Récoltes incluses ({selectedBatch.harvests?.length || 0})
                </h4>
                
                <div className="max-h-[250px] overflow-y-auto border rounded-md p-2 space-y-2 bg-muted/10">
                  {selectedBatch.harvests && selectedBatch.harvests.length > 0 ? (
                    selectedBatch.harvests.map((harvestRef) => {
                      // Try to find full harvest details if available in the global list
                      const harvestDetails = harvests.find(h => h.id === harvestRef.id);
                      
                      return (
                        <div key={harvestRef.id} className="flex items-start gap-3 p-3 bg-background rounded border">
                          <div className="flex-1 text-sm">
                            {harvestDetails ? (
                              <>
                                <div className="font-medium text-foreground">
                                  {harvestDetails.quantity}kg - {harvestDetails.product?.name || "Produit inconnu"}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Du {new Date(harvestDetails.harvestAt).toLocaleDateString()}
                                  {harvestDetails.farmer && ` • ${harvestDetails.farmer.name}`}
                                </div>
                              </>
                            ) : (
                              <div className="text-muted-foreground">
                                ID: {harvestRef.id} (Détails non disponibles)
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      Aucune récolte associée
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
