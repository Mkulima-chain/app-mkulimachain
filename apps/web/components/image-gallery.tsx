"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageGalleryProps {
  images: string[]
  className?: string
  showThumbnails?: boolean
  isPlaying?: boolean // Pour animer l'image pendant la lecture audio
}

export function ImageGallery({ images, className, showThumbnails = true, isPlaying = false }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return null
  }

  const currentImage = images[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Image */}
      <div className="relative group">
        <div className={cn(
          "relative h-64 md:h-96 bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 rounded-xl flex items-center justify-center overflow-hidden",
          isPlaying && "animate-pulse-slow"
        )}>
          <span className={cn(
            "text-9xl transition-all duration-300",
            isPlaying && "animate-bounce-slow scale-110"
          )}>
            {currentImage}
          </span>
          
          {/* Visualizer effect when playing */}
          {isPlaying && (
            <>
              <div className="absolute inset-0 animate-shimmer opacity-50" />
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3A8F4C]/80 dark:bg-[#3A8F4C]/80 backdrop-blur-sm text-white text-xs font-medium z-20">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: "0.2s" }} />
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" style={{ animationDelay: "0.4s" }} />
                </div>
                <span>En lecture...</span>
              </div>
              {/* Visualizer bars */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1 h-12">
                {[40, 60, 80, 70, 50].map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-[#3A8F4C] dark:bg-[#3A8F4C] rounded-t animate-pulse"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: `${0.6 + i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </>
          )}
          
          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 dark:bg-[#003D5C]/90 backdrop-blur-sm hover:bg-white dark:hover:bg-[#004D73] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5 text-[#5A3E36] dark:text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/90 dark:bg-[#003D5C]/90 backdrop-blur-sm hover:bg-white dark:hover:bg-[#004D73] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5 text-[#5A3E36] dark:text-white" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {images.length > 1 && !isPlaying && (
            <div className="absolute top-4 left-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                currentIndex === index
                  ? "border-[#3A8F4C] dark:border-[#3A8F4C] ring-2 ring-[#3A8F4C]/20 dark:ring-[#3A8F4C]/20"
                  : "border-transparent hover:border-[#004D73]/30 dark:hover:border-white/30"
              )}
              aria-label={`Voir l'image ${index + 1}`}
            >
              <div className="w-full h-full bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 flex items-center justify-center">
                <span className="text-3xl">{image}</span>
              </div>
              {currentIndex === index && (
                <div className="absolute inset-0 bg-[#3A8F4C]/20 dark:bg-[#3A8F4C]/30" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

