"use client"

import * as React from "react"
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
  Image as ImageIcon,
  CheckCircle2,
  Star,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

type MarketplaceItem = {
  id: string
  batchId: string
  farmerId: string
  sku?: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  photos?: string[]
  imageUrl?: string
  priceADA: number
  stockKg: number
  minOrderKg?: number
  maxOrderKg?: number
  shippingCostADA?: number
  location?: string
  certifications?: string[]
  rating?: number
  reviewCount: number
  views: number
  salesCount: number
  notes?: string
  featured: boolean
  expiresAt?: string
  cooperativeId?: string
  status: string
  batch?: { id: string; qrCode?: string; name?: string }
  farmer?: { id: string; name?: string }
  cooperative?: { id: string; name?: string }
  createdAt: string
  updatedAt?: string
}

type CreateMarketplaceItemDto = {
  batchId: string
  farmerId: string
  sku?: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  photos?: string[]
  imageUrl?: string
  priceADA: number
  stockKg: number
  minOrderKg?: number
  maxOrderKg?: number
  shippingCostADA?: number
  location?: string
  certifications?: string[]
  notes?: string
  featured?: boolean
  expiresAt?: string
  cooperativeId?: string
  status?: string
}

const statuses = [
  { value: "draft", label: "Brouillon" },
  { value: "active", label: "Actif" },
  { value: "sold_out", label: "Rupture" },
  { value: "archived", label: "Archivé" },
]

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<MarketplaceItem | null>(null)
  const [formData, setFormData] = React.useState<CreateMarketplaceItemDto>({
    batchId: "",
    farmerId: "",
    title: "",
    description: "",
    priceADA: 0,
    stockKg: 0,
    imageUrl: "",
    status: "draft",
  })

  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [filterStatus, setFilterStatus] = React.useState<string>("")
  const [filterCategory, setFilterCategory] = React.useState<string>("")
  const [filterFeatured, setFilterFeatured] = React.useState<boolean | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)

  type MarketplaceItemsResponse = {
    data: MarketplaceItem[]
    total: number
    page: number
    limit: number
    totalPages: number
  }

  const buildQueryString = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.append('search', searchQuery)
    if (filterStatus) params.append('status', filterStatus)
    if (filterCategory) params.append('category', filterCategory)
    if (filterFeatured !== null) params.append('featured', String(filterFeatured))
    params.append('page', String(currentPage))
    params.append('limit', String(pageSize))
    params.append('sortBy', 'createdAt')
    params.append('sortOrder', 'DESC')
    return params.toString()
  }

  const { data: itemsResponse, isLoading, refetch } = useApiQuery<MarketplaceItemsResponse>(
    ["marketplace", currentPage, searchQuery, filterStatus, filterCategory, filterFeatured],
    `/marketplace?${buildQueryString()}`
  )

  const items = itemsResponse?.data || []
  const totalPages = itemsResponse?.totalPages || 1
  const total = itemsResponse?.total || 0

  // Fetch batches, farmers, and cooperatives for selects
  type Batch = { id: string; qrCode?: string; name?: string }
  type Farmer = { id: string; name?: string }
  type Cooperative = { id: string; name?: string }

  const { data: batchesData } = useApiQuery<Batch[] | { data: Batch[] }>(
    ["batches"],
    "/batches?limit=100"
  )
  const batches = React.useMemo(() => {
    if (!batchesData) return []
    return Array.isArray(batchesData) ? batchesData : (batchesData.data || [])
  }, [batchesData])

  const { data: farmersData } = useApiQuery<Farmer[] | { data: Farmer[] }>(
    ["farmers"],
    "/farmers?limit=100"
  )
  const farmers = React.useMemo(() => {
    if (!farmersData) return []
    return Array.isArray(farmersData) ? farmersData : (farmersData.data || [])
  }, [farmersData])

  const { data: cooperativesData } = useApiQuery<Cooperative[] | { data: Cooperative[] }>(
    ["cooperatives"],
    "/cooperatives?limit=100"
  )
  const cooperatives = React.useMemo(() => {
    if (!cooperativesData) return []
    return Array.isArray(cooperativesData) ? cooperativesData : (cooperativesData.data || [])
  }, [cooperativesData])

  // Fetch statistics
  const { data: stats } = useApiQuery<{
    total: number
    active: number
    draft: number
    soldOut: number
    archived: number
    totalStock: number
    totalValue: number
    averageRating: number
    featured: number
  }>(
    ["marketplace-stats"],
    "/marketplace/stats/global"
  )

  const createMutation = useApiMutation<MarketplaceItem, CreateMarketplaceItemDto>(
    "/marketplace",
    "POST",
    {
      onSuccess: () => {
        toast.success("Article créé avec succès")
        setIsAddDialogOpen(false)
        refetch()
      },
    }
  )

  const updateMutation = useApiMutation<MarketplaceItem, CreateMarketplaceItemDto>(
    () => `/marketplace/${selectedItem?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Article mis à jour avec succès")
        setIsEditDialogOpen(false)
        setSelectedItem(null)
        refetch()
      },
    }
  )

  const deleteMutation = useApiMutation<void, void>(
    () => `/marketplace/${selectedItem?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Article supprimé avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedItem(null)
        refetch()
      },
    }
  )

  const handleAdd = () => {
    setFormData({
      batchId: "",
      farmerId: "",
      sku: undefined, // Ne pas définir de SKU, il sera généré automatiquement
      title: "",
      description: "",
      category: "",
      tags: [],
      photos: [],
      imageUrl: "",
      priceADA: 0,
      stockKg: 0,
      minOrderKg: undefined,
      maxOrderKg: undefined,
      shippingCostADA: undefined,
      location: "",
      certifications: [],
      notes: "",
      featured: false,
      expiresAt: "",
      cooperativeId: "",
      status: undefined, // Le status est géré automatiquement par le backend
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (item: MarketplaceItem) => {
    setSelectedItem(item)
    const expiresAtLocal = item.expiresAt
      ? new Date(item.expiresAt).toISOString().slice(0, 16)
      : ""
    setFormData({
      batchId: item.batchId,
      farmerId: item.farmerId,
      sku: item.sku || "",
      title: item.title,
      description: item.description || "",
      category: item.category || "",
      tags: item.tags || [],
      photos: item.photos || [],
      imageUrl: item.imageUrl || "",
      priceADA: item.priceADA,
      stockKg: item.stockKg,
      minOrderKg: item.minOrderKg,
      maxOrderKg: item.maxOrderKg,
      shippingCostADA: item.shippingCostADA,
      location: item.location || "",
      certifications: item.certifications || [],
      notes: item.notes || "",
      featured: item.featured || false,
      expiresAt: expiresAtLocal,
      cooperativeId: item.cooperativeId || "",
      status: item.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (item: MarketplaceItem) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData: CreateMarketplaceItemDto = {
      batchId: formData.batchId.trim(),
      farmerId: formData.farmerId.trim(),
      sku: formData.sku?.trim() || undefined,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      category: formData.category?.trim() || undefined,
      tags: formData.tags?.filter(t => t.trim() !== "") || undefined,
      photos: formData.photos?.filter(p => p.trim() !== "") || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
      priceADA: Number(formData.priceADA),
      stockKg: Number(formData.stockKg),
      minOrderKg: formData.minOrderKg ? Number(formData.minOrderKg) : undefined,
      maxOrderKg: formData.maxOrderKg ? Number(formData.maxOrderKg) : undefined,
      shippingCostADA: formData.shippingCostADA ? Number(formData.shippingCostADA) : undefined,
      location: formData.location?.trim() || undefined,
      certifications: formData.certifications?.filter(c => c.trim() !== "") || undefined,
      notes: formData.notes?.trim() || undefined,
      featured: formData.featured || false,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      cooperativeId: formData.cooperativeId?.trim() || undefined,
      // Le status est géré automatiquement par le backend (défaut: DRAFT)
    }
    createMutation.mutate(submitData)
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    const submitData: CreateMarketplaceItemDto = {
      ...formData,
      batchId: formData.batchId.trim(),
      farmerId: formData.farmerId.trim(),
      sku: formData.sku?.trim() || undefined,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
      category: formData.category?.trim() || undefined,
      tags: formData.tags?.filter(t => t.trim() !== "") || undefined,
      photos: formData.photos?.filter(p => p.trim() !== "") || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
      priceADA: Number(formData.priceADA),
      stockKg: Number(formData.stockKg),
      minOrderKg: formData.minOrderKg ? Number(formData.minOrderKg) : undefined,
      maxOrderKg: formData.maxOrderKg ? Number(formData.maxOrderKg) : undefined,
      shippingCostADA: formData.shippingCostADA ? Number(formData.shippingCostADA) : undefined,
      location: formData.location?.trim() || undefined,
      certifications: formData.certifications?.filter(c => c.trim() !== "") || undefined,
      notes: formData.notes?.trim() || undefined,
      featured: formData.featured || false,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
      cooperativeId: formData.cooperativeId?.trim() || undefined,
      status: formData.status || "draft",
    }
    updateMutation.mutate(submitData)
  }

  const handleConfirmDelete = () => {
    if (!selectedItem) return
    deleteMutation.mutate(undefined)
  }

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

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total items</CardTitle>
            <Package className="h-5 w-5 text-[#004D73]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Référencés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Items actifs</CardTitle>
            <Store className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : stats?.active || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">En vente</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock total</CardTitle>
            <TrendingUp className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : `${Number(stats?.totalStock || 0).toFixed(2)} kg`}</div>
            <p className="text-xs text-muted-foreground mt-1">Disponible</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <TrendingUp className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : `${Number(stats?.totalValue || 0).toFixed(2)} ADA`}</div>
            <p className="text-xs text-muted-foreground mt-1">En stock</p>
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
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un article..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <Select
              value={filterStatus || ""}
              onValueChange={(value) => {
                setFilterStatus(value || "")
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Catégorie..."
              className="w-[180px]"
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value)
                setCurrentPage(1)
              }}
            />
            <Select
              value={filterFeatured === null ? "" : String(filterFeatured)}
              onValueChange={(value) => {
                setFilterFeatured(value === "" ? null : value === "true")
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mis en avant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="true">Mis en avant</SelectItem>
                <SelectItem value="false">Non mis en avant</SelectItem>
              </SelectContent>
            </Select>
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
                        Titre / SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Catégorie
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
                        Photos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                          Aucun article trouvé
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => {
                        const statusColors: Record<string, string> = {
                          draft: "bg-gray-100 text-gray-800",
                          active: "bg-green-100 text-green-800",
                          sold_out: "bg-red-100 text-red-800",
                          archived: "bg-yellow-100 text-yellow-800",
                        }
                        return (
                          <tr key={item.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium">{item.title}</div>
                              {item.sku && (
                                <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                              )}
                              <div className="text-xs text-muted-foreground">
                                {item.batch?.name || item.batch?.qrCode || item.batchId}
                                {item.farmer?.name && ` • ${item.farmer.name}`}
                              </div>
                              {item.featured && (
                                <Badge className="mt-1 bg-yellow-100 text-yellow-800 text-xs">
                                  ⭐ Mis en avant
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {item.category || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {Number(item.priceADA).toFixed(6)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {Number(item.stockKg).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={statusColors[item.status] || "bg-gray-100 text-gray-800"}>
                                {item.status === "draft" && "Brouillon"}
                                {item.status === "active" && "Actif"}
                                {item.status === "sold_out" && "Rupture"}
                                {item.status === "archived" && "Archivé"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              {item.photos && item.photos.length > 0 ? (
                                <div className="flex gap-1">
                                  {item.photos.slice(0, 3).map((photo, idx) => (
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
                                  {item.photos.length > 3 && (
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                      +{item.photos.length - 3}
                                    </div>
                                  )}
                                </div>
                              ) : item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt="Article"
                                  className="h-10 w-10 rounded object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                  }}
                                />
                              ) : (
                                <span className="text-muted-foreground text-sm">-</span>
                              )}
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
                                        setSelectedItem(item)
                                        setIsViewDialogOpen(true)
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                    >
                                      <Eye className="h-4 w-4" />
                                      Voir détails
                                    </button>
                                    <button
                                      onClick={() => handleEdit(item)}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Modifier
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
                Page {currentPage} sur {totalPages} ({total} article{total > 1 ? 's' : ''})
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
            <DialogTitle>Ajouter un article</DialogTitle>
            <DialogDescription>
              Renseignez les informations de l'article
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                          {batch.name || batch.qrCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Le SKU sera généré automatiquement lors de la création
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
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
                  <Label htmlFor="priceADA">Prix (ADA/kg) *</Label>
                  <Input
                    id="priceADA"
                    type="number"
                    step="0.000001"
                    min="0.000001"
                    value={formData.priceADA}
                    onChange={(e) => setFormData({ ...formData, priceADA: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stockKg">Stock (kg) *</Label>
                  <Input
                    id="stockKg"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.stockKg}
                    onChange={(e) => setFormData({ ...formData, stockKg: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Le statut sera automatiquement défini à "Brouillon" lors de la création
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="minOrderKg">Quantité min. (kg)</Label>
                  <Input
                    id="minOrderKg"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.minOrderKg ?? ""}
                    onChange={(e) => setFormData({ ...formData, minOrderKg: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxOrderKg">Quantité max. (kg)</Label>
                  <Input
                    id="maxOrderKg"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.maxOrderKg ?? ""}
                    onChange={(e) => setFormData({ ...formData, maxOrderKg: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="shippingCostADA">Coût livraison (ADA)</Label>
                  <Input
                    id="shippingCostADA"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={formData.shippingCostADA ?? ""}
                    onChange={(e) => setFormData({ ...formData, shippingCostADA: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="cooperativeId">Coopérative</Label>
                  <Select
                    value={formData.cooperativeId || ""}
                    onValueChange={(value) => setFormData({ ...formData, cooperativeId: value || undefined })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="expiresAt">Date d'expiration</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt || ""}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  value={formData.tags?.join(", ") || ""}
                  onChange={(e) => {
                    const tags = e.target.value.split(",").map(t => t.trim()).filter(t => t !== "")
                    setFormData({ ...formData, tags })
                  }}
                  placeholder="bio, premium, kasai"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="certifications">Certifications (séparées par des virgules)</Label>
                <Input
                  id="certifications"
                  value={formData.certifications?.join(", ") || ""}
                  onChange={(e) => {
                    const certifications = e.target.value.split(",").map(c => c.trim()).filter(c => c !== "")
                    setFormData({ ...formData, certifications })
                  }}
                  placeholder="Bio, Fair Trade"
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

              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image URL (déprécié, utiliser photos)</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="featured" className="text-sm font-normal cursor-pointer">
                  Mettre en avant
                </Label>
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
            <DialogTitle>Modifier l'article</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de l'article
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-batchId">Lot *</Label>
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
                          {batch.name || batch.qrCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku || ""}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="Généré automatiquement"
                />
                <p className="text-xs text-muted-foreground">
                  Le SKU peut être modifié manuellement si nécessaire
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Catégorie</Label>
                <Input
                  id="edit-category"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-title">Titre *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
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

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-priceADA">Prix (ADA/kg) *</Label>
                  <Input
                    id="edit-priceADA"
                    type="number"
                    step="0.000001"
                    min="0.000001"
                    value={formData.priceADA}
                    onChange={(e) => setFormData({ ...formData, priceADA: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-stockKg">Stock (kg) *</Label>
                  <Input
                    id="edit-stockKg"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.stockKg}
                    onChange={(e) => setFormData({ ...formData, stockKg: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Statut</Label>
                  <Select
                    value={formData.status || "draft"}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-minOrderKg">Quantité min. (kg)</Label>
                  <Input
                    id="edit-minOrderKg"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.minOrderKg ?? ""}
                    onChange={(e) => setFormData({ ...formData, minOrderKg: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxOrderKg">Quantité max. (kg)</Label>
                  <Input
                    id="edit-maxOrderKg"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.maxOrderKg ?? ""}
                    onChange={(e) => setFormData({ ...formData, maxOrderKg: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-shippingCostADA">Coût livraison (ADA)</Label>
                  <Input
                    id="edit-shippingCostADA"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={formData.shippingCostADA ?? ""}
                    onChange={(e) => setFormData({ ...formData, shippingCostADA: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-location">Localisation</Label>
                  <Input
                    id="edit-location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-cooperativeId">Coopérative</Label>
                  <Select
                    value={formData.cooperativeId || ""}
                    onValueChange={(value) => setFormData({ ...formData, cooperativeId: value || undefined })}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="edit-expiresAt">Date d'expiration</Label>
                  <Input
                    id="edit-expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt || ""}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-tags">Tags (séparés par des virgules)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags?.join(", ") || ""}
                  onChange={(e) => {
                    const tags = e.target.value.split(",").map(t => t.trim()).filter(t => t !== "")
                    setFormData({ ...formData, tags })
                  }}
                  placeholder="bio, premium, kasai"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-certifications">Certifications (séparées par des virgules)</Label>
                <Input
                  id="edit-certifications"
                  value={formData.certifications?.join(", ") || ""}
                  onChange={(e) => {
                    const certifications = e.target.value.split(",").map(c => c.trim()).filter(c => c !== "")
                    setFormData({ ...formData, certifications })
                  }}
                  placeholder="Bio, Fair Trade"
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

              <div className="grid gap-2">
                <Label htmlFor="edit-imageUrl">Image URL (déprécié, utiliser photos)</Label>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-featured"
                  checked={formData.featured || false}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="edit-featured" className="text-sm font-normal cursor-pointer">
                  Mettre en avant
                </Label>
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'article</DialogTitle>
            <DialogDescription>
              Informations complètes de l'article
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Titre</Label>
                  <p className="text-sm font-medium">{selectedItem.title}</p>
                </div>
                {selectedItem.sku && (
                  <div>
                    <Label className="text-xs text-muted-foreground">SKU</Label>
                    <p className="text-sm font-medium">{selectedItem.sku}</p>
                  </div>
                )}
              </div>

              {selectedItem.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedItem.description}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Catégorie</Label>
                  <p className="text-sm font-medium">{selectedItem.category || "-"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Statut</Label>
                  <div className="mt-1">
                    <Badge className={
                      selectedItem.status === "draft" ? "bg-gray-100 text-gray-800" :
                      selectedItem.status === "active" ? "bg-green-100 text-green-800" :
                      selectedItem.status === "sold_out" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }>
                      {selectedItem.status === "draft" && "Brouillon"}
                      {selectedItem.status === "active" && "Actif"}
                      {selectedItem.status === "sold_out" && "Rupture"}
                      {selectedItem.status === "archived" && "Archivé"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Mis en avant</Label>
                  <div className="mt-1">
                    {selectedItem.featured ? (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        ⭐ Oui
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Non</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Prix (ADA/kg)</Label>
                  <p className="text-sm font-medium">{Number(selectedItem.priceADA).toFixed(6)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Stock (kg)</Label>
                  <p className="text-sm font-medium">{Number(selectedItem.stockKg).toFixed(2)}</p>
                </div>
                {selectedItem.rating !== undefined && selectedItem.rating !== null && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Note</Label>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <p className="text-sm font-medium">{Number(selectedItem.rating).toFixed(2)}</p>
                      {selectedItem.reviewCount > 0 && (
                        <span className="text-xs text-muted-foreground">({selectedItem.reviewCount} avis)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {(selectedItem.minOrderKg || selectedItem.maxOrderKg || selectedItem.shippingCostADA) && (
                <div className="grid grid-cols-3 gap-4">
                  {selectedItem.minOrderKg && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Quantité min. (kg)</Label>
                      <p className="text-sm font-medium">{Number(selectedItem.minOrderKg).toFixed(2)}</p>
                    </div>
                  )}
                  {selectedItem.maxOrderKg && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Quantité max. (kg)</Label>
                      <p className="text-sm font-medium">{Number(selectedItem.maxOrderKg).toFixed(2)}</p>
                    </div>
                  )}
                  {selectedItem.shippingCostADA && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Coût livraison (ADA)</Label>
                      <p className="text-sm font-medium">{Number(selectedItem.shippingCostADA).toFixed(6)}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Lot</Label>
                  <p className="text-sm font-medium">{selectedItem.batch?.name || selectedItem.batch?.qrCode || selectedItem.batchId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Agriculteur</Label>
                  <p className="text-sm font-medium">{selectedItem.farmer?.name || selectedItem.farmerId}</p>
                </div>
              </div>

              {selectedItem.cooperative && (
                <div>
                  <Label className="text-xs text-muted-foreground">Coopérative</Label>
                  <p className="text-sm font-medium">{selectedItem.cooperative.name}</p>
                </div>
              )}

              {selectedItem.location && (
                <div>
                  <Label className="text-xs text-muted-foreground">Localisation</Label>
                  <p className="text-sm font-medium">{selectedItem.location}</p>
                </div>
              )}

              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedItem.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.certifications && selectedItem.certifications.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Certifications</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedItem.certifications.map((cert, idx) => (
                      <Badge key={idx} className="bg-green-100 text-green-800">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {(selectedItem.photos && selectedItem.photos.length > 0) || selectedItem.imageUrl ? (
                <div>
                  <Label className="text-xs text-muted-foreground">Photos</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedItem.photos && selectedItem.photos.length > 0 ? (
                      selectedItem.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-32 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      ))
                    ) : selectedItem.imageUrl ? (
                      <img
                        src={selectedItem.imageUrl}
                        alt="Article"
                        className="w-full h-32 rounded object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Vues</Label>
                  <p className="text-sm font-medium">{selectedItem.views || 0}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ventes</Label>
                  <p className="text-sm font-medium">{selectedItem.salesCount || 0}</p>
                </div>
                {selectedItem.expiresAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Expire le</Label>
                    <p className="text-sm font-medium">
                      {new Date(selectedItem.expiresAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
              </div>

              {selectedItem.notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm">{selectedItem.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Créé le</Label>
                  <p className="text-sm font-medium">
                    {new Date(selectedItem.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {selectedItem.updatedAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Modifié le</Label>
                    <p className="text-sm font-medium">
                      {new Date(selectedItem.updatedAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'article</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
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
