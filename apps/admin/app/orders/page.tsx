"use client";

import * as React from "react";
import {
  ShoppingCart,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";

enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  SHIPPED = "shipped",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

type Order = {
  id: string;
  buyerId: string;
  item: {
    id: string;
    title: string;
    priceADA: number;
    farmer: {
      id: string;
      name: string;
    };
  };
  quantityKg: number;
  unitPriceADA: number;
  totalADA: number;
  status: OrderStatus;
  paymentHash?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
};

type CreateOrderDto = {
  buyerId: string;
  itemId: string;
  quantityKg: number;
  shippingAddress?: string;
};

type UpdateOrderDto = {
  status?: OrderStatus;
  paymentHash?: string;
  shippingAddress?: string;
  trackingNumber?: string;
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [formData, setFormData] = React.useState<CreateOrderDto>({
    buyerId: "",
    itemId: "",
    quantityKg: 0,
    shippingAddress: "",
  });
  const [updateData, setUpdateData] = React.useState<UpdateOrderDto>({
    status: OrderStatus.PENDING,
  });

  // Fetch orders
  const {
    data: orders = [],
    isLoading,
    refetch,
  } = useApiQuery<Order[]>(
    ["orders", searchQuery],
    `/orders${searchQuery ? `?status=${encodeURIComponent(searchQuery)}` : ""}`
  );

  // Create mutation
  const createMutation = useApiMutation<Order, CreateOrderDto>(
    "/orders",
    "POST",
    {
      onSuccess: () => {
        toast.success("Commande ajoutée avec succès");
        setIsAddDialogOpen(false);
        refetch();
      },
    }
  );

  // Update mutation
  const updateMutation = useApiMutation<Order, UpdateOrderDto>(
    () => `/orders/${selectedOrder?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Commande modifiée avec succès");
        setIsEditDialogOpen(false);
        setSelectedOrder(null);
        refetch();
      },
    }
  );

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/orders/${selectedOrder?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Commande supprimée avec succès");
        setIsDeleteDialogOpen(false);
        setSelectedOrder(null);
        refetch();
      },
    }
  );

  const handleAdd = () => {
    setFormData({
      buyerId: "",
      itemId: "",
      quantityKg: 0,
      shippingAddress: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      paymentHash: order.paymentHash,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      quantityKg: parseFloat(formData.quantityKg.toString()),
    });
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    updateMutation.mutate(updateData);
  };

  const handleConfirmDelete = () => {
    if (!selectedOrder) return;
    deleteMutation.mutate(undefined);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const variants: Record<
      OrderStatus,
      {
        variant: "default" | "secondary" | "outline";
        className: string;
        label: string;
      }
    > = {
      [OrderStatus.COMPLETED]: {
        variant: "default",
        className: "bg-[#3A8F4C] text-white",
        label: "Complétée",
      },
      [OrderStatus.SHIPPED]: {
        variant: "secondary",
        className: "bg-[#004D73] text-white",
        label: "Expédiée",
      },
      [OrderStatus.PAID]: {
        variant: "secondary",
        className: "bg-[#5A3E36] text-white",
        label: "Payée",
      },
      [OrderStatus.PENDING]: {
        variant: "outline",
        className: "",
        label: "En attente",
      },
      [OrderStatus.CANCELLED]: {
        variant: "outline",
        className: "",
        label: "Annulée",
      },
      [OrderStatus.REFUNDED]: {
        variant: "outline",
        className: "",
        label: "Remboursée",
      },
    };
    return variants[status] || variants[OrderStatus.PENDING];
  };

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
            <CardTitle className="text-sm font-medium">
              Total commandes
            </CardTitle>
            <ShoppingCart className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : orders.length}
            </div>
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
              {isLoading
                ? "..."
                : orders.filter((o) => o.status === OrderStatus.PENDING).length}
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
              {isLoading
                ? "..."
                : orders.filter(
                    (o) =>
                      o.status === OrderStatus.SHIPPED ||
                      o.status === OrderStatus.PAID
                  ).length}
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
              {isLoading
                ? "..."
                : orders.filter((o) => o.status === OrderStatus.COMPLETED)
                    .length}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrer
            </Button>
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
                        Commande
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Aucune commande trouvée
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => {
                        const statusBadge = getStatusBadge(order.status);
                        return (
                          <tr key={order.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium">
                                #{order.id.slice(0, 8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {order.item?.title || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {order.item?.farmer?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {order.quantityKg} kg
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              ₳ {order.totalADA.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                variant={statusBadge.variant}
                                className={statusBadge.className}
                              >
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
                                <PopoverContent
                                  align="end"
                                  className="w-48 p-2"
                                >
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
                        );
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
                <Label htmlFor="buyerId">ID de l'acheteur *</Label>
                <Input
                  id="buyerId"
                  value={formData.buyerId}
                  onChange={(e) =>
                    setFormData({ ...formData, buyerId: e.target.value })
                  }
                  placeholder="UUID de l'acheteur"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="itemId">ID de l'item *</Label>
                <Input
                  id="itemId"
                  value={formData.itemId}
                  onChange={(e) =>
                    setFormData({ ...formData, itemId: e.target.value })
                  }
                  placeholder="UUID de l'item marketplace"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quantityKg">Quantité (kg) *</Label>
                <Input
                  id="quantityKg"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.quantityKg}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantityKg: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="shippingAddress">Adresse de livraison</Label>
                <textarea
                  id="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shippingAddress: e.target.value,
                    })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
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
                <Label htmlFor="edit-status">Statut</Label>
                <select
                  id="edit-status"
                  value={updateData.status}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      status: e.target.value as OrderStatus,
                    })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value={OrderStatus.PENDING}>En attente</option>
                  <option value={OrderStatus.PAID}>Payée</option>
                  <option value={OrderStatus.SHIPPED}>Expédiée</option>
                  <option value={OrderStatus.COMPLETED}>Complétée</option>
                  <option value={OrderStatus.CANCELLED}>Annulée</option>
                  <option value={OrderStatus.REFUNDED}>Remboursée</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-paymentHash">Hash de paiement</Label>
                <Input
                  id="edit-paymentHash"
                  value={updateData.paymentHash || ""}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      paymentHash: e.target.value,
                    })
                  }
                  placeholder="Hash de la transaction"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-shippingAddress">
                  Adresse de livraison
                </Label>
                <textarea
                  id="edit-shippingAddress"
                  value={updateData.shippingAddress || ""}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      shippingAddress: e.target.value,
                    })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-trackingNumber">Numéro de suivi</Label>
                <Input
                  id="edit-trackingNumber"
                  value={updateData.trackingNumber || ""}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      trackingNumber: e.target.value,
                    })
                  }
                  placeholder="Numéro de suivi"
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
            <DialogTitle>Supprimer la commande</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la commande{" "}
              <strong>#{selectedOrder?.id.slice(0, 8)}</strong> ? Cette action
              est irréversible.
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
  );
}
