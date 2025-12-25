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
import { AddFarmerDialog } from "./add-farmer-dialog"
import { ViewCooperativeDialog } from "./view-cooperative-dialog"
import { UserPlus, Eye } from "lucide-react"

type Cooperative = {
  id: string
  name: string
  location: string
  leader: string
  createdAt: string
  updatedAt: string
}

type CreateCooperativeDto = {
  name: string
  location: string
  leader: string
}

export default function CooperativesPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isAddFarmerDialogOpen, setIsAddFarmerDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [selectedCooperative, setSelectedCooperative] = React.useState<Cooperative | null>(null)
  const [formData, setFormData] = React.useState<CreateCooperativeDto>({
    name: "",
    location: "",
    leader: "",
  })

  const { data: cooperatives = [], isLoading, refetch } = useApiQuery<Cooperative[]>(
    ["cooperatives", searchQuery],
    `/cooperatives${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`
  )

  const createMutation = useApiMutation<Cooperative, CreateCooperativeDto>(
    "/cooperatives",
    "POST",
    {
      onSuccess: () => {
        toast.success("Coopérative ajoutée avec succès")
        setIsAddDialogOpen(false)
        refetch()
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
    }
  )

  const handleAdd = () => {
    setFormData({ name: "", location: "", leader: "" })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (cooperative: Cooperative) => {
    setSelectedCooperative(cooperative)
    setFormData({
      name: cooperative.name,
      location: cooperative.location,
      leader: cooperative.leader,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (cooperative: Cooperative) => {
    setSelectedCooperative(cooperative)
    setIsDeleteDialogOpen(true)
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

  const totalCooperatives = cooperatives.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coopératives</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les coopératives agricoles
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une coopérative
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total coopératives</CardTitle>
            <Building2 className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : totalCooperatives}</div>
            <p className="text-xs text-muted-foreground mt-1">Référencées dans le système</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leaders</CardTitle>
            <Users className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : new Set(cooperatives.map((c) => c.leader)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Responsables enregistrés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Localisations</CardTitle>
            <MapPin className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : new Set(cooperatives.map((c) => c.location)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Zones couvertes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des coopératives</CardTitle>
              <CardDescription>
                Recherchez, ajoutez ou modifiez les coopératives
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
                placeholder="Rechercher une coopérative..."
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
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Leader
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cooperatives.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                          Aucune coopérative trouvée
                        </td>
                      </tr>
                    ) : (
                      cooperatives.map((cooperative) => (
                        <tr key={cooperative.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{cooperative.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Créée le {new Date(cooperative.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {cooperative.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {cooperative.leader}
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
                                      setSelectedCooperative(cooperative)
                                      setIsViewDialogOpen(true)
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                    Voir les détails
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedCooperative(cooperative)
                                      setIsAddFarmerDialogOpen(true)
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <UserPlus className="h-4 w-4" />
                                    Adhérer un agriculteur
                                  </button>
                                  <button
                                    onClick={() => handleEdit(cooperative)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </button>
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
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Ajouter une coopérative</DialogTitle>
            <DialogDescription>
              Renseignez les informations de la coopérative
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Localisation *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="leader">Leader *</Label>
                <Input
                  id="leader"
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
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
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Modifier la coopérative</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de la coopérative
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Localisation *</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-leader">Leader *</Label>
                <Input
                  id="edit-leader"
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
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
            <DialogTitle>Supprimer la coopérative</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>{selectedCooperative?.name}</strong> ? Cette action est
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

      {selectedCooperative && (
        <>
          <ViewCooperativeDialog
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
            cooperativeId={selectedCooperative.id}
            onSuccess={() => {
              refetch();
            }}
          />
          <AddFarmerDialog
            open={isAddFarmerDialogOpen}
            onOpenChange={setIsAddFarmerDialogOpen}
            cooperativeId={selectedCooperative.id}
            cooperativeName={selectedCooperative.name}
            onSuccess={() => {
              refetch()
            }}
          />
        </>
      )}
    </div>
  )
}
