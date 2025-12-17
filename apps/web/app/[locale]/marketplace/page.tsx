"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    MapPin,
    TrendingUp,
    Package,
    Users,
    Grid3x3,
    List,
    X,
    Heart,
    Share2,
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    MessageCircle,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { StatusBadge } from "@/components/status-badge";
import { ImageGallery } from "@/components/image-gallery";
import { ProductLocationMap } from "@/components/product-location-map";
import { ProductTraceability } from "@/components/product-traceability";
import { ProductChat } from "@/components/product-chat";
import { useCart, useActiveMarketplaceItems } from "@/hooks";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { MarketplaceItem } from "@/types/marketplace";

// Types de produits
// Types de produits
type ProductCategory = string;
type SortOption = "recent" | "price-asc" | "price-desc" | "popular";

interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  currency: string;
  images: string[];
  description: string;
  producer: string;
  location: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviews: number;
  stock: number;
  certified: boolean;
  blockchainHash?: string;
}

// Données de démonstration
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Cacao Premium Bio",
    category: "cacao",
    price: 4500,
    currency: "USD",
    images: ["🌰", "🌰", "🌰", "🌰"],
    description: "Cacao biologique certifié, origine Kongo Central",
    producer: "Coopérative Kivu",
    location: "Kongo Central, RDC",
    latitude: -5.5475,
    longitude: 13.2344,
    rating: 4.8,
    reviews: 124,
    stock: 250,
    certified: true,
    blockchainHash: "0x1234...5678",
  },
  {
    id: "2",
    name: "Café Arabica Robusta",
    category: "cafe",
    price: 3200,
    currency: "USD",
    images: ["☕", "☕", "☕"],
    description: "Café arabica de qualité supérieure, torréfaction moyenne",
    producer: "Ferme Mwamba",
    location: "Kivu, RDC",
    latitude: -1.9403,
    longitude: 29.8739,
    rating: 4.9,
    reviews: 89,
    stock: 180,
    certified: true,
    blockchainHash: "0x2345...6789",
  },
  {
    id: "3",
    name: "Manioc Séché Premium",
    category: "manioc",
    price: 1200,
    currency: "USD",
    images: ["🍠", "🍠", "🍠", "🍠", "🍠"],
    description:
      "Manioc séché de première qualité, conditionné en sacs de 50kg",
    producer: "Association Paysanne",
    location: "Kasaï, RDC",
    latitude: -5.85,
    longitude: 22.4333,
    rating: 4.6,
    reviews: 67,
    stock: 500,
    certified: true,
    blockchainHash: "0x3456...7890",
  },
  {
    id: "4",
    name: "Huile de Palme Bio",
    category: "autres",
    price: 2800,
    currency: "USD",
    images: ["🫒", "🫒", "🫒"],
    description: "Huile de palme biologique, pressée à froid",
    producer: "Coopérative Equateur",
    location: "Équateur, RDC",
    latitude: 0.0517,
    longitude: 18.26,
    rating: 4.7,
    reviews: 156,
    stock: 320,
    certified: true,
    blockchainHash: "0x4567...8901",
  },
  {
    id: "5",
    name: "Cacao Fino de Aroma",
    category: "cacao",
    price: 5200,
    currency: "USD",
    images: ["🌰", "🌰", "🌰", "🌰", "🌰"],
    description: "Cacao fino de aroma, récolte 2024",
    producer: "Ferme Bio Congo",
    location: "Bas-Congo, RDC",
    latitude: -5.1833,
    longitude: 13.5,
    rating: 5.0,
    reviews: 203,
    stock: 150,
    certified: true,
    blockchainHash: "0x5678...9012",
  },
  {
    id: "6",
    name: "Café Robusta Premium",
    category: "cafe",
    price: 2900,
    currency: "USD",
    images: ["☕", "☕", "☕", "☕"],
    description: "Café robusta de qualité export, torréfaction foncée",
    producer: "Coopérative Ituri",
    location: "Ituri, RDC",
    latitude: 1.8333,
    longitude: 30.0333,
    rating: 4.5,
    reviews: 92,
    stock: 220,
    certified: true,
    blockchainHash: "0x6789...0123",
  },
  {
    id: "7",
    name: "Farine de Manioc",
    category: "manioc",
    price: 950,
    currency: "USD",
    images: ["🍠", "🍠", "🍠"],
    description: "Farine de manioc fine, idéale pour la pâtisserie",
    producer: "Moulin Artisanal",
    location: "Bandundu, RDC",
    latitude: -3.3167,
    longitude: 17.3667,
    rating: 4.4,
    reviews: 45,
    stock: 400,
    certified: false,
    blockchainHash: "0x7890...1234",
  },
  {
    id: "8",
    name: "Miel Bio de Forêt",
    category: "autres",
    price: 1800,
    currency: "USD",
    images: ["🍯", "🍯", "🍯", "🍯"],
    description: "Miel pur de forêt équatoriale, non pasteurisé",
    producer: "Apiculteurs du Kivu",
    location: "Nord-Kivu, RDC",
    latitude: -0.5667,
    longitude: 29.1833,
    rating: 4.9,
    reviews: 178,
    stock: 120,
    certified: true,
    blockchainHash: "0x8901...2345",
  },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<ProductCategory>("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const [quantity, setQuantity] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Panier
  const { addToCart } = useCart();

  // Récupérer les produits depuis l'API
  const { data: apiItems, isLoading: isLoadingItems } = useActiveMarketplaceItems();

  // Mapper les items API vers le format Product local
  const mapApiItemToProduct = (item: MarketplaceItem): Product => {
    // Déterminer la catégorie basée sur le produit du lot
    let category = "autres";
    const productName = item.batch?.harvests?.[0]?.product?.name;
    
    if (productName) {
      // Normaliser le nom pour créer une catégorie (minuscule, sans accents, etc.)
      const normalized = productName.toLowerCase();
      if (normalized.includes("cacao")) category = "cacao";
      else if (normalized.includes("café") || normalized.includes("cafe")) category = "cafe";
      else if (normalized.includes("manioc")) category = "manioc";
      else category = normalized; // Utiliser le nom brut comme catégorie si pas de correspondance
    }

    return {
      id: item.id,
      name: item.title,
      category: category as ProductCategory,
      price: item.priceADA,
      currency: "ADA",
      images: item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : ["📦"],
      description: item.description || "Produit du marketplace",
      producer: item.farmer?.name || "Producteur local",
      location: item.farmer?.location || "RDC",
      latitude: -4.0383,
      longitude: 21.7587,
      rating: 4.5,
      reviews: 0,
      stock: item.stockKg,
      certified: true,
      blockchainHash: `0x${item.id.slice(0, 8)}...${item.id.slice(-4)}`,
    };
  };

  // utiliser les produits API si disponibles, sinon fallback sur mock
  const products: Product[] = apiItems && apiItems.length > 0
    ? apiItems.map(mapApiItemToProduct)
    : mockProducts;

  // Filtres avancés
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyCertified, setOnlyCertified] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Obtenir toutes les localisations uniques
  const locations = Array.from(new Set(products.map((p) => p.location)));

  // Filtrer et trier les produits
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.producer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice =
        (!minPrice || product.price >= Number(minPrice)) &&
        (!maxPrice || product.price <= Number(maxPrice));
      const matchesCertified = !onlyCertified || product.certified;
      const matchesLocation =
        selectedLocation === "all" || product.location === selectedLocation;
      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchesCertified &&
        matchesLocation
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "popular":
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setTimeout(() => {
      setCurrentPage(1);
    }, 0);
  }, [
    searchQuery,
    selectedCategory,
    sortBy,
    minPrice,
    maxPrice,
    onlyCertified,
    selectedLocation,
  ]);

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
    setQuantity(1); // Réinitialiser la quantité à chaque ouverture
  };

  // Générer les catégories dynamiquement à partir des produits existants
  const categories: { value: string; label: string; icon: string }[] = [
    { value: "all", label: "Tous", icon: "📦" },
  ];

  // Extraire les catégories uniques des produits
  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));
  
  uniqueCategories.forEach(cat => {
    if (cat === "all") return;
    
    let label = cat.charAt(0).toUpperCase() + cat.slice(1);
    let icon = "🌾"; // Default icon

    // Custom icons and labels mapping
    const normalized = cat.toLowerCase();
    if (normalized.includes("cacao")) {
      label = "Cacao";
      icon = "🌰";
    } else if (normalized.includes("cafe") || normalized.includes("café")) {
      label = "Café";
      icon = "☕";
    } else if (normalized.includes("manioc")) {
      label = "Manioc";
      icon = "🍠";
    } else if (normalized.includes("mais") || normalized.includes("maïs")) {
      label = "Maïs";
      icon = "🌽";
    } else if (normalized.includes("riz")) {
      label = "Riz";
      icon = "🍚";
    } else if (normalized.includes("huile")) {
      label = "Huile";
      icon = "🫒";
    } else if (normalized.includes("miel")) {
      label = "Miel";
      icon = "🍯";
    }

    categories.push({ value: cat, label, icon });
  });

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "recent", label: "Plus récent" },
    { value: "price-asc", label: "Prix croissant" },
    { value: "price-desc", label: "Prix décroissant" },
    { value: "popular", label: "Plus populaire" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#004D73]">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#3A8F4C]/10 to-[#004D73]/10 dark:from-[#3A8F4C]/20 dark:to-[#004D73]/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-[#5A3E36] dark:text-white mb-4">
              Marketplace Agricole
            </h1>
            <p className="text-xl text-[#004D73] dark:text-white/80 max-w-2xl mx-auto">
              Découvrez et achetez directement des produits agricoles certifiés
              de producteurs congolais
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#004D73]/60 dark:text-white/60" />
              <Input
                type="text"
                placeholder="Rechercher un produit, un producteur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 border-[#004D73]/20 dark:border-white/20 focus:border-[#3A8F4C] dark:focus:border-[#3A8F4C] rounded-xl bg-white dark:bg-[#003D5C] text-[#5A3E36] dark:text-white/90"
              />
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            {/* Category Filters */}
            <div className="flex items-center gap-2 flex-wrap justify-center flex-1">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={
                    selectedCategory === cat.value ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all",
                    selectedCategory === cat.value
                      ? "bg-[#3A8F4C] text-white border-[#3A8F4C] hover:bg-[#2E7D32]"
                      : "border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10 hover:border-[#3A8F4C] dark:hover:border-[#3A8F4C]"
                  )}
                >
                  <span className="mr-2">{cat.icon}</span>
                  {cat.label}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#5A3E36] dark:text-white/90">
                      Prix (USD)
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

                  {/* Location */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#5A3E36] dark:text-white/90">
                      Localisation
                    </Label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90 text-sm focus:outline-none focus:border-[#3A8F4C] dark:focus:border-[#3A8F4C]"
                    >
                      <option value="all">Toutes les localisations</option>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Certification */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#5A3E36] dark:text-white/90">
                      Certification
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="certified"
                        checked={onlyCertified}
                        onChange={(e) => setOnlyCertified(e.target.checked)}
                        className="h-4 w-4 rounded border-[#004D73]/20 text-[#3A8F4C] focus:ring-[#3A8F4C]"
                      />
                      <Label
                        htmlFor="certified"
                        className="text-sm text-[#5A3E36] dark:text-white/90 cursor-pointer"
                      >
                        Produits certifiés uniquement
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="bg-white/80 dark:bg-[#003D5C]/80 border-[#004D73]/20 dark:border-white/20">
              <CardContent className="p-4 text-center">
                <Package className="w-6 h-6 text-[#3A8F4C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">
                  {products.length}
                </p>
                <p className="text-xs text-[#004D73] dark:text-white/70">
                  Produits
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-[#003D5C]/80 border-[#004D73]/20 dark:border-white/20">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-[#3A8F4C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">
                  {new Set(products.map((p) => p.producer)).size}
                </p>
                <p className="text-xs text-[#004D73] dark:text-white/70">
                  Producteurs
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-[#003D5C]/80 border-[#004D73]/20 dark:border-white/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-[#3A8F4C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">
                  100%
                </p>
                <p className="text-xs text-[#004D73] dark:text-white/70">
                  Traçable
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-[#003D5C]/80 border-[#004D73]/20 dark:border-white/20">
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 text-[#3A8F4C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">
                  {(
                    products.reduce((acc, p) => acc + p.rating, 0) /
                      products.length || 0
                  ).toFixed(1)}
                </p>
                <p className="text-xs text-[#004D73] dark:text-white/70">
                  Note moyenne
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#004D73]">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[#5A3E36] dark:text-white">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? "produit trouvé"
                  : "produits trouvés"}
              </h2>
              {filteredProducts.length > 0 && (
                <p className="text-sm text-[#004D73] dark:text-white/70 mt-1">
                  Page {currentPage} sur {totalPages}
                </p>
              )}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <Card className="p-12 text-center bg-muted/30 dark:bg-[#003D5C]/50 border-[#004D73]/20 dark:border-white/20">
              <CardContent>
                <Package className="w-16 h-16 text-[#004D73]/40 dark:text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#5A3E36] dark:text-white mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-[#004D73] dark:text-white/70 mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setMinPrice("");
                    setMaxPrice("");
                    setOnlyCertified(false);
                    setSelectedLocation("all");
                  }}
                  className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white"
                >
                  Réinitialiser les filtres
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Products Grid/List */}
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                )}
              >
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    viewMode={viewMode}
                    isFavorite={favorites.has(product.id)}
                    onToggleFavorite={() => toggleFavorite(product.id)}
                    onClick={() => openProductModal(product)}
                  />
                ))}
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

      {/* Product Detail Modal */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
          {selectedProduct && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold text-[#5A3E36] dark:text-white mb-2">
                      {selectedProduct.name}
                    </DialogTitle>
                    <DialogDescription className="text-[#004D73] dark:text-white/70">
                      {selectedProduct.description}
                    </DialogDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(selectedProduct.id)}
                      className={cn(
                        "h-9 w-9",
                        favorites.has(selectedProduct.id)
                          ? "text-red-500 hover:text-red-600"
                          : "text-[#5A3E36] dark:text-white/90"
                      )}
                    >
                      <Heart
                        className={cn(
                          "w-5 h-5",
                          favorites.has(selectedProduct.id) && "fill-current"
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
                {/* Product Image Gallery */}
                <div className="relative">
                  <ImageGallery images={selectedProduct.images} />
                  {selectedProduct.certified && (
                    <div className="absolute top-4 right-4 z-10">
                      <StatusBadge status="certified" />
                    </div>
                  )}
                </div>

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
                                Producteur
                              </p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">
                                {selectedProduct.producer}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <MapPin className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                            <div>
                              <p className="text-xs text-[#004D73] dark:text-white/60">
                                Localisation
                              </p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">
                                {selectedProduct.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                            <div>
                              <p className="text-xs text-[#004D73] dark:text-white/60">
                                Stock disponible
                              </p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">
                                {selectedProduct.stock} unités
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Traçabilité complète */}
                    <ProductTraceability
                      blockchainHash={selectedProduct.blockchainHash}
                      producer={selectedProduct.producer}
                      location={selectedProduct.location}
                      certified={selectedProduct.certified}
                      harvestDate="2024-01-05"
                      processingDate="2024-01-08"
                      packagingDate="2024-01-10"
                      shippingDate="2024-01-12"
                      arrivalDate="2024-01-15"
                    />

                    {/* Carte de localisation */}
                    <Card className="bg-muted/30 dark:bg-white/5 border-[#004D73]/20 dark:border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-[#3A8F4C]" />
                          <h3 className="font-semibold text-[#5A3E36] dark:text-white">
                            Localisation
                          </h3>
                        </div>
                        <ProductLocationMap
                          latitude={selectedProduct.latitude}
                          longitude={selectedProduct.longitude}
                          productName={selectedProduct.name}
                          location={selectedProduct.location}
                          height="h-48"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <Card className="bg-muted/30 dark:bg-white/5 border-[#004D73]/20 dark:border-white/20">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-3xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]">
                              {selectedProduct.price.toLocaleString()}{" "}
                              {selectedProduct.currency}
                            </p>
                            <p className="text-sm text-[#004D73] dark:text-white/70">
                              Prix par unité
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "w-4 h-4",
                                  i < Math.floor(selectedProduct.rating)
                                    ? "fill-[#F2C94C] text-[#F2C94C]"
                                    : "text-[#004D73]/30 dark:text-white/30"
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-[#5A3E36] dark:text-white">
                            {selectedProduct.rating}
                          </span>
                          <span className="text-sm text-[#004D73] dark:text-white/70">
                            ({selectedProduct.reviews} avis)
                          </span>
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm text-[#5A3E36] dark:text-white/90">
                              Quantité
                            </Label>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setQuantity(Math.max(1, quantity - 1))
                                }
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-12 text-center font-semibold text-[#5A3E36] dark:text-white">
                                {quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  setQuantity(
                                    Math.min(
                                      selectedProduct.stock,
                                      quantity + 1
                                    )
                                  )
                                }
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white hover:bg-[#004D73]/10 dark:hover:bg-white/10 h-11 text-base font-semibold"
                            onClick={() => {
                              setIsChatOpen(true);
                            }}
                          >
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Contacter le vendeur
                          </Button>

                          <Button
                            className="w-full bg-[#3A8F4C] hover:bg-[#2E7D32] text-white h-11 text-base font-semibold"
                            onClick={() => {
                              if (selectedProduct) {
                                addToCart(
                                  {
                                    productId: selectedProduct.id,
                                    productName: selectedProduct.name,
                                    productImage: selectedProduct.images[0],
                                    price: selectedProduct.price,
                                    currency: selectedProduct.currency,
                                  },
                                  quantity
                                );
                                toast.success(
                                  `${selectedProduct.name} ajouté au panier`,
                                  {
                                    description: `Quantité: ${quantity}`,
                                  }
                                );
                                setQuantity(1);
                              }
                            }}
                          >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Ajouter au panier
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                            onClick={() => {
                              if (selectedProduct) {
                                addToCart(
                                  {
                                    productId: selectedProduct.id,
                                    productName: selectedProduct.name,
                                    productImage: selectedProduct.images[0],
                                    price: selectedProduct.price,
                                    currency: selectedProduct.currency,
                                  },
                                  quantity
                                );
                                toast.success("Produit ajouté au panier", {
                                  description: "Redirection vers le panier...",
                                });
                                setQuantity(1);
                                setIsProductModalOpen(false);
                                router.push("/cart");
                              }
                            }}
                          >
                            Acheter maintenant
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat avec le vendeur */}
      {selectedProduct && (
        <ProductChat
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          sellerName={selectedProduct.producer}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
