"use client"

import * as React from "react"
import { Users, Search, Plus, Filter, Edit, Trash2, MoreVertical, Loader2, CheckCircle2, XCircle, ShieldCheck, Mail, Calendar, User, FileText } from "lucide-react"
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

enum FarmerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_VERIFICATION = "pending_verification",
}

enum FarmerGender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

enum FarmerIdentificationType {
  CNI = "cni",
  PASSPORT = "passport",
  DRIVING_LICENSE = "driving_license",
  OTHER = "other",
}

type Farmer = {
  id: string
  name: string
  phone: string
  email?: string
  walletAddress?: string
  address: string
  city: string
  state: string
  latitude: number
  longitude: number
  cooperativeId?: string
  cooperative?: {
    id: string
    name: string
  }
  dateOfBirth?: string
  status?: FarmerStatus
  photoUrl?: string
  gender?: FarmerGender
  identificationNumber?: string
  identificationType?: FarmerIdentificationType
  notes?: string
  verified?: boolean
  verifiedAt?: string
  verifiedBy?: string
  createdAt: string
  updatedAt: string
}

type FarmersResponse = {
  data: Farmer[]
  total: number
  page: number
  limit: number
  totalPages: number
}

type CreateFarmerDto = {
  name: string
  phone: string
  email?: string
  walletAddress?: string
  address: string
  city: string
  state: string
  latitude: number
  longitude: number
  cooperativeId?: string
  dateOfBirth?: string
  status?: FarmerStatus
  photoUrl?: string
  gender?: FarmerGender
  identificationNumber?: string
  identificationType?: FarmerIdentificationType
  notes?: string
}

export default function FarmersPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [verifiedFilter, setVerifiedFilter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(10)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isStatsDialogOpen, setIsStatsDialogOpen] = React.useState(false)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = React.useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = React.useState(false)
  const [selectedFarmer, setSelectedFarmer] = React.useState<Farmer | null>(null)
  const [formData, setFormData] = React.useState<CreateFarmerDto>({
    name: "",
    phone: "",
    email: "",
    walletAddress: "",
    address: "",
    city: "",
    state: "",
    latitude: -4.4419,
    longitude: 15.2663,
    cooperativeId: "",
    dateOfBirth: "",
    status: FarmerStatus.ACTIVE,
    photoUrl: "",
    gender: undefined,
    identificationNumber: "",
    identificationType: undefined,
    notes: "",
  })

  // Build query string with filters
  const buildQueryString = () => {
    const params = new URLSearchParams()
    params.append("page", currentPage.toString())
    params.append("limit", pageSize.toString())
    if (searchQuery) params.append("search", searchQuery)
    if (statusFilter !== "all") params.append("status", statusFilter)
    if (verifiedFilter !== "all") params.append("verified", verifiedFilter === "verified" ? "true" : "false")
    return `/farmers?${params.toString()}`
  }

  // Fetch farmers with pagination
  const { data: farmersData, isLoading, refetch } = useApiQuery<FarmersResponse>(
    ["farmers", searchQuery, currentPage, statusFilter, verifiedFilter],
    buildQueryString()
  )

  const farmers = farmersData?.data || []
  const totalPages = farmersData?.totalPages || 1
  const total = farmersData?.total || 0

  // Fetch farmer stats
  const { data: farmerStats, isLoading: isLoadingStats } = useApiQuery<{
    totalHarvests: number
    totalHarvestQuantity: number
    activeLoans: number
    totalLoanAmount: number
    creditScore: number
  }>(
    ["farmer-stats", selectedFarmer?.id],
    selectedFarmer?.id ? `/farmers/${selectedFarmer.id}/stats` : null,
    { enabled: !!selectedFarmer?.id && isStatsDialogOpen }
  )

  // Fetch cooperatives for select
  const { 
    data: cooperativesResponse, 
    isLoading: isLoadingCooperatives,
    error: cooperativesError 
  } = useApiQuery<{
    data: { id: string; name: string }[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>(
    ["cooperatives"],
    "/cooperatives?limit=1000" // Récupérer toutes les coopératives pour le select
  )

  const cooperatives = cooperativesResponse?.data || []

  // Create mutation
  const createMutation = useApiMutation<Farmer, CreateFarmerDto>(
    "/farmers",
    "POST",
    {
      onSuccess: () => {
        toast.success("Agriculteur ajouté avec succès")
        setIsAddDialogOpen(false)
        setFormData({
          name: "",
          phone: "",
          email: "",
          walletAddress: "",
          address: "",
          city: "",
          state: "",
          latitude: -4.4419,
          longitude: 15.2663,
          cooperativeId: "",
          dateOfBirth: "",
          status: FarmerStatus.ACTIVE,
          photoUrl: "",
          gender: undefined,
          identificationNumber: "",
          identificationType: undefined,
          notes: "",
        })
        refetch()
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de l'ajout de l'agriculteur"
        )
      },
    }
  )

  // Update mutation
  const updateMutation = useApiMutation<Farmer, CreateFarmerDto>(
    (variables) => `/farmers/${selectedFarmer?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Agriculteur modifié avec succès")
        setIsEditDialogOpen(false)
        setSelectedFarmer(null)
        refetch()
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de la modification de l'agriculteur"
        )
      },
    }
  )

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/farmers/${selectedFarmer?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Agriculteur supprimé avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedFarmer(null)
        refetch()
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de la suppression de l'agriculteur"
        )
      },
    }
  )

  // Verify mutation
  const verifyMutation = useApiMutation<Farmer, void>(
    () => `/farmers/${selectedFarmer?.id}/verify`,
    "POST",
    {
      onSuccess: () => {
        toast.success("Agriculteur vérifié avec succès")
        setIsVerifyDialogOpen(false)
        setSelectedFarmer(null)
        refetch()
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de la vérification de l'agriculteur"
        )
      },
    }
  )

  // Update status mutation
  const updateStatusMutation = useApiMutation<Farmer, { status: FarmerStatus }>(
    () => `/farmers/${selectedFarmer?.id}/status`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Statut mis à jour avec succès")
        setIsStatusDialogOpen(false)
        setSelectedFarmer(null)
        refetch()
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de la mise à jour du statut"
        )
      },
    }
  )

  const handleAdd = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      walletAddress: "",
      address: "",
      city: "",
      state: "",
      latitude: -4.4419,
      longitude: 15.2663,
      cooperativeId: "",
      dateOfBirth: "",
      status: FarmerStatus.ACTIVE,
      photoUrl: "",
      gender: undefined,
      identificationNumber: "",
      identificationType: undefined,
      notes: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (farmer: Farmer) => {
    setSelectedFarmer(farmer)
    setFormData({
      name: farmer.name,
      phone: farmer.phone,
      email: farmer.email || "",
      walletAddress: farmer.walletAddress || "",
      address: farmer.address,
      city: farmer.city,
      state: farmer.state,
      latitude: farmer.latitude,
      longitude: farmer.longitude,
      cooperativeId: farmer.cooperativeId || "",
      dateOfBirth: farmer.dateOfBirth || "",
      status: farmer.status || FarmerStatus.ACTIVE,
      photoUrl: farmer.photoUrl || "",
      gender: farmer.gender,
      identificationNumber: farmer.identificationNumber || "",
      identificationType: farmer.identificationType,
      notes: farmer.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleVerify = (farmer: Farmer) => {
    setSelectedFarmer(farmer)
    setIsVerifyDialogOpen(true)
  }

  const handleChangeStatus = (farmer: Farmer) => {
    setSelectedFarmer(farmer)
    setIsStatusDialogOpen(true)
  }

  const handleConfirmVerify = () => {
    if (!selectedFarmer) return
    verifyMutation.mutate(undefined)
  }

  const handleConfirmStatusChange = (status: FarmerStatus) => {
    if (!selectedFarmer) return
    updateStatusMutation.mutate({ status })
  }

  const handleDelete = (farmer: Farmer) => {
    setSelectedFarmer(farmer)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const data: CreateFarmerDto = {
      ...formData,
      latitude: parseFloat(formData.latitude.toString()),
      longitude: parseFloat(formData.longitude.toString()),
      email: formData.email || undefined,
      walletAddress: formData.walletAddress || undefined,
      cooperativeId: formData.cooperativeId || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      photoUrl: formData.photoUrl || undefined,
      gender: formData.gender,
      identificationNumber: formData.identificationNumber || undefined,
      identificationType: formData.identificationType,
      notes: formData.notes || undefined,
    }
    createMutation.mutate(data)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFarmer) return
    const data: CreateFarmerDto = {
      ...formData,
      latitude: parseFloat(formData.latitude.toString()),
      longitude: parseFloat(formData.longitude.toString()),
      email: formData.email || undefined,
      walletAddress: formData.walletAddress || undefined,
      cooperativeId: formData.cooperativeId || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      photoUrl: formData.photoUrl || undefined,
      gender: formData.gender,
      identificationNumber: formData.identificationNumber || undefined,
      identificationType: formData.identificationType,
      notes: formData.notes || undefined,
    }
    updateMutation.mutate(data)
  }

  const handleConfirmDelete = () => {
    if (!selectedFarmer) return
    deleteMutation.mutate(undefined)
  }

  const handleViewStats = (farmer: Farmer) => {
    setSelectedFarmer(farmer)
    setIsStatsDialogOpen(true)
  }

  const activeFarmers = farmers
  const verifiedCount = farmers.filter((f) => f.verified).length
  const pendingVerificationCount = farmers.filter((f) => f.status === FarmerStatus.PENDING_VERIFICATION).length

  React.useEffect(() => {
    if (searchQuery || statusFilter !== "all" || verifiedFilter !== "all") {
      setCurrentPage(1)
    }
  }, [searchQuery, statusFilter, verifiedFilter])

  // Helper function to get status badge
  const getStatusBadge = (status?: FarmerStatus) => {
    if (!status) return null
    const statusConfig = {
      [FarmerStatus.ACTIVE]: { label: "Actif", className: "bg-green-100 text-green-800 border-green-200" },
      [FarmerStatus.INACTIVE]: { label: "Inactif", className: "bg-gray-100 text-gray-800 border-gray-200" },
      [FarmerStatus.SUSPENDED]: { label: "Suspendu", className: "bg-red-100 text-red-800 border-red-200" },
      [FarmerStatus.PENDING_VERIFICATION]: { label: "En attente", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    }
    const config = statusConfig[status] || statusConfig[FarmerStatus.ACTIVE]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agriculteurs</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les agriculteurs de la plateforme
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un agriculteur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total agriculteurs</CardTitle>
            <Users className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : total}</div>
            <p className="text-xs text-muted-foreground mt-1">Total enregistrés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vérifiés</CardTitle>
            <ShieldCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : verifiedCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {total > 0 ? Math.round((verifiedCount / total) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <XCircle className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : pendingVerificationCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Nécessitent vérification
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avec portefeuille</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : farmers.filter((f) => f.walletAddress).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {total > 0
                ? Math.round((farmers.filter((f) => f.walletAddress).length / total) * 100)
                : 0}% du total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des agriculteurs</CardTitle>
              <CardDescription>
                Recherchez et filtrez les agriculteurs
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
                placeholder="Rechercher un agriculteur..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value={FarmerStatus.ACTIVE}>Actif</SelectItem>
                <SelectItem value={FarmerStatus.INACTIVE}>Inactif</SelectItem>
                <SelectItem value={FarmerStatus.SUSPENDED}>Suspendu</SelectItem>
                <SelectItem value={FarmerStatus.PENDING_VERIFICATION}>En attente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Vérification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="verified">Vérifiés</SelectItem>
                <SelectItem value="unverified">Non vérifiés</SelectItem>
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
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activeFarmers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Aucun agriculteur trouvé
                        </td>
                      </tr>
                    ) : (
                      activeFarmers.map((farmer: Farmer) => (
                        <tr key={farmer.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {farmer.photoUrl ? (
                                <img
                                  src={farmer.photoUrl}
                                  alt={farmer.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium flex items-center gap-2">
                                  {farmer.name}
                                  {farmer.verified && (
                                    <ShieldCheck className="h-4 w-4 text-green-600" title="Vérifié" />
                                  )}
                                </div>
                                {farmer.email && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {farmer.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div>
                              <div>{farmer.phone}</div>
                              {farmer.cooperative && (
                                <Badge variant="outline" className="bg-[#3A8F4C]/10 text-[#3A8F4C] mt-1 text-xs">
                                  {farmer.cooperative.name}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(farmer.status)}
                              {farmer.verified ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs w-fit">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Vérifié
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200 text-xs w-fit">
                                  Non vérifié
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div>
                              <div>{farmer.city}, {farmer.state}</div>
                              <div className="text-xs text-muted-foreground">
                                {farmer.address}
                              </div>
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
                                    onClick={() => handleViewStats(farmer)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Filter className="h-4 w-4" />
                                    Statistiques
                                  </button>
                                  {!farmer.verified && (
                                    <button
                                      onClick={() => handleVerify(farmer)}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                    >
                                      <ShieldCheck className="h-4 w-4" />
                                      Vérifier
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleChangeStatus(farmer)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Changer statut
                                  </button>
                                  <button
                                    onClick={() => handleEdit(farmer)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDelete(farmer)}
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
                Page {currentPage} sur {totalPages} ({total} agriculteurs)
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
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un agriculteur</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouvel agriculteur
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+243812345678"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="jean.mukendi@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gender">Genre</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value === "" ? undefined : value as FarmerGender })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Non spécifié</SelectItem>
                      <SelectItem value={FarmerGender.MALE}>Homme</SelectItem>
                      <SelectItem value={FarmerGender.FEMALE}>Femme</SelectItem>
                      <SelectItem value={FarmerGender.OTHER}>Autre</SelectItem>
                      <SelectItem value={FarmerGender.PREFER_NOT_TO_SAY}>Ne pas préciser</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="identificationType">Type d'identification</Label>
                  <Select
                    value={formData.identificationType || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, identificationType: value === "" ? undefined : value as FarmerIdentificationType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      <SelectItem value={FarmerIdentificationType.CNI}>CNI</SelectItem>
                      <SelectItem value={FarmerIdentificationType.PASSPORT}>Passeport</SelectItem>
                      <SelectItem value={FarmerIdentificationType.DRIVING_LICENSE}>Permis de conduire</SelectItem>
                      <SelectItem value={FarmerIdentificationType.OTHER}>Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="identificationNumber">Numéro d'identification</Label>
                  <Input
                    id="identificationNumber"
                    value={formData.identificationNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, identificationNumber: e.target.value })
                    }
                    placeholder="1234567890"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={formData.status || FarmerStatus.ACTIVE}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as FarmerStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FarmerStatus.ACTIVE}>Actif</SelectItem>
                    <SelectItem value={FarmerStatus.INACTIVE}>Inactif</SelectItem>
                    <SelectItem value={FarmerStatus.SUSPENDED}>Suspendu</SelectItem>
                    <SelectItem value={FarmerStatus.PENDING_VERIFICATION}>En attente de vérification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="photoUrl">URL de la photo</Label>
                <Input
                  id="photoUrl"
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, photoUrl: e.target.value })
                  }
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="walletAddress">Adresse du portefeuille Cardano</Label>
                <Input
                  id="walletAddress"
                  value={formData.walletAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, walletAddress: e.target.value })
                  }
                  placeholder="addr1..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">Province *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cooperativeId">Coopérative</Label>
                <Select
                  value={formData.cooperativeId || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cooperativeId: value === "" ? undefined : value })
                  }
                  disabled={isLoadingCooperatives}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      isLoadingCooperatives 
                        ? "Chargement des coopératives..." 
                        : "Sélectionner une coopérative (optionnel)"
                    }>
                      {formData.cooperativeId 
                        ? cooperatives.find(c => c.id === formData.cooperativeId)?.name || "Sélectionner une coopérative (optionnel)"
                        : undefined
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucune coopérative</SelectItem>
                    {cooperativesError ? (
                      <SelectItem value="" disabled>
                        Erreur lors du chargement
                      </SelectItem>
                    ) : cooperatives.length === 0 && !isLoadingCooperatives ? (
                      <SelectItem value="" disabled>
                        Aucune coopérative disponible
                      </SelectItem>
                    ) : (
                      cooperatives.map((coop) => (
                        <SelectItem key={coop.id} value={coop.id}>
                          {coop.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {cooperativesError && (
                  <p className="text-xs text-destructive mt-1">
                    Impossible de charger les coopératives
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="Notes et commentaires sur l'agriculteur..."
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
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'agriculteur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'agriculteur
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom complet *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-phone">Téléphone *</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="jean.mukendi@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-dateOfBirth">Date de naissance</Label>
                  <Input
                    id="edit-dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-gender">Genre</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value === "" ? undefined : value as FarmerGender })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Non spécifié</SelectItem>
                      <SelectItem value={FarmerGender.MALE}>Homme</SelectItem>
                      <SelectItem value={FarmerGender.FEMALE}>Femme</SelectItem>
                      <SelectItem value={FarmerGender.OTHER}>Autre</SelectItem>
                      <SelectItem value={FarmerGender.PREFER_NOT_TO_SAY}>Ne pas préciser</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-identificationType">Type d'identification</Label>
                  <Select
                    value={formData.identificationType || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, identificationType: value === "" ? undefined : value as FarmerIdentificationType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun</SelectItem>
                      <SelectItem value={FarmerIdentificationType.CNI}>CNI</SelectItem>
                      <SelectItem value={FarmerIdentificationType.PASSPORT}>Passeport</SelectItem>
                      <SelectItem value={FarmerIdentificationType.DRIVING_LICENSE}>Permis de conduire</SelectItem>
                      <SelectItem value={FarmerIdentificationType.OTHER}>Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-identificationNumber">Numéro d'identification</Label>
                  <Input
                    id="edit-identificationNumber"
                    value={formData.identificationNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, identificationNumber: e.target.value })
                    }
                    placeholder="1234567890"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Statut</Label>
                <Select
                  value={formData.status || FarmerStatus.ACTIVE}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as FarmerStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={FarmerStatus.ACTIVE}>Actif</SelectItem>
                    <SelectItem value={FarmerStatus.INACTIVE}>Inactif</SelectItem>
                    <SelectItem value={FarmerStatus.SUSPENDED}>Suspendu</SelectItem>
                    <SelectItem value={FarmerStatus.PENDING_VERIFICATION}>En attente de vérification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-photoUrl">URL de la photo</Label>
                <Input
                  id="edit-photoUrl"
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, photoUrl: e.target.value })
                  }
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-walletAddress">Adresse du portefeuille Cardano</Label>
                <Input
                  id="edit-walletAddress"
                  value={formData.walletAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, walletAddress: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Adresse *</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-city">Ville *</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-state">Province *</Label>
                <Input
                  id="edit-state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-cooperativeId">Coopérative</Label>
                <Select
                  value={formData.cooperativeId || ""}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cooperativeId: value === "" ? undefined : value })
                  }
                  disabled={isLoadingCooperatives}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      isLoadingCooperatives 
                        ? "Chargement des coopératives..." 
                        : "Sélectionner une coopérative (optionnel)"
                    }>
                      {formData.cooperativeId 
                        ? cooperatives.find(c => c.id === formData.cooperativeId)?.name || "Sélectionner une coopérative (optionnel)"
                        : undefined
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Aucune coopérative</SelectItem>
                    {cooperativesError ? (
                      <SelectItem value="" disabled>
                        Erreur lors du chargement
                      </SelectItem>
                    ) : cooperatives.length === 0 && !isLoadingCooperatives ? (
                      <SelectItem value="" disabled>
                        Aucune coopérative disponible
                      </SelectItem>
                    ) : (
                      cooperatives.map((coop) => (
                        <SelectItem key={coop.id} value={coop.id}>
                          {coop.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {cooperativesError && (
                  <p className="text-xs text-destructive mt-1">
                    Impossible de charger les coopératives
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-latitude">Latitude *</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-longitude">Longitude *</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="Notes et commentaires sur l'agriculteur..."
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
            <DialogTitle>Supprimer l'agriculteur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>{selectedFarmer?.name}</strong> ? Cette action est
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

      {/* Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Statistiques de {selectedFarmer?.name}</DialogTitle>
            <DialogDescription>
              Vue d'ensemble des performances et activités
            </DialogDescription>
          </DialogHeader>
          {isLoadingStats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3A8F4C]" />
            </div>
          ) : farmerStats ? (
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Récoltes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{farmerStats.totalHarvests}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {farmerStats.totalHarvestQuantity.toFixed(2)} kg total
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Prêts actifs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{farmerStats.activeLoans}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      ₿ {farmerStats.totalLoanAmount.toFixed(2)} total
                    </p>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Score de crédit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{farmerStats.creditScore}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Basé sur l'historique de récoltes et remboursements
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Aucune statistique disponible
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatsDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Vérifier l'agriculteur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir vérifier{" "}
              <strong>{selectedFarmer?.name}</strong> ? Cette action marquera l'agriculteur comme vérifié.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsVerifyDialogOpen(false)}
              disabled={verifyMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmVerify}
              className="bg-green-600 hover:bg-green-700"
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Vérifier
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
            <DialogDescription>
              Sélectionnez le nouveau statut pour{" "}
              <strong>{selectedFarmer?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-status">Nouveau statut</Label>
              <Select
                value={selectedFarmer?.status || FarmerStatus.ACTIVE}
                onValueChange={(value) => {
                  if (selectedFarmer) {
                    setSelectedFarmer({ ...selectedFarmer, status: value as FarmerStatus })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FarmerStatus.ACTIVE}>Actif</SelectItem>
                  <SelectItem value={FarmerStatus.INACTIVE}>Inactif</SelectItem>
                  <SelectItem value={FarmerStatus.SUSPENDED}>Suspendu</SelectItem>
                  <SelectItem value={FarmerStatus.PENDING_VERIFICATION}>En attente de vérification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusDialogOpen(false)}
              disabled={updateStatusMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (selectedFarmer?.status) {
                  handleConfirmStatusChange(selectedFarmer.status)
                }
              }}
              className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
