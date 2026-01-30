"use client";

import * as React from "react";
import {
  Users,
  Search,
  Plus,
  Filter,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { EditFarmerDialog } from "@/components/farmers/edit-farmer-dialog";
import { AddFarmerDialog } from "@/components/farmers/add-farmer-dialog";
import { DeleteFarmerDialog } from "@/components/farmers/delete-farmer-dialog";
import { AuthContractService } from "@/services/lucid/auth-contract.service";
import { initLucid, connectWallet } from "@/lib/lucid";
import { useWalletAtom } from "@/hooks/useWalletAtom";

type Farmer = {
  id: string;
  name: string;
  phone: string;
  walletAddress?: string;
  mobileMoneyNumber?: string;
  mobileMoneyProvider?: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  cooperativeId?: string;
  createdAt: string;
  updatedAt: string;
};

type CreateFarmerDto = {
  name: string;
  phone: string;
  walletAddress?: string;
  mobileMoneyNumber?: string;
  mobileMoneyProvider?: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  cooperativeId?: string;
};

export default function FarmersPage() {
  const [searchQuery, setSearchQuery] = React.useState("");

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [selectedFarmer, setSelectedFarmer] = React.useState<Farmer | null>(
    null
  );
  const [formData, setFormData] = React.useState<CreateFarmerDto>({
    name: "",
    phone: "",
    walletAddress: "",
    mobileMoneyNumber: "",
    mobileMoneyProvider: "",
    address: "",
    city: "",
    state: "",
    latitude: -4.4419,
    longitude: 15.2663,
    cooperativeId: "",
  });

  // Fetch farmers
  const {
    data: farmers = [],
    isLoading,
    refetch,
  } = useApiQuery<Farmer[]>(
    ["farmers", searchQuery],
    `/farmers${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`
  );

  // Create mutation
  const createMutation = useApiMutation<Farmer, CreateFarmerDto>(
    "/farmers",
    "POST",
    {
      onSuccess: () => {
        toast.success("Agriculteur ajouté avec succès");
        setIsAddDialogOpen(false);
        refetch();
      },
    }
  );

  // Update mutation
  const updateMutation = useApiMutation<Farmer, CreateFarmerDto>(
    () => `/farmers/${selectedFarmer?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Agriculteur modifié avec succès");
        setIsEditDialogOpen(false);
        setSelectedFarmer(null);
        refetch();
      },
    }
  );

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/farmers/${selectedFarmer?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Agriculteur supprimé avec succès");
        setIsDeleteDialogOpen(false);
        setSelectedFarmer(null);
        refetch();
      },
    }
  );

  const handleAdd = () => {
    setFormData({
      name: "",
      phone: "",
      walletAddress: "",
      mobileMoneyNumber: "",
      mobileMoneyProvider: "",
      address: "",
      city: "",
      state: "",
      latitude: -4.4419,
      longitude: 15.2663,
      cooperativeId: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setFormData({
      name: farmer.name,
      phone: farmer.phone,
      walletAddress: farmer.walletAddress || "",
      mobileMoneyNumber: farmer.mobileMoneyNumber || "",
      mobileMoneyProvider: farmer.mobileMoneyProvider || "",
      address: farmer.address,
      city: farmer.city,
      state: farmer.state,
      latitude: farmer.latitude,
      longitude: farmer.longitude,
      cooperativeId: farmer.cooperativeId || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setIsDeleteDialogOpen(true);
  };

  // Import AuthContractService (make sure to add import at top)
  // import { AuthContractService } from "@/services/lucid/auth-contract.service";
  // import { initLucid } from "@/lib/lucid";
  // import { useWalletAtom } from "@/hooks/useWalletAtom";

  const { walletName, connected } = useWalletAtom();

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (connected && walletName && formData.walletAddress) {
      try {
        toast.info("Préparation de l'enregistrement Blockchain...");

        const lucid = await initLucid();

        // Connect to the specific wallet
        // @ts-ignore
        const walletApi = await window.cardano[walletName].enable();
        await connectWallet(lucid, walletApi);

        const authService = new AuthContractService(lucid);

        const txHash = await authService.registerFarmer({
          farmerAddress: formData.walletAddress,
          metadataHash: undefined,
        });

        toast.success(`Transaction envoyée: ${txHash.slice(0, 10)}...`);

        // Verify transaction success (optional wait)
        await lucid.awaitTx(txHash);
        toast.success("Enregistrement Blockchain confirmé !");
      } catch (error: any) {
        console.error("Blockchain Error:", error);
        toast.error(
          "Erreur enregistrement Blockchain: " + (error.message || error)
        );
        // We stop here to prevent DB inconsistency if blockchain fails
        return;
      }
    } else if (formData.walletAddress && !connected) {
      toast.warning(
        "Veuillez connecter votre wallet Admin pour enregistrer sur la blockchain"
      );
      return;
    }

    const data = {
      ...formData,
      latitude: parseFloat(formData.latitude.toString()),
      longitude: parseFloat(formData.longitude.toString()),
      walletAddress: formData.walletAddress || undefined,
      mobileMoneyNumber: formData.mobileMoneyNumber || undefined,
      mobileMoneyProvider: formData.mobileMoneyProvider || undefined,
      cooperativeId: formData.cooperativeId || undefined,
    };
    createMutation.mutate(data);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmer) return;
    const data = {
      ...formData,
      latitude: parseFloat(formData.latitude.toString()),
      longitude: parseFloat(formData.longitude.toString()),
      walletAddress: formData.walletAddress || undefined,
      mobileMoneyNumber: formData.mobileMoneyNumber || undefined,
      mobileMoneyProvider: formData.mobileMoneyProvider || undefined,
      cooperativeId: formData.cooperativeId || undefined,
    };
    updateMutation.mutate(data);
  };

  const handleConfirmDelete = () => {
    if (!selectedFarmer) return;
    deleteMutation.mutate(undefined);
  };

  const activeFarmers = farmers;
  const pendingCount = 0; // Vous pouvez ajouter un champ status si nécessaire

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
            <CardTitle className="text-sm font-medium">
              Total agriculteurs
            </CardTitle>
            <Users className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : activeFarmers.length}
            </div>
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
              {isLoading ? "..." : activeFarmers.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">100% du total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : pendingCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">0% du total</p>
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
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Ville
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {activeFarmers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-muted-foreground"
                        >
                          Aucun agriculteur trouvé
                        </td>
                      </tr>
                    ) : (
                      activeFarmers.map((farmer: Farmer) => (
                        <tr key={farmer.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium">
                                {farmer.name}
                              </div>
                              {farmer.walletAddress && (
                                <div className="text-xs text-muted-foreground font-mono">
                                  {farmer.walletAddress.slice(0, 20)}...
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {farmer.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {farmer.address}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {farmer.city}, {farmer.state}
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
      <AddFarmerDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmitAdd}
        isPending={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <EditFarmerDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleSubmitEdit}
        isPending={updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <DeleteFarmerDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        farmerName={selectedFarmer?.name || null}
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
