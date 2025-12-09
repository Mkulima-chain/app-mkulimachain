"use client"

import * as React from "react"
import { School, Search, Plus, Edit, Trash2, MoreVertical, Loader2, TrendingUp } from "lucide-react"
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

enum SchoolStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
}

type SchoolFund = {
  id: string
  schoolName: string
  province: string
  city?: string
  address?: string
  contactPerson?: string
  contactPhone?: string
  walletAddress?: string
  totalFundedADA: number
  totalDisbursedADA: number
  studentCount?: number
  status: SchoolStatus
  lastUpdate: string
  createdAt: string
  updatedAt: string
}

type CreateSchoolFundDto = {
  schoolName: string
  province: string
  city?: string
  address?: string
  contactPerson?: string
  contactPhone?: string
  walletAddress?: string
  studentCount?: number
}

type UpdateSchoolFundDto = {
  schoolName?: string
  province?: string
  city?: string
  address?: string
  contactPerson?: string
  contactPhone?: string
  walletAddress?: string
  studentCount?: number
  status?: SchoolStatus
}

export default function SchoolFundPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedSchool, setSelectedSchool] = React.useState<SchoolFund | null>(null)
  const [formData, setFormData] = React.useState<CreateSchoolFundDto>({
    schoolName: "",
    province: "",
    city: "",
    address: "",
    contactPerson: "",
    contactPhone: "",
    walletAddress: "",
    studentCount: 0,
  })
  const [updateData, setUpdateData] = React.useState<UpdateSchoolFundDto>({})

  // Fetch schools
  const { data: schools = [], isLoading, refetch } = useApiQuery<SchoolFund[]>(
    ["school-funds", searchQuery],
    `/school-funds${searchQuery ? `?province=${encodeURIComponent(searchQuery)}` : ""}`
  )

  // Create mutation
  const createMutation = useApiMutation<SchoolFund, CreateSchoolFundDto>(
    "/school-funds",
    "POST",
    {
      onSuccess: () => {
        toast.success("École ajoutée avec succès")
        setIsAddDialogOpen(false)
        refetch()
      },
    }
  )

  // Update mutation
  const updateMutation = useApiMutation<SchoolFund, UpdateSchoolFundDto>(
    () => `/school-funds/${selectedSchool?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("École modifiée avec succès")
        setIsEditDialogOpen(false)
        setSelectedSchool(null)
        refetch()
      },
    }
  )

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/school-funds/${selectedSchool?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("École supprimée avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedSchool(null)
        refetch()
      },
    }
  )

  const handleAdd = () => {
    setFormData({
      schoolName: "",
      province: "",
      city: "",
      address: "",
      contactPerson: "",
      contactPhone: "",
      walletAddress: "",
      studentCount: 0,
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (school: SchoolFund) => {
    setSelectedSchool(school)
    setUpdateData({
      schoolName: school.schoolName,
      province: school.province,
      city: school.city,
      address: school.address,
      contactPerson: school.contactPerson,
      contactPhone: school.contactPhone,
      walletAddress: school.walletAddress,
      studentCount: school.studentCount,
      status: school.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (school: SchoolFund) => {
    setSelectedSchool(school)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      studentCount: formData.studentCount ? parseInt(formData.studentCount.toString()) : undefined,
    })
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSchool) return
    updateMutation.mutate({
      ...updateData,
      studentCount: updateData.studentCount ? parseInt(updateData.studentCount.toString()) : undefined,
    })
  }

  const handleConfirmDelete = () => {
    if (!selectedSchool) return
    deleteMutation.mutate(undefined)
  }

  const getStatusBadge = (status: SchoolStatus) => {
    const variants: Record<SchoolStatus, { variant: "default" | "secondary" | "outline"; className: string; label: string }> = {
      [SchoolStatus.ACTIVE]: { variant: "default", className: "bg-[#3A8F4C] text-white", label: "Active" },
      [SchoolStatus.INACTIVE]: { variant: "outline", className: "", label: "Inactive" },
      [SchoolStatus.PENDING]: { variant: "outline", className: "", label: "En attente" },
    }
    return variants[status] || variants[SchoolStatus.PENDING]
  }

  const totalFunded = schools.reduce((sum, s) => sum + s.totalFundedADA, 0)
  const totalDisbursed = schools.reduce((sum, s) => sum + s.totalDisbursedADA, 0)
  const activeSchools = schools.filter((s) => s.status === SchoolStatus.ACTIVE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Fonds scolaires</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les fonds scolaires générés par les NFTs
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une école
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total collecté</CardTitle>
            <School className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿ {isLoading ? "..." : totalFunded.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Depuis le début</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total déboursé</CardTitle>
            <TrendingUp className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿ {isLoading ? "..." : totalDisbursed.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Envoyé aux écoles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Écoles actives</CardTitle>
            <School className="h-5 w-5 text-[#004D73]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : activeSchools.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Sur {schools.length} total</p>
          </CardContent>
        </Card>
      </div>

      {/* Schools List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des écoles</CardTitle>
              <CardDescription>
                Recherchez et gérez les écoles bénéficiaires
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
                placeholder="Rechercher par province..."
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
                        École
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Province
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Collecté
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Déboursé
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
                    {schools.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          Aucune école trouvée
                        </td>
                      </tr>
                    ) : (
                      schools.map((school) => {
                        const statusBadge = getStatusBadge(school.status)
                        return (
                          <tr key={school.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium">{school.schoolName}</div>
                              {school.city && (
                                <div className="text-xs text-muted-foreground">{school.city}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {school.province}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              ₿ {school.totalFundedADA.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              ₿ {school.totalDisbursedADA.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={statusBadge.variant} className={statusBadge.className}>
                                {statusBadge.label}
                              </Badge>
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
                                      onClick={() => handleEdit(school)}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Modifier
                                    </button>
                                    <button
                                      onClick={() => handleDelete(school)}
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
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une école</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter une nouvelle école bénéficiaire
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="schoolName">Nom de l'école *</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) =>
                    setFormData({ ...formData, schoolName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="province">Province *</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) =>
                    setFormData({ ...formData, province: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Adresse</Label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Personne de contact</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPerson: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Téléphone de contact</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                  placeholder="+243812345678"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="walletAddress">Adresse du portefeuille</Label>
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
                <Label htmlFor="studentCount">Nombre d'élèves</Label>
                <Input
                  id="studentCount"
                  type="number"
                  min="0"
                  value={formData.studentCount}
                  onChange={(e) =>
                    setFormData({ ...formData, studentCount: parseInt(e.target.value) || 0 })
                  }
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
            <DialogTitle>Modifier l'école</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'école
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-schoolName">Nom de l'école</Label>
                <Input
                  id="edit-schoolName"
                  value={updateData.schoolName || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, schoolName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-province">Province</Label>
                <Input
                  id="edit-province"
                  value={updateData.province || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, province: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-city">Ville</Label>
                <Input
                  id="edit-city"
                  value={updateData.city || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, city: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Adresse</Label>
                <textarea
                  id="edit-address"
                  value={updateData.address || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, address: e.target.value })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-contactPerson">Personne de contact</Label>
                <Input
                  id="edit-contactPerson"
                  value={updateData.contactPerson || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, contactPerson: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-contactPhone">Téléphone de contact</Label>
                <Input
                  id="edit-contactPhone"
                  value={updateData.contactPhone || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, contactPhone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-walletAddress">Adresse du portefeuille</Label>
                <Input
                  id="edit-walletAddress"
                  value={updateData.walletAddress || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, walletAddress: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-studentCount">Nombre d'élèves</Label>
                <Input
                  id="edit-studentCount"
                  type="number"
                  min="0"
                  value={updateData.studentCount || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, studentCount: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Statut</Label>
                <select
                  id="edit-status"
                  value={updateData.status || SchoolStatus.PENDING}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, status: e.target.value as SchoolStatus })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value={SchoolStatus.ACTIVE}>Active</option>
                  <option value={SchoolStatus.INACTIVE}>Inactive</option>
                  <option value={SchoolStatus.PENDING}>En attente</option>
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'école</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'école{" "}
              <strong>{selectedSchool?.schoolName}</strong> ? Cette action est
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
