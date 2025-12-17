"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/status-badge"
import { ShoppingCart, Star, MapPin, Users, Heart, Share2, Sparkles, Images } from "lucide-react"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  category: string
  price: number
  currency: string
  images: string[]
  description: string
  producer: string
  location: string
  rating: number
  reviews: number
  stock: number
  certified: boolean
  blockchainHash?: string
}

interface ProductCardProps {
  product: Product
  viewMode: "grid" | "list"
  isFavorite: boolean
  onToggleFavorite: () => void
  onClick: () => void
}

export function ProductCard({ product, viewMode, isFavorite, onToggleFavorite, onClick }: ProductCardProps) {
  if (viewMode === "list") {
    return (
      <Card
        className="group hover:shadow-xl transition-all duration-300 border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#003D5C] cursor-pointer"
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="flex gap-4 p-4">
            {/* Product Image */}
            <div className="relative w-32 h-32 flex-shrink-0 bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 rounded-lg flex items-center justify-center overflow-hidden">
              {product.images[0].startsWith('http') || product.images[0].startsWith('/') ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl">{product.images[0]}</span>
              )}
              {product.images.length > 1 && (
                <div className="absolute top-2 left-2 bg-black/50 dark:bg-black/70 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full flex items-center gap-1">
                  <Images className="w-3 h-3" />
                  {product.images.length}
                </div>
              )}
              {product.certified && (
                <div className="absolute top-2 right-2">
                  <StatusBadge status="certified" />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-[#5A3E36] dark:text-white mb-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-[#004D73] dark:text-white/70 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite()
                    }}
                    className={cn(
                      "h-8 w-8",
                      isFavorite
                        ? "text-red-500 hover:text-red-600"
                        : "text-[#5A3E36] dark:text-white/90"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 text-[#5A3E36] dark:text-white/90"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#004D73] dark:text-white/70">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span className="truncate">{product.producer}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{product.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[#F2C94C] text-[#F2C94C]" />
                    <span className="text-sm font-semibold text-[#5A3E36] dark:text-white">
                      {product.rating}
                    </span>
                    <span className="text-xs text-[#004D73] dark:text-white/60">
                      ({product.reviews})
                    </span>
                  </div>
                  <span className="text-xs text-[#004D73] dark:text-white/60">
                    Stock: {product.stock}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]">
                      {product.price.toLocaleString()} {product.currency}
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onClick()
                    }}
                    className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white rounded-lg px-4 py-2"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Acheter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid View
  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-[#004D73]/20 dark:border-white/20 bg-white dark:bg-[#003D5C] cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative h-48 bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 flex items-center justify-center rounded-t-lg overflow-hidden">
          {product.images[0].startsWith('http') || product.images[0].startsWith('/') ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <span className="text-8xl transition-transform duration-300 group-hover:scale-110">{product.images[0]}</span>
          )}
          
          {/* Image count badge */}
          {product.images.length > 1 && (
            <div className="absolute top-3 left-3 bg-black/50 dark:bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-full flex items-center gap-1.5 z-20">
              <Images className="w-3.5 h-3.5" />
              {product.images.length}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
            {product.certified && (
              <div className="z-30">
                <StatusBadge status="certified" />
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
              className={cn(
                "h-8 w-8 bg-white/90 dark:bg-[#003D5C]/90 backdrop-blur-sm",
                isFavorite
                  ? "text-red-500 hover:text-red-600"
                  : "text-[#5A3E36] dark:text-white/90"
              )}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              className="h-8 w-8 bg-white/90 dark:bg-[#003D5C]/90 backdrop-blur-sm text-[#5A3E36] dark:text-white/90"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-[#5A3E36] dark:text-white mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-[#004D73] dark:text-white/70 line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Producer & Location */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-[#004D73] dark:text-white/70">
              <Users className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{product.producer}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#004D73] dark:text-white/70">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{product.location}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#F2C94C] text-[#F2C94C]" />
              <span className="text-sm font-semibold text-[#5A3E36] dark:text-white">
                {product.rating}
              </span>
            </div>
            <span className="text-xs text-[#004D73] dark:text-white/60">
              ({product.reviews} avis)
            </span>
          </div>

          {/* Price & Stock */}
          <div className="flex items-center justify-between pt-2 border-t border-[#004D73]/10 dark:border-white/10">
            <div>
              <p className="text-2xl font-bold text-[#3A8F4C] dark:text-[#3A8F4C]">
                {product.price.toLocaleString()} {product.currency}
              </p>
              <p className="text-xs text-[#004D73] dark:text-white/60">
                Stock: {product.stock} unités
              </p>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
              className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white rounded-lg px-4 py-2"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Acheter
            </Button>
          </div>

          {/* Blockchain Hash */}
          {product.blockchainHash && (
            <div className="pt-2 border-t border-[#004D73]/10 dark:border-white/10">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#3A8F4C]" />
                <p className="text-xs text-[#004D73] dark:text-white/60 font-mono truncate">
                  {product.blockchainHash}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

