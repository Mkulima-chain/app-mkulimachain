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
  CheckCircle2,
  Eye,
  Filter,
  X,
  Image as ImageIcon,
  MapPin,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"

type HarvestStatus = 'pending' | 'verified' | 'rejected' | 'completed'

type Harvest = {
  id: string
  farmerId?: string
  productId?: string
  farmer?: { id: string; name?: string }
  product?: { id: string; name?: string }
  quantity: number
  harvestAt: string
  latitude?: number
  longitude?: number
  proofHash: string
  status?: HarvestStatus
  verified?: boolean
  verifiedAt?: string
  verifiedBy?: string
  unit?: string
  quality?: string
  notes?: string
  photos?: string[]
  weatherConditions?: string
  harvestMethod?: string
  storageLocation?: string
  batchNumber?: string
  certification?: string
  estimatedValue?: number
  cooperativeId?: string
  cooperative?: { id: string; name?: string }
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
  status?: HarvestStatus
  unit?: string
  quality?: string
  notes?: string
  photos?: string[]
  weatherConditions?: string
  harvestMethod?: string
  storageLocation?: string
  batchNumber?: string
  certification?: string
  estimatedValue?: number
  cooperativeId?: string
}

type HarvestsResponse = {
  data: Harvest[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function HarvestPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [selectedHarvest, setSelectedHarvest] = React.useState<Harvest | null>(null)
  const [filterStatus, setFilterStatus] = React.useState<string>("")
  const [filterVerified, setFilterVerified] = React.useState<boolean | null>(null)
  const [filterQuality, setFilterQuality] = React.useState<string>("")
  const [filterFarmer, setFilterFarmer] = React.useState<string>("")
  const [filterProduct, setFilterProduct] = React.useState<string>("")
  const [filterCooperative, setFilterCooperative] = React.useState<string>("")
  const [formData, setFormData] = React.useState<CreateHarvestDto>({
    farmerId: "",
    productId: "",
    quantity: 0,
    harvestAt: new Date().toISOString().slice(0, 16),
    latitude: undefined,
    longitude: undefined,
    proofHash: "",
    status: "pending",
    unit: "kg",
    quality: undefined,
    notes: undefined,
    photos: [],
    weatherConditions: undefined,
    harvestMethod: undefined,
    storageLocation: undefined,
    batchNumber: undefined,
    certification: undefined,
    estimatedValue: undefined,
    cooperativeId: undefined,
  })

  const buildQueryString = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    if (filterStatus) params.append('status', filterStatus)
    if (filterVerified !== null) params.append('verified', String(filterVerified))
    if (filterQuality) params.append('quality', filterQuality)
    if (filterFarmer) params.append('farmerId', filterFarmer)
    if (filterProduct) params.append('productId', filterProduct)
    if (filterCooperative) params.append('cooperativeId', filterCooperative)
    params.append('page', String(currentPage))
    params.append('limit', String(pageSize))
    params.append('sortBy', 'harvestAt')
    params.append('sortOrder', 'DESC')
    return params.toString()
  }

  const { data: harvestsResponse, isLoading, refetch } = useApiQuery<HarvestsResponse>(
    ["harvests", currentPage, searchQuery, filterStatus, filterVerified, filterQuality, filterFarmer, filterProduct, filterCooperative],
    `/harvests?${buildQueryString()}`
  )

  const harvests = harvestsResponse?.data || []
  const totalPages = harvestsResponse?.totalPages || 1
  const total = harvestsResponse?.total || 0

  // Fetch farmers, products, and cooperatives for selects
  type FarmersResponse = {
    data: { id: string; name: string }[]
    total: number
  }

  const { data: farmersResponse } = useApiQuery<FarmersResponse>(
    ["farmers"],
    "/farmers?limit=1000"
  )

  const { data: productsResponse } = useApiQuery<{ id: string; name: string }[] | { data: { id: string; name: string }[] }>(
    ["products"],
    "/products"
  )

  const { data: cooperativesResponse } = useApiQuery<{ id: string; name: string }[]>(
    ["cooperatives"],
    "/cooperatives?limit=1000"
  )

  const { data: statsResponse } = useApiQuery<any>(
    ["harvests-stats"],
    "/harvests/stats/global"
  )

  const farmers = React.useMemo(() => {
    if (!farmersResponse) return []
    return Array.isArray(farmersResponse) ? farmersResponse : (farmersResponse.data || [])
  }, [farmersResponse])

  const products = React.useMemo(() => {
    if (!productsResponse) return []
    // Gérer les deux formats possibles : array direct ou objet avec data
    if (Array.isArray(productsResponse)) {
      return productsResponse
    }
    if (productsResponse && typeof productsResponse === 'object' && 'data' in productsResponse) {
      return (productsResponse as { data: { id: string; name: string }[] }).data || []
    }
    return []
  }, [productsResponse])

  const cooperatives = React.useMemo(() => {
    if (!cooperativesResponse) return []
    return Array.isArray(cooperativesResponse) ? cooperativesResponse : []
  }, [cooperativesResponse])

  const createMutation = useApiMutation<Harvest, CreateHarvestDto>(
    "/harvests",
    "POST",
    {
      onSuccess: () => {
        toast.success("Récolte ajoutée avec succès")
        setIsAddDialogOpen(false)
        setFormData({
          farmerId: "",
          productId: "",
          quantity: 0,
          harvestAt: new Date().toISOString().slice(0, 16),
          latitude: undefined,
          longitude: undefined,
          proofHash: "",
          status: "pending",
          unit: "kg",
          photos: [],
        })
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

  const verifyMutation = useApiMutation<Harvest, void>(
    () => `/harvests/${selectedHarvest?.id}/verify`,
    "POST",
    {
      onSuccess: () => {
        toast.success("Récolte vérifiée avec succès")
        refetch()
      },
    }
  )

  const updateStatusMutation = useApiMutation<Harvest, { status: HarvestStatus }>(
    () => `/harvests/${selectedHarvest?.id}/status`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Statut mis à jour avec succès")
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
      status: "pending",
      unit: "kg",
      photos: [],
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
      status: harvest.status || "pending",
      unit: harvest.unit || "kg",
      quality: harvest.quality,
      notes: harvest.notes,
      photos: harvest.photos || [],
      weatherConditions: harvest.weatherConditions,
      harvestMethod: harvest.harvestMethod,
      storageLocation: harvest.storageLocation,
      batchNumber: harvest.batchNumber,
      certification: harvest.certification,
      estimatedValue: harvest.estimatedValue,
      cooperativeId: harvest.cooperativeId,
    })
    setIsEditDialogOpen(true)
  }

  const handleView = (harvest: Harvest) => {
    setSelectedHarvest(harvest)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (harvest: Harvest) => {
    setSelectedHarvest(harvest)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation des champs requis
    if (!formData.farmerId || formData.farmerId.trim() === '') {
      toast.error('Veuillez sélectionner un agriculteur')
      return
    }
    
    if (!formData.productId || formData.productId.trim() === '') {
      toast.error('Veuillez sélectionner un produit')
      return
    }
    
    if (!formData.proofHash || formData.proofHash.trim() === '') {
      toast.error('Le hash de preuve est requis')
      return
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('La quantité doit être supérieure à 0')
      return
    }
    
    // Convertir harvestAt au format ISO si nécessaire
    let harvestAtISO = formData.harvestAt
    if (harvestAtISO && !harvestAtISO.includes('Z') && !harvestAtISO.includes('+')) {
      // Si c'est au format datetime-local, convertir en ISO
      harvestAtISO = new Date(harvestAtISO).toISOString()
    }
    
    // Nettoyer les champs vides (chaînes vides -> undefined)
    const cleanedData: CreateHarvestDto = {
      farmerId: formData.farmerId.trim(),
      productId: formData.productId.trim(),
      quantity: Number(formData.quantity),
      harvestAt: harvestAtISO,
      proofHash: formData.proofHash.trim(),
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
      status: formData.status,
      unit: formData.unit || undefined,
      quality: formData.quality || undefined,
      notes: formData.notes || undefined,
      photos: formData.photos && formData.photos.length > 0 ? formData.photos : undefined,
      weatherConditions: formData.weatherConditions || undefined,
      harvestMethod: formData.harvestMethod || undefined,
      storageLocation: formData.storageLocation || undefined,
      batchNumber: formData.batchNumber || undefined,
      certification: formData.certification || undefined,
      estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
      cooperativeId: formData.cooperativeId || undefined,
    }
    
    // Log pour déboguer
    console.log('Données envoyées:', cleanedData)
    
    createMutation.mutate(cleanedData)
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHarvest) return
    
    // Validation des champs requis
    if (!formData.farmerId || formData.farmerId.trim() === '') {
      toast.error('Veuillez sélectionner un agriculteur')
      return
    }
    
    if (!formData.productId || formData.productId.trim() === '') {
      toast.error('Veuillez sélectionner un produit')
      return
    }
    
    if (!formData.proofHash || formData.proofHash.trim() === '') {
      toast.error('Le hash de preuve est requis')
      return
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
      toast.error('La quantité doit être supérieure à 0')
      return
    }
    
    // Convertir harvestAt au format ISO si nécessaire
    let harvestAtISO = formData.harvestAt
    if (harvestAtISO && !harvestAtISO.includes('Z') && !harvestAtISO.includes('+')) {
      // Si c'est au format datetime-local, convertir en ISO
      harvestAtISO = new Date(harvestAtISO).toISOString()
    }
    
    // Nettoyer les champs vides (chaînes vides -> undefined)
    const cleanedData: CreateHarvestDto = {
      farmerId: formData.farmerId.trim(),
      productId: formData.productId.trim(),
      quantity: Number(formData.quantity),
      harvestAt: harvestAtISO,
      proofHash: formData.proofHash.trim(),
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
      status: formData.status,
      unit: formData.unit || undefined,
      quality: formData.quality || undefined,
      notes: formData.notes || undefined,
      photos: formData.photos && formData.photos.length > 0 ? formData.photos : undefined,
      weatherConditions: formData.weatherConditions || undefined,
      harvestMethod: formData.harvestMethod || undefined,
      storageLocation: formData.storageLocation || undefined,
      batchNumber: formData.batchNumber || undefined,
      certification: formData.certification || undefined,
      estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
      cooperativeId: formData.cooperativeId || undefined,
    }
    
    updateMutation.mutate(cleanedData)
  }

  const handleConfirmDelete = () => {
    if (!selectedHarvest) return
    deleteMutation.mutate(undefined)
  }

  const getStatusBadge = (status?: HarvestStatus) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "secondary" as const },
      verified: { label: "Vérifiée", variant: "default" as const },
      rejected: { label: "Rejetée", variant: "destructive" as const },
      completed: { label: "Terminée", variant: "default" as const },
    }
    const config = statusConfig[status || 'pending']
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getQualityBadge = (quality?: string) => {
    if (!quality) return null
    const qualityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      excellent: { label: "Excellent", variant: "default" },
      good: { label: "Bon", variant: "default" },
      fair: { label: "Moyen", variant: "secondary" },
      poor: { label: "Faible", variant: "destructive" },
    }
    const config = qualityConfig[quality.toLowerCase()] || { label: quality, variant: "outline" as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
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

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total récoltes</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vérifiées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsResponse?.verifiedHarvests || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quantité totale</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsResponse?.totalQuantity?.toFixed(2) || 0} kg</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsResponse?.totalValue?.toFixed(2) || 0} $</div>
          </CardContent>
        </Card>
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
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value); setCurrentPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="verified">Vérifiée</SelectItem>
                <SelectItem value="rejected">Rejetée</SelectItem>
                <SelectItem value="completed">Terminée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterQuality} onValueChange={(value) => { setFilterQuality(value); setCurrentPage(1) }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Qualité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les qualités</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Bon</SelectItem>
                <SelectItem value="fair">Moyen</SelectItem>
                <SelectItem value="poor">Faible</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={filterVerified === true}
                onCheckedChange={(checked) => {
                  setFilterVerified(checked ? true : null)
                  setCurrentPage(1)
                }}
              />
              <Label htmlFor="verified" className="text-sm cursor-pointer">Vérifiées uniquement</Label>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3A8F4C]" />
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Agriculteur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Produit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Quantité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
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
                      {harvests.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                            Aucune récolte trouvée
                          </td>
                        </tr>
                      ) : (
                        harvests.map((harvest) => (
                          <tr key={harvest.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {harvest.farmer?.name || harvest.farmerId || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {harvest.product?.name || harvest.productId || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {harvest.quantity} {harvest.unit || "kg"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {new Date(harvest.harvestAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center gap-2">
                                {getStatusBadge(harvest.status)}
                                {harvest.verified && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                              </div>
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
                                      onClick={() => handleView(harvest)}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                    >
                                      <Eye className="h-4 w-4" />
                                      Voir détails
                                    </button>
                                    <button
                                      onClick={() => handleEdit(harvest)}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Modifier
                                    </button>
                                    {!harvest.verified && (
                                      <button
                                        onClick={() => {
                                          setSelectedHarvest(harvest)
                                          verifyMutation.mutate(undefined)
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Vérifier
                                      </button>
                                    )}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({total} récoltes)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une récolte</DialogTitle>
            <DialogDescription>
              Renseignez les informations de la récolte
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="farmerId">Agriculteur *</Label>
                  <Select
                    value={formData.farmerId}
                    onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
                    required
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
                  <Label htmlFor="productId">Produit *</Label>
                  <Select
                    value={formData.productId}
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                    required
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantité *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    required
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status || "pending"}
                    onValueChange={(value: HarvestStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="verified">Vérifiée</SelectItem>
                      <SelectItem value="rejected">Rejetée</SelectItem>
                      <SelectItem value="completed">Terminée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cooperativeId">Coopérative</Label>
                <Select
                  value={formData.cooperativeId || ""}
                  onValueChange={(value) => setFormData({ ...formData, cooperativeId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une coopérative" />
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
                <Label htmlFor="batchNumber">Numéro de lot</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber || ""}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value || undefined })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="harvestMethod">Méthode de récolte</Label>
                <Input
                  id="harvestMethod"
                  value={formData.harvestMethod || ""}
                  onChange={(e) => setFormData({ ...formData, harvestMethod: e.target.value || undefined })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="weatherConditions">Conditions météo</Label>
                <Input
                  id="weatherConditions"
                  value={formData.weatherConditions || ""}
                  onChange={(e) => setFormData({ ...formData, weatherConditions: e.target.value || undefined })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="storageLocation">Lieu de stockage</Label>
                <Input
                  id="storageLocation"
                  value={formData.storageLocation || ""}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value || undefined })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="certification">Certifications</Label>
                <Input
                  id="certification"
                  value={formData.certification || ""}
                  onChange={(e) => setFormData({ ...formData, certification: e.target.value || undefined })}
                />
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
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="photos">Photos (URLs)</Label>
                <div className="space-y-2">
                  {formData.photos && formData.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.photos.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-full rounded-lg object-cover border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPhotos = formData.photos?.filter((_, i) => i !== index) || []
                              setFormData({ ...formData, photos: newPhotos })
                            }}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      id="newPhotoUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          const url = input.value.trim()
                          if (url) {
                            const currentPhotos = formData.photos || []
                            if (!currentPhotos.includes(url)) {
                              setFormData({ ...formData, photos: [...currentPhotos, url] })
                              input.value = ''
                            }
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('newPhotoUrl') as HTMLInputElement
                        const url = input?.value.trim()
                        if (url) {
                          const currentPhotos = formData.photos || []
                          if (!currentPhotos.includes(url)) {
                            setFormData({ ...formData, photos: [...currentPhotos, url] })
                            input.value = ''
                          }
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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

      {/* Edit Dialog - Similar structure to Add Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la récolte</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de la récolte
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              {/* Same fields as Add Dialog */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-farmerId">Agriculteur *</Label>
                  <Select
                    value={formData.farmerId}
                    onValueChange={(value) => setFormData({ ...formData, farmerId: value })}
                    required
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
                    onValueChange={(value) => setFormData({ ...formData, productId: value })}
                    required
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-quantity">Quantité *</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    required
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
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Statut</Label>
                  <Select
                    value={formData.status || "pending"}
                    onValueChange={(value: HarvestStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="verified">Vérifiée</SelectItem>
                      <SelectItem value="rejected">Rejetée</SelectItem>
                      <SelectItem value="completed">Terminée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-cooperativeId">Coopérative</Label>
                <Select
                  value={formData.cooperativeId || ""}
                  onValueChange={(value) => setFormData({ ...formData, cooperativeId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une coopérative" />
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
                <Label htmlFor="edit-batchNumber">Numéro de lot</Label>
                <Input
                  id="edit-batchNumber"
                  value={formData.batchNumber || ""}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value || undefined })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-harvestMethod">Méthode de récolte</Label>
                <Input
                  id="edit-harvestMethod"
                  value={formData.harvestMethod || ""}
                  onChange={(e) => setFormData({ ...formData, harvestMethod: e.target.value || undefined })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-weatherConditions">Conditions météo</Label>
                <Input
                  id="edit-weatherConditions"
                  value={formData.weatherConditions || ""}
                  onChange={(e) => setFormData({ ...formData, weatherConditions: e.target.value || undefined })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-storageLocation">Lieu de stockage</Label>
                <Input
                  id="edit-storageLocation"
                  value={formData.storageLocation || ""}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value || undefined })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-certification">Certifications</Label>
                <Input
                  id="edit-certification"
                  value={formData.certification || ""}
                  onChange={(e) => setFormData({ ...formData, certification: e.target.value || undefined })}
                />
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
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-photos">Photos (URLs)</Label>
                <div className="space-y-2">
                  {formData.photos && formData.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.photos.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-full rounded-lg object-cover border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPhotos = formData.photos?.filter((_, i) => i !== index) || []
                              setFormData({ ...formData, photos: newPhotos })
                            }}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      id="editNewPhotoUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          const url = input.value.trim()
                          if (url) {
                            const currentPhotos = formData.photos || []
                            if (!currentPhotos.includes(url)) {
                              setFormData({ ...formData, photos: [...currentPhotos, url] })
                              input.value = ''
                            }
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('editNewPhotoUrl') as HTMLInputElement
                        const url = input?.value.trim()
                        if (url) {
                          const currentPhotos = formData.photos || []
                          if (!currentPhotos.includes(url)) {
                            setFormData({ ...formData, photos: [...currentPhotos, url] })
                            input.value = ''
                          }
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la récolte</DialogTitle>
          </DialogHeader>
          {selectedHarvest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agriculteur</Label>
                  <p className="text-sm">{selectedHarvest.farmer?.name || selectedHarvest.farmerId || "-"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Produit</Label>
                  <p className="text-sm">{selectedHarvest.product?.name || selectedHarvest.productId || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quantité</Label>
                  <p className="text-sm">{selectedHarvest.quantity} {selectedHarvest.unit || "kg"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date de récolte</Label>
                  <p className="text-sm">{new Date(selectedHarvest.harvestAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Statut</Label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(selectedHarvest.status)}
                  {selectedHarvest.verified && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-muted-foreground">
                        Vérifiée le {selectedHarvest.verifiedAt ? new Date(selectedHarvest.verifiedAt).toLocaleDateString() : ""}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {selectedHarvest.quality && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qualité</Label>
                  <div className="mt-1">{getQualityBadge(selectedHarvest.quality)}</div>
                </div>
              )}
              {selectedHarvest.latitude && selectedHarvest.longitude && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Localisation</Label>
                  <a
                    href={`https://www.google.com/maps?q=${selectedHarvest.latitude},${selectedHarvest.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <MapPin className="h-4 w-4" />
                    {selectedHarvest.latitude}, {selectedHarvest.longitude}
                  </a>
                </div>
              )}
              {selectedHarvest.cooperative && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Coopérative</Label>
                  <p className="text-sm">{selectedHarvest.cooperative.name}</p>
                </div>
              )}
              {selectedHarvest.batchNumber && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Numéro de lot</Label>
                  <p className="text-sm">{selectedHarvest.batchNumber}</p>
                </div>
              )}
              {selectedHarvest.photos && selectedHarvest.photos.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Photos</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {selectedHarvest.photos.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Photo ${index + 1}`}
                        className="h-20 w-full rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ddd"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              {selectedHarvest.notes && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</Label>
                  <p className="text-sm">{selectedHarvest.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
              className="h-10"
            >
              Fermer
            </Button>
            {selectedHarvest && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false)
                  handleEdit(selectedHarvest)
                }}
                className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white h-10"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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
