"use client"

import * as React from "react"
import {
  CalendarClock,
  Edit,
  Leaf,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  Trash2,
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

type Harvest = {
  id: string
  farmerId?: string
  productId?: string
  farmer?: { id: string }
  product?: { id: string }
  quantity: number
  harvestAt: string
  latitude?: number
  longitude?: number
  proofHash: string
  createdAt: string
}

type CreateHarvestDto = {
  farmerId: string
  productId: string
  quantity: number
  harvestAt: string
  latitude?: number
  longitude?: number
  proofHash: string
}

export default function HarvestPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedHarvest, setSelectedHarvest] = React.useState<Harvest | null>(null)
  const [formData, setFormData] = React.useState<CreateHarvestDto>({
    farmerId: "",
    productId: "",
    quantity: 0,
    harvestAt: new Date().toISOString().slice(0, 16),
    latitude: undefined,
    longitude: undefined,
    proofHash: "",
  })

  const { data: harvests = [], isLoading, refetch } = useApiQuery<Harvest[]>(
    ["harvests", searchQuery],
    `/harvests${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`
  )

  const createMutation = useApiMutation<Harvest, CreateHarvestDto>(
    "/harvests",
    "POST",
    {
      onSuccess: () => {
        toast.success("Récolte ajoutée avec succès")
        setIsAddDialogOpen(false)
        refetch()
      },
    }
  )

  const updateMutation = useApiMutation<Harvest, CreateHarvestDto>(
    () => `/harvests/${selectedHarvest?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Récolte mise à jour avec succès")
        setIsEditDialogOpen(false)
        setSelectedHarvest(null)
        refetch()
      },
    }
  )

  const deleteMutation = useApiMutation<void, void>(
    () => `/harvests/${selectedHarvest?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Récolte supprimée avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedHarvest(null)
        refetch()
      },
    }
  )

  const handleAdd = () => {
    setFormData({
      farmerId: "",
      productId: "",
      quantity: 0,
      harvestAt: new Date().toISOString().slice(0, 16),
      latitude: undefined,
      longitude: undefined,
      proofHash: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (harvest: Harvest) => {
    setSelectedHarvest(harvest)
    setFormData({
      farmerId: harvest.farmerId || "",
      productId: harvest.productId || "",
      quantity: harvest.quantity,
      harvestAt: harvest.harvestAt?.slice(0, 16) || "",
      latitude: harvest.latitude,
      longitude: harvest.longitude,
      proofHash: harvest.proofHash,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (harvest: Harvest) => {
    setSelectedHarvest(harvest)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      quantity: Number(formData.quantity),
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
    })
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHarvest) return
    updateMutation.mutate({
      ...formData,
      quantity: Number(formData.quantity),
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
    })
  }

  const handleConfirmDelete = () => {
    if (!selectedHarvest) return
    deleteMutation.mutate(undefined)
  }

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
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Aucune récolte trouvée
                        </td>
                      </tr>
                    ) : (
                      harvests.map((harvest) => (
                        <tr key={harvest.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {harvest.farmerId || harvest.farmer?.id || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {harvest.productId || harvest.product?.id || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {harvest.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {new Date(harvest.harvestAt).toLocaleString()}
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
                                    onClick={() => handleEdit(harvest)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDelete(harvest)}
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
            <DialogTitle>Ajouter une récolte</DialogTitle>
            <DialogDescription>
              Renseignez les informations de la récolte
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="farmerId">Farmer ID *</Label>
                <Input
                  id="farmerId"
                  value={formData.farmerId}
                  onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="productId">Product ID *</Label>
                <Input
                  id="productId"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantité (kg) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="harvestAt">Date/heure *</Label>
                <Input
                  id="harvestAt"
                  type="datetime-local"
                  value={formData.harvestAt}
                  onChange={(e) => setFormData({ ...formData, harvestAt: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="proofHash">Proof hash *</Label>
                <Input
                  id="proofHash"
                  value={formData.proofHash}
                  onChange={(e) => setFormData({ ...formData, proofHash: e.target.value })}
                  required
                />
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Modifier la récolte</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de la récolte
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-farmerId">Farmer ID *</Label>
                <Input
                  id="edit-farmerId"
                  value={formData.farmerId}
                  onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-productId">Product ID *</Label>
                <Input
                  id="edit-productId"
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantité (kg) *</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-harvestAt">Date/heure *</Label>
                <Input
                  id="edit-harvestAt"
                  type="datetime-local"
                  value={formData.harvestAt}
                  onChange={(e) => setFormData({ ...formData, harvestAt: e.target.value })}
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
                      setFormData({
                        ...formData,
                        latitude: e.target.value === "" ? undefined : Number(e.target.value),
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
                      setFormData({
                        ...formData,
                        longitude: e.target.value === "" ? undefined : Number(e.target.value),
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
                  onChange={(e) => setFormData({ ...formData, proofHash: e.target.value })}
                  required
                />
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
            <DialogTitle>Supprimer la récolte</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette récolte ? Cette action est irréversible.
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
    </div>
  )
}
