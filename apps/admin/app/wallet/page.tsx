"use client";

import * as React from "react";
import {
  Wallet,
  Search,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Loader2,
  TrendingUp,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import {
  AddWalletDialog,
  OwnerType,
  type CreateWalletDto,
} from "@/components/wallet/add-wallet-dialog";
import {
  EditWalletDialog,
  type UpdateWalletDto,
} from "@/components/wallet/edit-wallet-dialog";
import { DeleteWalletDialog } from "@/components/wallet/delete-wallet-dialog";

export { OwnerType };

type WalletType = {
  id: string;
  ownerType: OwnerType;
  ownerId: string;
  adaAddress: string;
  mobileMoneyNumber?: string;
  balanceADA: number;
  createdAt: string;
  updatedAt: string;
};

export default function WalletPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedWallet, setSelectedWallet] = React.useState<WalletType | null>(
    null
  );
  const [formData, setFormData] = React.useState<CreateWalletDto>({
    ownerType: OwnerType.FARMER,
    ownerId: "",
    adaAddress: "",
    mobileMoneyNumber: "",
    balanceADA: 0,
  });
  const [updateData, setUpdateData] = React.useState<UpdateWalletDto>({});

  // Fetch wallets
  const {
    data: wallets = [],
    isLoading,
    refetch,
  } = useApiQuery<WalletType[]>(
    ["wallets", searchQuery],
    `/wallets${searchQuery ? `?adaAddress=${encodeURIComponent(searchQuery)}` : ""}`
  );

  // Create mutation
  const createMutation = useApiMutation<WalletType, CreateWalletDto>(
    "/wallets",
    "POST",
    {
      onSuccess: () => {
        toast.success("Portefeuille ajouté avec succès");
        setIsAddDialogOpen(false);
        refetch();
      },
    }
  );

  // Update mutation
  const updateMutation = useApiMutation<WalletType, UpdateWalletDto>(
    () => `/wallets/${selectedWallet?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Portefeuille modifié avec succès");
        setIsEditDialogOpen(false);
        setSelectedWallet(null);
        refetch();
      },
    }
  );

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/wallets/${selectedWallet?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Portefeuille supprimé avec succès");
        setIsDeleteDialogOpen(false);
        setSelectedWallet(null);
        refetch();
      },
    }
  );

  const handleAdd = () => {
    setFormData({
      ownerType: OwnerType.FARMER,
      ownerId: "",
      adaAddress: "",
      mobileMoneyNumber: "",
      balanceADA: 0,
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (wallet: WalletType) => {
    setSelectedWallet(wallet);
    setUpdateData({
      adaAddress: wallet.adaAddress,
      mobileMoneyNumber: wallet.mobileMoneyNumber,
      balanceADA: wallet.balanceADA,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (wallet: WalletType) => {
    setSelectedWallet(wallet);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      balanceADA: formData.balanceADA || 0,
    });
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) return;
    updateMutation.mutate({
      ...updateData,
      balanceADA: updateData.balanceADA
        ? parseFloat(updateData.balanceADA.toString())
        : undefined,
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedWallet) return;
    deleteMutation.mutate(undefined);
  };

  const getOwnerTypeLabel = (type: OwnerType) => {
    const labels: Record<OwnerType, string> = {
      [OwnerType.FARMER]: "Agriculteur",
      [OwnerType.BUYER]: "Acheteur",
      [OwnerType.COOPERATIVE]: "Coopérative",
    };
    return labels[type] || type;
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.balanceADA, 0);
  const activeWallets = wallets.filter((w) => w.balanceADA > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portefeuilles</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les portefeuilles Cardano des utilisateurs
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un portefeuille
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Portefeuilles actifs
            </CardTitle>
            <Wallet className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : activeWallets.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sur {wallets.length} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total \u20b3</CardTitle>
            <TrendingUp className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₳ {isLoading ? "..." : totalBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">En circulation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total portefeuilles
            </CardTitle>
            <Activity className="h-5 w-5 text-[#004D73]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : wallets.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enregistrés</p>
          </CardContent>
        </Card>
      </div>

      {/* Wallets List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des portefeuilles</CardTitle>
              <CardDescription>
                Recherchez et gérez les portefeuilles Cardano
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
                placeholder="Rechercher par adresse..."
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
                        Propriétaire
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Adresse \u20b3
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Mobile Money
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Solde
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {wallets.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Aucun portefeuille trouvé
                        </td>
                      </tr>
                    ) : (
                      wallets.map((wallet) => (
                        <tr key={wallet.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              {getOwnerTypeLabel(wallet.ownerType)}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {wallet.ownerId.slice(0, 8)}...
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            {wallet.adaAddress.slice(0, 20)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {wallet.mobileMoneyNumber || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            ₳ {wallet.balanceADA.toFixed(2)}
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
                                    onClick={() => handleEdit(wallet)}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                    Modifier
                                  </button>
                                  <button
                                    onClick={() => handleDelete(wallet)}
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

      {/* Add Dialog */}
      <AddWalletDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmitAdd}
        isPending={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <EditWalletDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={updateData}
        onFormDataChange={setUpdateData}
        onSubmit={handleSubmitEdit}
        isPending={updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <DeleteWalletDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        walletAddress={selectedWallet?.adaAddress || null}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
