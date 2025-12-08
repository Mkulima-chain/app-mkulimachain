"use client"

import * as React from "react"
import { Package, Plus, Search, Filter, Edit, Trash2, MoreVertical } from "lucide-react"
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

type Product = {
  id: number
  name: string
  category: string
  farmer: string
  quantity: string
  price: string
  status: "available" | "sold"
  blockchainHash: string
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Cacao Premium",
    category: "Cacao",
    farmer: "Jean Mukendi",
    quantity: "500 kg",
    price: "₿ 2.5/kg",
    status: "available",
    blockchainHash: "0x1234...5678",
  },
  {
    id: 2,
    name: "Café Arabica",
    category: "Café",
    farmer: "Marie Kabila",
    quantity: "300 kg",
    price: "₿ 3.0/kg",
    status: "available",
    blockchainHash: "0xabcd...efgh",
  },
  {
    id: 3,
    name: "Manioc Bio",
    category: "Manioc",
    farmer: "Pierre Kasa",
    quantity: "1,000 kg",
    price: "₿ 1.2/kg",
    status: "sold",
    blockchainHash: "0x9876...5432",
  },
]

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>(initialProducts)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [formData, setFormData] = React.useState({
    name: "",
    category: "",
    farmer: "",
    quantity: "",
    price: "",
    status: "available" as "available" | "sold",
  })

  const handleAdd = () => {
    setFormData({
      name: "",
      category: "",
      farmer: "",
      quantity: "",
      price: "",
      status: "available",
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      farmer: product.farmer,
      quantity: product.quantity,
      price: product.price,
      status: product.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const newProduct: Product = {
      id: products.length + 1,
      name: formData.name,
      category: formData.category,
      farmer: formData.farmer,
      quantity: formData.quantity,
      price: formData.price,
      status: formData.status,
      blockchainHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
    }
    setProducts([...products, newProduct])
    setIsAddDialogOpen(false)
    toast.success("Produit ajouté avec succès")
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    setProducts(
      products.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              name: formData.name,
              category: formData.category,
              farmer: formData.farmer,
              quantity: formData.quantity,
              price: formData.price,
              status: formData.status,
            }
          : p
      )
    )
    setIsEditDialogOpen(false)
    setSelectedProduct(null)
    toast.success("Produit modifié avec succès")
  }

  const handleConfirmDelete = () => {
    if (!selectedProduct) return
    setProducts(products.filter((p) => p.id !== selectedProduct.id))
    setIsDeleteDialogOpen(false)
    setSelectedProduct(null)
    toast.success("Produit supprimé avec succès")
  }

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
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">+8% ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Disponibles</CardTitle>
            <Package className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.status === "available").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">75% du total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vendus</CardTitle>
            <Package className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.status === "sold").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">22% du total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <Package className="h-5 w-5 text-[#F2C94C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿ 45,678</div>
            <p className="text-xs text-muted-foreground mt-1">+15% ce mois</p>
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
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un produit..."
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
          </div>

          <div className="rounded-lg border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Agriculteur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Prix
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
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {product.blockchainHash}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">{product.category}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {product.farmer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {product.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {product.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={product.status === "available" ? "default" : "secondary"}
                          className={
                            product.status === "available"
                              ? "bg-[#3A8F4C] text-white"
                              : ""
                          }
                        >
                          {product.status === "available" ? "Disponible" : "Vendu"}
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
                                onClick={() => handleEdit(product)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                                Modifier
                              </button>
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
            <DialogTitle>Ajouter un produit</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouveau produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du produit</Label>
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
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="Cacao">Cacao</option>
                  <option value="Café">Café</option>
                  <option value="Manioc">Manioc</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="farmer">Agriculteur</Label>
                <Input
                  id="farmer"
                  value={formData.farmer}
                  onChange={(e) =>
                    setFormData({ ...formData, farmer: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantité</Label>
                <Input
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="500 kg"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Prix</Label>
                <Input
                  id="price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="₿ 2.5/kg"
                  required
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
                      status: e.target.value as "available" | "sold",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="available">Disponible</option>
                  <option value="sold">Vendu</option>
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
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Modifiez les informations du produit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Nom du produit</Label>
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
                <Label htmlFor="edit-category">Catégorie</Label>
                <select
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  required
                >
                  <option value="Cacao">Cacao</option>
                  <option value="Café">Café</option>
                  <option value="Manioc">Manioc</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-farmer">Agriculteur</Label>
                <Input
                  id="edit-farmer"
                  value={formData.farmer}
                  onChange={(e) =>
                    setFormData({ ...formData, farmer: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantité</Label>
                <Input
                  id="edit-quantity"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Prix</Label>
                <Input
                  id="edit-price"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
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
                      status: e.target.value as "available" | "sold",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="available">Disponible</option>
                  <option value="sold">Vendu</option>
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
