"use client"

import * as React from "react"
import {
  ShoppingCart,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
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
import { Checkbox } from "@/components/ui/checkbox"

enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  SHIPPED = "shipped",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

enum OrderPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

type Order = {
  id: string
  orderNumber?: string
  buyerId: string
  item: {
    id: string
    title: string
    priceADA: number
    farmer?: {
      id: string
      name?: string
    }
  }
  quantityKg: number
  unitPriceADA: number
  totalADA: number
  shippingCostADA?: number
  discountADA?: number
  taxADA?: number
  status: OrderStatus
  paymentHash?: string
  shippingAddress?: string
  trackingNumber?: string
  paidAt?: string
  shippedAt?: string
  completedAt?: string
  cancelledAt?: string
  cancellationReason?: string
  refundedAt?: string
  refundHash?: string
  estimatedDeliveryDate?: string
  deliveryMethod?: string
  notes?: string
  buyerNotes?: string
  internalNotes?: string
  priority?: OrderPriority
  tags?: string[]
  cooperativeId?: string
  cooperative?: { id: string; name?: string }
  farmerId?: string
  farmer?: { id: string; name?: string }
  createdAt: string
  updatedAt: string
}

type CreateOrderDto = {
  buyerId: string
  itemId: string
  quantityKg: number
  shippingAddress?: string
  shippingCostADA?: number
  discountADA?: number
  buyerNotes?: string
  deliveryMethod?: string
  estimatedDeliveryDate?: string
  cooperativeId?: string
}

type UpdateOrderDto = {
  status?: OrderStatus
  paymentHash?: string
  shippingAddress?: string
  trackingNumber?: string
  notes?: string
  internalNotes?: string
  priority?: OrderPriority
  tags?: string[]
  shippingCostADA?: number
  discountADA?: number
  taxADA?: number
  estimatedDeliveryDate?: string
  deliveryMethod?: string
}

type OrdersResponse = {
  data: Order[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const statuses = [
  { value: OrderStatus.PENDING, label: "En attente" },
  { value: OrderStatus.PAID, label: "Payée" },
  { value: OrderStatus.SHIPPED, label: "Expédiée" },
  { value: OrderStatus.COMPLETED, label: "Complétée" },
  { value: OrderStatus.CANCELLED, label: "Annulée" },
  { value: OrderStatus.REFUNDED, label: "Remboursée" },
]

const priorities = [
  { value: OrderPriority.LOW, label: "Basse" },
  { value: OrderPriority.NORMAL, label: "Normale" },
  { value: OrderPriority.HIGH, label: "Haute" },
  { value: OrderPriority.URGENT, label: "Urgente" },
]

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [filterStatus, setFilterStatus] = React.useState<string>("")
  const [filterFarmer, setFilterFarmer] = React.useState<string>("")
  const [filterCooperative, setFilterCooperative] = React.useState<string>("")
  const [showFilters, setShowFilters] = React.useState(false)

  const [formData, setFormData] = React.useState<CreateOrderDto>({
    buyerId: "",
    itemId: "",
    quantityKg: 0,
    shippingAddress: "",
    shippingCostADA: undefined,
    discountADA: undefined,
    buyerNotes: "",
    deliveryMethod: "",
    estimatedDeliveryDate: "",
    cooperativeId: "",
  })

  const [updateData, setUpdateData] = React.useState<UpdateOrderDto>({
    status: OrderStatus.PENDING,
  })

  const buildQueryString = () => {
    const params = new URLSearchParams()
    params.append('page', String(currentPage))
    params.append('limit', String(pageSize))
    if (searchQuery) params.append('orderNumber', searchQuery)
    if (filterStatus) params.append('status', filterStatus)
    if (filterFarmer) params.append('farmerId', filterFarmer)
    if (filterCooperative) params.append('cooperativeId', filterCooperative)
    return params.toString()
  }

  // Fetch orders with pagination
  const { data: ordersResponse, isLoading, refetch } = useApiQuery<OrdersResponse>(
    ["orders", String(currentPage), filterStatus, filterFarmer, filterCooperative, searchQuery],
    `/orders?${buildQueryString()}`
  )

  const orders = ordersResponse?.data || []
  const totalPages = ordersResponse?.totalPages || 0

  // Fetch global stats
  const { data: globalStats } = useApiQuery<{
    total: number
    active: number
    totalValue: number
    averageValue: number
    thisMonth: number
    thisYear: number
    byStatus: {
      pending: number
      paid: number
      shipped: number
      completed: number
      cancelled: number
      refunded: number
    }
  }>(["orders-stats-global"], "/orders/stats/global")

  // Fetch users, marketplace items, farmers, cooperatives for selects
  const { data: users = [] } = useApiQuery<{ id: string; firstName: string; lastName: string; email: string }[]>(
    ["users"],
    "/auth/users"
  )

  const { data: marketplaceItemsResponse } = useApiQuery<{ data: { id: string; title: string; stockKg: number; priceADA: number; status: string }[] }>(
    ["marketplace-items"],
    "/marketplace?limit=100"
  )

  const marketplaceItems = React.useMemo(() => {
    return marketplaceItemsResponse?.data || []
  }, [marketplaceItemsResponse])

  const { data: farmersResponse } = useApiQuery<{ data: { id: string; name?: string }[] }>(
    ["farmers"],
    "/farmers?limit=100"
  )

  const farmers = React.useMemo(() => {
    return farmersResponse?.data || []
  }, [farmersResponse])

  const { data: cooperativesResponse } = useApiQuery<{ data: { id: string; name?: string }[] }>(
    ["cooperatives"],
    "/cooperatives?limit=100"
  )

  const cooperatives = React.useMemo(() => {
    return cooperativesResponse?.data || []
  }, [cooperativesResponse])

  // Create mutation
  const createMutation = useApiMutation<Order, CreateOrderDto>(
    "/orders",
    "POST",
    {
      onSuccess: () => {
        toast.success("Commande ajoutée avec succès")
        setIsAddDialogOpen(false)
        refetch()
      },
    }
  )

  // Update mutation
  const updateMutation = useApiMutation<Order, UpdateOrderDto>(
    () => `/orders/${selectedOrder?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Commande modifiée avec succès")
        setIsEditDialogOpen(false)
        setSelectedOrder(null)
        refetch()
      },
    }
  )

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/orders/${selectedOrder?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Commande supprimée avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedOrder(null)
        refetch()
      },
    }
  )

  const handleAdd = () => {
    setFormData({
      buyerId: "",
      itemId: "",
      quantityKg: 0,
      shippingAddress: "",
      shippingCostADA: undefined,
      discountADA: undefined,
      buyerNotes: "",
      deliveryMethod: "",
      estimatedDeliveryDate: "",
      cooperativeId: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (order: Order) => {
    setSelectedOrder(order)
    setUpdateData({
      status: order.status,
      paymentHash: order.paymentHash,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      notes: order.notes,
      internalNotes: order.internalNotes,
      priority: order.priority,
      tags: order.tags,
      shippingCostADA: order.shippingCostADA,
      discountADA: order.discountADA,
      taxADA: order.taxADA,
      estimatedDeliveryDate: order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toISOString().slice(0, 16) : undefined,
      deliveryMethod: order.deliveryMethod,
    })
    setIsEditDialogOpen(true)
  }

  const handleView = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (order: Order) => {
    setSelectedOrder(order)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation: vérifier que l'article sélectionné existe
    const selectedItem = marketplaceItems.find(item => item.id === formData.itemId)
    if (!selectedItem) {
      toast.error("Veuillez sélectionner un article valide")
      return
    }
    
    // Avertissement si l'article n'est pas actif (mais on permet quand même dans l'admin)
    if (selectedItem.status !== "active") {
      toast.warning(`Attention: L'article sélectionné n'est pas actif (statut: ${selectedItem.status}). La commande peut être créée mais l'article devra être activé pour être disponible aux clients.`)
    }
    
    // Validation: vérifier le stock
    if (Number(selectedItem.stockKg) < Number(formData.quantityKg)) {
      toast.error(`Stock insuffisant. Stock disponible: ${Number(selectedItem.stockKg).toFixed(2)} kg, quantité demandée: ${Number(formData.quantityKg).toFixed(2)} kg`)
      return
    }
    
    const submitData: CreateOrderDto = {
      buyerId: formData.buyerId.trim(),
      itemId: formData.itemId.trim(),
      quantityKg: Number(formData.quantityKg),
      shippingAddress: formData.shippingAddress?.trim() || undefined,
      shippingCostADA: formData.shippingCostADA ? Number(formData.shippingCostADA) : undefined,
      discountADA: formData.discountADA ? Number(formData.discountADA) : undefined,
      buyerNotes: formData.buyerNotes?.trim() || undefined,
      deliveryMethod: formData.deliveryMethod?.trim() || undefined,
      estimatedDeliveryDate: formData.estimatedDeliveryDate ? new Date(formData.estimatedDeliveryDate).toISOString() : undefined,
      cooperativeId: formData.cooperativeId?.trim() || undefined,
    }
    createMutation.mutate(submitData)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return
    const submitData: UpdateOrderDto = {
      ...updateData,
      estimatedDeliveryDate: updateData.estimatedDeliveryDate ? new Date(updateData.estimatedDeliveryDate).toISOString() : undefined,
    }
    updateMutation.mutate(submitData)
  }

  const handleConfirmDelete = () => {
    if (!selectedOrder) return
    deleteMutation.mutate(undefined)
  }

  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<OrderStatus, { variant: "default" | "secondary" | "outline"; className: string; label: string }> = {
      [OrderStatus.COMPLETED]: { variant: "default", className: "bg-[#3A8F4C] text-white", label: "Complétée" },
      [OrderStatus.SHIPPED]: { variant: "secondary", className: "bg-[#004D73] text-white", label: "Expédiée" },
      [OrderStatus.PAID]: { variant: "secondary", className: "bg-[#5A3E36] text-white", label: "Payée" },
      [OrderStatus.PENDING]: { variant: "outline", className: "", label: "En attente" },
      [OrderStatus.CANCELLED]: { variant: "outline", className: "", label: "Annulée" },
      [OrderStatus.REFUNDED]: { variant: "outline", className: "", label: "Remboursée" },
    }
    return variants[status] || variants[OrderStatus.PENDING]
  }

  const getPriorityBadge = (priority?: OrderPriority) => {
    if (!priority) return null
    const variants: Record<OrderPriority, { className: string; label: string }> = {
      [OrderPriority.LOW]: { className: "bg-gray-100 text-gray-800", label: "Basse" },
      [OrderPriority.NORMAL]: { className: "bg-blue-100 text-blue-800", label: "Normale" },
      [OrderPriority.HIGH]: { className: "bg-orange-100 text-orange-800", label: "Haute" },
      [OrderPriority.URGENT]: { className: "bg-red-100 text-red-800", label: "Urgente" },
    }
    return variants[priority] || variants[OrderPriority.NORMAL]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Commandes</h1>
          <p className="text-muted-foreground mt-1">
            Gérez et suivez les commandes de la plateforme
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une commande
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total commandes</CardTitle>
            <ShoppingCart className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {globalStats?.thisMonth || 0} ce mois
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Actives</CardTitle>
            <ShoppingCart className="h-5 w-5 text-[#F2C94C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats?.active || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              En traitement
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Montant total</CardTitle>
            <ShoppingCart className="h-5 w-5 text-[#004D73]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalStats?.totalValue?.toFixed(2) || "0.00"} ADA
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Moyenne: {globalStats?.averageValue?.toFixed(2) || "0.00"} ADA
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Complétées</CardTitle>
            <ShoppingCart className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {globalStats?.byStatus?.completed || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {globalStats?.total ? Math.round((globalStats.byStatus?.completed || 0) / globalStats.total * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des commandes</CardTitle>
              <CardDescription>
                Recherchez et gérez les commandes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par numéro..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtres
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-lg bg-muted/50">
              <div className="grid gap-2">
                <Label htmlFor="filter-status">Statut</Label>
                <Select
                  value={filterStatus}
                  onValueChange={(value) => {
                    setFilterStatus(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger>
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="filter-farmer">Agriculteur</Label>
                <Select
                  value={filterFarmer}
                  onValueChange={(value) => {
                    setFilterFarmer(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les agriculteurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les agriculteurs</SelectItem>
                    {farmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name || farmer.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="filter-cooperative">Coopérative</Label>
                <Select
                  value={filterCooperative}
                  onValueChange={(value) => {
                    setFilterCooperative(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les coopératives" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les coopératives</SelectItem>
                    {cooperatives.map((coop) => (
                      <SelectItem key={coop.id} value={coop.id}>
                        {coop.name || coop.id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

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
                          Numéro / Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Produit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Agriculteur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Quantité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Montant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Priorité
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                            Aucune commande trouvée
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => {
                          const statusBadge = getStatusBadge(order.status)
                          const priorityBadge = getPriorityBadge(order.priority)
                          return (
                            <tr key={order.id} className="hover:bg-muted/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium">
                                  {order.orderNumber || `#${order.id.slice(0, 8)}`}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {order.item?.title || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {order.farmer?.name || order.item?.farmer?.name || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {Number(order.quantityKg).toFixed(2)} kg
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {Number(order.totalADA).toFixed(2)} ADA
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={statusBadge.variant} className={statusBadge.className}>
                                  {statusBadge.label}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {priorityBadge && (
                                  <Badge className={priorityBadge.className}>
                                    {priorityBadge.label}
                                  </Badge>
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
                                        onClick={() => handleView(order)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                      >
                                        <Eye className="h-4 w-4" />
                                        Voir détails
                                      </button>
                                      <button
                                        onClick={() => handleEdit(order)}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                      >
                                        <Edit className="h-4 w-4" />
                                        Modifier
                                      </button>
                                      <button
                                        onClick={() => handleDelete(order)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({ordersResponse?.total || 0} commandes)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
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
            <DialogTitle>Ajouter une commande</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter une nouvelle commande
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="buyerId">Acheteur *</Label>
                <Select
                  value={formData.buyerId}
                  onValueChange={(value) => setFormData({ ...formData, buyerId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un acheteur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="itemId">Article du marketplace *</Label>
                <Select
                  value={formData.itemId}
                  onValueChange={(value) => setFormData({ ...formData, itemId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un article" />
                  </SelectTrigger>
                  <SelectContent>
                    {marketplaceItems.length === 0 ? (
                      <SelectItem value="" disabled>
                        Aucun article disponible
                      </SelectItem>
                    ) : (
                      marketplaceItems.map((item) => {
                        const statusLabels: Record<string, string> = {
                          draft: "Brouillon",
                          active: "Actif",
                          sold_out: "Rupture",
                          archived: "Archivé",
                        }
                        const statusLabel = statusLabels[item.status] || item.status
                        const isActive = item.status === "active"
                        return (
                          <SelectItem key={item.id} value={item.id}>
                            {item.title} - Stock: {Number(item.stockKg).toFixed(2)} kg - {Number(item.priceADA).toFixed(6)} ADA/kg - {statusLabel}
                          </SelectItem>
                        )
                      })
                    )}
                  </SelectContent>
                </Select>
                {marketplaceItems.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Aucun article disponible. Veuillez créer un article dans le module Marketplace.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantityKg">Quantité (kg) *</Label>
                  <Input
                    id="quantityKg"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.quantityKg}
                    onChange={(e) =>
                      setFormData({ ...formData, quantityKg: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cooperativeId">Coopérative</Label>
                  <Select
                    value={formData.cooperativeId || ""}
                    onValueChange={(value) => setFormData({ ...formData, cooperativeId: value || undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune</SelectItem>
                      {cooperatives.map((coop) => (
                        <SelectItem key={coop.id} value={coop.id}>
                          {coop.name || coop.id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="shippingCostADA">Frais de livraison (ADA)</Label>
                  <Input
                    id="shippingCostADA"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={formData.shippingCostADA || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingCostADA: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discountADA">Réduction (ADA)</Label>
                  <Input
                    id="discountADA"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={formData.discountADA || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, discountADA: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deliveryMethod">Méthode de livraison</Label>
                <Input
                  id="deliveryMethod"
                  value={formData.deliveryMethod || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryMethod: e.target.value })
                  }
                  placeholder="standard, express, etc."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estimatedDeliveryDate">Date de livraison estimée</Label>
                <Input
                  id="estimatedDeliveryDate"
                  type="datetime-local"
                  value={formData.estimatedDeliveryDate || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedDeliveryDate: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shippingAddress">Adresse de livraison</Label>
                <Textarea
                  id="shippingAddress"
                  value={formData.shippingAddress || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingAddress: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="buyerNotes">Notes du client</Label>
                <Textarea
                  id="buyerNotes"
                  value={formData.buyerNotes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, buyerNotes: e.target.value })
                  }
                  className="min-h-[80px]"
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la commande</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la commande
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Statut</Label>
                <Select
                  value={updateData.status || OrderStatus.PENDING}
                  onValueChange={(value) =>
                    setUpdateData({ ...updateData, status: value as OrderStatus })
                  }
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
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Priorité</Label>
                <Select
                  value={updateData.priority || OrderPriority.NORMAL}
                  onValueChange={(value) =>
                    setUpdateData({ ...updateData, priority: value as OrderPriority })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paymentHash">Hash de paiement</Label>
                <Input
                  id="edit-paymentHash"
                  value={updateData.paymentHash || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, paymentHash: e.target.value })
                  }
                  placeholder="Hash de la transaction"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-trackingNumber">Numéro de suivi</Label>
                <Input
                  id="edit-trackingNumber"
                  value={updateData.trackingNumber || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, trackingNumber: e.target.value })
                  }
                  placeholder="Numéro de suivi"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-shippingCostADA">Frais de livraison (ADA)</Label>
                  <Input
                    id="edit-shippingCostADA"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={updateData.shippingCostADA || ""}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, shippingCostADA: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-discountADA">Réduction (ADA)</Label>
                  <Input
                    id="edit-discountADA"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={updateData.discountADA || ""}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, discountADA: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-shippingAddress">Adresse de livraison</Label>
                <Textarea
                  id="edit-shippingAddress"
                  value={updateData.shippingAddress || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, shippingAddress: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-internalNotes">Notes internes</Label>
                <Textarea
                  id="edit-internalNotes"
                  value={updateData.internalNotes || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, internalNotes: e.target.value })
                  }
                  className="min-h-[80px]"
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber || `#${selectedOrder?.id.slice(0, 8)}`}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Statut</Label>
                  <div className="mt-1">
                    <Badge className={getStatusBadge(selectedOrder.status).className}>
                      {getStatusBadge(selectedOrder.status).label}
                    </Badge>
                  </div>
                </div>
                {selectedOrder.priority && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Priorité</Label>
                    <div className="mt-1">
                      {getPriorityBadge(selectedOrder.priority) && (
                        <Badge className={getPriorityBadge(selectedOrder.priority)!.className}>
                          {getPriorityBadge(selectedOrder.priority)!.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Produit</Label>
                  <div className="text-sm mt-1">{selectedOrder.item?.title || "N/A"}</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Agriculteur</Label>
                  <div className="text-sm mt-1">
                    {selectedOrder.farmer?.name || selectedOrder.item?.farmer?.name || "N/A"}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Quantité</Label>
                  <div className="text-sm mt-1">{Number(selectedOrder.quantityKg).toFixed(2)} kg</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Prix unitaire</Label>
                  <div className="text-sm mt-1">{Number(selectedOrder.unitPriceADA).toFixed(6)} ADA</div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Total</Label>
                  <div className="text-sm font-medium mt-1">{Number(selectedOrder.totalADA).toFixed(2)} ADA</div>
                </div>
              </div>
              {selectedOrder.shippingCostADA && (
                <div>
                  <Label className="text-xs text-muted-foreground">Frais de livraison</Label>
                  <div className="text-sm mt-1">{Number(selectedOrder.shippingCostADA).toFixed(6)} ADA</div>
                </div>
              )}
              {selectedOrder.discountADA && (
                <div>
                  <Label className="text-xs text-muted-foreground">Réduction</Label>
                  <div className="text-sm mt-1">{Number(selectedOrder.discountADA).toFixed(6)} ADA</div>
                </div>
              )}
              {selectedOrder.shippingAddress && (
                <div>
                  <Label className="text-xs text-muted-foreground">Adresse de livraison</Label>
                  <div className="text-sm mt-1">{selectedOrder.shippingAddress}</div>
                </div>
              )}
              {selectedOrder.trackingNumber && (
                <div>
                  <Label className="text-xs text-muted-foreground">Numéro de suivi</Label>
                  <div className="text-sm mt-1">{selectedOrder.trackingNumber}</div>
                </div>
              )}
              {selectedOrder.buyerNotes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes du client</Label>
                  <div className="text-sm mt-1">{selectedOrder.buyerNotes}</div>
                </div>
              )}
              {selectedOrder.internalNotes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes internes</Label>
                  <div className="text-sm mt-1">{selectedOrder.internalNotes}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Date de création</Label>
                  <div className="text-sm mt-1">
                    {new Date(selectedOrder.createdAt).toLocaleString('fr-FR')}
                  </div>
                </div>
                {selectedOrder.paidAt && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Date de paiement</Label>
                    <div className="text-sm mt-1">
                      {new Date(selectedOrder.paidAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer la commande</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la commande{" "}
              <strong>{selectedOrder?.orderNumber || `#${selectedOrder?.id.slice(0, 8)}`}</strong> ? Cette action est
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
