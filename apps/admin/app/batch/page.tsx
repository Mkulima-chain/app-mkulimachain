"use client"

import * as React from "react"
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  QrCode,
  CheckCircle2,
  Eye,
  Image as ImageIcon,
} from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"

type Batch = {
  id: string
  qrCode: string
  batchHash: string
  status: string
  name?: string
  description?: string
  totalQuantity?: number
  totalWeight?: number
  unit?: string
  verified?: boolean
  verifiedAt?: string
  quality?: string
  notes?: string
  photos?: string[]
  productionDate?: string
  expirationDate?: string
  originLocation?: string
  destinationLocation?: string
  certification?: string
  estimatedValue?: number
  cooperativeId?: string
  cooperative?: { id: string; name?: string }
  farmerId?: string
  farmer?: { id: string; name?: string }
  productId?: string
  product?: { id: string; name?: string }
  harvests?: { id: string; quantity?: number; farmer?: { name?: string }; product?: { name?: string } }[]
  createdAt: string
  updatedAt?: string
}

type CreateBatchDto = {
  harvestIds: string[]
  qrCode: string
  batchHash: string
  status?: string
  name?: string
  description?: string
  totalQuantity?: number
  totalWeight?: number
  unit?: string
  productionDate?: string
  expirationDate?: string
  quality?: string
  notes?: string
  photos?: string[]
  originLocation?: string
  destinationLocation?: string
  certification?: string
  estimatedValue?: number
  cooperativeId?: string
  farmerId?: string
  productId?: string
}

const batchStatuses = [
  { value: "created", label: "Créé" },
  { value: "processed", label: "Traité" },
  { value: "exported", label: "Exporté" },
]

export default function BatchPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [selectedBatch, setSelectedBatch] = React.useState<Batch | null>(null)
  const [formData, setFormData] = React.useState<CreateBatchDto>({
    harvestIds: [],
    qrCode: "",
    batchHash: "",
    status: "created",
  })

  type BatchesResponse = {
    data: Batch[]
    total: number
    page: number
    limit: number
    totalPages: number
  }

  const buildQueryString = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    params.append('page', String(currentPage))
    params.append('limit', String(pageSize))
    params.append('sortBy', 'createdAt')
    params.append('sortOrder', 'DESC')
    return params.toString()
  }

  const { data: batchesResponse, isLoading, refetch } = useApiQuery<BatchesResponse>(
    ["batches", String(currentPage), searchQuery],
    `/batches?${buildQueryString()}`
  )

  const batches = batchesResponse?.data || []
  const totalPages = batchesResponse?.totalPages || 1
  const total = batchesResponse?.total || 0

  // Fetch harvests for selection
  type HarvestsResponse = {
    data: { id: string; quantity: number; harvestAt: string; farmer?: { name: string }; product?: { name: string } }[]
    total: number
  }

  const { data: harvestsResponse, isLoading: isLoadingHarvests } = useApiQuery<HarvestsResponse>(
    ["harvests-for-batch"],
    "/harvests?limit=100&sortBy=harvestAt&sortOrder=DESC"
  )

  const availableHarvests = harvestsResponse?.data || []

  // Fetch cooperatives, farmers, and products for dropdowns
  type Cooperative = { id: string; name?: string }
  type Farmer = { id: string; name?: string }
  type Product = { id: string; name?: string }
  
  const { data: cooperativesData, isLoading: isLoadingCooperatives } = useApiQuery<Cooperative[] | { data: Cooperative[] }>(
    ["cooperatives"],
    "/cooperatives?limit=100"
  )
  const cooperatives = React.useMemo(() => {
    if (!cooperativesData) return []
    return Array.isArray(cooperativesData) ? cooperativesData : (cooperativesData.data || [])
  }, [cooperativesData])

  const { data: farmersData, isLoading: isLoadingFarmers } = useApiQuery<Farmer[] | { data: Farmer[] }>(
    ["farmers"],
    "/farmers?limit=100"
  )
  const farmers = React.useMemo(() => {
    if (!farmersData) return []
    return Array.isArray(farmersData) ? farmersData : (farmersData.data || [])
  }, [farmersData])

  const { data: productsData, isLoading: isLoadingProducts } = useApiQuery<Product[] | { data: Product[] }>(
    ["products"],
    "/products?limit=100"
  )
  const products = React.useMemo(() => {
    if (!productsData) return []
    // Gérer les deux formats possibles : array direct ou objet avec data
    if (Array.isArray(productsData)) {
      return productsData
    }
    if (productsData && typeof productsData === 'object' && 'data' in productsData) {
      return (productsData as { data: Product[] }).data || []
    }
    return []
  }, [productsData])

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
    setFormData({
      harvestIds: [],
      qrCode: "",
      batchHash: "",
      status: "created",
      name: "",
      description: "",
      totalQuantity: undefined,
      totalWeight: undefined,
      unit: "kg",
      productionDate: "",
      expirationDate: "",
      quality: "",
      notes: "",
      photos: [],
      originLocation: "",
      destinationLocation: "",
      certification: "",
      estimatedValue: undefined,
      cooperativeId: "",
      farmerId: "",
      productId: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (batch: Batch) => {
    setSelectedBatch(batch)
    // Convert dates to datetime-local format
    const productionDateLocal = batch.productionDate
      ? new Date(batch.productionDate).toISOString().slice(0, 16)
      : ""
    const expirationDateLocal = batch.expirationDate
      ? new Date(batch.expirationDate).toISOString().slice(0, 16)
      : ""
    
    setFormData({
      harvestIds: batch.harvests?.map((h) => h.id) || [],
      qrCode: batch.qrCode,
      batchHash: batch.batchHash,
      status: batch.status,
      name: batch.name || "",
      description: (batch as any).description || "",
      totalQuantity: batch.totalQuantity,
      totalWeight: batch.totalWeight,
      unit: batch.unit || "kg",
      productionDate: productionDateLocal,
      expirationDate: expirationDateLocal,
      quality: batch.quality || "",
      notes: (batch as any).notes || "",
      photos: batch.photos || [],
      originLocation: (batch as any).originLocation || "",
      destinationLocation: (batch as any).destinationLocation || "",
      certification: (batch as any).certification || "",
      estimatedValue: (batch as any).estimatedValue,
      cooperativeId: batch.cooperativeId || "",
      farmerId: batch.farmerId || "",
      productId: batch.productId || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (batch: Batch) => {
    setSelectedBatch(batch)
    setIsDeleteDialogOpen(true)
  }

  // Validation UUID
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.harvestIds || formData.harvestIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une récolte")
      return
    }

    // Vérifier que tous les IDs sont des UUIDs valides
    const invalidIds = formData.harvestIds.filter(id => !isValidUUID(id))
    if (invalidIds.length > 0) {
      toast.error(`IDs invalides détectés: ${invalidIds.join(", ")}`)
      return
    }

    if (!formData.qrCode || formData.qrCode.trim() === "") {
      toast.error("Le code QR est requis")
      return
    }

    if (!formData.batchHash || formData.batchHash.trim() === "") {
      toast.error("Le hash du lot est requis")
      return
    }

    // Préparer les données à envoyer
    const submitData: CreateBatchDto = {
      harvestIds: formData.harvestIds,
      qrCode: formData.qrCode.trim(),
      batchHash: formData.batchHash.trim(),
      status: formData.status || "created",
      name: formData.name?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      totalQuantity: formData.totalQuantity !== undefined && formData.totalQuantity !== null ? Number(formData.totalQuantity) : undefined,
      totalWeight: formData.totalWeight !== undefined && formData.totalWeight !== null ? Number(formData.totalWeight) : undefined,
      unit: formData.unit || undefined,
      productionDate: formData.productionDate ? new Date(formData.productionDate).toISOString() : undefined,
      expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : undefined,
      quality: formData.quality?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      photos: formData.photos?.filter(p => p.trim() !== "") || undefined,
      originLocation: formData.originLocation?.trim() || undefined,
      destinationLocation: formData.destinationLocation?.trim() || undefined,
      certification: formData.certification?.trim() || undefined,
      estimatedValue: formData.estimatedValue !== undefined && formData.estimatedValue !== null ? Number(formData.estimatedValue) : undefined,
      cooperativeId: formData.cooperativeId?.trim() || undefined,
      farmerId: formData.farmerId?.trim() || undefined,
      productId: formData.productId?.trim() || undefined,
    }

    createMutation.mutate(submitData)
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBatch) return

    // Validation
    if (!formData.harvestIds || formData.harvestIds.length === 0) {
      toast.error("Veuillez sélectionner au moins une récolte")
      return
    }

    const invalidIds = formData.harvestIds.filter(id => !isValidUUID(id))
    if (invalidIds.length > 0) {
      toast.error(`IDs invalides détectés: ${invalidIds.join(", ")}`)
      return
    }

    if (!formData.qrCode || formData.qrCode.trim() === "") {
      toast.error("Le code QR est requis")
      return
    }

    if (!formData.batchHash || formData.batchHash.trim() === "") {
      toast.error("Le hash du lot est requis")
      return
    }

    // Préparer les données à envoyer
    const submitData: CreateBatchDto = {
      harvestIds: formData.harvestIds,
      qrCode: formData.qrCode.trim(),
      batchHash: formData.batchHash.trim(),
      status: formData.status || "created",
      name: formData.name?.trim() || undefined,
      description: formData.description?.trim() || undefined,
      totalQuantity: formData.totalQuantity !== undefined && formData.totalQuantity !== null ? Number(formData.totalQuantity) : undefined,
      totalWeight: formData.totalWeight !== undefined && formData.totalWeight !== null ? Number(formData.totalWeight) : undefined,
      unit: formData.unit || undefined,
      productionDate: formData.productionDate ? new Date(formData.productionDate).toISOString() : undefined,
      expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : undefined,
      quality: formData.quality?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      photos: formData.photos?.filter(p => p.trim() !== "") || undefined,
      originLocation: formData.originLocation?.trim() || undefined,
      destinationLocation: formData.destinationLocation?.trim() || undefined,
      certification: formData.certification?.trim() || undefined,
      estimatedValue: formData.estimatedValue !== undefined && formData.estimatedValue !== null ? Number(formData.estimatedValue) : undefined,
      cooperativeId: formData.cooperativeId?.trim() || undefined,
      farmerId: formData.farmerId?.trim() || undefined,
      productId: formData.productId?.trim() || undefined,
    }

    updateMutation.mutate(submitData)
  }

  const handleConfirmDelete = () => {
    if (!selectedBatch) return
    deleteMutation.mutate(undefined)
  }

  const handleHarvestToggle = (harvestId: string) => {
    const currentIds = formData.harvestIds || []
    if (currentIds.includes(harvestId)) {
      setFormData({
        ...formData,
        harvestIds: currentIds.filter(id => id !== harvestId)
      })
    } else {
      setFormData({
        ...formData,
        harvestIds: [...currentIds, harvestId]
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lots</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les lots de produits
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
                placeholder="Rechercher par nom, QR code..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
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
                        Nom / QR Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Quantité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Vérifié
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Qualité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Photos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date création
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {batches.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                          Aucun lot trouvé
                        </td>
                      </tr>
                    ) : (
                      batches.map((batch) => {
                        const statusColors: Record<string, string> = {
                          created: "bg-blue-100 text-blue-800",
                          processed: "bg-yellow-100 text-yellow-800",
                          exported: "bg-green-100 text-green-800",
                        }
                        const qualityColors: Record<string, string> = {
                          excellent: "bg-green-100 text-green-800",
                          good: "bg-blue-100 text-blue-800",
                          fair: "bg-yellow-100 text-yellow-800",
                          poor: "bg-red-100 text-red-800",
                        }
                        return (
                        <tr key={batch.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium">
                                {batch.name || batch.qrCode}
                              </div>
                              {batch.name && (
                                <div className="text-xs text-muted-foreground mt-1">
                            {batch.qrCode}
                                </div>
                              )}
                              {batch.farmer && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Agriculteur: {batch.farmer.name}
                                </div>
                              )}
                              {batch.product && (
                                <div className="text-xs text-muted-foreground">
                                  Produit: {batch.product.name}
                                </div>
                              )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {batch.totalQuantity !== undefined && batch.totalQuantity !== null ? (
                                <div>
                                  <div className="font-medium">
                                    {Number(batch.totalQuantity).toFixed(2)} {batch.unit || "kg"}
                                  </div>
                                  {batch.totalWeight !== undefined && batch.totalWeight !== null && (
                                    <div className="text-xs text-muted-foreground">
                                      Poids: {Number(batch.totalWeight).toFixed(2)} kg
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                          </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={
                                  statusColors[batch.status] ||
                                  "bg-gray-100 text-gray-800"
                                }
                              >
                                {batch.status === "created" && "Créé"}
                                {batch.status === "processed" && "Traité"}
                                {batch.status === "exported" && "Exporté"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {batch.verified ? (
                                <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Vérifié
                                </Badge>
                              ) : (
                                <Badge variant="outline">Non vérifié</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {batch.quality ? (
                                <Badge
                                  className={
                                    qualityColors[batch.quality] ||
                                    "bg-gray-100 text-gray-800"
                                  }
                                >
                                  {batch.quality}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {batch.photos && batch.photos.length > 0 ? (
                                <div className="flex gap-1">
                                  {batch.photos.slice(0, 3).map((photo, idx) => (
                                    <img
                                      key={idx}
                                      src={photo}
                                      alt={`Photo ${idx + 1}`}
                                      className="h-10 w-10 rounded object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none"
                                      }}
                                    />
                                  ))}
                                  {batch.photos.length > 3 && (
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                      +{batch.photos.length - 3}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {batch.createdAt
                                ? new Date(batch.createdAt).toLocaleDateString("fr-FR", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "-"}
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
                                      onClick={() => {
                                        setSelectedBatch(batch)
                                        setIsViewDialogOpen(true)
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                    >
                                      <Eye className="h-4 w-4" />
                                      Voir détails
                                    </button>
                                  <button
                                    onClick={() => handleEdit(batch)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
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
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages} ({total} lot{total > 1 ? 's' : ''})
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un lot</DialogTitle>
            <DialogDescription>
              Renseignez les informations du lot
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Récoltes à inclure *</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                  {isLoadingHarvests ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-[#3A8F4C]" />
                      <span className="ml-2 text-sm text-muted-foreground">Chargement des récoltes...</span>
                    </div>
                  ) : availableHarvests.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune récolte disponible
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableHarvests.map((harvest) => (
                        <div key={harvest.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`harvest-${harvest.id}`}
                            checked={formData.harvestIds?.includes(harvest.id) || false}
                            onCheckedChange={() => handleHarvestToggle(harvest.id)}
                          />
                          <Label
                            htmlFor={`harvest-${harvest.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                {harvest.farmer?.name || "Agriculteur inconnu"} - {harvest.product?.name || "Produit inconnu"}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {harvest.quantity} kg - {new Date(harvest.harvestAt).toLocaleDateString()}
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formData.harvestIds && formData.harvestIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.harvestIds.length} récolte(s) sélectionnée(s)
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom</Label>
                <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="qrCode">QR Code *</Label>
                <Input
                  id="qrCode"
                  value={formData.qrCode}
                  onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                  required
                />
              </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="batchHash">Batch hash *</Label>
                <Input
                  id="batchHash"
                  value={formData.batchHash}
                  onChange={(e) => setFormData({ ...formData, batchHash: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status || "created"}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                  {batchStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                      {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="totalQuantity">Quantité totale</Label>
                  <Input
                    id="totalQuantity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalQuantity ?? ""}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalWeight">Poids total (kg)</Label>
                  <Input
                    id="totalWeight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalWeight ?? ""}
                    onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unité</Label>
                  <Select
                    value={formData.unit || "kg"}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="tonnes">Tonnes</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="productionDate">Date de production</Label>
                  <Input
                    id="productionDate"
                    type="datetime-local"
                    value={formData.productionDate || ""}
                    onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expirationDate">Date d'expiration</Label>
                  <Input
                    id="expirationDate"
                    type="datetime-local"
                    value={formData.expirationDate || ""}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quality">Qualité</Label>
                  <Select
                    value={formData.quality || ""}
                    onValueChange={(value) => setFormData({ ...formData, quality: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Non spécifiée</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Bon</SelectItem>
                      <SelectItem value="fair">Moyen</SelectItem>
                      <SelectItem value="poor">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="estimatedValue">Valeur estimée</Label>
                  <Input
                    id="estimatedValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.estimatedValue ?? ""}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cooperativeId">Coopérative</Label>
                  <Select
                    value={formData.cooperativeId || ""}
                    onValueChange={(value) => setFormData({ ...formData, cooperativeId: value || undefined })}
                  >
                    <SelectTrigger disabled={isLoadingCooperatives}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune</SelectItem>
                      {cooperatives.map((coop) => (
                        <SelectItem key={coop.id} value={coop.id}>
                          {coop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="farmerId">Agriculteur</Label>
                  <Select
                    value={formData.farmerId || ""}
                    onValueChange={(value) => setFormData({ ...formData, farmerId: value || undefined })}
                  >
                    <SelectTrigger disabled={isLoadingFarmers}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      {farmers.map((farmer) => (
                        <SelectItem key={farmer.id} value={farmer.id}>
                          {farmer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="productId">Produit</Label>
                  <Select
                    value={formData.productId || ""}
                    onValueChange={(value) => setFormData({ ...formData, productId: value || undefined })}
                  >
                    <SelectTrigger disabled={isLoadingProducts}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="originLocation">Lieu d'origine</Label>
                  <Input
                    id="originLocation"
                    value={formData.originLocation || ""}
                    onChange={(e) => setFormData({ ...formData, originLocation: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="destinationLocation">Lieu de destination</Label>
                  <Input
                    id="destinationLocation"
                    value={formData.destinationLocation || ""}
                    onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="certification">Certifications</Label>
                <Input
                  id="certification"
                  value={formData.certification || ""}
                  onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="photos">URLs des photos (une par ligne)</Label>
                <Textarea
                  id="photos"
                  value={formData.photos?.join("\n") || ""}
                  onChange={(e) => {
                    const urls = e.target.value.split("\n").filter(url => url.trim() !== "")
                    setFormData({ ...formData, photos: urls })
                  }}
                  rows={3}
                  placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le lot</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du lot
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Récoltes à inclure *</Label>
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                  {isLoadingHarvests ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-[#3A8F4C]" />
                      <span className="ml-2 text-sm text-muted-foreground">Chargement des récoltes...</span>
                    </div>
                  ) : availableHarvests.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune récolte disponible
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableHarvests.map((harvest) => (
                        <div key={harvest.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-harvest-${harvest.id}`}
                            checked={formData.harvestIds?.includes(harvest.id) || false}
                            onCheckedChange={() => handleHarvestToggle(harvest.id)}
                          />
                          <Label
                            htmlFor={`edit-harvest-${harvest.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            <div className="flex items-center justify-between">
                              <span>
                                {harvest.farmer?.name || "Agriculteur inconnu"} - {harvest.product?.name || "Produit inconnu"}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {harvest.quantity} kg - {new Date(harvest.harvestAt).toLocaleDateString()}
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {formData.harvestIds && formData.harvestIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formData.harvestIds.length} récolte(s) sélectionnée(s)
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nom</Label>
                <Input
                    id="edit-name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-qrCode">QR Code *</Label>
                <Input
                  id="edit-qrCode"
                  value={formData.qrCode}
                  onChange={(e) => setFormData({ ...formData, qrCode: e.target.value })}
                  required
                />
              </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Select
                    value={formData.status || "created"}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                  {batchStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                      {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-totalQuantity">Quantité totale</Label>
                  <Input
                    id="edit-totalQuantity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalQuantity ?? ""}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-totalWeight">Poids total (kg)</Label>
                  <Input
                    id="edit-totalWeight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.totalWeight ?? ""}
                    onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-unit">Unité</Label>
                  <Select
                    value={formData.unit || "kg"}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="tonnes">Tonnes</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-productionDate">Date de production</Label>
                  <Input
                    id="edit-productionDate"
                    type="datetime-local"
                    value={formData.productionDate || ""}
                    onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-expirationDate">Date d'expiration</Label>
                  <Input
                    id="edit-expirationDate"
                    type="datetime-local"
                    value={formData.expirationDate || ""}
                    onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-quality">Qualité</Label>
                  <Select
                    value={formData.quality || ""}
                    onValueChange={(value) => setFormData({ ...formData, quality: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Non spécifiée</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Bon</SelectItem>
                      <SelectItem value="fair">Moyen</SelectItem>
                      <SelectItem value="poor">Faible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-estimatedValue">Valeur estimée</Label>
                  <Input
                    id="edit-estimatedValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.estimatedValue ?? ""}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-cooperativeId">Coopérative</Label>
                  <Select
                    value={formData.cooperativeId || ""}
                    onValueChange={(value) => setFormData({ ...formData, cooperativeId: value || undefined })}
                  >
                    <SelectTrigger disabled={isLoadingCooperatives}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune</SelectItem>
                      {cooperatives.map((coop) => (
                        <SelectItem key={coop.id} value={coop.id}>
                          {coop.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-farmerId">Agriculteur</Label>
                  <Select
                    value={formData.farmerId || ""}
                    onValueChange={(value) => setFormData({ ...formData, farmerId: value || undefined })}
                  >
                    <SelectTrigger disabled={isLoadingFarmers}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      {farmers.map((farmer) => (
                        <SelectItem key={farmer.id} value={farmer.id}>
                          {farmer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-productId">Produit</Label>
                  <Select
                    value={formData.productId || ""}
                    onValueChange={(value) => setFormData({ ...formData, productId: value || undefined })}
                  >
                    <SelectTrigger disabled={isLoadingProducts}>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-originLocation">Lieu d'origine</Label>
                  <Input
                    id="edit-originLocation"
                    value={formData.originLocation || ""}
                    onChange={(e) => setFormData({ ...formData, originLocation: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-destinationLocation">Lieu de destination</Label>
                  <Input
                    id="edit-destinationLocation"
                    value={formData.destinationLocation || ""}
                    onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-certification">Certifications</Label>
                <Input
                  id="edit-certification"
                  value={formData.certification || ""}
                  onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-photos">URLs des photos (une par ligne)</Label>
                <Textarea
                  id="edit-photos"
                  value={formData.photos?.join("\n") || ""}
                  onChange={(e) => {
                    const urls = e.target.value.split("\n").filter(url => url.trim() !== "")
                    setFormData({ ...formData, photos: urls })
                  }}
                  rows={3}
                  placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
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

      {/* Vue détaillée */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du lot</DialogTitle>
            <DialogDescription>
              Informations complètes du lot
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nom</Label>
                  <p className="text-sm font-medium">{selectedBatch.name || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">QR Code</Label>
                  <p className="text-sm font-medium">{selectedBatch.qrCode}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Hash</Label>
                  <p className="text-sm font-mono text-xs break-all">{selectedBatch.batchHash}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Statut</Label>
                  <Badge className="mt-1">
                    {selectedBatch.status === "created" && "Créé"}
                    {selectedBatch.status === "processed" && "Traité"}
                    {selectedBatch.status === "exported" && "Exporté"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Vérifié</Label>
                  <div className="text-sm mt-1">
                    {selectedBatch.verified ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                        Oui
                      </Badge>
                    ) : (
                      <Badge variant="outline">Non</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Quantité totale</Label>
                  <p className="text-sm font-medium">
                    {selectedBatch.totalQuantity !== undefined && selectedBatch.totalQuantity !== null
                      ? `${Number(selectedBatch.totalQuantity).toFixed(2)} ${selectedBatch.unit || "kg"}`
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Poids total</Label>
                  <p className="text-sm font-medium">
                    {selectedBatch.totalWeight !== undefined && selectedBatch.totalWeight !== null
                      ? `${Number(selectedBatch.totalWeight).toFixed(2)} kg`
                      : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Qualité</Label>
                  <div className="text-sm">
                    {selectedBatch.quality ? (
                      <Badge>{selectedBatch.quality}</Badge>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                {selectedBatch.productionDate && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Date de production</Label>
                    <p className="text-sm">
                      {new Date(selectedBatch.productionDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
                {selectedBatch.expirationDate && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Date d'expiration</Label>
                    <p className="text-sm">
                      {new Date(selectedBatch.expirationDate).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
                {selectedBatch.farmer && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Agriculteur</Label>
                    <p className="text-sm">{selectedBatch.farmer.name || "-"}</p>
                  </div>
                )}
                {selectedBatch.product && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Produit</Label>
                    <p className="text-sm">{selectedBatch.product.name || "-"}</p>
                  </div>
                )}
                {selectedBatch.cooperative && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Coopérative</Label>
                    <p className="text-sm">{selectedBatch.cooperative.name || "-"}</p>
                  </div>
                )}
              </div>
              {selectedBatch.harvests && selectedBatch.harvests.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Récoltes ({selectedBatch.harvests.length})</Label>
                  <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                    {selectedBatch.harvests.map((harvest) => (
                      <div key={harvest.id} className="text-xs p-2 bg-muted rounded">
                        {harvest.farmer?.name || "Agriculteur"} - {harvest.product?.name || "Produit"}
                        {harvest.quantity !== undefined && ` (${harvest.quantity} kg)`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedBatch.photos && selectedBatch.photos.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Photos</Label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {selectedBatch.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        className="h-24 w-full rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
