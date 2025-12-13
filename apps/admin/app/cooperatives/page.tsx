"use client"

import * as React from "react"
import {
  Building2,
  Edit,
  Loader2,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Users,
  Eye,
  CheckCircle2,
  Mail,
  Phone,
  Calendar,
  FileText,
  Globe,
  X,
  AlertCircle,
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

type CooperativeStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification'

type Cooperative = {
  id: string
  name: string
  location: string
  leader: string
  email?: string
  phone?: string
  status?: CooperativeStatus
  logoUrl?: string
  description?: string
  registrationNumber?: string
  foundedDate?: string
  memberCount?: number
  notes?: string
  verified?: boolean
  verifiedAt?: string
  verifiedBy?: string
  latitude?: number
  longitude?: number
  farmers?: Array<{ id: string; name: string }>
  farmersCount?: number
  createdAt: string
  updatedAt: string
}

type CreateCooperativeDto = {
  name: string
  location: string
  leader: string
  email?: string
  phone?: string
  status?: CooperativeStatus
  logoUrl?: string
  description?: string
  registrationNumber?: string
  foundedDate?: string
  notes?: string
  latitude?: number
  longitude?: number
}

type Farmer = {
  id: string
  name: string
  phone: string
  city: string
  state: string
}

export default function CooperativesPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [selectedCooperative, setSelectedCooperative] = React.useState<Cooperative | null>(null)
  const [filterLocation, setFilterLocation] = React.useState<string>("")
  const [filterLeader, setFilterLeader] = React.useState<string>("")
  const [filterStatus, setFilterStatus] = React.useState<string>("")
  const [filterVerified, setFilterVerified] = React.useState<boolean | null>(null)
  const [formData, setFormData] = React.useState<CreateCooperativeDto>({
    name: "",
    location: "",
    leader: "",
    email: "",
    phone: "",
    status: "active",
    logoUrl: "",
    description: "",
    registrationNumber: "",
    foundedDate: "",
    notes: "",
    latitude: undefined,
    longitude: undefined,
  })

  // Build query string
  const buildQueryString = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.append("search", searchQuery)
    if (filterLocation) params.append("location", filterLocation)
    if (filterLeader) params.append("leader", filterLeader)
    if (filterStatus) params.append("status", filterStatus)
    if (filterVerified !== null) params.append("verified", filterVerified.toString())
    params.append("page", currentPage.toString())
    params.append("limit", pageSize.toString())
    const query = params.toString()
    return query ? `?${query}` : ""
  }

  const { data: cooperativesResponse, isLoading, refetch } = useApiQuery<{
    data: Cooperative[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>(
    ["cooperatives", searchQuery, filterLocation, filterLeader, filterStatus, filterVerified, currentPage, pageSize],
    `/cooperatives${buildQueryString()}`
  )

  const cooperatives = cooperativesResponse?.data || []
  const totalCooperatives = cooperativesResponse?.total || 0
  const totalPages = cooperativesResponse?.totalPages || 0

  // Fetch farmers for selected cooperative
  const { data: farmersResponse } = useApiQuery<{
    data: Farmer[]
    total: number
  }>(
    ["cooperative-farmers", selectedCooperative?.id],
    selectedCooperative?.id ? `/farmers?cooperativeId=${selectedCooperative.id}&limit=100` : null,
    { enabled: !!selectedCooperative?.id && isViewDialogOpen }
  )
  const farmersData = farmersResponse?.data || []

  // Get unique locations and leaders for filters
  // Note: Pour obtenir toutes les valeurs uniques, on pourrait faire une requête séparée
  // Pour l'instant, on utilise les valeurs des coopératives chargées
  const uniqueLocations = React.useMemo(() => {
    if (!Array.isArray(cooperatives)) return []
    return Array.from(new Set(cooperatives.map(c => c.location).filter(Boolean))).sort()
  }, [cooperatives])

  const uniqueLeaders = React.useMemo(() => {
    if (!Array.isArray(cooperatives)) return []
    return Array.from(new Set(cooperatives.map(c => c.leader).filter(Boolean))).sort()
  }, [cooperatives])

  // Les coopératives sont déjà paginées par le backend
  const paginatedCooperatives = cooperatives

  const createMutation = useApiMutation<Cooperative, CreateCooperativeDto>(
    "/cooperatives",
    "POST",
    {
      onSuccess: () => {
        toast.success("Coopérative ajoutée avec succès")
        setIsAddDialogOpen(false)
        setFormData({
          name: "",
          location: "",
          leader: "",
          email: "",
          phone: "",
          status: "active",
          logoUrl: "",
          description: "",
          registrationNumber: "",
          foundedDate: "",
          notes: "",
          latitude: undefined,
          longitude: undefined,
        })
        refetch()
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de l'ajout de la coopérative"
        )
      },
    }
  )

  const updateMutation = useApiMutation<Cooperative, CreateCooperativeDto>(
    (variables) => `/cooperatives/${selectedCooperative?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Coopérative mise à jour avec succès")
        setIsEditDialogOpen(false)
        setSelectedCooperative(null)
        refetch()
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de la modification de la coopérative"
        )
      },
    }
  )

  const deleteMutation = useApiMutation<void, void>(
    () => `/cooperatives/${selectedCooperative?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Coopérative supprimée avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedCooperative(null)
        refetch()
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de la suppression de la coopérative"
        )
      },
    }
  )

  const handleAdd = () => {
    setFormData({
      name: "",
      location: "",
      leader: "",
      email: "",
      phone: "",
      status: "active",
      logoUrl: "",
      description: "",
      registrationNumber: "",
      foundedDate: "",
      notes: "",
      latitude: undefined,
      longitude: undefined,
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (cooperative: Cooperative) => {
    setSelectedCooperative(cooperative)
    setFormData({
      name: cooperative.name,
      location: cooperative.location,
      leader: cooperative.leader,
      email: cooperative.email || "",
      phone: cooperative.phone || "",
      status: cooperative.status || "active",
      logoUrl: cooperative.logoUrl || "",
      description: cooperative.description || "",
      registrationNumber: cooperative.registrationNumber || "",
      foundedDate: cooperative.foundedDate || "",
      notes: cooperative.notes || "",
      latitude: cooperative.latitude,
      longitude: cooperative.longitude,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (cooperative: Cooperative) => {
    setSelectedCooperative(cooperative)
    setIsDeleteDialogOpen(true)
  }

  const handleView = (cooperative: Cooperative) => {
    setSelectedCooperative(cooperative)
    setIsViewDialogOpen(true)
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCooperative) return
    updateMutation.mutate(formData)
  }

  const handleConfirmDelete = () => {
    if (!selectedCooperative) return
    deleteMutation.mutate(undefined)
  }

  const verifyMutation = useApiMutation<Cooperative, void>(
    () => `/cooperatives/${selectedCooperative?.id}/verify`,
    "POST",
    {
      onSuccess: () => {
        toast.success("Coopérative vérifiée avec succès")
        refetch()
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de la vérification"
        )
      },
    }
  )

  const updateStatusMutation = useApiMutation<Cooperative, { status: CooperativeStatus }>(
    () => `/cooperatives/${selectedCooperative?.id}/status`,
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

  const handleVerify = (cooperative: Cooperative) => {
    setSelectedCooperative(cooperative)
    verifyMutation.mutate(undefined)
  }

  const handleStatusChange = (cooperative: Cooperative, status: CooperativeStatus) => {
    setSelectedCooperative(cooperative)
    updateStatusMutation.mutate({ status })
  }

  const getStatusBadge = (status?: CooperativeStatus) => {
    const statusConfig = {
      active: { label: "Active", className: "bg-green-100 text-green-800 border-green-200" },
      inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800 border-gray-200" },
      suspended: { label: "Suspendue", className: "bg-red-100 text-red-800 border-red-200" },
      pending_verification: { label: "En attente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    }
    const config = statusConfig[status || "active"] || statusConfig.active
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const totalFarmers = cooperatives.reduce((sum, coop) => sum + (coop.farmersCount || 0), 0)
  const verifiedCount = cooperatives.filter(c => c.verified).length
  const activeCount = cooperatives.filter(c => c.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coopératives</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les coopératives de la plateforme
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une coopérative
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total coopératives</CardTitle>
            <Building2 className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : totalCooperatives}</div>
            <p className="text-xs text-muted-foreground mt-1">Total enregistrées</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total agriculteurs</CardTitle>
            <Users className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : totalFarmers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Agriculteurs associés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leaders</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : uniqueLeaders.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Responsables enregistrés
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vérifiées</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : verifiedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Coopératives vérifiées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des coopératives</CardTitle>
              <CardDescription>
                Recherchez et filtrez les coopératives
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
                placeholder="Rechercher une coopérative..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <Select value={filterLocation} onValueChange={(value) => {
              setFilterLocation(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Localisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les localisations</SelectItem>
                {uniqueLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLeader} onValueChange={(value) => {
              setFilterLeader(value)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Leader" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les leaders</SelectItem>
                {uniqueLeaders.map((leader) => (
                  <SelectItem key={leader} value={leader}>
                    {leader}
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspendue</SelectItem>
                <SelectItem value="pending_verification">En attente</SelectItem>
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
                Vérifiées uniquement
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
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Leader
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Agriculteurs
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedCooperatives.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                          Aucune coopérative trouvée
                        </td>
                      </tr>
                    ) : (
                      paginatedCooperatives.map((cooperative) => (
                        <tr key={cooperative.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {cooperative.logoUrl ? (
                                <img
                                  src={cooperative.logoUrl}
                                  alt={cooperative.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium">{cooperative.name}</div>
                                  {cooperative.verified && (
                                    <CheckCircle2 className="h-4 w-4 text-[#3A8F4C]" title="Vérifiée" />
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Créée le {new Date(cooperative.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {cooperative.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {cooperative.leader}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="space-y-1">
                              {cooperative.email && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">{cooperative.email}</span>
                                </div>
                              )}
                              {cooperative.phone && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">{cooperative.phone}</span>
                                </div>
                              )}
                              {!cooperative.email && !cooperative.phone && (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {getStatusBadge(cooperative.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge variant="outline" className="bg-[#3A8F4C]/10 text-[#3A8F4C]">
                              {cooperative.farmersCount || 0} agriculteur{cooperative.farmersCount !== 1 ? 's' : ''}
                            </Badge>
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
                                    onClick={() => handleView(cooperative)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Voir détails
                                  </button>
                                  <button
                                    onClick={() => handleEdit(cooperative)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </button>
                                  {!cooperative.verified && (
                                    <button
                                      onClick={() => handleVerify(cooperative)}
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
                                  {cooperative.status !== 'active' && (
                                    <button
                                      onClick={() => handleStatusChange(cooperative, 'active')}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left"
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Activer
                                    </button>
                                  )}
                                  {cooperative.status !== 'inactive' && (
                                    <button
                                      onClick={() => handleStatusChange(cooperative, 'inactive')}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left"
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Désactiver
                                    </button>
                                  )}
                                  {cooperative.status !== 'suspended' && (
                                    <button
                                      onClick={() => handleStatusChange(cooperative, 'suspended')}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left text-red-600"
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Suspendre
                                    </button>
                                  )}
                                  <div className="border-t border-border/50 my-1" />
                                  <button
                                    onClick={() => handleDelete(cooperative)}
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
                Page {currentPage} sur {totalPages} ({totalCooperatives} coopératives)
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Ajouter une coopérative</DialogTitle>
            <DialogDescription>
              Renseignez les informations de la coopérative
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-medium">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Coopérative Agricole du Kasaï"
                  minLength={2}
                  maxLength={100}
                  required
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.name.length}/100 caractères
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-sm font-medium">Localisation *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Mbuji-Mayi, Kasaï-Oriental"
                  minLength={2}
                  maxLength={255}
                  required
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.location.length}/255 caractères
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="leader" className="text-sm font-medium">Leader *</Label>
                <Input
                  id="leader"
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  placeholder="Ex: Pierre Kabongo"
                  minLength={2}
                  maxLength={100}
                  required
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.leader.length}/100 caractères
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@cooperative.cd"
                    className="h-10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+243812345678"
                    className="h-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status" className="text-sm font-medium">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: CooperativeStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspendue</SelectItem>
                      <SelectItem value="pending_verification">En attente de vérification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="foundedDate" className="text-sm font-medium">Date de fondation</Label>
                  <Input
                    id="foundedDate"
                    type="date"
                    value={formData.foundedDate}
                    onChange={(e) => setFormData({ ...formData, foundedDate: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="logoUrl" className="text-sm font-medium">URL du logo</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.jpg"
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registrationNumber" className="text-sm font-medium">Numéro d'enregistrement</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="RC-KIN-2024-001"
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de la coopérative..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="latitude" className="text-sm font-medium">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="-6.1369"
                    className="h-10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude" className="text-sm font-medium">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="23.5898"
                    className="h-10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes et commentaires..."
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={createMutation.isPending}
                className="h-10"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white h-10"
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Modifier la coopérative</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de la coopérative
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">Nom *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location" className="text-sm font-medium">Localisation *</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-leader" className="text-sm font-medium">Leader *</Label>
                <Input
                  id="edit-leader"
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  required
                  className="h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone" className="text-sm font-medium">Téléphone</Label>
                  <Input
                    id="edit-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status" className="text-sm font-medium">Statut</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: CooperativeStatus) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspendue</SelectItem>
                      <SelectItem value="pending_verification">En attente de vérification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-foundedDate" className="text-sm font-medium">Date de fondation</Label>
                  <Input
                    id="edit-foundedDate"
                    type="date"
                    value={formData.foundedDate}
                    onChange={(e) => setFormData({ ...formData, foundedDate: e.target.value })}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-logoUrl" className="text-sm font-medium">URL du logo</Label>
                <Input
                  id="edit-logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-registrationNumber" className="text-sm font-medium">Numéro d'enregistrement</Label>
                <Input
                  id="edit-registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-latitude" className="text-sm font-medium">Latitude</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="h-10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-longitude" className="text-sm font-medium">Longitude</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="h-10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateMutation.isPending}
                className="h-10"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white h-10"
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
            <DialogTitle className="text-xl">Supprimer la coopérative</DialogTitle>
            <DialogDescription className="text-sm">
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong className="font-semibold text-foreground">{selectedCooperative?.name}</strong> ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
              className="h-10"
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="h-10"
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

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {selectedCooperative?.logoUrl ? (
                <img
                  src={selectedCooperative.logoUrl}
                  alt={selectedCooperative.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  {selectedCooperative?.name}
                  {selectedCooperative?.verified && (
                    <CheckCircle2 className="h-5 w-5 text-[#3A8F4C]" title="Vérifiée" />
                  )}
                </DialogTitle>
                <DialogDescription>
                  Détails de la coopérative et liste des agriculteurs associés
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedCooperative && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedCooperative.status)}
                {selectedCooperative.verified && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Vérifiée
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Localisation</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{selectedCooperative.location}</p>
                  </div>
                  {selectedCooperative.latitude && selectedCooperative.longitude && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedCooperative.latitude},${selectedCooperative.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#3A8F4C] hover:underline flex items-center gap-1 mt-1"
                    >
                      <Globe className="h-3 w-3" />
                      Voir sur la carte
                    </a>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Leader</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{selectedCooperative.leader}</p>
                  </div>
                </div>
                {selectedCooperative.email && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">{selectedCooperative.email}</p>
                    </div>
                  </div>
                )}
                {selectedCooperative.phone && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Téléphone</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">{selectedCooperative.phone}</p>
                    </div>
                  </div>
                )}
                {selectedCooperative.registrationNumber && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Numéro d'enregistrement</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">{selectedCooperative.registrationNumber}</p>
                    </div>
                  </div>
                )}
                {selectedCooperative.foundedDate && (
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date de fondation</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        {new Date(selectedCooperative.foundedDate).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date de création</Label>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {new Date(selectedCooperative.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Dernière modification</Label>
                  <p className="text-sm font-medium text-foreground mt-1">
                    {new Date(selectedCooperative.updatedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {selectedCooperative.description && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</Label>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{selectedCooperative.description}</p>
                </div>
              )}

              {selectedCooperative.notes && (
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notes</Label>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{selectedCooperative.notes}</p>
                </div>
              )}

              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-semibold">
                    Agriculteurs associés ({farmersData.length})
                  </Label>
                </div>
                {farmersData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Aucun agriculteur associé à cette coopérative</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {farmersData.map((farmer) => (
                      <div
                        key={farmer.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{farmer.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {farmer.phone} • {farmer.city}, {farmer.state}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            {selectedCooperative && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false)
                  handleEdit(selectedCooperative)
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
    </div>
  )
}
