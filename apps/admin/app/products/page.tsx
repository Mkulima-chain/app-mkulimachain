"use client"

import * as React from "react"
import { Package, Plus, Search, Filter, Edit, Trash2, MoreVertical, Loader2, CheckCircle2, AlertTriangle, Eye, Image as ImageIcon, X } from "lucide-react"
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

type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'discontinued'

type Product = {
  id: string
  sku: string
  name: string
  unit: string
  category: string
  description?: string
  price: number
  currency: string
  stock: number
  originCountry?: string
  isActive: boolean
  status?: ProductStatus
  verified?: boolean
  verifiedAt?: string
  verifiedBy?: string
  barcode?: string
  weight?: number
  dimensions?: string
  expiryDate?: string
  minStockLevel?: number
  maxStockLevel?: number
  supplier?: string
  notes?: string
  rating?: number
  reviewCount?: number
  tags?: string[]
  image?: string[]
  createdAt: string
  updatedAt: string
}

type CreateProductDto = {
  sku: string
  name: string
  unit: string
  category: string
  description?: string
  price: number
  currency?: string
  stock?: number
  originCountry?: string
  isActive?: boolean
  status?: ProductStatus
  barcode?: string
  weight?: number
  dimensions?: string
  expiryDate?: string
  minStockLevel?: number
  maxStockLevel?: number
  supplier?: string
  notes?: string
  tags?: string[]
  image?: string[]
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [filterCategory, setFilterCategory] = React.useState<string>("")
  const [filterStatus, setFilterStatus] = React.useState<string>("")
  const [filterVerified, setFilterVerified] = React.useState<boolean | null>(null)
  const [formData, setFormData] = React.useState<CreateProductDto>({
    sku: "",
    name: "",
    unit: "",
    category: "",
    description: "",
    price: 0,
    currency: "",
    stock: 0,
    originCountry: "",
    isActive: true,
    status: "active",
    barcode: "",
    weight: undefined,
    dimensions: "",
    expiryDate: "",
    minStockLevel: 0,
    maxStockLevel: undefined,
    supplier: "",
    notes: "",
    tags: [],
    image: [],
  })

  // Fonction pour générer le SKU automatiquement
  const generateSKU = (productName: string): string => {
    if (!productName || productName.trim() === "") {
      return ""
    }

    // Normaliser le nom: enlever les accents, mettre en majuscules, remplacer les espaces par des tirets
    const normalizedName = productName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Enlever les accents
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "-") // Remplacer les caractères non alphanumériques par des tirets
      .replace(/-+/g, "-") // Remplacer les tirets multiples par un seul
      .replace(/^-|-$/g, "") // Enlever les tirets en début et fin

    // Générer un nombre unique basé sur le timestamp (3 derniers chiffres)
    const uniqueNumber = Date.now().toString().slice(-3)

    // Concaténer: SKU-NOMDUPRODUIT-NOMBREUNIQUE
    return `SKU-${normalizedName}-${uniqueNumber}`
  }

  // Build query string
  const buildQueryString = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.append("search", searchQuery)
    if (filterCategory) params.append("category", filterCategory)
    if (filterStatus) params.append("status", filterStatus)
    if (filterVerified !== null) params.append("verified", filterVerified.toString())
    params.append("page", currentPage.toString())
    params.append("limit", pageSize.toString())
    const query = params.toString()
    return query ? `?${query}` : ""
  }

  // Fetch products
  const { data: productsResponse, isLoading, refetch } = useApiQuery<{
    data: Product[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>(
    ["products", searchQuery, filterCategory, filterStatus, filterVerified, currentPage, pageSize],
    `/products${buildQueryString()}`
  )

  const products = productsResponse?.data || []
  const totalProducts = productsResponse?.total || 0
  const totalPages = productsResponse?.totalPages || 0

  // Fetch categories, units, and currencies
  const { data: categories = [] } = useApiQuery<any[]>(
    ["categories"],
    "/categories?activeOnly=true"
  )
  const { data: units = [] } = useApiQuery<any[]>(
    ["units"],
    "/units?activeOnly=true"
  )
  const { data: currencies = [] } = useApiQuery<any[]>(
    ["currencies"],
    "/currencies?activeOnly=true"
  )

  // Create mutation
  const createMutation = useApiMutation<Product, CreateProductDto>(
    "/products",
    "POST",
    {
      onSuccess: () => {
        toast.success("Produit ajouté avec succès")
        setIsAddDialogOpen(false)
        setFormData({
          sku: "",
          name: "",
          unit: "",
          category: "",
          description: "",
          price: 0,
          currency: "",
          stock: 0,
          originCountry: "",
          isActive: true,
          status: "active",
          barcode: "",
          weight: undefined,
          dimensions: "",
          expiryDate: "",
          minStockLevel: 0,
          maxStockLevel: undefined,
          supplier: "",
          notes: "",
          tags: [],
          image: [],
        })
        refetch()
      },
    }
  )

  // Update mutation
  const updateMutation = useApiMutation<Product, CreateProductDto>(
    () => `/products/${selectedProduct?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Produit modifié avec succès")
        setIsEditDialogOpen(false)
        setSelectedProduct(null)
        refetch()
      },
    }
  )

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/products/${selectedProduct?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Produit supprimé avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedProduct(null)
        refetch()
      },
    }
  )

  const handleAdd = () => {
    setFormData({
      sku: "",
      name: "",
      unit: "",
      category: "",
      description: "",
      price: 0,
      currency: "",
      stock: 0,
      originCountry: "",
      isActive: true,
      status: "active",
      barcode: "",
      weight: undefined,
      dimensions: "",
      expiryDate: "",
      minStockLevel: 0,
      maxStockLevel: undefined,
      supplier: "",
      notes: "",
      tags: [],
      image: [],
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      sku: product.sku,
      name: product.name,
      unit: product.unit,
      category: product.category,
      description: product.description || "",
      price: Number(product.price),
      currency: product.currency,
      stock: Number(product.stock),
      originCountry: product.originCountry || "",
      isActive: product.isActive,
      status: product.status || "active",
      barcode: product.barcode || "",
      weight: product.weight,
      dimensions: product.dimensions || "",
      expiryDate: product.expiryDate || "",
      minStockLevel: product.minStockLevel || 0,
      maxStockLevel: product.maxStockLevel,
      supplier: product.supplier || "",
      notes: product.notes || "",
      tags: product.tags || [],
      image: product.image || [],
    })
    setIsEditDialogOpen(true)
  }

  const handleView = (product: Product) => {
    setSelectedProduct(product)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return
    updateMutation.mutate(formData)
  }

  const handleConfirmDelete = () => {
    if (!selectedProduct) return
    deleteMutation.mutate(undefined)
  }

  const verifyMutation = useApiMutation<Product, void>(
    () => `/products/${selectedProduct?.id}/verify`,
    "POST",
    {
      onSuccess: () => {
        toast.success("Produit vérifié avec succès")
        refetch()
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de la vérification"
        )
      },
    }
  )

  const updateStatusMutation = useApiMutation<Product, { status: ProductStatus }>(
    () => `/products/${selectedProduct?.id}/status`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Statut mis à jour avec succès")
        refetch()
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de la mise à jour du statut"
        )
      },
    }
  )

  const handleVerify = (product: Product) => {
    setSelectedProduct(product)
    verifyMutation.mutate(undefined)
  }

  const handleStatusChange = (product: Product, status: ProductStatus) => {
    setSelectedProduct(product)
    updateStatusMutation.mutate({ status })
  }

  const getStatusBadge = (status?: ProductStatus, stock?: number, minStockLevel?: number) => {
    const statusConfig = {
      active: { label: "Actif", className: "bg-green-100 text-green-800 border-green-200" },
      inactive: { label: "Inactif", className: "bg-gray-100 text-gray-800 border-gray-200" },
      out_of_stock: { label: "Rupture", className: "bg-red-100 text-red-800 border-red-200" },
      discontinued: { label: "Discontinué", className: "bg-gray-200 text-gray-900 border-gray-300" },
    }
    const actualStatus = status || (stock === 0 ? 'out_of_stock' : 'active')
    const config = statusConfig[actualStatus] || statusConfig.active
    const isLowStock = stock !== undefined && minStockLevel !== undefined && stock <= minStockLevel && stock > 0
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={config.className}>
          {config.label}
        </Badge>
        {isLowStock && (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Stock faible
          </Badge>
        )}
      </div>
    )
  }

  // Get unique categories for filter
  const uniqueCategories = React.useMemo(() => {
    if (!Array.isArray(products)) return []
    return Array.from(new Set(products.map(p => p.category).filter(Boolean))).sort()
  }, [products])

  const verifiedCount = products.filter(p => p.verified).length
  const outOfStockCount = products.filter(p => p.status === 'out_of_stock' || p.stock === 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Produits</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les produits agricoles de la plateforme
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total produits</CardTitle>
            <Package className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "..." : products.filter(p => p.isActive).length} actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Stock total</CardTitle>
            <Package className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : products.reduce((sum, p) => sum + p.stock, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Unités disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <Package className="h-5 w-5 text-[#F2C94C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : products.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock)), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isLoading ? "..." : products[0]?.currency || "USD"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vérifiés</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : verifiedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Produits vérifiés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des produits</CardTitle>
              <CardDescription>
                Recherchez et gérez les produits
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
                placeholder="Rechercher un produit..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <Select value={filterCategory} onValueChange={(value) => {
              setFilterCategory(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(value) => {
              setFilterStatus(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
                <SelectItem value="discontinued">Discontinué</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="filter-verified"
                checked={filterVerified === true}
                onCheckedChange={(checked) => {
                  setFilterVerified(checked ? true : null)
                  setCurrentPage(1)
                }}
              />
              <Label htmlFor="filter-verified" className="text-sm cursor-pointer">
                Vérifiés uniquement
              </Label>
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
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Fournisseur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                          Aucun produit trouvé
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono">{product.sku}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {product.image && product.image.length > 0 ? (
                                <img
                                  src={product.image[0]}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium">{product.name}</div>
                                <div className="text-xs text-muted-foreground">{product.unit}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{product.category}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              {Number(product.price).toFixed(2)} {product.currency}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{product.stock}</div>
                            {product.minStockLevel !== undefined && product.stock <= product.minStockLevel && (
                              <div className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-3 w-3" />
                                Min: {product.minStockLevel}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(product.status, product.stock, product.minStockLevel)}
                              {product.verified && (
                                <CheckCircle2 className="h-4 w-4 text-[#3A8F4C]" title="Vérifié" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {product.supplier ? (
                              <span className="text-muted-foreground">{product.supplier}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-56 p-2">
                                <div className="space-y-1">
                                  <button
                                    onClick={() => handleView(product)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Voir détails
                                  </button>
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </button>
                                  {!product.verified && (
                                    <button
                                      onClick={() => handleVerify(product)}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                      disabled={verifyMutation.isPending}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                      Vérifier
                                    </button>
                                  )}
                                  <div className="border-t border-border/50 my-1" />
                                  <div className="px-3 py-1 text-xs font-semibold text-muted-foreground">
                                    Changer le statut
                                  </div>
                                  {product.status !== 'active' && (
                                    <button
                                      onClick={() => handleStatusChange(product, 'active')}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left"
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Activer
                                    </button>
                                  )}
                                  {product.status !== 'inactive' && (
                                    <button
                                      onClick={() => handleStatusChange(product, 'inactive')}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left"
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Désactiver
                                    </button>
                                  )}
                                  {product.status !== 'out_of_stock' && (
                                    <button
                                      onClick={() => handleStatusChange(product, 'out_of_stock')}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left text-red-600"
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Marquer rupture
                                    </button>
                                  )}
                                  {product.status !== 'discontinued' && (
                                    <button
                                      onClick={() => handleStatusChange(product, 'discontinued')}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left text-gray-600"
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Discontinuer
                                    </button>
                                  )}
                                  <div className="border-t border-border/50 my-1" />
                                  <button
                                    onClick={() => handleDelete(product)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages} ({totalProducts} produits)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouveau produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU (Référence unique) *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  readOnly
                  disabled
                  className="bg-muted cursor-not-allowed"
                  placeholder="Généré automatiquement"
                />
                <p className="text-xs text-muted-foreground">
                  Le SKU est généré automatiquement à partir du nom du produit
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const newName = e.target.value
                    const newSKU = generateSKU(newName)
                    setFormData({ ...formData, name: newName, sku: newSKU })
                  }}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unité *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une unité" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.symbol}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Prix unitaire *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock initial</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="originCountry">Pays d'origine</Label>
                  <Input
                    id="originCountry"
                    value={formData.originCountry}
                    onChange={(e) =>
                      setFormData({ ...formData, originCountry: e.target.value })
                    }
                    placeholder="CD, FR, etc."
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
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: ProductStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
                      <SelectItem value="discontinued">Discontinué</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                    Produit actif
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="barcode">Code-barres</Label>
                  <Input
                    id="barcode"
                    value={formData.barcode || ""}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="1234567890123"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supplier">Fournisseur</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier || ""}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Nom du fournisseur"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="weight">Poids (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight || ""}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="1.5"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dimensions">Dimensions (LxWxH)</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions || ""}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="10x5x3"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiryDate">Date d'expiration</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate || ""}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minStockLevel">Stock minimum (alerte)</Label>
                  <Input
                    id="minStockLevel"
                    type="number"
                    min="0"
                    value={formData.minStockLevel || 0}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxStockLevel">Stock maximum</Label>
                <Input
                  id="maxStockLevel"
                  type="number"
                  min="0"
                  value={formData.maxStockLevel || ""}
                  onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="1000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes internes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Notes et commentaires sur le produit..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="images">Images du produit (URLs)</Label>
                <div className="space-y-2">
                  {formData.image && formData.image.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.image.map((img, index) => (
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
                              const newImages = formData.image?.filter((_, i) => i !== index) || []
                              setFormData({ ...formData, image: newImages })
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
                      id="newImageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          const url = input.value.trim()
                          if (url) {
                            const currentImages = formData.image || []
                            if (!currentImages.includes(url)) {
                              setFormData({ ...formData, image: [...currentImages, url] })
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
                        const input = document.getElementById('newImageUrl') as HTMLInputElement
                        const url = input?.value.trim()
                        if (url) {
                          const currentImages = formData.image || []
                          if (!currentImages.includes(url)) {
                            setFormData({ ...formData, image: [...currentImages, url] })
                            input.value = ''
                          }
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Entrez une URL d'image et appuyez sur Entrée ou cliquez sur le bouton + pour l'ajouter
                  </p>
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-sku">SKU (Référence unique) *</Label>
                <Input
                  id="edit-sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value.toUpperCase() })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom du produit *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Catégorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-unit">Unité *</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une unité" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.symbol}>
                          {unit.name} ({unit.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Prix unitaire *</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-currency">Devise</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-originCountry">Pays d'origine</Label>
                  <Input
                    id="edit-originCountry"
                    value={formData.originCountry}
                    onChange={(e) =>
                      setFormData({ ...formData, originCountry: e.target.value })
                    }
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
                  <Label htmlFor="edit-status">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: ProductStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
                      <SelectItem value="discontinued">Discontinué</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <input
                    type="checkbox"
                    id="edit-isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="edit-isActive" className="text-sm font-normal cursor-pointer">
                    Produit actif
                  </Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-barcode">Code-barres</Label>
                  <Input
                    id="edit-barcode"
                    value={formData.barcode || ""}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-supplier">Fournisseur</Label>
                  <Input
                    id="edit-supplier"
                    value={formData.supplier || ""}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-weight">Poids (kg)</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    step="0.01"
                    value={formData.weight || ""}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-dimensions">Dimensions (LxWxH)</Label>
                  <Input
                    id="edit-dimensions"
                    value={formData.dimensions || ""}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-expiryDate">Date d'expiration</Label>
                <Input
                  id="edit-expiryDate"
                  type="date"
                  value={formData.expiryDate || ""}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-minStockLevel">Stock minimum (alerte)</Label>
                  <Input
                    id="edit-minStockLevel"
                    type="number"
                    min="0"
                    value={formData.minStockLevel || 0}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-maxStockLevel">Stock maximum</Label>
                  <Input
                    id="edit-maxStockLevel"
                    type="number"
                    min="0"
                    value={formData.maxStockLevel || ""}
                    onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes internes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-images">Images du produit (URLs)</Label>
                <div className="space-y-2">
                  {formData.image && formData.image.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {formData.image.map((img, index) => (
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
                              const newImages = formData.image?.filter((_, i) => i !== index) || []
                              setFormData({ ...formData, image: newImages })
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
                      id="editNewImageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          const url = input.value.trim()
                          if (url) {
                            const currentImages = formData.image || []
                            if (!currentImages.includes(url)) {
                              setFormData({ ...formData, image: [...currentImages, url] })
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
                        const input = document.getElementById('editNewImageUrl') as HTMLInputElement
                        const url = input?.value.trim()
                        if (url) {
                          const currentImages = formData.image || []
                          if (!currentImages.includes(url)) {
                            setFormData({ ...formData, image: [...currentImages, url] })
                            input.value = ''
                          }
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Entrez une URL d'image et appuyez sur Entrée ou cliquez sur le bouton + pour l'ajouter
                  </p>
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

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {selectedProduct?.image && selectedProduct.image.length > 0 ? (
                <img
                  src={selectedProduct.image[0]}
                  alt={selectedProduct.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  {selectedProduct?.name}
                  {selectedProduct?.verified && (
                    <CheckCircle2 className="h-5 w-5 text-[#3A8F4C]" title="Vérifié" />
                  )}
                </DialogTitle>
                <DialogDescription>
                  Détails complets du produit
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedProduct.status, selectedProduct.stock, selectedProduct.minStockLevel)}
                {selectedProduct.verified && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">SKU</Label>
                  <p className="text-sm font-mono font-medium text-foreground mt-1">{selectedProduct.sku}</p>
                </div>
                {selectedProduct.barcode && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Code-barres</Label>
                    <p className="text-sm font-medium text-foreground mt-1">{selectedProduct.barcode}</p>
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Catégorie</Label>
                  <Badge variant="outline" className="mt-1">{selectedProduct.category}</Badge>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unité</Label>
                  <p className="text-sm font-medium text-foreground mt-1">{selectedProduct.unit}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prix</Label>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {Number(selectedProduct.price).toFixed(2)} {selectedProduct.currency}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock</Label>
                  <div className="mt-1">
                    <p className="text-sm font-medium text-foreground">{selectedProduct.stock} unités</p>
                    {selectedProduct.minStockLevel !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        Min: {selectedProduct.minStockLevel}
                        {selectedProduct.maxStockLevel !== undefined && ` / Max: ${selectedProduct.maxStockLevel}`}
                      </p>
                    )}
                  </div>
                </div>
                {selectedProduct.originCountry && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pays d'origine</Label>
                    <p className="text-sm font-medium text-foreground mt-1">{selectedProduct.originCountry}</p>
                  </div>
                )}
                {selectedProduct.supplier && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fournisseur</Label>
                    <p className="text-sm font-medium text-foreground mt-1">{selectedProduct.supplier}</p>
                  </div>
                )}
                {selectedProduct.weight && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Poids</Label>
                    <p className="text-sm font-medium text-foreground mt-1">{selectedProduct.weight} kg</p>
                  </div>
                )}
                {selectedProduct.dimensions && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dimensions</Label>
                    <p className="text-sm font-medium text-foreground mt-1">{selectedProduct.dimensions}</p>
                  </div>
                )}
                {selectedProduct.expiryDate && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date d'expiration</Label>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {new Date(selectedProduct.expiryDate).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {selectedProduct.rating !== undefined && selectedProduct.rating !== null && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Note</Label>
                    <p className="text-sm font-medium text-foreground mt-1">
                      {Number(selectedProduct.rating).toFixed(1)}/5 ({selectedProduct.reviewCount || 0} avis)
                    </p>
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date de création</Label>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {new Date(selectedProduct.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dernière modification</Label>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {new Date(selectedProduct.updatedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {selectedProduct.description && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{selectedProduct.description}</p>
                </div>
              )}

              {selectedProduct.notes && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes internes</Label>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{selectedProduct.notes}</p>
                </div>
              )}

              {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedProduct.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedProduct.image && selectedProduct.image.length > 0 && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Images</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {selectedProduct.image.map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`${selectedProduct.name} - Image ${index + 1}`}
                        className="h-20 w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
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
            {selectedProduct && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false)
                  handleEdit(selectedProduct)
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
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>{selectedProduct?.name}</strong> ? Cette action est
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
