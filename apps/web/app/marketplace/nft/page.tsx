"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
    Search, Filter, SlidersHorizontal, ShoppingCart, Star, TrendingUp,
    Package, Users, User, Grid3x3, List, X, Sparkles, Heart, Share2,
    ChevronLeft, ChevronRight, Coins, Wallet, Image as ImageIcon,
    Zap, Crown, Gem, Flame, Eye, Copy, Check, Calendar
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthMenu } from "@/components/auth-menu"
import { LanguageSelector } from "@/components/language-selector"
import { ImageGallery } from "@/components/image-gallery"
import { AudioPlayer } from "@/components/audio-player"
import { cn } from "@/lib/utils"
import { useCardanoWallet } from "@/hooks/use-cardano-wallet"

// Types
type NFTCollection = "all" | "agriculture" | "culture" | "art" | "collectibles" | "land"
type SortOption = "recent" | "price-asc" | "price-desc" | "popular" | "rarity"

interface NFT {
  id: string
  name: string
  collection: NFTCollection
  price: number
  currency: string
  images: string[]
  description: string
  creator: string
  owner: string
  rarity: "common" | "rare" | "epic" | "legendary"
  attributes: { trait_type: string; value: string }[]
  likes: number
  views: number
  blockchainHash?: string
  mintedAt: string
  educationFund?: number // Montant alloué à l'éducation (en ADA)
  standard?: "CIP-25" | "CIP-27" // Standard Cardano
  type?: "recipe" | "tale" | "song" | "proverb" | "product" | "art" | "land" // Type de contenu culturel
  audioUrl?: string // URL de l'audio pour les chants
}

// Données de démonstration
const mockNFTs: NFT[] = [
  // NFTs Culturels Lingala - Recettes
  {
    id: "1",
    name: "Recette Lingala : Fufu de Manioc",
    collection: "culture",
    price: 75,
    currency: "ADA",
    images: ["🍠", "👩‍🍳", "🍽️"],
    description: "Recette traditionnelle congolaise de fufu de manioc transmise par générations. NFT CIP-25 préservant le patrimoine culinaire lingala.",
    creator: "Mama Kasaï - Femme Agricultrice",
    owner: "Culture_Lover",
    rarity: "epic",
    type: "recipe",
    standard: "CIP-25",
    educationFund: 30,
    attributes: [
      { trait_type: "Type", value: "Recette" },
      { trait_type: "Région", value: "Kasaï" },
      { trait_type: "Langue", value: "Lingala" },
      { trait_type: "Finance Éducation", value: "30 ADA" }
    ],
    likes: 456,
    views: 2100,
    blockchainHash: "0x1234...5678",
    mintedAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Conte Lingala : Mwinda na Mputu",
    collection: "culture",
    price: 120,
    currency: "ADA",
    images: ["📖", "🌙", "✨"],
    description: "Conte traditionnel lingala racontant l'histoire de la lumière et de l'obscurité. NFT CIP-25 préservant la tradition orale congolaise.",
    creator: "Grand-mère Bandundu",
    owner: "Story_Collector",
    rarity: "legendary",
    type: "tale",
    standard: "CIP-25",
    educationFund: 50,
    attributes: [
      { trait_type: "Type", value: "Conte" },
      { trait_type: "Région", value: "Bandundu" },
      { trait_type: "Langue", value: "Lingala" },
      { trait_type: "Finance Éducation", value: "50 ADA" }
    ],
    likes: 678,
    views: 3200,
    blockchainHash: "0x2345...6789",
    mintedAt: "2024-01-10"
  },
  {
    id: "3",
    name: "Chant Traditionnel : Mokili Mobimba",
    collection: "culture",
    price: 95,
    currency: "ADA",
    images: ["🎵", "🎤", "👥"],
    description: "Chant traditionnel lingala célébrant l'unité et la fraternité. NFT CIP-25 avec enregistrement audio authentique.",
    creator: "Chœur des Femmes Agricultrices",
    owner: "Music_Fan",
    rarity: "rare",
    type: "song",
    standard: "CIP-25",
    educationFund: 40,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // URL de démonstration
    attributes: [
      { trait_type: "Type", value: "Chant" },
      { trait_type: "Région", value: "Bas-Congo" },
      { trait_type: "Langue", value: "Lingala" },
      { trait_type: "Finance Éducation", value: "40 ADA" },
      { trait_type: "Durée", value: "3:45" }
    ],
    likes: 523,
    views: 2800,
    blockchainHash: "0x3456...7890",
    mintedAt: "2024-01-12"
  },
  {
    id: "4",
    name: "Proverbe Lingala : Nzoto ezali na motema",
    collection: "culture",
    price: 60,
    currency: "ADA",
    images: ["💬", "🧠", "❤️"],
    description: "Proverbe traditionnel lingala sur la sagesse et le cœur. NFT CIP-25 préservant la philosophie congolaise.",
    creator: "Ancien du Kivu",
    owner: "Wisdom_Seeker",
    rarity: "rare",
    type: "proverb",
    standard: "CIP-25",
    educationFund: 25,
    attributes: [
      { trait_type: "Type", value: "Proverbe" },
      { trait_type: "Région", value: "Kivu" },
      { trait_type: "Langue", value: "Lingala" },
      { trait_type: "Finance Éducation", value: "25 ADA" }
    ],
    likes: 389,
    views: 1900,
    blockchainHash: "0x4567...8901",
    mintedAt: "2024-01-18"
  },
  // NFTs Agriculture
  {
    id: "5",
    name: "Cacao Premium #001",
    collection: "agriculture",
    price: 150,
    currency: "ADA",
    images: ["🌰", "🌰", "🌰"],
    description: "NFT représentant un cacao premium certifié, première édition. Traçabilité blockchain complète.",
    creator: "Coopérative Kivu - Femmes Agricultrices",
    owner: "Collector_01",
    rarity: "legendary",
    type: "product",
    attributes: [
      { trait_type: "Origine", value: "Kongo Central" },
      { trait_type: "Certification", value: "Bio" },
      { trait_type: "Année", value: "2024" },
      { trait_type: "Producteur", value: "Femme Agricultrice" }
    ],
    likes: 234,
    views: 1520,
    blockchainHash: "0x5678...9012",
    mintedAt: "2024-01-15"
  },
  {
    id: "6",
    name: "Café Arabica #042",
    collection: "agriculture",
    price: 85,
    currency: "ADA",
    images: ["☕", "☕", "☕"],
    description: "NFT de café arabica de qualité supérieure avec traçabilité blockchain complète",
    creator: "Ferme Mwamba - Femmes Agricultrices",
    owner: "CoffeeLover",
    rarity: "epic",
    type: "product",
    attributes: [
      { trait_type: "Torréfaction", value: "Moyenne" },
      { trait_type: "Origine", value: "Kivu" },
      { trait_type: "Producteur", value: "Femme Agricultrice" }
    ],
    likes: 189,
    views: 980,
    blockchainHash: "0x6789...0123",
    mintedAt: "2024-01-20"
  },
  {
    id: "7",
    name: "Manioc Premium #203",
    collection: "agriculture",
    price: 45,
    currency: "ADA",
    images: ["🍠", "🍠", "🍠"],
    description: "NFT de manioc séché premium avec certification blockchain",
    creator: "Association Paysanne - Femmes Agricultrices",
    owner: "NFT_Newbie",
    rarity: "common",
    type: "product",
    attributes: [
      { trait_type: "Qualité", value: "Premium" },
      { trait_type: "Conditionnement", value: "Sacs 50kg" },
      { trait_type: "Producteur", value: "Femme Agricultrice" }
    ],
    likes: 89,
    views: 420,
    blockchainHash: "0x7890...1234",
    mintedAt: "2024-01-22"
  },
  {
    id: "8",
    name: "Terre Fertile #156",
    collection: "land",
    price: 500,
    currency: "ADA",
    images: ["🌾", "🌾", "🌾", "🌾"],
    description: "Parcelle de terre fertile certifiée pour l'agriculture. Certification blockchain complète.",
    creator: "Terra Congo",
    owner: "Farmer_Pro",
    rarity: "legendary",
    type: "land",
    attributes: [
      { trait_type: "Superficie", value: "5 hectares" },
      { trait_type: "Type", value: "Agricole" },
      { trait_type: "Localisation", value: "Kongo Central" }
    ],
    likes: 456,
    views: 2100,
    blockchainHash: "0x8901...2345",
    mintedAt: "2024-01-10"
  },
  {
    id: "9",
    name: "Art Paysan #089",
    collection: "art",
    price: 120,
    currency: "ADA",
    images: ["🎨", "🎨", "🎨"],
    description: "Œuvre d'art numérique représentant la vie paysanne congolaise",
    creator: "Artiste Congolais",
    owner: "ArtCollector",
    rarity: "rare",
    type: "art",
    attributes: [
      { trait_type: "Style", value: "Digital" },
      { trait_type: "Thème", value: "Agriculture" }
    ],
    likes: 167,
    views: 750,
    blockchainHash: "0x9012...3456",
    mintedAt: "2024-01-18"
  },
  {
    id: "10",
    name: "Recette Lingala : Poulet Moambé",
    collection: "culture",
    price: 100,
    currency: "ADA",
    images: ["🍗", "🥘", "👩‍🍳"],
    description: "Recette traditionnelle de poulet moambé, plat emblématique congolais. NFT CIP-25 préservant la gastronomie lingala.",
    creator: "Mama Bas-Congo",
    owner: "Foodie_Collector",
    rarity: "epic",
    type: "recipe",
    standard: "CIP-25",
    educationFund: 40,
    attributes: [
      { trait_type: "Type", value: "Recette" },
      { trait_type: "Région", value: "Bas-Congo" },
      { trait_type: "Langue", value: "Lingala" },
      { trait_type: "Finance Éducation", value: "40 ADA" }
    ],
    likes: 567,
    views: 2900,
    blockchainHash: "0x0123...4567",
    mintedAt: "2024-01-20"
  }
]

const getRarityColor = (rarity: NFT["rarity"]) => {
  switch (rarity) {
    case "legendary":
      return "text-[#F2C94C] bg-[#F2C94C]/10 dark:bg-[#F2C94C]/20 border-[#F2C94C]/30"
    case "epic":
      return "text-purple-600 bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700"
    case "rare":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
    case "common":
      return "text-gray-600 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-800"
  }
}

const getRarityIcon = (rarity: NFT["rarity"]) => {
  switch (rarity) {
    case "legendary":
      return <Crown className="w-4 h-4" />
    case "epic":
      return <Gem className="w-4 h-4" />
    case "rare":
      return <Zap className="w-4 h-4" />
    case "common":
      return <Flame className="w-4 h-4" />
    default:
      return <Star className="w-4 h-4" />
  }
}

const getRarityLabel = (rarity: NFT["rarity"]) => {
  switch (rarity) {
    case "legendary":
      return "Légendaire"
    case "epic":
      return "Épique"
    case "rare":
      return "Rare"
    case "common":
      return "Commun"
    default:
      return rarity
  }
}

export default function NFTMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<NFTCollection>("all")
  const [sortBy, setSortBy] = useState<SortOption>("recent")
  const [showFilters, setShowFilters] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [copied, setCopied] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [audioProgress, setAudioProgress] = useState<{ [key: string]: number }>({})
  const productsPerPage = 12

  // Wallet
  const { connected } = useCardanoWallet()

  // Filtres avancés
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Filtrer et trier les NFT
  const filteredNFTs = mockNFTs
    .filter(nft => {
      const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nft.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nft.creator.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCollection = selectedCollection === "all" || nft.collection === selectedCollection
      const matchesPrice = (!minPrice || nft.price >= Number(minPrice)) &&
                          (!maxPrice || nft.price <= Number(maxPrice))
      const matchesRarity = selectedRarity === "all" || nft.rarity === selectedRarity
      return matchesSearch && matchesCollection && matchesPrice && matchesRarity
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "popular":
          return b.likes - a.likes
        case "rarity":
          const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 }
          return rarityOrder[b.rarity] - rarityOrder[a.rarity]
        default:
          return 0
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredNFTs.length / productsPerPage)
  const paginatedNFTs = filteredNFTs.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )

  // Reset to first page when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
    }, 0)
    return () => clearTimeout(timer)
  }, [searchQuery, selectedCollection, sortBy, minPrice, maxPrice, selectedRarity])

  const toggleFavorite = (nftId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nftId)) {
        newSet.delete(nftId)
      } else {
        newSet.add(nftId)
      }
      return newSet
    })
  }

  const openNFTModal = (nft: NFT) => {
    setSelectedNFT(nft)
    setIsNFTModalOpen(true)
  }

  const handleCopyHash = () => {
    if (selectedNFT?.blockchainHash) {
      navigator.clipboard.writeText(selectedNFT.blockchainHash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const collections: { value: NFTCollection; label: string; icon: string }[] = [
    { value: "all", label: "Tous", icon: "📦" },
    { value: "culture", label: "Culture Lingala", icon: "📚" },
    { value: "agriculture", label: "Agriculture", icon: "🌾" },
    { value: "art", label: "Art", icon: "🎨" },
    { value: "collectibles", label: "Collection", icon: "💎" },
    { value: "land", label: "Terrains", icon: "🏞️" }
  ]

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "recent", label: "Plus récent" },
    { value: "price-asc", label: "Prix croissant" },
    { value: "price-desc", label: "Prix décroissant" },
    { value: "popular", label: "Plus populaire" },
    { value: "rarity", label: "Rareté" }
  ]

  const rarities: { value: string; label: string }[] = [
    { value: "all", label: "Toutes" },
    { value: "legendary", label: "Légendaire" },
    { value: "epic", label: "Épique" },
    { value: "rare", label: "Rare" },
    { value: "common", label: "Commun" }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#004D73]">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-white/98 dark:bg-[#004D73]/98 backdrop-blur-md border-b border-[#004D73]/20 dark:border-white/20 shadow-lg shadow-[#004D73]/5 dark:shadow-white/5" 
          : "bg-white/95 dark:bg-[#004D73]/95 backdrop-blur-sm border-b border-[#004D73]/10 dark:border-white/10 shadow-sm"
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#3A8F4C] to-[#2E7D32] flex items-center justify-center shadow-lg shadow-[#3A8F4C]/30 group-hover:shadow-xl group-hover:shadow-[#3A8F4C]/40 transition-all duration-300 group-hover:scale-105">
                <svg
                  className="w-7 h-7 text-white transition-transform group-hover:rotate-12 duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#5A3E36] dark:text-white group-hover:text-[#3A8F4C] dark:group-hover:text-[#3A8F4C] transition-colors duration-300">
                  Mkulima Chain
                </span>
                <span className="text-[10px] text-[#004D73]/70 dark:text-white/70 font-medium -mt-1">
                  Terra Congo
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              <Link 
                href="/" 
                className="relative px-4 py-2 text-[#5A3E36] dark:text-white/90 hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C] transition-colors duration-300 font-medium text-sm group"
              >
                Accueil
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#3A8F4C] to-[#2E7D32] group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/marketplace" 
                className="relative px-4 py-2 text-[#5A3E36] dark:text-white/90 hover:text-[#3A8F4C] dark:hover:text-[#3A8F4C] transition-colors duration-300 font-medium text-sm group"
              >
                Marketplace
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#3A8F4C] to-[#2E7D32] group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/marketplace/nft" 
                className="relative px-4 py-2 text-[#3A8F4C] dark:text-[#3A8F4C] font-medium text-sm group"
              >
                NFT
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#3A8F4C] to-[#2E7D32]"></span>
              </Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSelector />
              <ThemeToggle />
              <AuthMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#3A8F4C]/10 to-[#004D73]/10 dark:from-[#3A8F4C]/20 dark:to-[#004D73]/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 border border-[#3A8F4C]/30 mb-4">
              <Sparkles className="w-4 h-4 text-[#3A8F4C]" />
              <span className="text-sm font-medium text-[#3A8F4C]">Marketplace NFT - Lingala Chain</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#5A3E36] dark:text-white mb-4">
              NFTs Culturels & Agricoles
            </h1>
            <p className="text-xl text-[#004D73] dark:text-white/80 max-w-2xl mx-auto mb-4">
              Découvrez et collectionnez des NFTs uniques : recettes, contes, chants lingala et produits agricoles certifiés
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F2C94C]/10 dark:bg-[#F2C94C]/20 border border-[#F2C94C]/30">
              <span className="text-2xl">🎓</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#5A3E36] dark:text-white">
                  Financement de l&apos;éducation
                </p>
                <p className="text-xs text-[#004D73] dark:text-white/70">
                  Les revenus des NFTs culturels financent la scolarité des enfants d&apos;agriculteurs
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
                  variant={selectedCollection === col.value ? "default" : "outline"}
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
                  <h3 className="text-lg font-semibold text-[#5A3E36] dark:text-white">Filtres avancés</h3>
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
                    <Label className="text-sm font-medium text-[#5A3E36] dark:text-white/90">Prix (ADA)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#004D73] text-[#5A3E36] dark:text-white/90"
                      />
                      <span className="text-[#004D73] dark:text-white/70">-</span>
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
                    <Label className="text-sm font-medium text-[#5A3E36] dark:text-white/90">Rareté</Label>
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
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">{mockNFTs.length}</p>
                <p className="text-xs text-[#004D73] dark:text-white/70">NFT disponibles</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-[#003D5C]/80 border-[#004D73]/20 dark:border-white/20">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-[#3A8F4C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">{new Set(mockNFTs.map(n => n.creator)).size}</p>
                <p className="text-xs text-[#004D73] dark:text-white/70">Créateurs</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-[#003D5C]/80 border-[#004D73]/20 dark:border-white/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-[#3A8F4C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">{mockNFTs.reduce((sum, nft) => sum + nft.likes, 0)}</p>
                <p className="text-xs text-[#004D73] dark:text-white/70">Likes total</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-[#003D5C]/80 border-[#004D73]/20 dark:border-white/20">
              <CardContent className="p-4 text-center">
                <Coins className="w-6 h-6 text-[#3A8F4C] mx-auto mb-2" />
                <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">{mockNFTs.reduce((sum, nft) => sum + nft.price, 0)}</p>
                <p className="text-xs text-[#004D73] dark:text-white/70">Volume total (ADA)</p>
              </CardContent>
            </Card>
          </div>

          {/* Education Impact Banner */}
          {mockNFTs.filter(nft => nft.educationFund).length > 0 && (
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
                      Les NFTs culturels Lingala (recettes, contes, chants, proverbes) financent directement la scolarité des enfants d&apos;agriculteurs congolais.
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-[#3A8F4C] dark:text-[#3A8F4C]">
                          {mockNFTs.filter(nft => nft.educationFund).length} NFTs culturels
                        </p>
                        <p className="text-xs text-[#004D73] dark:text-white/70">Avec financement éducation</p>
                      </div>
                      <div>
                        <p className="font-semibold text-[#3A8F4C] dark:text-[#3A8F4C]">
                          {mockNFTs.reduce((sum, nft) => sum + (nft.educationFund || 0), 0)} ADA
                        </p>
                        <p className="text-xs text-[#004D73] dark:text-white/70">Total alloué à l&apos;éducation</p>
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
                {filteredNFTs.length} {filteredNFTs.length === 1 ? "NFT trouvé" : "NFT trouvés"}
              </h2>
              {filteredNFTs.length > 0 && (
                <p className="text-sm text-[#004D73] dark:text-white/70 mt-1">
                  Page {currentPage} sur {totalPages}
                </p>
              )}
            </div>
          </div>

          {filteredNFTs.length === 0 ? (
            <Card className="p-12 text-center bg-muted/30 dark:bg-[#003D5C]/50 border-[#004D73]/20 dark:border-white/20">
              <CardContent>
                <ImageIcon className="w-16 h-16 text-[#004D73]/40 dark:text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#5A3E36] dark:text-white mb-2">
                  Aucun NFT trouvé
                </h3>
                <p className="text-[#004D73] dark:text-white/70 mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCollection("all")
                    setMinPrice("")
                    setMaxPrice("")
                    setSelectedRarity("all")
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
              <div className={cn(
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              )}>
                {paginatedNFTs.map((nft) => (
                  <Card
                    key={nft.id}
                    className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#003D5C] cursor-pointer"
                    onClick={() => openNFTModal(nft)}
                  >
                    <CardContent className="p-0">
                      {/* NFT Image */}
                      <div className="relative h-64 bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 flex items-center justify-center rounded-t-lg overflow-hidden">
                        <span className="text-8xl transition-transform duration-300 group-hover:scale-110">{nft.images[0]}</span>
                        {nft.images.length > 1 && (
                          <div className="absolute top-3 left-3 bg-black/50 dark:bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center gap-1.5 z-20">
                            <ImageIcon className="w-3.5 h-3.5" />
                            {nft.images.length}
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                          <div className={cn("px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border", getRarityColor(nft.rarity))}>
                            {getRarityIcon(nft.rarity)}
                            {getRarityLabel(nft.rarity)}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(nft.id)
                            }}
                            className={cn(
                              "h-8 w-8 bg-white/90 dark:bg-[#003D5C]/90 backdrop-blur-sm",
                              favorites.has(nft.id)
                                ? "text-red-500 hover:text-red-600"
                                : "text-[#5A3E36] dark:text-white/90"
                            )}
                          >
                            <Heart className={cn("w-4 h-4", favorites.has(nft.id) && "fill-current")} />
                          </Button>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* NFT Info */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-[#5A3E36] dark:text-white mb-1 line-clamp-1">
                            {nft.name}
                          </h3>
                          <p className="text-xs text-[#004D73] dark:text-white/70 capitalize mb-2">
                            {nft.collection}
                          </p>
                        </div>

                        {/* Creator & Owner */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-[#004D73] dark:text-white/70">
                            <Users className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">Créé par {nft.creator}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#004D73] dark:text-white/70">
                            <User className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">Propriétaire: {nft.owner}</span>
                          </div>
                          {nft.educationFund && (
                            <div className="flex items-center gap-2 text-xs text-[#3A8F4C] dark:text-[#3A8F4C] font-medium">
                              <span className="text-base">🎓</span>
                              <span>{nft.educationFund} ADA pour l&apos;éducation</span>
                            </div>
                          )}
                          {nft.standard && (
                            <div className="flex items-center gap-2 text-xs text-[#004D73] dark:text-white/70">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Standard {nft.standard}</span>
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-[#004D73] dark:text-white/70">
                          <div className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            <span>{nft.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            <span>{nft.views}</span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#004D73]/10 dark:border-white/10">
                          <div>
                            <p className="text-2xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]">
                              {nft.price} {nft.currency}
                            </p>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              openNFTModal(nft)
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
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            currentPage === page
                              ? "bg-[#3A8F4C] text-white border-[#3A8F4C]"
                              : "border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90"
                          )}
                        >
                          {page}
                        </Button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-[#004D73] dark:text-white/70">...</span>
                    }
                    return null
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
                      {selectedNFT.name}
                    </DialogTitle>
                    <DialogDescription className="text-[#004D73] dark:text-white/70">
                      {selectedNFT.description}
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
                      <Heart className={cn("w-5 h-5", favorites.has(selectedNFT.id) && "fill-current")} />
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
                  <ImageGallery 
                    images={selectedNFT.images} 
                    isPlaying={selectedNFT.type === "song" && playingAudio === selectedNFT.id}
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <div className={cn("px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border", getRarityColor(selectedNFT.rarity))}>
                      {getRarityIcon(selectedNFT.rarity)}
                      {getRarityLabel(selectedNFT.rarity)}
                    </div>
                  </div>
                </div>

                {/* Audio Player for Songs */}
                {selectedNFT.type === "song" && selectedNFT.audioUrl && (
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
                            Enregistrement audio authentique de ce chant traditionnel lingala
                          </p>
                        </div>
                      </div>
                      <AudioPlayer
                        audioUrl={selectedNFT.audioUrl}
                        nftId={selectedNFT.id}
                        isPlaying={playingAudio === selectedNFT.id}
                        onPlay={() => setPlayingAudio(selectedNFT.id)}
                        onPause={() => setPlayingAudio(null)}
                        progress={audioProgress[selectedNFT.id] || 0}
                        onProgressChange={(progress) => setAudioProgress(prev => ({ ...prev, [selectedNFT.id]: progress }))}
                      />
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <Card className="bg-muted/30 dark:bg-white/5 border-[#004D73]/20 dark:border-white/20">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-[#5A3E36] dark:text-white mb-3">Informations</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                            <div>
                              <p className="text-xs text-[#004D73] dark:text-white/60">Créateur</p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">{selectedNFT.creator}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                            <div>
                              <p className="text-xs text-[#004D73] dark:text-white/60">Propriétaire actuel</p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">{selectedNFT.owner}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                            <div>
                              <p className="text-xs text-[#004D73] dark:text-white/60">Collection</p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white capitalize">{selectedNFT.collection}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                            <div>
                              <p className="text-xs text-[#004D73] dark:text-white/60">Date de création</p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">
                                {new Date(selectedNFT.mintedAt).toLocaleDateString("fr-FR")}
                              </p>
                            </div>
                          </div>
                          {selectedNFT.educationFund && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#F2C94C]/10 dark:bg-[#F2C94C]/20 border border-[#F2C94C]/30">
                              <span className="text-2xl">🎓</span>
                              <div>
                                <p className="text-xs text-[#004D73] dark:text-white/60">Financement éducation</p>
                                <p className="text-sm font-semibold text-[#3A8F4C] dark:text-[#3A8F4C]">
                                  {selectedNFT.educationFund} ADA alloués à la scolarité
                                </p>
                                <p className="text-xs text-[#004D73] dark:text-white/60 mt-1">
                                  Les revenus de ce NFT financent l&apos;éducation des enfants d&apos;agriculteurs
                                </p>
                              </div>
                            </div>
                          )}
                          {selectedNFT.standard && (
                            <div className="flex items-center gap-3">
                              <Sparkles className="w-4 h-4 text-[#3A8F4C]" />
                              <div>
                                <p className="text-xs text-[#004D73] dark:text-white/60">Standard Cardano</p>
                                <p className="text-sm font-medium text-[#5A3E36] dark:text-white">
                                  {selectedNFT.standard}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Attributes */}
                    <Card className="bg-muted/30 dark:bg-white/5 border-[#004D73]/20 dark:border-white/20">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-[#5A3E36] dark:text-white mb-3">Attributs</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedNFT.attributes.map((attr, index) => (
                            <div key={index} className="p-2 rounded-lg bg-white/50 dark:bg-[#004D73]/30 border border-[#004D73]/10 dark:border-white/10">
                              <p className="text-xs text-[#004D73] dark:text-white/60">{attr.trait_type}</p>
                              <p className="text-sm font-medium text-[#5A3E36] dark:text-white">{attr.value}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Blockchain Hash */}
                    {selectedNFT.blockchainHash && (
                      <Card className="bg-muted/30 dark:bg-white/5 border-[#004D73]/20 dark:border-white/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#3A8F4C]" />
                              <h3 className="font-semibold text-[#5A3E36] dark:text-white">Traçabilité Blockchain</h3>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleCopyHash}
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
                            {selectedNFT.blockchainHash}
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
                              {selectedNFT.price} {selectedNFT.currency}
                            </p>
                            <p className="text-sm text-[#004D73] dark:text-white/70">Prix actuel</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-semibold text-[#5A3E36] dark:text-white">
                              {selectedNFT.likes}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                            <span className="text-sm text-[#004D73] dark:text-white/70">
                              {selectedNFT.views} vues
                            </span>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {!connected ? (
                          <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Connectez votre wallet Cardano pour acheter ce NFT
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              className="w-full border-[#3A8F4C] text-[#3A8F4C] hover:bg-[#3A8F4C] hover:text-white"
                            >
                              <Wallet className="w-4 h-4 mr-2" />
                              Connecter Wallet
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Button
                              className="w-full bg-[#3A8F4C] hover:bg-[#2E7D32] text-white h-11 text-base font-semibold"
                            >
                              <ShoppingCart className="w-5 h-5 mr-2" />
                              Acheter maintenant
                            </Button>

                            <Button
                              variant="outline"
                              className="w-full border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                            >
                              Faire une offre
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
    </div>
  )
}

