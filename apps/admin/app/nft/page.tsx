"use client"

import * as React from "react"
import { Image, Search, Plus, Edit, Trash2, MoreVertical, Loader2 } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

enum NFTType {
  RECIPE = "recipe",
  TALE = "tale",
  SONG = "song",
  ART = "art",
  TRADITION = "tradition",
}

enum NFTStatus {
  DRAFT = "draft",
  MINTING = "minting",
  MINTED = "minted",
  LISTED = "listed",
  SOLD = "sold",
}

type NFT = {
  id: string
  creatorId: string
  type: NFTType
  title: string
  description?: string
  metadataURI: string
  priceADA: number
  revenueDistribution: {
    creatorPercent: number
    schoolFundPercent: number
    platformPercent: number
  }
  status: NFTStatus
  onChainHash?: string
  policyId?: string
  assetName?: string
  createdAt: string
  updatedAt: string
}

type CreateNFTDto = {
  creatorId: string
  type: NFTType
  title: string
  description?: string
  metadataURI: string
  priceADA: number
  revenueDistribution: {
    creatorPercent: number
    schoolFundPercent: number
    platformPercent: number
  }
}

type UpdateNFTDto = {
  title?: string
  description?: string
  metadataURI?: string
  priceADA?: number
  status?: NFTStatus
  revenueDistribution?: {
    creatorPercent: number
    schoolFundPercent: number
    platformPercent: number
  }
}

export default function NFTPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedNFT, setSelectedNFT] = React.useState<NFT | null>(null)
  const [formData, setFormData] = React.useState<CreateNFTDto>({
    creatorId: "",
    type: NFTType.RECIPE,
    title: "",
    description: "",
    metadataURI: "",
    priceADA: 0,
    revenueDistribution: {
      creatorPercent: 70,
      schoolFundPercent: 20,
      platformPercent: 10,
    },
  })
  const [updateData, setUpdateData] = React.useState<UpdateNFTDto>({})

  // Fetch NFTs
  const { data: nfts = [], isLoading, refetch } = useApiQuery<NFT[]>(
    ["nfts", searchQuery],
    `/nfts${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`
  )

  // Fetch users for creator select
  const { data: users = [] } = useApiQuery<{ id: string; firstName: string; lastName: string; email: string }[]>(
    ["users"],
    "/auth/users"
  )

  // Create mutation
  const createMutation = useApiMutation<NFT, CreateNFTDto>(
    "/nfts",
    "POST",
    {
      onSuccess: () => {
        toast.success("NFT ajouté avec succès")
        setIsAddDialogOpen(false)
        refetch()
      },
    }
  )

  // Update mutation
  const updateMutation = useApiMutation<NFT, UpdateNFTDto>(
    () => `/nfts/${selectedNFT?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("NFT modifié avec succès")
        setIsEditDialogOpen(false)
        setSelectedNFT(null)
        refetch()
      },
    }
  )

  // Delete mutation
  const deleteMutation = useApiMutation<void, void>(
    () => `/nfts/${selectedNFT?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("NFT supprimé avec succès")
        setIsDeleteDialogOpen(false)
        setSelectedNFT(null)
        refetch()
      },
    }
  )

  const handleAdd = () => {
    setFormData({
      creatorId: "",
      type: NFTType.RECIPE,
      title: "",
      description: "",
      metadataURI: "",
      priceADA: 0,
      revenueDistribution: {
        creatorPercent: 70,
        schoolFundPercent: 20,
        platformPercent: 10,
      },
    })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (nft: NFT) => {
    setSelectedNFT(nft)
    setUpdateData({
      title: nft.title,
      description: nft.description,
      metadataURI: nft.metadataURI,
      priceADA: nft.priceADA,
      status: nft.status,
      revenueDistribution: nft.revenueDistribution,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (nft: NFT) => {
    setSelectedNFT(nft)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      priceADA: parseFloat(formData.priceADA.toString()),
    })
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedNFT) return
    updateMutation.mutate({
      ...updateData,
      priceADA: updateData.priceADA ? parseFloat(updateData.priceADA.toString()) : undefined,
    })
  }

  const handleConfirmDelete = () => {
    if (!selectedNFT) return
    deleteMutation.mutate(undefined)
  }

  const getStatusBadge = (status: NFTStatus) => {
    const variants: Record<NFTStatus, { variant: "default" | "secondary" | "outline"; className: string; label: string }> = {
      [NFTStatus.LISTED]: { variant: "default", className: "bg-[#3A8F4C] text-white", label: "En vente" },
      [NFTStatus.MINTED]: { variant: "secondary", className: "bg-[#004D73] text-white", label: "Minté" },
      [NFTStatus.SOLD]: { variant: "secondary", className: "bg-[#5A3E36] text-white", label: "Vendu" },
      [NFTStatus.DRAFT]: { variant: "outline", className: "", label: "Brouillon" },
      [NFTStatus.MINTING]: { variant: "outline", className: "", label: "En minting" },
    }
    return variants[status] || variants[NFTStatus.DRAFT]
  }

  const getTypeLabel = (type: NFTType) => {
    const labels: Record<NFTType, string> = {
      [NFTType.RECIPE]: "Recette",
      [NFTType.TALE]: "Conte",
      [NFTType.SONG]: "Chant",
      [NFTType.ART]: "Art",
      [NFTType.TRADITION]: "Tradition",
    }
    return labels[type] || type
  }

  const activeNFTs = nfts.filter((n) => n.status === NFTStatus.LISTED)
  const totalRevenue = nfts.filter((n) => n.status === NFTStatus.SOLD).reduce((sum, n) => sum + n.priceADA, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">NFTs Culturels</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les NFTs culturels Lingala et leurs ventes
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-[#3A8F4C] hover:bg-[#2E7D32]">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un NFT
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">NFTs créés</CardTitle>
            <Image className="h-5 w-5 text-[#3A8F4C]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : nfts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus générés</CardTitle>
            <Image className="h-5 w-5 text-[#5A3E36]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₿ {isLoading ? "..." : totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pour fonds scolaires</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">NFTs en vente</CardTitle>
            <Image className="h-5 w-5 text-[#004D73]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : activeNFTs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Actuellement</p>
          </CardContent>
        </Card>
      </div>

      {/* NFTs List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste des NFTs</CardTitle>
              <CardDescription>
                Recherchez et gérez les NFTs culturels
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
                placeholder="Rechercher un NFT..."
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
                        Titre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Type
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
                    {nfts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          Aucun NFT trouvé
                        </td>
                      </tr>
                    ) : (
                      nfts.map((nft) => {
                        const statusBadge = getStatusBadge(nft.status)
                        return (
                          <tr key={nft.id} className="hover:bg-muted/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium">{nft.title}</div>
                              {nft.description && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {nft.description.slice(0, 50)}...
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {getTypeLabel(nft.type)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              ₿ {nft.priceADA.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={statusBadge.variant} className={statusBadge.className}>
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
                                <PopoverContent align="end" className="w-48 p-2">
                                  <div className="space-y-1">
                                    <button
                                      onClick={() => handleEdit(nft)}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                    >
                                      <Edit className="h-4 w-4" />
                                      Modifier
                                    </button>
                                    <button
                                      onClick={() => handleDelete(nft)}
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
                        )
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un NFT</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un nouveau NFT culturel
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="creatorId">Créateur *</Label>
                <Select
                  value={formData.creatorId}
                  onValueChange={(value) => setFormData({ ...formData, creatorId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un créateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as NFTType })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                  required
                >
                  <option value={NFTType.RECIPE}>Recette</option>
                  <option value={NFTType.TALE}>Conte</option>
                  <option value={NFTType.SONG}>Chant</option>
                  <option value={NFTType.ART}>Art</option>
                  <option value={NFTType.TRADITION}>Tradition</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metadataURI">URI des métadonnées *</Label>
                <Input
                  id="metadataURI"
                  value={formData.metadataURI}
                  onChange={(e) =>
                    setFormData({ ...formData, metadataURI: e.target.value })
                  }
                  placeholder="ipfs://..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priceADA">Prix (ADA) *</Label>
                <Input
                  id="priceADA"
                  type="number"
                  step="0.01"
                  min="0.000001"
                  value={formData.priceADA}
                  onChange={(e) =>
                    setFormData({ ...formData, priceADA: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
              <div className="grid gap-4">
                <Label>Distribution des revenus (%)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="creatorPercent">Créateur</Label>
                    <Input
                      id="creatorPercent"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.revenueDistribution.creatorPercent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          revenueDistribution: {
                            ...formData.revenueDistribution,
                            creatorPercent: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="schoolFundPercent">Fonds scolaire</Label>
                    <Input
                      id="schoolFundPercent"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.revenueDistribution.schoolFundPercent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          revenueDistribution: {
                            ...formData.revenueDistribution,
                            schoolFundPercent: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="platformPercent">Plateforme</Label>
                    <Input
                      id="platformPercent"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.revenueDistribution.platformPercent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          revenueDistribution: {
                            ...formData.revenueDistribution,
                            platformPercent: parseFloat(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                </div>
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le NFT</DialogTitle>
            <DialogDescription>
              Modifiez les informations du NFT
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Titre</Label>
                <Input
                  id="edit-title"
                  value={updateData.title || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <textarea
                  id="edit-description"
                  value={updateData.description || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, description: e.target.value })
                  }
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-metadataURI">URI des métadonnées</Label>
                <Input
                  id="edit-metadataURI"
                  value={updateData.metadataURI || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, metadataURI: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-priceADA">Prix (ADA)</Label>
                <Input
                  id="edit-priceADA"
                  type="number"
                  step="0.01"
                  min="0.000001"
                  value={updateData.priceADA || ""}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, priceADA: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Statut</Label>
                <select
                  id="edit-status"
                  value={updateData.status || NFTStatus.DRAFT}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, status: e.target.value as NFTStatus })
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                >
                  <option value={NFTStatus.DRAFT}>Brouillon</option>
                  <option value={NFTStatus.MINTING}>En minting</option>
                  <option value={NFTStatus.MINTED}>Minté</option>
                  <option value={NFTStatus.LISTED}>En vente</option>
                  <option value={NFTStatus.SOLD}>Vendu</option>
                </select>
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
            <DialogTitle>Supprimer le NFT</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le NFT{" "}
              <strong>{selectedNFT?.title}</strong> ? Cette action est
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
