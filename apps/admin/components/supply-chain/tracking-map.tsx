"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
const iconShadow = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [41, 41],
  iconAnchor: [12, 41],
});

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
});

const activeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Step = {
  id: string;
  stepType: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  description?: string;
  timestamp: string;
};

type TrackingMapProps = {
  steps: Step[];
  selectedStepId?: string | null;
  onStepSelect?: (step: Step) => void;
};

export default function TrackingMap({
  steps,
  selectedStepId,
  onStepSelect,
}: TrackingMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
        <p className="text-muted-foreground">Chargement de la carte...</p>
      </div>
    );
  }

  // Filter steps with valid coordinates
  const validSteps = steps.filter(
    (step) =>
      step.latitude !== undefined &&
      step.longitude !== undefined &&
      step.latitude !== null &&
      step.longitude !== null
  );

  if (validSteps.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-muted rounded-lg">
        <p className="text-muted-foreground">
          Aucune donnée de localisation disponible pour ce lot.
        </p>
      </div>
    );
  }

  // Calculate bounds or center
  const center: [number, number] = [
    validSteps[0].latitude!,
    validSteps[0].longitude!,
  ];
  const polylinePositions: [number, number][] = validSteps.map((s) => [
    s.latitude!,
    s.longitude!,
  ]);

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border z-0 relative">
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw path between steps */}
        <Polyline
          positions={polylinePositions}
          pathOptions={{ color: "#3A8F4C", weight: 3, dashArray: "5, 10" }}
        />

        {/* Markers for each step */}
        {validSteps.map((step, index) => (
          <Marker
            key={step.id}
            position={[step.latitude!, step.longitude!]}
            icon={step.id === selectedStepId ? activeIcon : defaultIcon}
            eventHandlers={{
              click: () => onStepSelect?.(step),
            }}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-sm">{step.stepType}</p>
                <p className="text-xs text-muted-foreground mb-1">
                  {new Date(step.timestamp).toLocaleDateString()}
                </p>
                {step.locationName && (
                  <p className="text-xs font-medium">{step.locationName}</p>
                )}
                {step.description && (
                  <p className="text-xs mt-1 border-t pt-1">
                    {step.description.slice(0, 50)}
                    {step.description.length > 50 ? "..." : ""}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
