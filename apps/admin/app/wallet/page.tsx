"use client"

import * as React from "react"
import { Wallet, Search, Plus, Edit, Trash2, MoreVertical, Loader2, TrendingUp, Activity } from "lucide-react"
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

enum OwnerType {
  FARMER = "farmer",
  BUYER = "buyer",
  COOPERATIVE = "cooperative",
}

type WalletType = {
  id: string
  ownerType: OwnerType
  ownerId: string
  adaAddress: string
  mobileMoneyNumber?: string
  balanceADA: number
  createdAt: string
  updatedAt: string
}

type CreateWalletDto = {
  ownerType: OwnerType
  ownerId: string
  adaAddress: string
  mobileMoneyNumber?: string
  balanceADA?: number
}

type UpdateWalletDto = {
  adaAddress?: string
  mobileMoneyNumber?: string
  balanceADA?: number
}

export default function WalletPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedWallet, setSelectedWallet] = React.useState<WalletType | null>(null)
  const [formData, setFormData] = React.useState<CreateWalletDto>({
    ownerType: OwnerType.FARMER,
    ownerId: "",
    adaAddress: "",
    mobileMoneyNumber: "",
    balanceADA: 0,
  })
  const [updateData, setUpdateData] = React.useState<UpdateWalletDto>({})

  // Fetch wallets
  const { data: wallets = [], isLoading, refetch } = useApiQuery<WalletType[]>(
    ["wallets", searchQuery],
    `/wallets${searchQuery ? `?adaAddress=${encodeURIComponent(searchQuery)}` : ""}`
  )

  // Create mutation
  const createMutation = useApiMutation<WalletType, CreateWalletDto>(
    "/wallets",
    "POST",
    {
      onSuccess: () => {
        toast.success("Portefeuille ajouté avec succès")
        setIsAddDialogOpen(false)
        refetch()
      },
    }
  )

  // Update mutation
  const updateMutation = useApiMutation<WalletType, UpdateWalletDto>(
    () => `/wallets/${selectedWallet?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Portefeuille modifié avec succès")
        setIsEditDialogOpen(false)
        setSelectedWallet(null)
        refetch()
      },
    }
  )

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/wallets/${selectedWallet?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("Portefeuille supprimé avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedWallet(null)
        refetch()
      },
    }
  )

  const handleAdd = () => {
    setFormData({
      ownerType: OwnerType.FARMER,
      ownerId: "",
      adaAddress: "",
      mobileMoneyNumber: "",
      balanceADA: 0,
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (wallet: WalletType) => {
    setSelectedWallet(wallet)
    setUpdateData({
      adaAddress: wallet.adaAddress,
      mobileMoneyNumber: wallet.mobileMoneyNumber,
      balanceADA: wallet.balanceADA,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (wallet: WalletType) => {
    setSelectedWallet(wallet)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      balanceADA: formData.balanceADA || 0,
    })
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWallet) return
    updateMutation.mutate({
      ...updateData,
      balanceADA: updateData.balanceADA ? parseFloat(updateData.balanceADA.toString()) : undefined,
    })
  }

  const handleConfirmDelete = () => {
    if (!selectedWallet) return
    deleteMutation.mutate(undefined)
  }

  const getOwnerTypeLabel = (type: OwnerType) => {
    const labels: Record<OwnerType, string> = {
      [OwnerType.FARMER]: "Agriculteur",
      [OwnerType.BUYER]: "Acheteur",
      [OwnerType.COOPERATIVE]: "Coopérative",
    }
    return labels[type] || type
  }

  const totalBalance = wallets.reduce((sum, w) => sum + w.balanceADA, 0)
  const activeWallets = wallets.filter((w) => w.balanceADA > 0)

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
            <CardTitle className="text-sm font-medium">Portefeuilles actifs</CardTitle>
            <Wallet className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : activeWallets.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Sur {wallets.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total ADA</CardTitle>
            <TrendingUp className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿ {isLoading ? "..." : totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">En circulation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total portefeuilles</CardTitle>
            <Activity className="h-5 w-5 text-[#004D73]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : wallets.length}</div>
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
                        Adresse ADA
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
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Aucun portefeuille trouvé
                        </td>
                      </tr>
                    ) : (
                      wallets.map((wallet) => (
                        <tr key={wallet.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{getOwnerTypeLabel(wallet.ownerType)}</div>
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
                            ₿ {wallet.balanceADA.toFixed(2)}
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
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ajouter un portefeuille</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouveau portefeuille
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="ownerType">Type de propriétaire *</Label>
                <select
                  id="ownerType"
                  value={formData.ownerType}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerType: e.target.value as OwnerType })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  required
                >
                  <option value={OwnerType.FARMER}>Agriculteur</option>
                  <option value={OwnerType.BUYER}>Acheteur</option>
                  <option value={OwnerType.COOPERATIVE}>Coopérative</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ownerId">ID du propriétaire *</Label>
                <Input
                  id="ownerId"
                  value={formData.ownerId}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerId: e.target.value })
                  }
                  placeholder="UUID du propriétaire"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adaAddress">Adresse Cardano *</Label>
                <Input
                  id="adaAddress"
                  value={formData.adaAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, adaAddress: e.target.value })
                  }
                  placeholder="addr1..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mobileMoneyNumber">Numéro Mobile Money</Label>
                <Input
                  id="mobileMoneyNumber"
                  value={formData.mobileMoneyNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileMoneyNumber: e.target.value })
                  }
                  placeholder="+243812345678"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="balanceADA">Solde initial (ADA)</Label>
                <Input
                  id="balanceADA"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.balanceADA}
                  onChange={(e) =>
                    setFormData({ ...formData, balanceADA: parseFloat(e.target.value) || 0 })
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le portefeuille</DialogTitle>
            <DialogDescription>
              Modifiez les informations du portefeuille
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-adaAddress">Adresse Cardano</Label>
                <Input
                  id="edit-adaAddress"
                  value={updateData.adaAddress || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, adaAddress: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-mobileMoneyNumber">Numéro Mobile Money</Label>
                <Input
                  id="edit-mobileMoneyNumber"
                  value={updateData.mobileMoneyNumber || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, mobileMoneyNumber: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-balanceADA">Solde (ADA)</Label>
                <Input
                  id="edit-balanceADA"
                  type="number"
                  step="0.01"
                  min="0"
                  value={updateData.balanceADA || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, balanceADA: parseFloat(e.target.value) || 0 })
                  }
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
            <DialogTitle>Supprimer le portefeuille</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce portefeuille ? Cette action est
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
