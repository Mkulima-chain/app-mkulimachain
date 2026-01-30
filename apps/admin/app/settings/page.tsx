"use client"

import * as React from "react"
import { Settings, Plus, Edit, Trash2, Loader2, Package, Ruler, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useApiQuery } from "@/hooks/use-api-query"
import { useApiMutation } from "@/hooks/use-api-mutation"

type Category = {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type Unit = {
  id: string
  name: string
  symbol: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type Currency = {
  id: string
  code: string
  name: string
  symbol?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

type TabType = "categories" | "units" | "currencies"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<TabType>("categories")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<Category | Unit | Currency | null>(null)
  const [formData, setFormData] = React.useState<any>({})

  // Fetch data based on active tab
  const { data: categories = [], refetch: refetchCategories } = useApiQuery<Category[]>(
    ["categories"],
    "/categories?activeOnly=false"
  )
  const { data: units = [], refetch: refetchUnits } = useApiQuery<Unit[]>(
    ["units"],
    "/units?activeOnly=false"
  )
  const { data: currencies = [], refetch: refetchCurrencies } = useApiQuery<Currency[]>(
    ["currencies"],
    "/currencies?activeOnly=false"
  )

  const currentData = activeTab === "categories" ? categories : activeTab === "units" ? units : currencies
  const refetch = activeTab === "categories" ? refetchCategories : activeTab === "units" ? refetchUnits : refetchCurrencies

  // Mutations
  const createMutation = useApiMutation<any, any>(
    `/${activeTab}`,
    "POST",
    {
      onSuccess: () => {
        toast.success(`${activeTab === "categories" ? "Catégorie" : activeTab === "units" ? "Unité" : "Devise"} ajoutée avec succès`)
        setIsAddDialogOpen(false)
        refetch()
      },
    }
  )

  const updateMutation = useApiMutation<any, any>(
    () => `/${activeTab}/${selectedItem?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success(`${activeTab === "categories" ? "Catégorie" : activeTab === "units" ? "Unité" : "Devise"} modifiée avec succès`)
        setIsEditDialogOpen(false)
        setSelectedItem(null)
        refetch()
      },
    }
  )

  const deleteMutation = useApiMutation<void, void>(
    () => `/${activeTab}/${selectedItem?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success(`${activeTab === "categories" ? "Catégorie" : activeTab === "units" ? "Unité" : "Devise"} supprimée avec succès`)
        setIsDeleteDialogOpen(false)
        setSelectedItem(null)
        refetch()
      },
    }
  )

  const handleAdd = () => {
    if (activeTab === "categories") {
      setFormData({ name: "", description: "", isActive: true })
    } else if (activeTab === "units") {
      setFormData({ name: "", symbol: "", description: "", isActive: true })
    } else {
      setFormData({ code: "", name: "", symbol: "", isActive: true })
    }
    setIsAddDialogOpen(true)
  }

  const handleEdit = (item: Category | Unit | Currency) => {
    setSelectedItem(item)
    setFormData(item)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (item: Category | Unit | Currency) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    updateMutation.mutate(formData)
  }

  const handleConfirmDelete = () => {
    if (!selectedItem) return
    deleteMutation.mutate(undefined)
  }

  const tabs = [
    { id: "categories" as TabType, label: "Catégories", icon: Package },
    { id: "units" as TabType, label: "Unités", icon: Ruler },
    { id: "currencies" as TabType, label: "Devises", icon: DollarSign },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">
          Gérez les catégories, unités et devises de la plateforme
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#3A8F4C] text-[#3A8F4C] font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {activeTab === "categories" ? "Catégories" : activeTab === "units" ? "Unités" : "Devises"}
              </CardTitle>
              <CardDescription>
                {activeTab === "categories"
                  ? "Gérez les catégories de produits"
                  : activeTab === "units"
                  ? "Gérez les unités de mesure"
                  : "Gérez les devises"}
              </CardDescription>
            </div>
            <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    {activeTab === "categories" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </>
                    )}
                    {activeTab === "units" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Symbole</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </>
                    )}
                    {activeTab === "currencies" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Symbole</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Aucune donnée trouvée
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50">
                        {activeTab === "categories" && (
                          <>
                            <td className="px-6 py-4">{(item as Category).name}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{(item as Category).description || "-"}</td>
                            <td className="px-6 py-4">
                              <Badge variant={item.isActive ? "default" : "secondary"}>
                                {item.isActive ? "Actif" : "Inactif"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === "units" && (
                          <>
                            <td className="px-6 py-4">{(item as Unit).name}</td>
                            <td className="px-6 py-4 font-mono">{(item as Unit).symbol}</td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">{(item as Unit).description || "-"}</td>
                            <td className="px-6 py-4">
                              <Badge variant={item.isActive ? "default" : "secondary"}>
                                {item.isActive ? "Actif" : "Inactif"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                        {activeTab === "currencies" && (
                          <>
                            <td className="px-6 py-4 font-mono font-medium">{(item as Currency).code}</td>
                            <td className="px-6 py-4">{(item as Currency).name}</td>
                            <td className="px-6 py-4">{(item as Currency).symbol || "-"}</td>
                            <td className="px-6 py-4">
                              <Badge variant={item.isActive ? "default" : "secondary"}>
                                {item.isActive ? "Actif" : "Inactif"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Ajouter {activeTab === "categories" ? "une catégorie" : activeTab === "units" ? "une unité" : "une devise"}
            </DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouvel élément
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              {activeTab === "categories" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                      Actif
                    </Label>
                  </div>
                </>
              )}
              {activeTab === "units" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="symbol">Symbole *</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol || ""}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      required
                      maxLength={10}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                      Actif
                    </Label>
                  </div>
                </>
              )}
              {activeTab === "currencies" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="code">Code ISO 4217 *</Label>
                    <Input
                      id="code"
                      value={formData.code || ""}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      maxLength={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="symbol">Symbole</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol || ""}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      maxLength={10}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                      Actif
                    </Label>
                  </div>
                </>
              )}
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
              <Button type="submit" className="bg-[#3A8F4C] hover:bg-[#2E7D32]" disabled={createMutation.isPending}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Modifier {activeTab === "categories" ? "la catégorie" : activeTab === "units" ? "l'unité" : "la devise"}
            </DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'élément
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              {activeTab === "categories" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Nom *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="edit-isActive" className="text-sm font-normal cursor-pointer">
                      Actif
                    </Label>
                  </div>
                </>
              )}
              {activeTab === "units" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Nom *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-symbol">Symbole *</Label>
                    <Input
                      id="edit-symbol"
                      value={formData.symbol || ""}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      required
                      maxLength={10}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Input
                      id="edit-description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="edit-isActive" className="text-sm font-normal cursor-pointer">
                      Actif
                    </Label>
                  </div>
                </>
              )}
              {activeTab === "currencies" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-code">Code ISO 4217 *</Label>
                    <Input
                      id="edit-code"
                      value={formData.code || ""}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      maxLength={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Nom *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-symbol">Symbole</Label>
                    <Input
                      id="edit-symbol"
                      value={formData.symbol || ""}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      maxLength={10}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-isActive"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="edit-isActive" className="text-sm font-normal cursor-pointer">
                      Actif
                    </Label>
                  </div>
                </>
              )}
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
              <Button type="submit" className="bg-[#3A8F4C] hover:bg-[#2E7D32]" disabled={updateMutation.isPending}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer{" "}
              <strong>
                {activeTab === "categories"
                  ? (selectedItem as Category)?.name
                  : activeTab === "units"
                  ? (selectedItem as Unit)?.name
                  : (selectedItem as Currency)?.code}
              </strong>
              ? Cette action est irréversible.
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


