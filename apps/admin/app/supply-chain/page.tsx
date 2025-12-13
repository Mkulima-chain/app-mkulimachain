"use client"

import * as React from "react"
import { Network, Search, Plus, Edit, Trash2, MoreVertical, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

enum StepType {
  HARVEST = "harvest",
  DRYING = "drying",
  PACKAGING = "packaging",
  EXPORT = "export",
}

type SupplyChainStep = {
  id: string
  batchId: string
  stepType: StepType
  timestamp: string
  metadataHash: string
  createdAt: string
  updatedAt: string
}

type CreateSupplyChainStepDto = {
  batchId: string
  stepType: StepType
  timestamp?: string
  metadataHash: string
}

type UpdateSupplyChainStepDto = {
  batchId?: string
  stepType?: StepType
  timestamp?: string
  metadataHash?: string
}

export default function SupplyChainPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedStep, setSelectedStep] = React.useState<SupplyChainStep | null>(null)
  const [formData, setFormData] = React.useState<CreateSupplyChainStepDto>({
    batchId: "",
    stepType: StepType.HARVEST,
    timestamp: new Date().toISOString().slice(0, 16),
    metadataHash: "",
  })
  const [updateData, setUpdateData] = React.useState<UpdateSupplyChainStepDto>({})

  // Fetch steps
  const { data: steps = [], isLoading, refetch } = useApiQuery<SupplyChainStep[]>(
    ["supply-chain-steps", searchQuery],
    `/supply-chain-steps${searchQuery ? `?batchId=${encodeURIComponent(searchQuery)}` : ""}`
  )

  // Fetch batches for select
  const { data: batches = [] } = useApiQuery<{ id: string; qrCode: string }[]>(
    ["batches"],
    "/batches"
  )

  // Create mutation
  const createMutation = useApiMutation<SupplyChainStep, CreateSupplyChainStepDto>(
    "/supply-chain-steps",
    "POST",
    {
      onSuccess: () => {
        toast.success("Étape ajoutée avec succès")
        setIsAddDialogOpen(false)
        refetch()
      },
    }
  )

  // Update mutation
  const updateMutation = useApiMutation<SupplyChainStep, UpdateSupplyChainStepDto>(
    () => `/supply-chain-steps/${selectedStep?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Étape modifiée avec succès")
        setIsEditDialogOpen(false)
        setSelectedStep(null)
        refetch()
      },
    }
  )

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/supply-chain-steps/${selectedStep?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Étape supprimée avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedStep(null)
        refetch()
      },
    }
  )

  const handleAdd = () => {
    setFormData({
      batchId: "",
      stepType: StepType.HARVEST,
      timestamp: new Date().toISOString().slice(0, 16),
      metadataHash: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (step: SupplyChainStep) => {
    setSelectedStep(step)
    setUpdateData({
      batchId: step.batchId,
      stepType: step.stepType,
      timestamp: step.timestamp ? new Date(step.timestamp).toISOString().slice(0, 16) : undefined,
      metadataHash: step.metadataHash,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (step: SupplyChainStep) => {
    setSelectedStep(step)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      timestamp: formData.timestamp ? new Date(formData.timestamp).toISOString() : undefined,
    })
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStep) return
    updateMutation.mutate({
      ...updateData,
      timestamp: updateData.timestamp ? new Date(updateData.timestamp).toISOString() : undefined,
    })
  }

  const handleConfirmDelete = () => {
    if (!selectedStep) return
    deleteMutation.mutate(undefined)
  }

  const getStepTypeLabel = (type: StepType) => {
    const labels: Record<StepType, string> = {
      [StepType.HARVEST]: "Récolte",
      [StepType.DRYING]: "Séchage",
      [StepType.PACKAGING]: "Emballage",
      [StepType.EXPORT]: "Export",
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Chaîne d'approvisionnement</h1>
          <p className="text-muted-foreground mt-1">
            Gérez la traçabilité de la chaîne d'approvisionnement
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une étape
        </Button>
      </div>

      {/* Steps List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des étapes</CardTitle>
              <CardDescription>
                Recherchez et gérez les étapes de la chaîne d'approvisionnement
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
                placeholder="Rechercher par ID de lot..."
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
                        Lot
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type d'étape
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Horodatage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Hash
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {steps.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Aucune étape trouvée
                        </td>
                      </tr>
                    ) : (
                      steps.map((step) => (
                        <tr key={step.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            {step.batchId.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{getStepTypeLabel(step.stepType)}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {step.timestamp ? new Date(step.timestamp).toLocaleString() : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            {step.metadataHash.slice(0, 20)}...
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
                                    onClick={() => handleEdit(step)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDelete(step)}
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

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter une étape</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter une nouvelle étape
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="batchId">Lot *</Label>
                <Select
                  value={formData.batchId}
                  onValueChange={(value) => setFormData({ ...formData, batchId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un lot" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.qrCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stepType">Type d'étape *</Label>
                <select
                  id="stepType"
                  value={formData.stepType}
                  onChange={(e) =>
                    setFormData({ ...formData, stepType: e.target.value as StepType })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  required
                >
                  <option value={StepType.HARVEST}>Récolte</option>
                  <option value={StepType.DRYING}>Séchage</option>
                  <option value={StepType.PACKAGING}>Emballage</option>
                  <option value={StepType.EXPORT}>Export</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timestamp">Horodatage</Label>
                <Input
                  id="timestamp"
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) =>
                    setFormData({ ...formData, timestamp: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metadataHash">Hash des métadonnées *</Label>
                <Input
                  id="metadataHash"
                  value={formData.metadataHash}
                  onChange={(e) =>
                    setFormData({ ...formData, metadataHash: e.target.value })
                  }
                  placeholder="0x..."
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'étape</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'étape
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-batchId">Lot</Label>
                <Select
                  value={updateData.batchId || ""}
                  onValueChange={(value) => setUpdateData({ ...updateData, batchId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un lot" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.qrCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-stepType">Type d'étape</Label>
                <select
                  id="edit-stepType"
                  value={updateData.stepType || StepType.HARVEST}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, stepType: e.target.value as StepType })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value={StepType.HARVEST}>Récolte</option>
                  <option value={StepType.DRYING}>Séchage</option>
                  <option value={StepType.PACKAGING}>Emballage</option>
                  <option value={StepType.EXPORT}>Export</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-timestamp">Horodatage</Label>
                <Input
                  id="edit-timestamp"
                  type="datetime-local"
                  value={updateData.timestamp || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, timestamp: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-metadataHash">Hash des métadonnées</Label>
                <Input
                  id="edit-metadataHash"
                  value={updateData.metadataHash || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, metadataHash: e.target.value })
                  }
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'étape</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette étape ? Cette action est
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
    </div>
  )
}
