"use client";

import { useState } from "react";
import { Search, Plus, Loader2, Sparkles, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useAuth } from "@/hooks/use-auth";
import { useWalletAtom } from "@/hooks/useWalletAtom";
import { NFTMintService } from "./services/nft-mint.service";
import { Wallet } from "lucide-react";

// Types et constantes
import {
  NFT,
  CreateNFTDto,
  UpdateNFTDto,
  MintNFTDto,
  NFTStatus,
} from "./types";
import { NFTStats } from "./components/nft-stats";
import { NFTTable } from "./components/nft-table";
import { NFTForm } from "./components/nft-form";
import { useNFTImages } from "./hooks/use-nft-images";
import { Badge } from "@/components/ui/badge";
import { useNFTForm } from "./hooks/use-nft-form";
import { nftApi } from "./services/nft-api";
import { isValidUUID } from "./utils";

// Composants de dialogue pour édition et suppression
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function NFTPage() {
  const { user } = useAuth();
  const { connected, wallet, connect, disconnect, walletName } =
    useWalletAtom();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMintDialogOpen, setIsMintDialogOpen] = useState(false);
  const [isListDialogOpen, setIsListDialogOpen] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [updateData, setUpdateData] = useState<UpdateNFTDto>({});
  const [mintData, setMintData] = useState<MintNFTDto>({
    onChainHash: "",
    policyId: "",
    assetName: "",
  });

  // Hook personnalisé pour le formulaire
  const {
    formData,
    imageFile,
    audioFile,
    imagePreview,
    audioPreview,
    updateFormData,
    handleImageSelect,
    handleAudioSelect,
    removeImage,
    removeAudio,
    resetForm,
  } = useNFTForm({
    initialCreatorId: user?.id || "",
  });

  // Fetch NFTs
  const {
    data: nfts = [],
    isLoading,
    refetch,
  } = useApiQuery<NFT[]>(
    ["nfts", searchQuery],
    `/nfts${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`
  );

  // Hook pour récupérer les images
  const { nftImages, imageStates } = useNFTImages(nfts);

  // Mutations
  const createMutation = useApiMutation<NFT, CreateNFTDto>("/nfts", "POST", {
    onSuccess: () => {
      toast.success("NFT ajouté avec succès");
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
  });

  const updateMutation = useApiMutation<NFT, UpdateNFTDto>(
    () => `/nfts/${selectedNFT?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("NFT modifié avec succès");
        setIsEditDialogOpen(false);
        setSelectedNFT(null);
        refetch();
      },
    }
  );

  const deleteMutation = useApiMutation<void, void>(
    () => `/nfts/${selectedNFT?.id}`,
    "DELETE",
    {
      onSuccess: () => {
        toast.success("NFT supprimé avec succès");
        setIsDeleteDialogOpen(false);
        setSelectedNFT(null);
        refetch();
      },
    }
  );

  const mintMutation = useApiMutation<NFT, MintNFTDto>(
    () => `/nfts/${selectedNFT?.id}/mint`,
    "POST",
    {
      onSuccess: () => {
        toast.success("NFT minté avec succès");
        setIsMintDialogOpen(false);
        setSelectedNFT(null);
        setMintData({ onChainHash: "", policyId: "", assetName: "" });
        setIsMinting(false);
        refetch();
      },
      onError: (error) => {
        setIsMinting(false);
        toast.error(`Erreur lors de l'enregistrement: ${error.message}`);
      },
    }
  );

  const listMutation = useApiMutation<NFT>(
    () => `/nfts/${selectedNFT?.id}/list`,
    "POST",
    {
      onSuccess: () => {
        toast.success("NFT mis en vente avec succès");
        setIsListDialogOpen(false);
        setSelectedNFT(null);
        refetch();
      },
      onError: (error) => {
        toast.error(`Erreur lors de la mise en vente: ${error.message}`);
      },
    }
  );

  // Handlers
  const handleAdd = () => {
    updateFormData({ creatorId: user?.id || "" });
    setIsAddDialogOpen(true);
  };

  const handleEdit = (nft: NFT) => {
    setSelectedNFT(nft);
    setUpdateData({
      title: nft.title,
      description: nft.description,
      metadataURI: nft.metadataURI,
      priceADA: Number(nft.priceADA || 0),
      status: nft.status,
      revenueDistribution: nft.revenueDistribution,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (nft: NFT) => {
    setSelectedNFT(nft);
    setIsDeleteDialogOpen(true);
  };

  const handleMint = (nft: NFT) => {
    setSelectedNFT(nft);
    setMintData({
      onChainHash: nft.onChainHash || "",
      policyId: nft.policyId || "",
      assetName: nft.assetName || "",
    });
    setIsMintDialogOpen(true);
  };

  const handleList = (nft: NFT) => {
    // Vérifier d'abord les statuts qui empêchent la mise en vente
    if (nft.status === NFTStatus.LISTED) {
      toast.info("Ce NFT est déjà en vente");
      return;
    }

    if (nft.status === NFTStatus.SOLD) {
      toast.error("Ce NFT a déjà été vendu");
      return;
    }

    // Vérifier que le NFT est minté (après avoir exclu LISTED et SOLD)
    if (nft.status !== NFTStatus.MINTED) {
      toast.error("Le NFT doit être minté avant d'être mis en vente");
      return;
    }

    setSelectedNFT(nft);
    setIsListDialogOpen(true);
  };

  const handleConfirmList = () => {
    if (!selectedNFT) return;
    listMutation.mutate(undefined);
  };

  const handleMintWithLucid = async () => {
    if (!selectedNFT) return;

    if (!connected || !wallet) {
      toast.error("Veuillez connecter votre wallet Cardano d'abord");
      return;
    }

    try {
      setIsMinting(true);
      toast.loading("Mint en cours sur la blockchain...", { id: "minting" });

      // Mint le NFT avec Lucid
      const result = await NFTMintService.mintNFT(
        wallet,
        selectedNFT,
        mintData.policyId || undefined,
        mintData.assetName || undefined
      );

      toast.success("NFT minté avec succès sur la blockchain!", {
        id: "minting",
      });

      // Enregistrer les informations dans l'API
      mintMutation.mutate({
        onChainHash: result.txHash,
        policyId: result.policyId,
        assetName: result.assetName,
      });
    } catch (error) {
      setIsMinting(false);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorMessageLower = errorMessage.toLowerCase();

      // Gestion spécifique pour l'annulation utilisateur
      if (
        errorMessageLower.includes("declined") ||
        errorMessageLower.includes("cancelled") ||
        errorMessageLower.includes("refused") ||
        errorMessageLower.includes("user declined") ||
        errorMessageLower.includes("user canceled")
      ) {
        toast.info("Mint annulé", {
          description: "Vous avez annulé la transaction.",
        });
        return;
      }

      toast.error(`Erreur lors du mint: ${errorMessage}`, {
        id: "minting",
        duration: 10000,
      });
      console.error("Mint error details:", error);
    }
  };

  const handleSubmitAdd = async (
    data: CreateNFTDto,
    image?: File,
    audio?: File
  ) => {
    try {
      // Validation
      if (!isValidUUID(data.creatorId)) {
        toast.error("Format UUID invalide pour le créateur");
        return;
      }

      setIsSubmitting(true);
      await nftApi.create(data, image, audio);
      toast.success("NFT ajouté avec succès", {
        description: `NFT "${data.title}" créé avec succès`,
      });
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: unknown) {
      const errorMessage =
        (error as { message?: string; errors?: string[] })?.message ||
        (error as { errors?: string[] })?.errors ||
        "Une erreur est survenue lors de la création du NFT";

      console.error("Erreur lors de la création du NFT:", error);

      toast.error("Erreur lors de la création du NFT", {
        description:
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage),
        duration: 8000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNFT) return;

    updateMutation.mutate({
      ...updateData,
      priceADA: updateData.priceADA
        ? parseFloat(updateData.priceADA.toString())
        : undefined,
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedNFT) return;
    deleteMutation.mutate(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
      <NFTStats nfts={nfts} isLoading={isLoading} />

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
            <NFTTable
              nfts={nfts}
              nftImages={nftImages}
              imageStates={imageStates}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMint={handleMint}
              onList={handleList}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <NFTForm
        isOpen={isAddDialogOpen}
        onClose={() => {
          setIsAddDialogOpen(false);
          resetForm();
        }}
        onSubmit={handleSubmitAdd}
        formData={formData}
        onFormDataChange={updateFormData}
        imageFile={imageFile}
        audioFile={audioFile}
        imagePreview={imagePreview}
        audioPreview={audioPreview}
        onImageSelect={(file) => {
          try {
            handleImageSelect(file);
          } catch (error: unknown) {
            toast.error(
              (error as { message?: string })?.message ||
                "Erreur lors de la sélection de l'image"
            );
          }
        }}
        onAudioSelect={(file) => {
          try {
            handleAudioSelect(file);
          } catch (error: unknown) {
            toast.error(
              (error as { message?: string })?.message ||
                "Erreur lors de la sélection de l'audio"
            );
          }
        }}
        onRemoveImage={removeImage}
        onRemoveAudio={removeAudio}
        isLoading={isSubmitting}
      />

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
                    setUpdateData({
                      ...updateData,
                      description: e.target.value,
                    })
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
                    setUpdateData({
                      ...updateData,
                      metadataURI: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-priceADA">Prix (\u20b3)</Label>
                <Input
                  id="edit-priceADA"
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  value={
                    updateData.priceADA !== undefined &&
                    updateData.priceADA !== null
                      ? updateData.priceADA.toString()
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "") {
                      setUpdateData({
                        ...updateData,
                        priceADA: undefined,
                      });
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue) && numValue >= 0) {
                        setUpdateData({
                          ...updateData,
                          priceADA: numValue,
                        });
                      }
                    }
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Statut</Label>
                <select
                  id="edit-status"
                  value={updateData.status || NFTStatus.DRAFT}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      status: e.target.value as NFTStatus,
                    })
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

      {/* List Dialog */}
      <Dialog open={isListDialogOpen} onOpenChange={setIsListDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Mettre en vente
            </DialogTitle>
            <DialogDescription>
              Voulez-vous mettre le NFT <strong>{selectedNFT?.title}</strong> en
              vente sur le marketplace ? Le NFT sera visible par tous les
              utilisateurs et pourra être acheté.
            </DialogDescription>
          </DialogHeader>
          {selectedNFT && (
            <div className="py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prix:</span>
                <span className="font-medium">
                  ₳ {Number(selectedNFT.priceADA || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Statut actuel:</span>
                <Badge variant="outline">{selectedNFT.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsListDialogOpen(false);
                setSelectedNFT(null);
              }}
              disabled={listMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmList}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={listMutation.isPending}
            >
              {listMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mise en vente...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Mettre en vente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mint Dialog */}
      <Dialog open={isMintDialogOpen} onOpenChange={setIsMintDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#3A8F4C]" />
              Mint le NFT
            </DialogTitle>
            <DialogDescription>
              Mint le NFT <strong>{selectedNFT?.title}</strong> directement sur
              la blockchain Cardano. Connectez votre wallet pour commencer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Blockfrost Configuration Check */}
            {typeof window !== "undefined" &&
            !process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY ? (
              <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
                <div className="flex items-center gap-3 mb-3">
                  <Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="font-semibold text-red-800 dark:text-red-200">
                    Configuration manquante
                  </p>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                  La clé API Blockfrost n&apos;est pas configurée.
                </p>
                <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                  Ajoutez{" "}
                  <code className="bg-red-100 dark:bg-red-900 px-1 rounded">
                    NEXT_PUBLIC_BLOCKFROST_API_KEY
                  </code>{" "}
                  dans votre fichier{" "}
                  <code className="bg-red-100 dark:bg-red-900 px-1 rounded">
                    .env.local
                  </code>{" "}
                  et redémarrez le serveur.
                </p>
              </div>
            ) : null}

            {/* Wallet Connection Status */}
            {!connected ? (
              <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                <div className="flex items-center gap-3 mb-3">
                  <Wallet className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Wallet non connecté
                  </p>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  Vous devez connecter votre wallet Cardano pour mint le NFT.
                </p>
                <Button
                  type="button"
                  onClick={async () => {
                    try {
                      // Simple detection of installed wallets from window.cardano
                      const cardano = (window as any).cardano;
                      if (!cardano) {
                        toast.error(
                          "Aucun wallet Cardano détecté. Installez Nami, Eternl ou un autre wallet Cardano."
                        );
                        return;
                      }

                      // Filter for likely wallet objects (checking for .enable or .apiVersion)
                      const walletNames = Object.keys(cardano).filter(
                        (key) =>
                          typeof cardano[key] === "object" &&
                          (cardano[key].enable || cardano[key].apiVersion) &&
                          !["ccvault", "typhon"].includes(key) // Exclude some checks if needed, but generally safe to try
                      );

                      if (walletNames.length === 0) {
                        toast.error("Aucun wallet compatible détecté.");
                        return;
                      }

                      // Connect to the first found wallet for simplicity, or could show selection
                      await connect(walletNames[0]);
                      toast.success(
                        `Wallet ${walletNames[0]} connecté avec succès`
                      );
                    } catch (error) {
                      toast.error(
                        `Erreur de connexion: ${error instanceof Error ? error.message : "Erreur inconnue"}`
                      );
                    }
                  }}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                  disabled={false} // Removed Blockfrost check dependency for button enabling
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connecter Wallet
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-200">
                        Wallet connecté
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        {walletName}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await disconnect();
                      toast.success("Wallet déconnecté");
                    }}
                  >
                    Déconnecter
                  </Button>
                </div>
              </div>
            )}

            {/* Optional: Manual Entry (for advanced users) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">
                  Optionnel: Entrée manuelle
                </span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mint-policyId">
                  Policy ID (optionnel - sera généré si vide)
                </Label>
                <Input
                  id="mint-policyId"
                  placeholder="Policy ID existant (vide = nouveau)"
                  value={mintData.policyId || ""}
                  onChange={(e) =>
                    setMintData({ ...mintData, policyId: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Si vide, un Policy ID sera généré automatiquement
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mint-assetName">
                  Nom de l&apos;asset (optionnel - sera généré si vide)
                </Label>
                <Input
                  id="mint-assetName"
                  placeholder="Nom de l'asset (vide = titre du NFT)"
                  value={mintData.assetName || ""}
                  onChange={(e) =>
                    setMintData({ ...mintData, assetName: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Si vide, un nom sera généré à partir du titre du NFT
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsMintDialogOpen(false);
                setMintData({ onChainHash: "", policyId: "", assetName: "" });
              }}
              disabled={isMinting || mintMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleMintWithLucid}
              className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
              disabled={
                !connected || !wallet || isMinting || mintMutation.isPending
              }
            >
              {isMinting || mintMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mint en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Mint
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
