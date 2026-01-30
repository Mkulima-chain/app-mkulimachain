"use client";

import { useState, useEffect } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Composant pour charger les styles Leaflet et configurer les icônes
function LeafletStyles() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Charger le CSS de Leaflet via un élément <link> dans le DOM
      const linkId = "leaflet-stylesheet";
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      // Fix pour les icônes par défaut de Leaflet
      import("leaflet").then((L) => {
        // Supprimer la méthode _getIconUrl si elle existe
        if ((L.Icon.Default.prototype as any)._getIconUrl) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
        }

        // Configurer les URLs des icônes avec des URLs CDN
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });
      });
    }
  }, []);

  return null;
}

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  className?: string;
  height?: string;
}

export function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
  className,
  height = "h-64",
}: LocationPickerProps) {
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [Popup, setPopup] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);

  // Position par défaut (Kenya - centre approximatif)
  const defaultPosition: [number, number] = [-1.2921, 36.8219];
  const currentPosition: [number, number] =
    latitude && longitude
      ? [Number(latitude), Number(longitude)]
      : defaultPosition;

  useEffect(() => {
    const loadComponents = async () => {
      try {
        // Charger et configurer Leaflet avant de charger react-leaflet
        const L = await import("leaflet");

        // Supprimer la méthode _getIconUrl si elle existe
        if ((L.Icon.Default.prototype as any)._getIconUrl) {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
        }

        // Configurer les URLs des icônes avec des URLs CDN
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        // Maintenant charger react-leaflet
        const mod = await import("react-leaflet");
        setMapContainer(() => mod.MapContainer);
        setTileLayer(() => mod.TileLayer);
        setMarker(() => mod.Marker);
        setPopup(() => mod.Popup);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading map components:", error);
        setIsLoading(false);
      }
    };

    loadComponents();
  }, []);

  const handleGetCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error(
        "La géolocalisation n'est pas supportée par votre navigateur"
      );
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        onLocationChange(lat, lng);
        setIsGettingLocation(false);
        toast.success("Position récupérée avec succès");

        // Centrer la carte sur la position
        if (mapInstance) {
          mapInstance.setView([lat, lng], 15);
        }
      },
      (error: GeolocationPositionError) => {
        setIsGettingLocation(false);

        let errorMessage = "Impossible de récupérer votre position.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Accès à la géolocalisation refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Position indisponible. Vérifiez que votre GPS est activé.";
            break;
          case error.TIMEOUT:
            errorMessage = "Délai d'attente dépassé. Veuillez réessayer.";
            break;
          default:
            errorMessage =
              "Erreur lors de la récupération de la position. Veuillez réessayer.";
            break;
        }

        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    onLocationChange(lat, lng);
  };

  if (isLoading || !MapContainer || !TileLayer || !Marker || !Popup) {
    return (
      <div
        className={cn(
          "relative rounded-lg border overflow-hidden bg-muted/30",
          className,
          height
        )}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#3A8F4C] mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Chargement de la carte...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <LeafletStyles />
      <div
        className={cn(
          "relative rounded-lg border overflow-hidden bg-muted/30",
          className,
          height
        )}
      >
        <div className="absolute top-2 right-2 z-[1000] flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="bg-white/90 hover:bg-white shadow-md"
          >
            {isGettingLocation ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Localisation...
              </>
            ) : (
              <>
                <Navigation className="h-4 w-4 mr-2" />
                Ma position
              </>
            )}
          </Button>
        </div>
        <MapContainer
          center={currentPosition}
          zoom={latitude && longitude ? 13 : 6}
          minZoom={3}
          maxZoom={18}
          scrollWheelZoom={true}
          className="w-full h-full"
          style={{ zIndex: 0 }}
          whenCreated={(map: any) => {
            setMapInstance(map);
            map.on("click", handleMapClick);
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {latitude && longitude && (
            <Marker
              position={[Number(latitude), Number(longitude)]}
              eventHandlers={{
                dragend: (e: any) => {
                  const marker = e.target;
                  const position = marker.getLatLng();
                  onLocationChange(position.lat, position.lng);
                },
              }}
              draggable={true}
            >
              <Popup>
                <div className="text-center p-2">
                  <MapPin className="h-4 w-4 text-[#3A8F4C] mx-auto mb-1" />
                  <p className="text-xs font-medium">Position sélectionnée</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(latitude).toFixed(6)},{" "}
                    {Number(longitude).toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 px-2 py-1 rounded text-xs text-muted-foreground shadow-md">
          Cliquez sur la carte pour sélectionner une position
        </div>
      </div>
    </>
  );
}
