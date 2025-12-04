"use client"

import { useEffect, useState } from "react"
import { ExternalLink, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Composant pour charger les styles Leaflet
function LeafletStyles() {
  useEffect(() => {
    import("leaflet/dist/leaflet.css")
    
    // Fix pour les icônes par défaut de Leaflet
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })
      })
    }
  }, [])
  
  return null
}

// Créer un marqueur personnalisé avec les couleurs de l'application
async function createCustomIcon() {
  if (typeof window === "undefined") return null
  
  try {
    const L = await import("leaflet")
    if (!L || !L.divIcon) return null
    
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3A8F4C 0%, #2E7D32 100%);
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(58, 143, 76, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 18px;
            font-weight: bold;
          ">📍</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    })
  } catch (error) {
    console.error("Error creating custom icon:", error)
    return null
  }
}

// Composant de carte interne
function MapContent({ 
  position, 
  productName, 
  location,
  latitude,
  longitude 
}: { 
  position: [number, number]
  productName: string
  location: string
  latitude: number
  longitude: number
}) {
  const [MapContainer, setMapContainer] = useState<any>(null)
  const [TileLayer, setTileLayer] = useState<any>(null)
  const [Marker, setMarker] = useState<any>(null)
  const [Popup, setPopup] = useState<any>(null)
  const [Circle, setCircle] = useState<any>(null)
  const [ZoomControl, setZoomControl] = useState<any>(null)
  const [customIcon, setCustomIcon] = useState<any>(null)

  useEffect(() => {
    const loadComponents = async () => {
      try {
        const mod = await import("react-leaflet")
        setMapContainer(() => mod.MapContainer)
        setTileLayer(() => mod.TileLayer)
        setMarker(() => mod.Marker)
        setPopup(() => mod.Popup)
        setCircle(() => mod.Circle)
        setZoomControl(() => mod.ZoomControl)
        
        // Créer l'icône personnalisée après avoir chargé Leaflet
        const icon = await createCustomIcon()
        if (icon) {
          setCustomIcon(icon)
        }
      } catch (error) {
        console.error("Error loading map components:", error)
      }
    }
    
    loadComponents()
  }, [])

  if (!MapContainer || !TileLayer || !Marker || !Popup) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A8F4C] mx-auto mb-2"></div>
          <p className="text-sm text-[#004D73] dark:text-white/70">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      minZoom={8}
      maxZoom={18}
      scrollWheelZoom={true}
      className="w-full h-full"
      style={{ zIndex: 0 }}
      zoomControl={false}
    >
      <ZoomControl position="topright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {Circle && (
        <Circle
          center={position}
          radius={2000}
          pathOptions={{
            color: "#3A8F4C",
            fillColor: "#3A8F4C",
            fillOpacity: 0.1,
            weight: 2,
            opacity: 0.5,
          }}
        />
      )}
      <Marker position={position} icon={customIcon ?? undefined}>
        <Popup className="custom-popup">
          <div className="text-center p-2 min-w-[200px]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3A8F4C] to-[#2E7D32] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="font-semibold text-[#5A3E36] dark:text-white mb-1 text-sm">{productName}</p>
            <p className="text-xs text-[#004D73] dark:text-white/70 mb-3">{location}</p>
            <div className="flex gap-2">
              <a
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-1.5 bg-[#3A8F4C] hover:bg-[#2E7D32] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3 h-3" />
                Google Maps
              </a>
              <a
                href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=13`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-3 py-1.5 bg-[#004D73] hover:bg-[#003D5C] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3 h-3" />
                OSM
              </a>
            </div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}

interface ProductLocationMapProps {
  latitude: number
  longitude: number
  productName: string
  location: string
  className?: string
  height?: string
}

export function ProductLocationMap({
  latitude,
  longitude,
  productName,
  location,
  className,
  height = "h-64",
}: ProductLocationMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const position: [number, number] = [latitude, longitude]

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className={cn("relative rounded-xl overflow-hidden border border-[#004D73]/20 dark:border-white/20 bg-muted/30 dark:bg-white/5", className, height)}>
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-[#004D73] dark:text-white/70">Chargement de la carte...</p>
        </div>
      </div>
    )
  }

  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <>
      <LeafletStyles />
      <div className={cn("relative rounded-xl overflow-hidden border-2 border-[#004D73]/20 dark:border-white/20 shadow-lg", className, height)}>
        <MapContent 
          position={position} 
          productName={productName} 
          location={location}
          latitude={latitude}
          longitude={longitude}
        />
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 z-50">
          <div className="bg-white/95 dark:bg-[#003D5C]/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-lg border border-[#004D73]/20 dark:border-white/20">
            <p className="text-xs font-semibold text-[#5A3E36] dark:text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#3A8F4C]" />
              <span className="truncate max-w-[200px]">{location}</span>
            </p>
          </div>
          <Button
            onClick={openInMaps}
            size="sm"
            className="h-8 px-3 bg-[#3A8F4C] hover:bg-[#2E7D32] text-white text-xs font-medium shadow-lg"
          >
            <ExternalLink className="w-3 h-3 mr-1.5" />
            Ouvrir
          </Button>
        </div>
        <div className="absolute bottom-2 right-2 bg-white/95 dark:bg-[#003D5C]/95 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg border border-[#004D73]/20 dark:border-white/20 z-50">
          <p className="text-[10px] text-[#004D73] dark:text-white/60">
            Zoom: {13}
          </p>
        </div>
      </div>
    </>
  )
}

