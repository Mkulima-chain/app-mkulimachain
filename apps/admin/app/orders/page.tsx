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
  List,
  Calendar,
  Users,
  ChevronDown,
  ChevronRight,
  LockKeyhole,
  Unlock,
  RotateCcw,
  AlertTriangle,
  Wallet,
  CheckCircle2,
  Activity,
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
import { useEscrowContract } from "@/hooks";
import { useWalletAtom } from "@/hooks/useWalletAtom";
import { WalletConnectDialog } from "@/components/wallet-connect-dialog";
import { TraceabilityStepButtons } from "@/components/traceability-step-buttons";
import { OrderStatus, Order } from "@/types/order";

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
  const [isEscrowDialogOpen, setIsEscrowDialogOpen] = React.useState(false);
  const [isTraceabilityDialogOpen, setIsTraceabilityDialogOpen] =
    React.useState(false);
  const [escrowAction, setEscrowAction] = React.useState<
    "release" | "refund" | "dispute" | null
  >(null);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [viewMode, setViewMode] = React.useState<
    "list" | "by-client" | "by-date"
  >("list");
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(
    new Set()
  );
  const [formData, setFormData] = React.useState<CreateOrderDto>({
    buyerId: "",
    itemId: "",
    quantityKg: 0,
    shippingAddress: "",
  });
  const [updateData, setUpdateData] = React.useState<UpdateOrderDto>({
    status: OrderStatus.PENDING,
  });

  // Escrow contract hook
  const {
    releaseFunds,
    refundPayer,
    createDispute,
    getEscrows,
    isLoading: isEscrowLoading,
  } = useEscrowContract();

  // Wallet connection
  const { connected: walletConnected, address: walletAddress } =
    useWalletAtom();
  const [isWalletDialogOpen, setIsWalletDialogOpen] = React.useState(false);

  // Helper to check if order has escrow
  const hasEscrow = (order: Order): boolean => {
    return order.shippingAddress?.includes("Escrow TX:") || false;
  };

  // Extract escrow TX hash from shippingAddress
  const getEscrowTxHash = (order: Order): string | null => {
    if (!order.shippingAddress) return null;
    const match = order.shippingAddress.match(/Escrow TX:\s*([a-fA-F0-9]+)/);
    return match ? match[1] : null;
  };

  // Grouping types
  type OrderGroup = {
    key: string;
    label: string;
    orders: Order[];
    totalAmount: number;
  };

  // Group orders by client
  const groupOrdersByClient = (orders: Order[]): OrderGroup[] => {
    const groups = new Map<string, Order[]>();
    orders.forEach((order) => {
      const key = order.buyerId;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(order);
    });
    return Array.from(groups.entries()).map(([key, orders]) => ({
      key,
      label: `Client #${key.slice(0, 8)}...`,
      orders,
      totalAmount: orders.reduce((sum, o) => sum + Number(o.totalADA || 0), 0),
    }));
  };

  // Group orders by date
  const groupOrdersByDate = (orders: Order[]): OrderGroup[] => {
    const groups = new Map<string, Order[]>();
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(order);
    });
    return Array.from(groups.entries())
      .map(([key, orders]) => ({
        key,
        label: key,
        orders,
        totalAmount: orders.reduce(
          (sum, o) => sum + Number(o.totalADA || 0),
          0
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.orders[0].createdAt).getTime() -
          new Date(a.orders[0].createdAt).getTime()
      );
  };

  // Toggle group expansion
  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

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

  const handleManageTraceability = (order: Order) => {
    setSelectedOrder(order);
    setIsTraceabilityDialogOpen(true);
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

  // Escrow action handlers
  const handleEscrowAction = async (
    order: Order,
    action: "release" | "refund" | "dispute"
  ) => {
    setSelectedOrder(order);
    setEscrowAction(action);
    setIsEscrowDialogOpen(true);
  };

  const handleConfirmEscrowAction = async () => {
    if (!selectedOrder || !escrowAction) return;

    // Check wallet connection
    if (!walletConnected) {
      toast.error("Wallet non connecté", {
        description:
          "Veuillez connecter votre wallet pour effectuer cette action",
        action: {
          label: "Connecter",
          onClick: () => setIsWalletDialogOpen(true),
        },
      });
      return;
    }

    const escrowTxHash = getEscrowTxHash(selectedOrder);
    if (!escrowTxHash) {
      toast.error("Impossible de trouver le hash de transaction escrow");
      return;
    }

    try {
      // Fetch escrow UTxOs from blockchain
      toast.info("Recherche de l'escrow sur la blockchain...", {
        duration: 3000,
      });

      const escrowUtxos = await getEscrows();

      if (!escrowUtxos || escrowUtxos.length === 0) {
        toast.warning("Aucun escrow trouvé sur la blockchain", {
          description: "L'escrow a peut-être déjà été traité",
        });
        // Still update the order status locally
        if (escrowAction === "release") {
          updateMutation.mutate({ status: OrderStatus.COMPLETED });
        } else if (escrowAction === "refund") {
          updateMutation.mutate({ status: OrderStatus.REFUNDED });
        }
        setIsEscrowDialogOpen(false);
        setSelectedOrder(null);
        setEscrowAction(null);
        return;
      }

      // Find the matching escrow by amount (convert ADA to lovelace)
      const orderAmount = BigInt(
        Math.floor(Number(selectedOrder.totalADA || 0) * 1_000_000)
      );

      // Debug: Log all escrow UTxOs
      console.log("Escrow UTxOs found:", escrowUtxos.length);
      escrowUtxos.forEach((utxo: any, i: number) => {
        console.log(`UTxO ${i}:`, {
          txHash: utxo.txHash,
          lovelace: utxo.assets?.lovelace?.toString(),
          datumHash: utxo.datumHash,
          datum: utxo.datum,
          scriptRef: utxo.scriptRef,
        });
      });
      console.log("Looking for amount:", orderAmount.toString());

      const matchingUtxo = escrowUtxos.find((utxo: any) => {
        const utxoLovelace = utxo.assets?.lovelace || BigInt(0);
        // Allow 2 ADA difference for fees
        return Math.abs(Number(utxoLovelace) - Number(orderAmount)) < 2_000_000;
      });

      if (matchingUtxo) {
        console.log("Matching UTxO found:", matchingUtxo);
      }

      if (!matchingUtxo) {
        toast.warning("Escrow non trouvé avec le montant correspondant", {
          description: "L'escrow a peut-être déjà été traité",
        });
        // Still update the order status locally
        if (escrowAction === "release") {
          updateMutation.mutate({ status: OrderStatus.COMPLETED });
        } else if (escrowAction === "refund") {
          updateMutation.mutate({ status: OrderStatus.REFUNDED });
        }
        setIsEscrowDialogOpen(false);
        setSelectedOrder(null);
        setEscrowAction(null);
        return;
      }

      toast.info("Exécution de la transaction blockchain...", {
        duration: 5000,
      });

      // Reconstruct datum from order data
      // Note: In production, this should be parsed from the inline datum
      const reconstructedDatum: any = {
        payerAddress: walletAddress || "", // Use current wallet as fallback
        beneficiaryAddress:
          selectedOrder.item?.farmer?.id || walletAddress || "",
        amountLovelace: orderAmount,
        arbiterAddress:
          process.env.NEXT_PUBLIC_PLATFORM_ADDRESS || walletAddress || "",
        deadlineTimestamp: Math.floor(Date.now() / 1000) + 72 * 60 * 60,
        description: `Commande ${selectedOrder.id.slice(0, 8)}`,
        status: "Locked",
      };

      let txResult: string | null = null;

      if (escrowAction === "release") {
        // Release funds to seller
        txResult = await releaseFunds({
          escrowUtxo: matchingUtxo,
          datum: reconstructedDatum,
        });

        toast.success("Fonds libérés avec succès!", {
          description: `TX: ${txResult?.slice(0, 16)}... - Commande #${selectedOrder.id.slice(0, 8)}`,
        });

        // Update order status to COMPLETED
        updateMutation.mutate({
          status: OrderStatus.COMPLETED,
          paymentHash: txResult || undefined,
        });
      } else if (escrowAction === "refund") {
        // Refund to buyer
        txResult = await refundPayer({
          escrowUtxo: matchingUtxo,
          datum: reconstructedDatum,
        });

        toast.success("Remboursement effectué avec succès!", {
          description: `TX: ${txResult?.slice(0, 16)}... - Commande #${selectedOrder.id.slice(0, 8)}`,
        });

        // Update order status to REFUNDED
        updateMutation.mutate({
          status: OrderStatus.REFUNDED,
          paymentHash: txResult || undefined,
        });
      } else if (escrowAction === "dispute") {
        // Create dispute
        txResult = await createDispute({
          escrowUtxo: matchingUtxo,
          datum: reconstructedDatum,
          reason: `Litige ouvert pour commande #${selectedOrder.id.slice(0, 8)}`,
        });

        toast.warning("Litige ouvert avec succès!", {
          description: `TX: ${txResult?.slice(0, 16)}... - En attente de résolution`,
        });
      }

      setIsEscrowDialogOpen(false);
      setSelectedOrder(null);
      setEscrowAction(null);
      refetch(); // Refresh orders list
    } catch (error: any) {
      console.error("Escrow action error:", error);
      toast.error("Erreur lors de l'action escrow", {
        description: error.message || "Veuillez réessayer",
      });
    }
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
        <div className="flex items-center gap-3">
          {/* Wallet Connection Button */}
          <Button
            variant={walletConnected ? "outline" : "secondary"}
            onClick={() => setIsWalletDialogOpen(true)}
            className={walletConnected ? "border-green-500 text-green-600" : ""}
          >
            {walletConnected ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {walletAddress?.slice(0, 8)}...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4 mr-2" />
                Connecter Wallet
              </>
            )}
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une commande
          </Button>
        </div>
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
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list" ? "bg-[#3A8F4C] hover:bg-[#2E7D32]" : ""
                }
              >
                <List className="h-4 w-4 mr-1" />
                Liste
              </Button>
              <Button
                variant={viewMode === "by-client" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("by-client")}
                className={
                  viewMode === "by-client"
                    ? "bg-[#3A8F4C] hover:bg-[#2E7D32]"
                    : ""
                }
              >
                <Users className="h-4 w-4 mr-1" />
                Par Client
              </Button>
              <Button
                variant={viewMode === "by-date" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("by-date")}
                className={
                  viewMode === "by-date"
                    ? "bg-[#3A8F4C] hover:bg-[#2E7D32]"
                    : ""
                }
              >
                <Calendar className="h-4 w-4 mr-1" />
                Par Date
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3A8F4C]" />
            </div>
          ) : viewMode === "list" ? (
            /* LIST VIEW - Original table */
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
                              ₳ {Number(order.totalADA || 0).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={statusBadge.variant}
                                  className={statusBadge.className}
                                >
                                  {statusBadge.label}
                                </Badge>
                                {hasEscrow(order) && (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-300"
                                  >
                                    <LockKeyhole className="h-3 w-3 mr-1" />
                                    Escrow
                                  </Badge>
                                )}
                              </div>
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
                                  className="w-56 p-2"
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
                                      onClick={() =>
                                        handleManageTraceability(order)
                                      }
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                    >
                                      <Activity className="h-4 w-4" />
                                      Traçabilité
                                    </button>

                                    {/* Escrow Actions */}
                                    {hasEscrow(order) && (
                                      <>
                                        <div className="border-t my-2" />
                                        <p className="px-3 py-1 text-xs font-medium text-muted-foreground">
                                          Actions Escrow
                                        </p>
                                        {(order.status ===
                                          OrderStatus.SHIPPED ||
                                          order.status ===
                                            OrderStatus.PAID) && (
                                          <button
                                            onClick={() =>
                                              handleEscrowAction(
                                                order,
                                                "release"
                                              )
                                            }
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-green-50 text-green-700 transition-colors"
                                          >
                                            <Unlock className="h-4 w-4" />
                                            Libérer les fonds
                                          </button>
                                        )}
                                        {(order.status ===
                                          OrderStatus.PENDING ||
                                          order.status ===
                                            OrderStatus.CANCELLED) && (
                                          <button
                                            onClick={() =>
                                              handleEscrowAction(
                                                order,
                                                "refund"
                                              )
                                            }
                                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-blue-50 text-blue-700 transition-colors"
                                          >
                                            <RotateCcw className="h-4 w-4" />
                                            Rembourser
                                          </button>
                                        )}
                                        <button
                                          onClick={() =>
                                            handleEscrowAction(order, "dispute")
                                          }
                                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-amber-50 text-amber-700 transition-colors"
                                        >
                                          <AlertTriangle className="h-4 w-4" />
                                          Ouvrir un litige
                                        </button>
                                      </>
                                    )}

                                    <div className="border-t my-2" />
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
          ) : (
            /* GROUPED VIEW */
            <div className="space-y-4">
              {(viewMode === "by-client"
                ? groupOrdersByClient(orders)
                : groupOrdersByDate(orders)
              ).map((group) => (
                <div key={group.key} className="rounded-lg border">
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedGroups.has(group.key) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {viewMode === "by-client" ? (
                        <Users className="h-4 w-4 text-[#004D73]" />
                      ) : (
                        <Calendar className="h-4 w-4 text-[#004D73]" />
                      )}
                      <span className="font-medium">{group.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {group.orders.length} commande
                        {group.orders.length > 1 ? "s" : ""}
                      </span>
                      <span className="font-medium text-[#3A8F4C]">
                        ₳ {group.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </button>
                  {expandedGroups.has(group.key) && (
                    <div className="divide-y">
                      {group.orders.map((order) => {
                        const statusBadge = getStatusBadge(order.status);
                        return (
                          <div
                            key={order.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-muted/30"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium">
                                #{order.id.slice(0, 8)}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {order.item?.title || "N/A"}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm">
                                {order.quantityKg} kg
                              </span>
                              <span className="text-sm font-medium">
                                ₳ {Number(order.totalADA || 0).toFixed(2)}
                              </span>
                              <Badge
                                variant={statusBadge.variant}
                                className={statusBadge.className}
                              >
                                {statusBadge.label}
                              </Badge>
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
                                      onClick={() =>
                                        handleManageTraceability(order)
                                      }
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                    >
                                      <Activity className="h-4 w-4" />
                                      Traçabilité
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune commande trouvée
                </div>
              )}
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

      {/* Escrow Action Dialog */}
      <Dialog open={isEscrowDialogOpen} onOpenChange={setIsEscrowDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {escrowAction === "release" && (
                <>
                  <Unlock className="h-5 w-5 text-green-600" />
                  Libérer les fonds
                </>
              )}
              {escrowAction === "refund" && (
                <>
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                  Rembourser l&apos;acheteur
                </>
              )}
              {escrowAction === "dispute" && (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Ouvrir un litige
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {escrowAction === "release" && (
                <>
                  Cette action libérera les fonds verrouillés en escrow au
                  vendeur. Commande:{" "}
                  <strong>#{selectedOrder?.id.slice(0, 8)}</strong>
                </>
              )}
              {escrowAction === "refund" && (
                <>
                  Cette action remboursera les fonds verrouillés en escrow à
                  l&apos;acheteur. Commande:{" "}
                  <strong>#{selectedOrder?.id.slice(0, 8)}</strong>
                </>
              )}
              {escrowAction === "dispute" && (
                <>
                  Cette action ouvrira un litige pour la commande{" "}
                  <strong>#{selectedOrder?.id.slice(0, 8)}</strong>.
                  L&apos;arbitre devra résoudre le litige.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="py-4 space-y-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Produit:</strong> {selectedOrder.item?.title || "N/A"}
                </p>
                <p className="text-sm">
                  <strong>Montant:</strong> ₳{" "}
                  {Number(selectedOrder.totalADA || 0).toFixed(2)}
                </p>
                <p className="text-sm">
                  <strong>TX Escrow:</strong>{" "}
                  {getEscrowTxHash(selectedOrder)?.slice(0, 24)}...
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEscrowDialogOpen(false);
                setEscrowAction(null);
              }}
              disabled={isEscrowLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmEscrowAction}
              disabled={isEscrowLoading}
              className={
                escrowAction === "release"
                  ? "bg-green-600 hover:bg-green-700"
                  : escrowAction === "refund"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-amber-600 hover:bg-amber-700"
              }
            >
              {isEscrowLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                "Confirmer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wallet Connect Dialog */}
      <WalletConnectDialog
        open={isWalletDialogOpen}
        onOpenChange={setIsWalletDialogOpen}
      />

      {/* Traceability Dialog */}
      <Dialog
        open={isTraceabilityDialogOpen}
        onOpenChange={setIsTraceabilityDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gérer la traçabilité</DialogTitle>
            <DialogDescription>
              Mettez à jour les étapes de la commande{" "}
              <strong>#{selectedOrder?.id.slice(0, 8)}</strong>
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="py-4">
              <TraceabilityStepButtons
                order={selectedOrder}
                onUpdate={() => {
                  refetch();
                }}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTraceabilityDialogOpen(false)}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
