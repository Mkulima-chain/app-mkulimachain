"use client"

import * as React from "react"
import { ShoppingCart, Search, Filter, Plus, Edit, Trash2, MoreVertical } from "lucide-react"
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

type Order = {
  id: string
  customer: string
  product: string
  quantity: string
  amount: string
  status: "completed" | "pending" | "processing"
  date: string
}

const initialOrders: Order[] = [
  {
    id: "#1234",
    customer: "Buyer International",
    product: "Cacao Premium",
    quantity: "500 kg",
    amount: "₿ 1,250",
    status: "completed",
    date: "2024-01-15",
  },
  {
    id: "#1235",
    customer: "Café Export Co.",
    product: "Café Arabica",
    quantity: "300 kg",
    amount: "₿ 900",
    status: "pending",
    date: "2024-01-16",
  },
  {
    id: "#1236",
    customer: "Bio Market",
    product: "Manioc Bio",
    quantity: "1,000 kg",
    amount: "₿ 1,200",
    status: "processing",
    date: "2024-01-17",
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>(initialOrders)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)
  const [formData, setFormData] = React.useState({
    customer: "",
    product: "",
    quantity: "",
    amount: "",
    status: "pending" as "completed" | "pending" | "processing",
    date: new Date().toISOString().split("T")[0],
  })

  const handleAdd = () => {
    setFormData({
      customer: "",
      product: "",
      quantity: "",
      amount: "",
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (order: Order) => {
    setSelectedOrder(order)
    setFormData({
      customer: order.customer,
      product: order.product,
      quantity: order.quantity,
      amount: order.amount,
      status: order.status,
      date: order.date,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (order: Order) => {
    setSelectedOrder(order)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const newOrder: Order = {
      id: `#${Math.floor(Math.random() * 10000)}`,
      customer: formData.customer,
      product: formData.product,
      quantity: formData.quantity,
      amount: formData.amount,
      status: formData.status,
      date: formData.date,
    }
    setOrders([...orders, newOrder])
    setIsAddDialogOpen(false)
    toast.success("Commande ajoutée avec succès")
  }

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrder) return

    setOrders(
      orders.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              customer: formData.customer,
              product: formData.product,
              quantity: formData.quantity,
              amount: formData.amount,
              status: formData.status,
              date: formData.date,
            }
          : o
      )
    )
    setIsEditDialogOpen(false)
    setSelectedOrder(null)
    toast.success("Commande modifiée avec succès")
  }

  const handleConfirmDelete = () => {
    if (!selectedOrder) return
    setOrders(orders.filter((o) => o.id !== selectedOrder.id))
    setIsDeleteDialogOpen(false)
    setSelectedOrder(null)
    toast.success("Commande supprimée avec succès")
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
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">+15% ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <ShoppingCart className="h-5 w-5 text-[#F2C94C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">16% du total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En traitement</CardTitle>
            <ShoppingCart className="h-5 w-5 text-[#004D73]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "processing").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">26% du total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Complétées</CardTitle>
            <ShoppingCart className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((o) => o.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">58% du total</p>
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
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une commande..."
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
                      Commande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Produit
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
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.customer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : order.status === "processing"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            order.status === "completed"
                              ? "bg-[#3A8F4C] text-white"
                              : order.status === "processing"
                              ? "bg-[#004D73] text-white"
                              : ""
                          }
                        >
                          {order.status === "completed"
                            ? "Complétée"
                            : order.status === "processing"
                            ? "En traitement"
                            : "En attente"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {order.date}
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
            <DialogTitle>Ajouter une commande</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter une nouvelle commande
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customer">Client</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) =>
                    setFormData({ ...formData, customer: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="product">Produit</Label>
                <Input
                  id="product"
                  value={formData.product}
                  onChange={(e) =>
                    setFormData({ ...formData, product: e.target.value })
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
                <Label htmlFor="amount">Montant</Label>
                <Input
                  id="amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="₿ 1,250"
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
                      status: e.target.value as "completed" | "pending" | "processing",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="pending">En attente</option>
                  <option value="processing">En traitement</option>
                  <option value="completed">Complétée</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
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
            <DialogTitle>Modifier la commande</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la commande
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-customer">Client</Label>
                <Input
                  id="edit-customer"
                  value={formData.customer}
                  onChange={(e) =>
                    setFormData({ ...formData, customer: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-product">Produit</Label>
                <Input
                  id="edit-product"
                  value={formData.product}
                  onChange={(e) =>
                    setFormData({ ...formData, product: e.target.value })
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
                <Label htmlFor="edit-amount">Montant</Label>
                <Input
                  id="edit-amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
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
                      status: e.target.value as "completed" | "pending" | "processing",
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value="pending">En attente</option>
                  <option value="processing">En traitement</option>
                  <option value="completed">Complétée</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
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
            <DialogTitle>Supprimer la commande</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la commande{" "}
              <strong>{selectedOrder?.id}</strong> ? Cette action est
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
