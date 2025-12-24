"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Filter,
  SlidersHorizontal,
  ShoppingCart,
  Star,
  TrendingUp,
  Package,
  Users,
  Grid3x3,
  List,
  X,
  Sparkles,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Coins,
  Wallet,
  Image as ImageIcon,
  Zap,
  Crown,
  Gem,
  Flame,
  Copy,
  Check,
  Calendar,
  Loader2,
} from "lucide-react";
import { ImageGallery } from "@/components/image-gallery";
import { AudioPlayer } from "@/components/audio-player";
import { cn } from "@/lib/utils";
import { useCardanoWallet } from "@/hooks/use-cardano-wallet";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiPost } from "@/hooks/use-api-mutation";
import { NFT, NFTType, NFTStatus } from "@/types/nft";
import { useNFTImages } from "@/hooks/use-nft-images";
import { NFTImageSkeleton } from "@/components/nft-image-skeleton";
import { ipfsUriToHttpUrl } from "@/utils/ipfs";
import { NFTPurchaseService } from "@/services/nft-purchase.service";
import { useAtomValue } from "jotai";
import { walletAtom } from "@/lib/wallet";
import { toast } from "sonner";

// Types pour les filtres
type NFTCollection =
  | "all"
  | "agriculture"
  | "culture"
  | "art"
  | "collectibles"
  | "land";
type SortOption = "recent" | "price-asc" | "price-desc" | "popular";

// Fonctions utilitaires pour mapper les types API vers l'affichage
const getCollectionFromType = (type: NFTType): NFTCollection => {
  switch (type) {
    case NFTType.RECIPE:
    case NFTType.TALE:
    case NFTType.SONG:
    case NFTType.TRADITION:
      return "culture";
    case NFTType.ART:
      return "art";
    default:
      return "agriculture";
  }
};

const getTypeLabel = (type: NFTType): string => {
  const labels: Record<NFTType, string> = {
    [NFTType.RECIPE]: "Recette",
    [NFTType.TALE]: "Conte",
    [NFTType.SONG]: "Chant",
    [NFTType.ART]: "Art",
    [NFTType.TRADITION]: "Tradition",
  };
  return labels[type] || type;
};

type Rarity = "common" | "rare" | "epic" | "legendary";

const getRarityFromStatus = (status: NFTStatus): Rarity => {
  switch (status) {
    case NFTStatus.SOLD:
      return "legendary";
    case NFTStatus.MINTED:
      return "epic";
    case NFTStatus.LISTED:
      return "rare";
    default:
      return "common";
  }
};

const getRarityColor = (rarity: Rarity) => {
  switch (rarity) {
    case "legendary":
      return "text-[#F2C94C] bg-[#F2C94C]/10 dark:bg-[#F2C94C]/20 border-[#F2C94C]/30";
    case "epic":
      return "text-purple-600 bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700";
    case "rare":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700";
    case "common":
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700";
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-800";
  }
};

const getRarityIcon = (rarity: Rarity) => {
  switch (rarity) {
    case "legendary":
      return <Crown className="w-4 h-4" />;
    case "epic":
      return <Gem className="w-4 h-4" />;
    case "rare":
      return <Zap className="w-4 h-4" />;
    case "common":
      return <Flame className="w-4 h-4" />;
    default:
      return <Star className="w-4 h-4" />;
  }
};

const getRarityLabel = (rarity: Rarity) => {
  switch (rarity) {
    case "legendary":
      return "Légendaire";
    case "epic":
      return "Épique";
    case "rare":
      return "Rare";
    case "common":
      return "Commun";
    default:
      return rarity;
  }
};

export default function NFTMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] =
    useState<NFTCollection>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ [key: string]: number }>(
    {}
  );
  interface NFTMetadata {
    audio?: string;
    attributes?: Array<{
      trait_type?: string;
      name?: string;
      value: string | number;
    }>;
    [key: string]: unknown;
  }
  const [nftMetadata, setNftMetadata] = useState<Record<string, NFTMetadata>>(
    {}
  );
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [pendingPurchase, setPendingPurchase] = useState(false);
  const productsPerPage = 12;

  // Mutation pour créer l'achat NFT
  const purchaseMutation = useApiPost<
    { id: string; transactionHash: string },
    { nftId: string; buyerId: string; transactionHash?: string }
  >("/nft-purchases", {
    onSuccess: () => {
      toast.success("NFT acheté avec succès!");
      setIsNFTModalOpen(false);
      setShowPurchaseDialog(false);
      // Invalider les queries pour rafraîchir les données
      window.location.reload(); // Simple refresh pour l'instant
    },
    onError: (error) => {
      toast.error(
        `Erreur lors de l'enregistrement de l'achat: ${error.message}`
      );
    },
  });

  // Wallet
  const { connected, connect, wallets } = useCardanoWallet();
  const walletState = useAtomValue(walletAtom);
  const lucid = walletState.lucid;
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Récupérer les NFTs depuis l'API
  const {
    data: nfts = [],
    isLoading,
    error,
  } = useApiQuery<NFT[]>({
    queryKey: ["nfts", searchQuery],
    endpoint: `/nfts${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`,
  });

  // Récupérer les images depuis IPFS
  const { nftImages, imageStates } = useNFTImages(nfts);

  // Filtres avancés
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedRarity, setSelectedRarity] = useState<string>("all");

  // Filtrer et trier les NFT
  const filteredNFTs = nfts
    .filter((nft) => {
      // Filtrer uniquement les NFTs en vente
      if (nft.status !== NFTStatus.LISTED) return false;

      const matchesSearch =
        nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        nft.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        false;
      const nftCollection = getCollectionFromType(nft.type);
      const matchesCollection =
        selectedCollection === "all" || nftCollection === selectedCollection;
      const matchesPrice =
        (!minPrice || Number(nft.priceADA || 0) >= Number(minPrice)) &&
        (!maxPrice || Number(nft.priceADA || 0) <= Number(maxPrice));
      const rarity = getRarityFromStatus(nft.status);
      const matchesRarity =
        selectedRarity === "all" || rarity === selectedRarity;
      return (
        matchesSearch && matchesCollection && matchesPrice && matchesRarity
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return Number(a.priceADA || 0) - Number(b.priceADA || 0);
        case "price-desc":
          return Number(b.priceADA || 0) - Number(a.priceADA || 0);
        case "popular":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredNFTs.length / productsPerPage);
  const paginatedNFTs = filteredNFTs.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Fonction pour gérer l'achat d'un NFT
  const handlePurchaseNFT = async () => {
    if (!selectedNFT) {
      return;
    }

    // Si le wallet n'est pas connecté, ouvrir le modal de connexion
    if (!lucid || !connected) {
      setPendingPurchase(true); // Marquer qu'un achat est en attente
      if (wallets && wallets.length > 0) {
        // Si un seul wallet disponible, connecter directement
        if (wallets.length === 1) {
          try {
            await connect(wallets[0].name);
            toast.success("Wallet connecté avec succès!");
            // L'achat continuera automatiquement via useEffect
            return;
          } catch (error) {
            setPendingPurchase(false);
            toast.error(
              `Erreur lors de la connexion: ${error instanceof Error ? error.message : "Erreur inconnue"}`
            );
            return;
          }
        } else {
          // Sinon, ouvrir le modal de sélection
          setShowWalletModal(true);
          return;
        }
      } else {
        setPendingPurchase(false);
        toast.error(
          "Aucun wallet Cardano détecté. Veuillez installer un wallet comme Nami, Eternl ou Flint."
        );
        return;
      }
    }

    // Si on arrive ici, le wallet est connecté, procéder à l'achat
    await executePurchase();
  };

  // Fonction pour exécuter l'achat
  const executePurchase = useCallback(async () => {
    if (!selectedNFT || !lucid || !connected) {
      return;
    }

    if (!walletState.address) {
      toast.error("Adresse wallet non disponible");
      setPendingPurchase(false);
      return;
    }

    try {
      setIsPurchasing(true);
      setPendingPurchase(false);
      toast.loading("Traitement de l'achat...", { id: "purchasing" });

      // Pour l'instant, on utilise l'adresse du wallet connecté comme adresse du vendeur
      // En production, il faudrait récupérer l'adresse du créateur depuis l'API
      const sellerAddress = walletState.address; // TODO: Récupérer depuis l'API

      // Effectuer le paiement avec Lucid
      const result = await NFTPurchaseService.purchaseNFT(
        lucid,
        selectedNFT,
        sellerAddress
      );

      toast.success("Paiement effectué avec succès!", { id: "purchasing" });

      // Enregistrer l'achat dans l'API
      purchaseMutation.mutate({
        nftId: selectedNFT.id,
        buyerId: walletState.address, // Utiliser l'adresse comme buyerId temporairement
        transactionHash: result.txHash,
      });
    } catch (error) {
      setIsPurchasing(false);
      setPendingPurchase(false);
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      toast.error(`Erreur lors de l'achat: ${errorMessage}`, {
        id: "purchasing",
        duration: 10000,
      });
      console.error("Purchase error details:", error);
    }
  }, [selectedNFT, lucid, connected, walletState.address, purchaseMutation]);

  // Effectuer l'achat automatiquement après connexion du wallet
  useEffect(() => {
    if (
      pendingPurchase &&
      connected &&
      lucid &&
      selectedNFT &&
      walletState.address
    ) {
      // Attendre un peu pour que le wallet soit complètement initialisé
      const timer = setTimeout(() => {
        executePurchase();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    pendingPurchase,
    connected,
    lucid,
    selectedNFT,
    walletState.address,
    executePurchase,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [
    searchQuery,
    selectedCollection,
    sortBy,
    minPrice,
    maxPrice,
    selectedRarity,
  ]);

  const toggleFavorite = (nftId: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nftId)) {
        newSet.delete(nftId);
      } else {
        newSet.add(nftId);
      }
      return newSet;
    });
  };

  // Récupérer les métadonnées pour le NFT sélectionné
  useEffect(() => {
    if (selectedNFT && selectedNFT.metadataURI) {
      const fetchMetadata = async () => {
        try {
          const metadataUrl = ipfsUriToHttpUrl(selectedNFT.metadataURI);
          const response = await fetch(metadataUrl);
          if (response.ok) {
            const metadata = await response.json();
            setNftMetadata((prev) => ({
              ...prev,
              [selectedNFT.id]: metadata,
            }));
          }
        } catch (error) {
          console.error("Error fetching metadata:", error);
        }
      };
      fetchMetadata();
    }
  }, [selectedNFT]);

  const openNFTModal = (nft: NFT) => {
    setSelectedNFT(nft);
    setIsNFTModalOpen(true);
  };

  const handleCopyHash = () => {
    if (selectedNFT) {
      const hash = selectedNFT.onChainHash || selectedNFT.metadataURI;
      if (hash) {
        navigator.clipboard.writeText(hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const collections: { value: NFTCollection; label: string; icon: string }[] = [
    { value: "all", label: "Tous", icon: "📦" },
    { value: "culture", label: "Culture Lingala", icon: "📚" },
    { value: "agriculture", label: "Agriculture", icon: "🌾" },
    { value: "art", label: "Art", icon: "🎨" },
    { value: "collectibles", label: "Collection", icon: "💎" },
    { value: "land", label: "Terrains", icon: "🏞️" },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "recent", label: "Plus récent" },
    { value: "price-asc", label: "Prix croissant" },
    { value: "price-desc", label: "Prix décroissant" },
    { value: "popular", label: "Plus populaire" },
  ];

  const rarities: { value: string; label: string }[] = [
    { value: "all", label: "Toutes" },
    { value: "legendary", label: "Légendaire" },
    { value: "epic", label: "Épique" },
    { value: "rare", label: "Rare" },
    { value: "common", label: "Commun" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#004D73]">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#3A8F4C]/10 to-[#004D73]/10 dark:from-[#3A8F4C]/20 dark:to-[#004D73]/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 border border-[#3A8F4C]/30 mb-4">
              <Sparkles className="w-4 h-4 text-[#3A8F4C]" />
              <span className="text-sm font-medium text-[#3A8F4C]">
                Marketplace NFT - Lingala Chain
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#5A3E36] dark:text-white mb-4">
              NFTs Culturels & Agricoles
            </h1>
            <p className="text-xl text-[#004D73] dark:text-white/80 max-w-2xl mx-auto mb-4">
              Découvrez et collectionnez des NFTs uniques : recettes, contes,
              chants lingala et produits agricoles certifiés
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F2C94C]/10 dark:bg-[#F2C94C]/20 border border-[#F2C94C]/30">
              <span className="text-2xl">🎓</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#5A3E36] dark:text-white">
                  Financement de l&apos;éducation
                </p>
                <p className="text-xs text-[#004D73] dark:text-white/70">
                  Les revenus des NFTs culturels financent la scolarité des
                  enfants d&apos;agriculteurs
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#004D73]/60 dark:text-white/60" />
              <Input
                type="text"
                placeholder="Rechercher un NFT, un créateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 border-[#004D73]/20 dark:border-white/20 focus:border-[#3A8F4C] dark:focus:border-[#3A8F4C] rounded-xl bg-white dark:bg-[#003D5C] text-[#5A3E36] dark:text-white/90"
              />
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {/* Collection Filters */}
            <div className="flex items-center gap-2 flex-wrap justify-center flex-1">
              {collections.map((col) => (
                <Button
                  key={col.value}
                  variant={
                    selectedCollection === col.value ? "default" : "outline"
                  }
                  onClick={() => setSelectedCollection(col.value)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    selectedCollection === col.value
                      ? "bg-[#3A8F4C] text-white border-[#3A8F4C] hover:bg-[#2E7D32]"
                      : "border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10 hover:border-[#3A8F4C] dark:hover:border-[#3A8F4C]"
                  )}
                >
                  <span className="mr-2">{col.icon}</span>
                  {col.label}
                </Button>
              ))}
            </div>

            {/* View Mode & Sort */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 border border-[#004D73]/20 dark:border-white/20 rounded-lg p-1 bg-white dark:bg-[#003D5C]">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-8 w-8",
                    viewMode === "grid"
                      ? "bg-[#3A8F4C] text-white hover:bg-[#2E7D32]"
                      : "text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                  )}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "h-8 w-8",
                    viewMode === "list"
                      ? "bg-[#3A8F4C] text-white hover:bg-[#2E7D32]"
                      : "text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Filter Button */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all border-[#004D73]/20 dark:border-white/20",
                  showFilters
                    ? "bg-[#3A8F4C] text-white border-[#3A8F4C]"
                    : "text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                )}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 rounded-lg border border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#003D5C] text-[#5A3E36] dark:text-white/90 text-sm font-medium focus:outline-none focus:border-[#3A8F4C] dark:focus:border-[#3A8F4C]"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <Card className="mb-8 bg-white/90 dark:bg-[#003D5C]/90 border-[#004D73]/20 dark:border-white/20 backdrop-blur-sm animate-slide-up">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#5A3E36] dark:text-white">
                    Filtres avancés
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowFilters(false)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#5A3E36] dark:text-white/90">
                      Prix (₳)
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                      />
                      <span className="text-[#004D73] dark:text-white/70">
                        -
                      </span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                      />
                    </div>
                  </div>

                  {/* Rarity */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#5A3E36] dark:text-white/90">
                      Rareté
                    </Label>
                    <select
                      value={selectedRarity}
                      onChange={(e) => setSelectedRarity(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90 text-sm focus:outline-none focus:border-[#3A8F4C] dark:focus:border-[#3A8F4C]"
                    >
                      {rarities.map((rarity) => (
                        <option key={rarity.value} value={rarity.value}>
                          {rarity.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-6">
            <Card className="bg-white/80 dark:bg-[#003D5C]/80 border-[#004D73]/20 dark:border-white/20">
              <CardContent className="p-4 text-center">
                <ImageIcon className="w-6 h-6 text-[#3A8F4C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">
                  {isLoading ? "..." : filteredNFTs.length}
                </p>
                <p className="text-xs text-[#004D73] dark:text-white/70">
                  NFT disponibles
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-[#003D5C]/80 border-[#004D73]/20 dark:border-white/20">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-[#3A8F4C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">
                  {isLoading
                    ? "..."
                    : new Set(nfts.map((n) => n.creatorId)).size}
                </p>
                <p className="text-xs text-[#004D73] dark:text-white/70">
                  Créateurs
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-[#003D5C]/80 border-[#004D73]/20 dark:border-white/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-[#3A8F4C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">
                  {isLoading
                    ? "..."
                    : nfts.filter((n) => n.status === NFTStatus.LISTED).length}
                </p>
                <p className="text-xs text-[#004D73] dark:text-white/70">
                  En vente
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-[#003D5C]/80 border-[#004D73]/20 dark:border-white/20">
              <CardContent className="p-4 text-center">
                <Coins className="w-6 h-6 text-[#3A8F4C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">
                  {isLoading
                    ? "..."
                    : filteredNFTs
                        .reduce(
                          (sum, nft) => sum + Number(nft.priceADA || 0),
                          0
                        )
                        .toFixed(2)}
                </p>
                <p className="text-xs text-[#004D73] dark:text-white/70">
                  Volume total (₳)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Education Impact Banner */}
          {filteredNFTs.filter(
            (nft) =>
              nft.type === NFTType.RECIPE ||
              nft.type === NFTType.TALE ||
              nft.type === NFTType.SONG ||
              nft.type === NFTType.TRADITION
          ).length > 0 && (
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-[#F2C94C]/20 to-[#3A8F4C]/20 dark:from-[#F2C94C]/30 dark:to-[#3A8F4C]/30 border-[#F2C94C]/30 dark:border-[#F2C94C]/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-[#F2C94C]/20 dark:bg-[#F2C94C]/30">
                    <span className="text-4xl">🎓</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#5A3E36] dark:text-white mb-1">
                      Impact Éducatif des NFTs Culturels
                    </h3>
                    <p className="text-sm text-[#004D73] dark:text-white/80 mb-2">
                      Les NFTs culturels Lingala (recettes, contes, chants,
                      traditions) financent directement la scolarité des enfants
                      d&apos;agriculteurs congolais.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-[#3A8F4C] dark:text-[#3A8F4C]">
                          {
                            filteredNFTs.filter(
                              (nft) =>
                                nft.type === NFTType.RECIPE ||
                                nft.type === NFTType.TALE ||
                                nft.type === NFTType.SONG ||
                                nft.type === NFTType.TRADITION
                            ).length
                          }{" "}
                          NFTs culturels
                        </p>
                        <p className="text-xs text-[#004D73] dark:text-white/70">
                          Avec financement éducation
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-[#3A8F4C] dark:text-[#3A8F4C]">
                          {filteredNFTs
                            .filter(
                              (nft) =>
                                nft.type === NFTType.RECIPE ||
                                nft.type === NFTType.TALE ||
                                nft.type === NFTType.SONG ||
                                nft.type === NFTType.TRADITION
                            )
                            .reduce(
                              (sum, nft) =>
                                sum +
                                (Number(
                                  nft.revenueDistribution.schoolFundPercent || 0
                                ) *
                                  Number(nft.priceADA || 0)) /
                                  100,
                              0
                            )
                            .toFixed(2)}{" "}
                          ADA
                        </p>
                        <p className="text-xs text-[#004D73] dark:text-white/70">
                          Total alloué à l&apos;éducation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* NFTs Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#004D73]">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#5A3E36] dark:text-white">
                {filteredNFTs.length}{" "}
                {filteredNFTs.length === 1 ? "NFT trouvé" : "NFT trouvés"}
              </h2>
              {filteredNFTs.length > 0 && (
                <p className="text-sm text-[#004D73] dark:text-white/70 mt-1">
                  Page {currentPage} sur {totalPages}
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3A8F4C]" />
            </div>
          ) : filteredNFTs.length === 0 ? (
            <Card className="p-12 text-center bg-muted/30 dark:bg-[#003D5C]/50 border-[#004D73]/20 dark:border-white/20">
              <CardContent>
                <ImageIcon className="w-16 h-16 text-[#004D73]/40 dark:text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#5A3E36] dark:text-white mb-2">
                  Aucun NFT trouvé
                </h3>
                <p className="text-[#004D73] dark:text-white/70 mb-4">
                  {error
                    ? "Erreur lors du chargement des NFTs"
                    : "Essayez de modifier vos critères de recherche"}
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCollection("all");
                    setMinPrice("");
                    setMaxPrice("");
                    setSelectedRarity("all");
                  }}
                  className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white"
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* NFTs Grid/List */}
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                )}
              >
                {paginatedNFTs.map((nft) => {
                  const imageUrl = nftImages[nft.id];
                  const imageState = imageStates[nft.id] || "loading";
                  const rarity = getRarityFromStatus(nft.status);
                  const collection = getCollectionFromType(nft.type);
                  const educationFund =
                    (Number(nft.revenueDistribution.schoolFundPercent || 0) *
                      Number(nft.priceADA || 0)) /
                    100;

                  return (
                    <Card
                      key={nft.id}
                      className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#003D5C] cursor-pointer"
                      onClick={() => openNFTModal(nft)}
                    >
                      <CardContent className="p-0">
                        {/* NFT Image */}
                        <div className="relative h-64 bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 rounded-t-lg overflow-hidden">
                          {imageState === "loading" ? (
                            <NFTImageSkeleton />
                          ) : imageState === "loaded" && imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={nft.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-8xl transition-transform duration-300 group-hover:scale-110">
                                {nft.type === NFTType.RECIPE
                                  ? "🍠"
                                  : nft.type === NFTType.TALE
                                    ? "📖"
                                    : nft.type === NFTType.SONG
                                      ? "🎵"
                                      : nft.type === NFTType.ART
                                        ? "🎨"
                                        : "🌾"}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                            <div
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border",
                                getRarityColor(rarity)
                              )}
                            >
                              {getRarityIcon(rarity)}
                              {getRarityLabel(rarity)}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(nft.id);
                              }}
                              className={cn(
                                "h-8 w-8 bg-white/90 dark:bg-[#003D5C]/90 backdrop-blur-sm",
                                favorites.has(nft.id)
                                  ? "text-red-500 hover:text-red-600"
                                  : "text-[#5A3E36] dark:text-white/90"
                              )}
                            >
                              <Heart
                                className={cn(
                                  "w-4 h-4",
                                  favorites.has(nft.id) && "fill-current"
                                )}
                              />
                            </Button>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* NFT Info */}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-semibold text-lg text-[#5A3E36] dark:text-white mb-1 line-clamp-1">
                              {nft.title}
                            </h3>
                            <p className="text-xs text-[#004D73] dark:text-white/70 capitalize mb-2">
                              {getTypeLabel(nft.type)}
                            </p>
                          </div>

                          {/* Creator & Info */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-xs text-[#004D73] dark:text-white/70">
                              <Users className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">
                                Créateur:{" "}
                                {nft.creator
                                  ? `${nft.creator.firstName} ${nft.creator.lastName}`
                                  : nft.creatorId.slice(0, 8) + "..."}
                              </span>
                            </div>
                            {(nft.type === NFTType.RECIPE ||
                              nft.type === NFTType.TALE ||
                              nft.type === NFTType.SONG ||
                              nft.type === NFTType.TRADITION) &&
                              educationFund > 0 && (
                                <div className="flex items-center gap-2 text-xs text-[#3A8F4C] dark:text-[#3A8F4C] font-medium">
                                  <span className="text-base">🎓</span>
                                  <span>
                                    {educationFund.toFixed(2)} ADA pour
                                    l&apos;éducation
                                  </span>
                                </div>
                              )}
                            <div className="flex items-center gap-2 text-xs text-[#004D73] dark:text-white/70">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Standard CIP-25</span>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between pt-2 border-t border-[#004D73]/10 dark:border-white/10">
                            <div>
                              <p className="text-2xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]">
                                ₳ {Number(nft.priceADA || 0).toFixed(2)}
                              </p>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                openNFTModal(nft);
                              }}
                              className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white rounded-lg px-4 py-2"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Acheter
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            onClick={() => setCurrentPage(page)}
                            className={cn(
                              currentPage === page
                                ? "bg-[#3A8F4C] text-white border-[#3A8F4C]"
                                : "border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90"
                            )}
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="text-[#004D73] dark:text-white/70"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    }
                  )}

                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* NFT Detail Modal */}
      <Dialog open={isNFTModalOpen} onOpenChange={setIsNFTModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
          {selectedNFT && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold text-[#5A3E36] dark:text-white mb-2">
                      {selectedNFT.title}
                    </DialogTitle>
                    <DialogDescription className="text-[#004D73] dark:text-white/70">
                      {selectedNFT.description || "NFT culturel ou agricole"}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(selectedNFT.id)}
                      className={cn(
                        "h-9 w-9",
                        favorites.has(selectedNFT.id)
                          ? "text-red-500 hover:text-red-600"
                          : "text-[#5A3E36] dark:text-white/90"
                      )}
                    >
                      <Heart
                        className={cn(
                          "w-5 h-5",
                          favorites.has(selectedNFT.id) && "fill-current"
                        )}
                      />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* NFT Image Gallery */}
                <div className="relative">
                  {(() => {
                    const imageUrl = nftImages[selectedNFT.id];
                    const imageState = imageStates[selectedNFT.id] || "loading";
                    const metadata = nftMetadata[selectedNFT.id];
                    const images = imageUrl ? [imageUrl] : [];

                    if (imageState === "loading") {
                      return <NFTImageSkeleton />;
                    }

                    return (
                      <>
                        {images.length > 0 ? (
                          <ImageGallery
                            images={images}
                            isPlaying={
                              selectedNFT.type === NFTType.SONG &&
                              playingAudio === selectedNFT.id
                            }
                          />
                        ) : (
                          <div className="w-full h-64 bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 flex items-center justify-center rounded-lg">
                            <span className="text-8xl">
                              {selectedNFT.type === NFTType.RECIPE
                                ? "🍠"
                                : selectedNFT.type === NFTType.TALE
                                  ? "📖"
                                  : selectedNFT.type === NFTType.SONG
                                    ? "🎵"
                                    : selectedNFT.type === NFTType.ART
                                      ? "🎨"
                                      : "🌾"}
                            </span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 z-10">
                          <div
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border",
                              getRarityColor(
                                getRarityFromStatus(selectedNFT.status)
                              )
                            )}
                          >
                            {getRarityIcon(
                              getRarityFromStatus(selectedNFT.status)
                            )}
                            {getRarityLabel(
                              getRarityFromStatus(selectedNFT.status)
                            )}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Audio Player for Songs */}
                {selectedNFT.type === NFTType.SONG &&
                  nftMetadata[selectedNFT.id]?.audio && (
                    <Card className="bg-gradient-to-r from-[#3A8F4C]/10 to-[#004D73]/10 dark:from-[#3A8F4C]/20 dark:to-[#004D73]/30 border-[#3A8F4C]/30 dark:border-[#3A8F4C]/50">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 rounded-full bg-[#3A8F4C]/20 dark:bg-[#3A8F4C]/30">
                            <span className="text-3xl">🎵</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-[#5A3E36] dark:text-white mb-1">
                              Écouter le chant
                            </h3>
                            <p className="text-sm text-[#004D73] dark:text-white/70">
                              Enregistrement audio authentique de ce chant
                              traditionnel lingala
                            </p>
                          </div>
                        </div>
                        <AudioPlayer
                          audioUrl={ipfsUriToHttpUrl(
                            nftMetadata[selectedNFT.id]?.audio ?? ""
                          )}
                          nftId={selectedNFT.id}
                          isPlaying={playingAudio === selectedNFT.id}
                          onPlay={() => setPlayingAudio(selectedNFT.id)}
                          onPause={() => setPlayingAudio(null)}
                          progress={audioProgress[selectedNFT.id] || 0}
                          onProgressChange={(progress) =>
                            setAudioProgress((prev) => ({
                              ...prev,
                              [selectedNFT.id]: progress,
                            }))
                          }
                        />
                      </CardContent>
                    </Card>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <Card className="bg-muted/30 dark:bg-white/5 border-[#004D73]/20 dark:border-white/20">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-[#5A3E36] dark:text-white mb-3">
                          Informations
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                            <div>
                              <p className="text-xs text-[#004D73] dark:text-white/60">
                                Créateur
                              </p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">
                                {selectedNFT.creator
                                  ? `${selectedNFT.creator.firstName} ${selectedNFT.creator.lastName}`
                                  : selectedNFT.creatorId.slice(0, 8) + "..."}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                            <div>
                              <p className="text-xs text-[#004D73] dark:text-white/60">
                                Type
                              </p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">
                                {getTypeLabel(selectedNFT.type)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                            <div>
                              <p className="text-xs text-[#004D73] dark:text-white/60">
                                Date de création
                              </p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">
                                {new Date(
                                  selectedNFT.createdAt
                                ).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                          {(selectedNFT.type === NFTType.RECIPE ||
                            selectedNFT.type === NFTType.TALE ||
                            selectedNFT.type === NFTType.SONG ||
                            selectedNFT.type === NFTType.TRADITION) && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F2C94C]/10 dark:bg-[#F2C94C]/20 border border-[#F2C94C]/30">
                              <span className="text-2xl">🎓</span>
                              <div>
                                <p className="text-xs text-[#004D73] dark:text-white/60">
                                  Financement éducation
                                </p>
                                <p className="text-sm font-semibold text-[#3A8F4C] dark:text-[#3A8F4C]">
                                  {(
                                    (Number(
                                      selectedNFT.revenueDistribution
                                        .schoolFundPercent || 0
                                    ) *
                                      Number(selectedNFT.priceADA || 0)) /
                                    100
                                  ).toFixed(2)}{" "}
                                  ADA alloués à la scolarité
                                </p>
                                <p className="text-xs text-[#004D73] dark:text-white/60 mt-1">
                                  Les revenus de ce NFT financent
                                  l&apos;éducation des enfants
                                  d&apos;agriculteurs
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-4 h-4 text-[#3A8F4C]" />
                            <div>
                              <p className="text-xs text-[#004D73] dark:text-white/60">
                                Standard Cardano
                              </p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">
                                CIP-25
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Attributes */}
                    {nftMetadata[selectedNFT.id]?.attributes && (
                      <Card className="bg-muted/30 dark:bg-white/5 border-[#004D73]/20 dark:border-white/20">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-[#5A3E36] dark:text-white mb-3">
                            Attributs
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {nftMetadata[selectedNFT.id].attributes?.map(
                              (attr, index: number) => (
                                <div
                                  key={index}
                                  className="p-2 rounded-lg bg-white/50 dark:bg-[#004D73]/30 border border-[#004D73]/10 dark:border-white/10"
                                >
                                  <p className="text-xs text-[#004D73] dark:text-white/60">
                                    {attr.trait_type || attr.name}
                                  </p>
                                  <p className="text-sm font-medium text-[#5A3E36] dark:text-white">
                                    {attr.value}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Blockchain Hash */}
                    {(selectedNFT.onChainHash || selectedNFT.metadataURI) && (
                      <Card className="bg-muted/30 dark:bg-white/5 border-[#004D73]/20 dark:border-white/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#3A8F4C]" />
                              <h3 className="font-semibold text-[#5A3E36] dark:text-white">
                                Traçabilité Blockchain
                              </h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const hash =
                                  selectedNFT.onChainHash ||
                                  selectedNFT.metadataURI;
                                if (hash) {
                                  navigator.clipboard.writeText(hash);
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 2000);
                                }
                              }}
                              className="h-7 w-7"
                            >
                              {copied ? (
                                <Check className="w-4 h-4 text-[#3A8F4C]" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs font-mono text-[#004D73] dark:text-white/70 break-all">
                            {selectedNFT.onChainHash || selectedNFT.metadataURI}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <Card className="bg-muted/30 dark:bg-white/5 border-[#004D73]/20 dark:border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-3xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]">
                              ₳ {Number(selectedNFT.priceADA || 0).toFixed(2)}
                            </p>
                            <p className="text-sm text-[#004D73] dark:text-white/70">
                              Prix actuel
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#004D73] dark:text-white/70">
                              Créateur
                            </span>
                            <span className="font-medium text-[#5A3E36] dark:text-white">
                              {(
                                (Number(
                                  selectedNFT.revenueDistribution
                                    .creatorPercent || 0
                                ) *
                                  Number(selectedNFT.priceADA || 0)) /
                                100
                              ).toFixed(2)}{" "}
                              ADA
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#004D73] dark:text-white/70">
                              Fonds scolaire
                            </span>
                            <span className="font-medium text-[#3A8F4C] dark:text-[#3A8F4C]">
                              {(
                                (Number(
                                  selectedNFT.revenueDistribution
                                    .schoolFundPercent || 0
                                ) *
                                  Number(selectedNFT.priceADA || 0)) /
                                100
                              ).toFixed(2)}{" "}
                              ADA
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#004D73] dark:text-white/70">
                              Plateforme
                            </span>
                            <span className="font-medium text-[#5A3E36] dark:text-white">
                              {(
                                (Number(
                                  selectedNFT.revenueDistribution
                                    .platformPercent || 0
                                ) *
                                  Number(selectedNFT.priceADA || 0)) /
                                100
                              ).toFixed(2)}{" "}
                              ADA
                            </span>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {!connected ? (
                          <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Connectez votre wallet Cardano pour acheter ce
                                NFT
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => {
                                if (wallets && wallets.length > 0) {
                                  // Si un seul wallet disponible, connecter directement
                                  if (wallets.length === 1) {
                                    connect(wallets[0].name);
                                  } else {
                                    // Sinon, ouvrir le modal de sélection
                                    setShowWalletModal(true);
                                  }
                                } else {
                                  toast.error(
                                    "Aucun wallet Cardano détecté. Veuillez installer un wallet comme Nami, Eternl ou Flint."
                                  );
                                }
                              }}
                              className="w-full border-[#3A8F4C] text-[#3A8F4C] hover:bg-[#3A8F4C] hover:text-white"
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              Connecter Wallet
                            </Button>
                          </div>
                        ) : selectedNFT.status !== NFTStatus.LISTED ? (
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800">
                            <p className="text-sm text-gray-800 dark:text-gray-200 text-center">
                              Ce NFT n&apos;est plus disponible à la vente
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Button
                              onClick={handlePurchaseNFT}
                              disabled={
                                isPurchasing || purchaseMutation.isPending
                              }
                              className="w-full bg-[#3A8F4C] hover:bg-[#2E7D32] text-white h-11 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isPurchasing || purchaseMutation.isPending ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Achat en cours...
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-5 h-5 mr-2" />
                                  Acheter maintenant
                                </>
                              )}
                            </Button>

                            <Button
                              variant="outline"
                              className="w-full border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                              disabled
                            >
                              Faire une offre (bientôt)
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Wallet Connection Modal */}
      <Dialog open={showWalletModal} onOpenChange={setShowWalletModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connecter votre wallet Cardano</DialogTitle>
            <DialogDescription>
              Sélectionnez un wallet pour continuer avec l&apos;achat
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {wallets && wallets.length > 0 ? (
              wallets.map((walletItem) => (
                <Button
                  key={walletItem.name}
                  variant="outline"
                  onClick={async () => {
                    try {
                      await connect(walletItem.name);
                      setShowWalletModal(false);
                      toast.success("Wallet connecté avec succès!");
                      // Si un achat est en attente, il sera exécuté automatiquement via useEffect
                    } catch (error) {
                      setPendingPurchase(false);
                      toast.error(
                        `Erreur lors de la connexion: ${error instanceof Error ? error.message : "Erreur inconnue"}`
                      );
                    }
                  }}
                  className="w-full justify-start h-auto p-4 border-[#004D73]/20 dark:border-white/20 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                >
                  <div className="flex items-center gap-3 w-full">
                    {walletItem.icon && (
                      <img
                        src={walletItem.icon}
                        alt={walletItem.name}
                        className="w-8 h-8"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-[#5A3E36] dark:text-white">
                        {walletItem.name}
                      </p>
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Aucun wallet Cardano détecté. Veuillez installer un wallet
                  comme Nami, Eternl ou Flint.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
