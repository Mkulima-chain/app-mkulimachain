"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  ShoppingCart, Heart, DollarSign,
  MapPin, Calendar, Star, Edit, Settings,
  LogOut, User, CreditCard, Truck, CheckCircle2,
  Clock, XCircle, Plus, Grid3x3, Image as ImageIcon, Sparkles, Crown, Gem, Zap, Flame, Coins
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { AuthMenu } from "@/components/auth-menu"
import { OrderTraceability } from "@/components/order-traceability"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

// Types
interface Order {
  id: string
  productName: string
  productImage: string
  price: number
  quantity: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  date: string
  orderNumber: string
  traceability?: {
    order: { completed: boolean; date?: string }
    preparation: { completed: boolean; date?: string }
    harvest: { completed: boolean; date?: string }
    processing: { completed: boolean; date?: string }
    packaging: { completed: boolean; date?: string }
    shipping: { completed: boolean; date?: string }
    delivery: { completed: boolean; date?: string }
  }
}

interface Favorite {
  id: string
  name: string
  image: string
  price: number
  category: string
}

interface UserNFT {
  id: string
  name: string
  collection: string
  images: string[]
  price: number
  currency: string
  rarity: "common" | "rare" | "epic" | "legendary"
  type?: "recipe" | "tale" | "song" | "proverb" | "product" | "art" | "land"
  purchasedAt: string
  educationFund?: number
  standard?: "CIP-25" | "CIP-27"
}

// Données de démonstration
const mockOrders: Order[] = [
  {
    id: "1",
    productName: "Cacao Premium Bio",
    productImage: "🌰",
    price: 4500,
    quantity: 2,
    status: "delivered",
    date: "2024-01-15",
    orderNumber: "ORD-2024-001",
    traceability: {
      order: { completed: true, date: "2024-01-01" },
      preparation: { completed: true, date: "2024-01-02" },
      harvest: { completed: true, date: "2024-01-05" },
      processing: { completed: true, date: "2024-01-08" },
      packaging: { completed: true, date: "2024-01-10" },
      shipping: { completed: true, date: "2024-01-12" },
      delivery: { completed: true, date: "2024-01-15" }
    }
  },
  {
    id: "2",
    productName: "Café Arabica Robusta",
    productImage: "☕",
    price: 3200,
    quantity: 1,
    status: "shipped",
    date: "2024-01-20",
    orderNumber: "ORD-2024-002",
    traceability: {
      order: { completed: true, date: "2024-01-05" },
      preparation: { completed: true, date: "2024-01-06" },
      harvest: { completed: true, date: "2024-01-10" },
      processing: { completed: true, date: "2024-01-13" },
      packaging: { completed: true, date: "2024-01-15" },
      shipping: { completed: true, date: "2024-01-18" },
      delivery: { completed: false }
    }
  },
  {
    id: "3",
    productName: "Miel Bio de Forêt",
    productImage: "🍯",
    price: 1800,
    quantity: 3,
    status: "processing",
    date: "2024-01-22",
    orderNumber: "ORD-2024-003",
    traceability: {
      order: { completed: true, date: "2024-01-10" },
      preparation: { completed: true, date: "2024-01-11" },
      harvest: { completed: true, date: "2024-01-15" },
      processing: { completed: true, date: "2024-01-18" },
      packaging: { completed: true, date: "2024-01-20" },
      shipping: { completed: false },
      delivery: { completed: false }
    }
  },
  {
    id: "4",
    productName: "Huile de Palme Bio",
    productImage: "🫒",
    price: 2800,
    quantity: 1,
    status: "pending",
    date: "2024-01-23",
    orderNumber: "ORD-2024-004",
    traceability: {
      order: { completed: true, date: "2024-01-15" },
      preparation: { completed: true, date: "2024-01-16" },
      harvest: { completed: true, date: "2024-01-18" },
      processing: { completed: true, date: "2024-01-20" },
      packaging: { completed: false },
      shipping: { completed: false },
      delivery: { completed: false }
    }
  }
]

const mockFavorites: Favorite[] = [
  {
    id: "1",
    name: "Cacao Premium Bio",
    image: "🌰",
    price: 4500,
    category: "cacao"
  },
  {
    id: "5",
    name: "Cacao Fino de Aroma",
    image: "🌰",
    price: 5200,
    category: "cacao"
  },
  {
    id: "8",
    name: "Miel Bio de Forêt",
    image: "🍯",
    price: 1800,
    category: "autres"
  }
]

// NFTs possédés par l'utilisateur
const mockUserNFTs: UserNFT[] = [
  {
    id: "2",
    name: "Conte Lingala : Mwinda na Mputu",
    collection: "Culture Lingala",
    images: ["📖", "🌙", "✨"],
    price: 120,
    currency: "ADA",
    rarity: "legendary",
    type: "tale",
    standard: "CIP-25",
    educationFund: 50,
    purchasedAt: "2024-01-10"
  },
  {
    id: "3",
    name: "Chant Traditionnel : Mokili Mobimba",
    collection: "Culture Lingala",
    images: ["🎵", "🎤", "👥"],
    price: 95,
    currency: "ADA",
    rarity: "rare",
    type: "song",
    standard: "CIP-25",
    educationFund: 40,
    purchasedAt: "2024-01-12"
  },
  {
    id: "5",
    name: "Cacao Premium #001",
    collection: "Agriculture",
    images: ["🌰", "🌰", "🌰"],
    price: 150,
    currency: "ADA",
    rarity: "legendary",
    type: "product",
    purchasedAt: "2024-01-15"
  },
  {
    id: "8",
    name: "Terre Fertile #156",
    collection: "Terrains",
    images: ["🌾", "🌾", "🌾", "🌾"],
    price: 500,
    currency: "ADA",
    rarity: "legendary",
    type: "land",
    purchasedAt: "2024-01-10"
  }
]

const getRarityColor = (rarity: UserNFT["rarity"]) => {
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

const getRarityIcon = (rarity: UserNFT["rarity"]) => {
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

const getRarityLabel = (rarity: UserNFT["rarity"]) => {
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

const getStatusColor = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return "text-[#3A8F4C] bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20"
    case "shipped":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900/30"
    case "processing":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30"
    case "pending":
      return "text-orange-600 bg-orange-100 dark:bg-orange-900/30"
    case "cancelled":
      return "text-red-600 bg-red-100 dark:bg-red-900/30"
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-800"
  }
}

const getStatusIcon = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return <CheckCircle2 className="w-4 h-4" />
    case "shipped":
      return <Truck className="w-4 h-4" />
    case "processing":
      return <Clock className="w-4 h-4" />
    case "pending":
      return <Clock className="w-4 h-4" />
    case "cancelled":
      return <XCircle className="w-4 h-4" />
    default:
      return <Clock className="w-4 h-4" />
  }
}

const getStatusLabel = (status: Order["status"]) => {
  switch (status) {
    case "delivered":
      return "Livré"
    case "shipped":
      return "Expédié"
    case "processing":
      return "En traitement"
    case "pending":
      return "En attente"
    case "cancelled":
      return "Annulé"
    default:
      return status
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "favorites" | "profile">("overview")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-[#004D73] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3A8F4C]"></div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const user = session.user
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0].toUpperCase() || "U"

  const hasImage = user.image && user.image.length > 0

  // Statistiques
  const totalOrders = mockOrders.length
  const totalSpent = mockOrders.reduce((sum, order) => sum + order.price * order.quantity, 0)
  const totalFavorites = mockFavorites.length
  const pendingOrders = mockOrders.filter(o => o.status === "pending" || o.status === "processing").length
  
  // Statistiques NFTs
  const totalNFTs = mockUserNFTs.length
  const totalNFTValue = mockUserNFTs.reduce((sum, nft) => sum + nft.price, 0)
  const legendaryNFTs = mockUserNFTs.filter(nft => nft.rarity === "legendary").length
  const totalEducationFund = mockUserNFTs.reduce((sum, nft) => sum + (nft.educationFund || 0), 0)

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: Grid3x3 },
    { id: "orders", label: "Commandes", icon: ShoppingCart },
    { id: "favorites", label: "Favoris", icon: Heart },
    { id: "nfts", label: "Ma Collection NFT", icon: ImageIcon },
    { id: "profile", label: "Profil", icon: User },
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
                href="/dashboard" 
                className="relative px-4 py-2 text-[#3A8F4C] dark:text-[#3A8F4C] font-medium text-sm group"
              >
                Dashboard
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

      {/* Dashboard Content */}
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#5A3E36] dark:text-white mb-2">
              Tableau de bord
            </h1>
            <p className="text-[#004D73] dark:text-white/70">
              Bienvenue, {user.name || "Utilisateur"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-[#3A8F4C] text-white border-[#3A8F4C] hover:bg-[#2E7D32]"
                      : "border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                  )}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              )
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#5A3E36] dark:text-white/90">
                      Commandes totales
                    </CardTitle>
                    <ShoppingCart className="h-4 w-4 text-[#3A8F4C]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#5A3E36] dark:text-white">{totalOrders}</div>
                    <p className="text-xs text-[#004D73] dark:text-white/70 mt-1">
                      {pendingOrders} en attente
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#5A3E36] dark:text-white/90">
                      Total dépensé
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-[#3A8F4C]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#5A3E36] dark:text-white">
                      {totalSpent.toLocaleString()} USD
                    </div>
                    <p className="text-xs text-[#004D73] dark:text-white/70 mt-1">
                      Toutes commandes confondues
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#5A3E36] dark:text-white/90">
                      Favoris
                    </CardTitle>
                    <Heart className="h-4 w-4 text-[#3A8F4C]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#5A3E36] dark:text-white">{totalFavorites}</div>
                    <p className="text-xs text-[#004D73] dark:text-white/70 mt-1">
                      Produits sauvegardés
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-[#5A3E36] dark:text-white/90">
                      Collection NFT
                    </CardTitle>
                    <ImageIcon className="h-4 w-4 text-[#3A8F4C]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[#5A3E36] dark:text-white">{totalNFTs}</div>
                    <p className="text-xs text-[#004D73] dark:text-white/70 mt-1">
                      {legendaryNFTs} légendaire{legendaryNFTs > 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent NFTs */}
              {mockUserNFTs.length > 0 && (
                <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-[#5A3E36] dark:text-white">NFTs récents</CardTitle>
                        <CardDescription className="text-[#004D73] dark:text-white/70">
                          Vos derniers ajouts à la collection
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("nfts")}
                        className="border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90"
                      >
                        Voir tout
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mockUserNFTs.slice(0, 3).map((nft) => (
                        <Card
                          key={nft.id}
                          className="group overflow-hidden bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20 hover:border-[#3A8F4C] dark:hover:border-[#3A8F4C] transition-all cursor-pointer"
                          onClick={() => setActiveTab("nfts")}
                        >
                          <div className="relative h-32 bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 flex items-center justify-center overflow-hidden">
                            <span className="text-5xl transition-transform group-hover:scale-110 duration-300">
                              {nft.images[0]}
                            </span>
                            <div className="absolute top-2 right-2">
                              <div className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border",
                                getRarityColor(nft.rarity)
                              )}>
                                {getRarityIcon(nft.rarity)}
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-semibold text-sm text-[#5A3E36] dark:text-white line-clamp-1 group-hover:text-[#3A8F4C] transition-colors">
                              {nft.name}
                            </h3>
                            <p className="text-xs text-[#004D73] dark:text-white/70 mt-1">
                              {nft.price} {nft.currency}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Orders */}
              <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[#5A3E36] dark:text-white">Commandes récentes</CardTitle>
                      <CardDescription className="text-[#004D73] dark:text-white/70">
                        Vos 4 dernières commandes
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("orders")}
                      className="border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90"
                    >
                      Voir tout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockOrders.slice(0, 4).map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10 hover:bg-[#E8F5E9]/50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl">{order.productImage}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#5A3E36] dark:text-white truncate">
                              {order.productName}
                            </h3>
                            <p className="text-sm text-[#004D73] dark:text-white/70">
                              {order.orderNumber} • {new Date(order.date).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#3A8F4C] dark:text-[#3A8F4C]">
                              {(order.price * order.quantity).toLocaleString()} USD
                            </p>
                            <p className="text-xs text-[#004D73] dark:text-white/70">
                              Qté: {order.quantity}
                            </p>
                          </div>
                          <div className={cn("px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5", getStatusColor(order.status))}>
                            {getStatusIcon(order.status)}
                            {getStatusLabel(order.status)}
                          </div>
                        </div>
                        {order.traceability && (
                          <OrderTraceability traceability={order.traceability} />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && (
            <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
              <CardHeader>
                <CardTitle className="text-[#5A3E36] dark:text-white">Toutes mes commandes</CardTitle>
                <CardDescription className="text-[#004D73] dark:text-white/70">
                  Historique complet de vos commandes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10 hover:bg-[#E8F5E9]/50 dark:hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 flex items-center justify-center flex-shrink-0">
                          <span className="text-4xl">{order.productImage}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-[#5A3E36] dark:text-white mb-1">
                            {order.productName}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-[#004D73] dark:text-white/70">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(order.date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                              })}
                            </span>
                            <span>•</span>
                            <span>{order.orderNumber}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-[#3A8F4C] dark:text-[#3A8F4C] mb-1">
                            {(order.price * order.quantity).toLocaleString()} USD
                          </p>
                          <p className="text-sm text-[#004D73] dark:text-white/70">
                            {order.quantity} {order.quantity === 1 ? "unité" : "unités"}
                          </p>
                        </div>
                        <div className={cn("px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2", getStatusColor(order.status))}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </div>
                      </div>
                      {order.traceability && (
                        <OrderTraceability traceability={order.traceability} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "favorites" && (
            <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[#5A3E36] dark:text-white">Mes favoris</CardTitle>
                    <CardDescription className="text-[#004D73] dark:text-white/70">
                      Produits sauvegardés
                    </CardDescription>
                  </div>
                  <Link href="/marketplace">
                    <Button className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Explorer
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {mockFavorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-[#004D73]/40 dark:text-white/40 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-[#5A3E36] dark:text-white mb-2">
                      Aucun favori
                    </h3>
                    <p className="text-[#004D73] dark:text-white/70 mb-4">
                      Commencez à ajouter des produits à vos favoris
                    </p>
                    <Link href="/marketplace">
                      <Button className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white">
                        Parcourir le marketplace
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockFavorites.map((favorite) => (
                      <Link
                        key={favorite.id}
                        href={`/marketplace`}
                        className="group p-4 rounded-lg border border-[#004D73]/10 dark:border-white/10 hover:border-[#3A8F4C] dark:hover:border-[#3A8F4C] hover:bg-[#E8F5E9]/50 dark:hover:bg-white/5 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 flex items-center justify-center flex-shrink-0">
                            <span className="text-3xl">{favorite.image}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-[#5A3E36] dark:text-white mb-1 truncate group-hover:text-[#3A8F4C] transition-colors">
                              {favorite.name}
                            </h3>
                            <p className="text-sm text-[#004D73] dark:text-white/70 capitalize">
                              {favorite.category}
                            </p>
                            <p className="text-lg font-bold text-[#3A8F4C] dark:text-[#3A8F4C] mt-1">
                              {favorite.price.toLocaleString()} USD
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "nfts" && (
            <div className="space-y-6">
              {/* Statistiques de la collection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-[#3A8F4C]/10 to-[#3A8F4C]/5 dark:from-[#3A8F4C]/20 dark:to-[#3A8F4C]/10 border-[#3A8F4C]/30 dark:border-[#3A8F4C]/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#004D73] dark:text-white/70 mb-1">Total NFTs</p>
                        <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">{totalNFTs}</p>
                      </div>
                      <div className="p-3 rounded-full bg-[#3A8F4C]/20 dark:bg-[#3A8F4C]/30">
                        <ImageIcon className="w-6 h-6 text-[#3A8F4C]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-[#F2C94C]/10 to-[#F2C94C]/5 dark:from-[#F2C94C]/20 dark:to-[#F2C94C]/10 border-[#F2C94C]/30 dark:border-[#F2C94C]/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#004D73] dark:text-white/70 mb-1">Valeur totale</p>
                        <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">{totalNFTValue} ADA</p>
                      </div>
                      <div className="p-3 rounded-full bg-[#F2C94C]/20 dark:bg-[#F2C94C]/30">
                        <Coins className="w-6 h-6 text-[#F2C94C]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-900/10 border-purple-300 dark:border-purple-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#004D73] dark:text-white/70 mb-1">Légendaires</p>
                        <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">{legendaryNFTs}</p>
                      </div>
                      <div className="p-3 rounded-full bg-purple-200 dark:bg-purple-800">
                        <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-300 dark:border-blue-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#004D73] dark:text-white/70 mb-1">Fonds éducation</p>
                        <p className="text-2xl font-bold text-[#5A3E36] dark:text-white">{totalEducationFund} ADA</p>
                      </div>
                      <div className="p-3 rounded-full bg-blue-200 dark:bg-blue-800">
                        <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Collection NFT */}
              <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[#5A3E36] dark:text-white">Ma Collection NFT</CardTitle>
                      <CardDescription className="text-[#004D73] dark:text-white/70">
                        Vos NFTs Lingala Chain
                      </CardDescription>
                    </div>
                    <Link href="/marketplace/nft">
                      <Button className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Explorer NFT
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {mockUserNFTs.length === 0 ? (
                    <div className="text-center py-12">
                      <ImageIcon className="w-16 h-16 text-[#004D73]/40 dark:text-white/40 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[#5A3E36] dark:text-white mb-2">
                        Aucun NFT dans votre collection
                      </h3>
                      <p className="text-[#004D73] dark:text-white/70 mb-4">
                        Commencez à collectionner des NFTs culturels et agricoles
                      </p>
                      <Link href="/marketplace/nft">
                        <Button className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white">
                          Parcourir le marché NFT
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {mockUserNFTs.map((nft) => (
                        <Card
                          key={nft.id}
                          className="group overflow-hidden bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20 hover:border-[#3A8F4C] dark:hover:border-[#3A8F4C] transition-all hover:shadow-lg"
                        >
                          <div className="relative">
                            <div className="relative h-48 bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 flex items-center justify-center overflow-hidden">
                              <span className="text-7xl transition-transform group-hover:scale-110 duration-300">
                                {nft.images[0]}
                              </span>
                              {nft.images.length > 1 && (
                                <div className="absolute top-2 right-2 bg-black/50 dark:bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                                  +{nft.images.length - 1}
                                </div>
                              )}
                              {nft.type === "song" && (
                                <div className="absolute top-2 left-2 bg-[#3A8F4C]/80 dark:bg-[#3A8F4C]/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                  🎵 Audio disponible
                                </div>
                              )}
                            </div>
                            <div className="absolute top-2 right-2">
                              <div className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border",
                                getRarityColor(nft.rarity)
                              )}>
                                {getRarityIcon(nft.rarity)}
                                {getRarityLabel(nft.rarity)}
                              </div>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <h3 className="font-semibold text-[#5A3E36] dark:text-white line-clamp-1 group-hover:text-[#3A8F4C] transition-colors">
                                {nft.name}
                              </h3>
                              <p className="text-xs text-[#004D73] dark:text-white/70 capitalize">
                                {nft.collection}
                              </p>
                              <div className="flex items-center justify-between pt-2">
                                <div>
                                  <p className="text-xs text-[#004D73] dark:text-white/70">Prix d'achat</p>
                                  <p className="text-lg font-bold text-[#3A8F4C] dark:text-[#3A8F4C]">
                                    {nft.price} {nft.currency}
                                  </p>
                                </div>
                                {nft.educationFund && (
                                  <div className="text-right">
                                    <p className="text-xs text-[#004D73] dark:text-white/70">Fonds éducation</p>
                                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                      {nft.educationFund} ADA
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2 pt-2 border-t border-[#004D73]/10 dark:border-white/10">
                                <Calendar className="w-3 h-3 text-[#004D73] dark:text-white/70" />
                                <span className="text-xs text-[#004D73] dark:text-white/70">
                                  Acheté le {new Date(nft.purchasedAt).toLocaleDateString("fr-FR")}
                                </span>
                              </div>
                              {nft.standard && (
                                <div className="flex items-center gap-2">
                                  <div className="px-2 py-0.5 rounded bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 text-[#3A8F4C] text-xs font-medium">
                                    {nft.standard}
                                  </div>
                                  {nft.type && (
                                    <div className="px-2 py-0.5 rounded bg-[#004D73]/10 dark:bg-[#004D73]/20 text-[#004D73] dark:text-[#004D73] text-xs font-medium capitalize">
                                      {nft.type}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Info */}
              <Card className="lg:col-span-2 bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                <CardHeader>
                  <CardTitle className="text-[#5A3E36] dark:text-white">Informations du profil</CardTitle>
                  <CardDescription className="text-[#004D73] dark:text-white/70">
                    Gérez vos informations personnelles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24 border-4 border-[#3A8F4C]/20 dark:border-white/20">
                      {hasImage ? (
                        <AvatarImage src={user.image || undefined} alt={user.name || "User"} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 text-[#3A8F4C] dark:text-[#3A8F4C] font-bold text-2xl">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-[#5A3E36] dark:text-white mb-1">
                        {user.name || "Utilisateur"}
                      </h2>
                      <p className="text-[#004D73] dark:text-white/70 mb-4">{user.email}</p>
                      <Button variant="outline" className="border-[#004D73]/20 dark:border-white/20">
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier le profil
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-[#004D73]/10 dark:bg-white/10" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-[#5A3E36] dark:text-white/90 mb-2 block">
                        Nom complet
                      </label>
                      <p className="text-[#004D73] dark:text-white/70">{user.name || "Non renseigné"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#5A3E36] dark:text-white/90 mb-2 block">
                        Email
                      </label>
                      <p className="text-[#004D73] dark:text-white/70">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#5A3E36] dark:text-white/90 mb-2 block">
                        Téléphone
                      </label>
                      <p className="text-[#004D73] dark:text-white/70">Non renseigné</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#5A3E36] dark:text-white/90 mb-2 block">
                        Adresse
                      </label>
                      <p className="text-[#004D73] dark:text-white/70">Non renseignée</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                <CardHeader>
                  <CardTitle className="text-[#5A3E36] dark:text-white">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Méthodes de paiement
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white/90 hover:bg-[#E8F5E9] dark:hover:bg-white/10"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Adresses
                  </Button>
                  <Separator className="bg-[#004D73]/10 dark:bg-white/10 my-3" />
                  <Button
                    variant="outline"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full justify-start border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

