"use client"

import * as React from "react"
import { Users, Search, Plus, Filter, Edit, Trash2, MoreVertical } from "lucide-react"
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

type Farmer = {
  id: number
  name: string
  email: string
  location: string
  products: string[]
  status: "active" | "pending"
  totalHarvest: string
  revenue: string
}

const initialFarmers: Farmer[] = [
  {
    id: 1,
    name: "Jean Mukendi",
    email: "jean.mukendi@example.com",
    location: "Bas-Congo",
    products: ["Cacao", "Café"],
    status: "active",
    totalHarvest: "2,450 kg",
    revenue: "₿ 1,250",
  },
  {
    id: 2,
    name: "Marie Kabila",
    email: "marie.kabila@example.com",
    location: "Kivu",
    products: ["Café"],
    status: "active",
    totalHarvest: "1,890 kg",
    revenue: "₿ 980",
  },
  {
    id: 3,
    name: "Pierre Kasa",
    email: "pierre.kasa@example.com",
    location: "Équateur",
    products: ["Manioc"],
    status: "pending",
    totalHarvest: "3,200 kg",
    revenue: "₿ 1,650",
  },
]

export default function FarmersPage() {
  const [farmers, setFarmers] = React.useState<Farmer[]>(initialFarmers)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedFarmer, setSelectedFarmer] = React.useState<Farmer | null>(null)
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    location: "",
    products: "",
    status: "active" as "active" | "pending",
  })

  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      location: "",
      products: "",
      status: "active",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (farmer: Farmer) => {
    setSelectedFarmer(farmer)
    setFormData({
      name: farmer.name,
      email: farmer.email,
      location: farmer.location,
      products: farmer.products.join(", "),
      status: farmer.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (farmer: Farmer) => {
    setSelectedFarmer(farmer)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const newFarmer: Farmer = {
      id: farmers.length + 1,
      name: formData.name,
      email: formData.email,
      location: formData.location,
      products: formData.products.split(",").map((p) => p.trim()),
      status: formData.status,
      totalHarvest: "0 kg",
      revenue: "₿ 0",
    }
    setFarmers([...farmers, newFarmer])
    setIsAddDialogOpen(false)
    toast.success("Agriculteur ajouté avec succès")
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFarmer) return

    setFarmers(
      farmers.map((f) =>
        f.id === selectedFarmer.id
          ? {
              ...f,
              name: formData.name,
              email: formData.email,
              location: formData.location,
              products: formData.products.split(",").map((p) => p.trim()),
              status: formData.status,
            }
          : f
      )
    )
    setIsEditDialogOpen(false)
    setSelectedFarmer(null)
    toast.success("Agriculteur modifié avec succès")
  }

  const handleConfirmDelete = () => {
    if (!selectedFarmer) return
    setFarmers(farmers.filter((f) => f.id !== selectedFarmer.id))
    setIsDeleteDialogOpen(false)
    setSelectedFarmer(null)
    toast.success("Agriculteur supprimé avec succès")
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total agriculteurs</CardTitle>
            <Users className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{farmers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <Users className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmers.filter((f) => f.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">88% du total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {farmers.filter((f) => f.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">12% du total</p>
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
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un agriculteur..."
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>

          {/* Table */}
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
                      Produits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Récolte totale
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Revenus
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
                  {farmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium">{farmer.name}</div>
                          <div className="text-sm text-muted-foreground">{farmer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {farmer.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {farmer.products.map((product, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {farmer.totalHarvest}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {farmer.revenue}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={farmer.status === "active" ? "default" : "secondary"}
                          className={
                            farmer.status === "active"
                              ? "bg-[#3A8F4C] text-white"
                              : ""
                          }
                        >
                          {farmer.status === "active" ? "Actif" : "En attente"}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un agriculteur</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouvel agriculteur
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom complet</Label>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="products">Produits (séparés par des virgules)</Label>
                <Input
                  id="products"
                  value={formData.products}
                  onChange={(e) =>
                    setFormData({ ...formData, products: e.target.value })
                  }
                  placeholder="Cacao, Café, Manioc"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Statut</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "pending",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="active">Actif</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
                Ajouter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier l'agriculteur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'agriculteur
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom complet</Label>
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
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-location">Localisation</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-products">Produits (séparés par des virgules)</Label>
                <Input
                  id="edit-products"
                  value={formData.products}
                  onChange={(e) =>
                    setFormData({ ...formData, products: e.target.value })
                  }
                  placeholder="Cacao, Café, Manioc"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Statut</Label>
                <select
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "active" | "pending",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="active">Actif</option>
                  <option value="pending">En attente</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
                Enregistrer
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
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
