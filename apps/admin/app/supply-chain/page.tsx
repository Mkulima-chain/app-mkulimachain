"use client";

import * as React from "react";
import { Search, Plus, Loader2, Locate } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import Timeline from "@/components/supply-chain/timeline";
import dynamic from "next/dynamic";

// Dynamically import TrackingMap with no SSR to avoid window issues
const TrackingMap = dynamic(
  () => import("@/components/supply-chain/tracking-map"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-muted animate-pulse rounded-lg" />
    ),
  }
);

enum StepType {
  HARVEST = "harvest",
  DRYING = "drying",
  PACKAGING = "packaging",
  EXPORT = "export",
}

type SupplyChainStep = {
  id: string;
  batchId: string;
  stepType: StepType;
  timestamp: string;
  metadataHash: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  description?: string;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
};

type Batch = {
  id: string;
  qrCode: string; // The human readable ID (e.g. BATCH-2024-...)
  status: string;
};

type CreateSupplyChainStepDto = {
  batchId: string;
  stepType: StepType;
  timestamp?: string;
  metadataHash: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  description?: string;
  txHash?: string;
};

export default function SupplyChainPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);
  const [selectedStep, setSelectedStep] =
    React.useState<SupplyChainStep | null>(null);

  const [formData, setFormData] = React.useState<CreateSupplyChainStepDto>({
    batchId: "",
    stepType: StepType.HARVEST,
    timestamp: new Date().toISOString().slice(0, 16),
    metadataHash: "",
    locationName: "",
    description: "",
    latitude: undefined,
    longitude: undefined,
    txHash: "",
  });

  // Fetch steps
  const {
    data: steps = [],
    isLoading,
    refetch,
  } = useApiQuery<SupplyChainStep[]>(
    ["supply-chain-steps", searchQuery],
    `/supply-chain-steps${searchQuery ? `?batchId=${encodeURIComponent(searchQuery)}` : ""}`
  );

  // Fetch batches for selection
  const { data: batches = [] } = useApiQuery<Batch[]>(["batches"], "/batches");

  // Create mutation
  const createMutation = useApiMutation<
    SupplyChainStep,
    CreateSupplyChainStepDto
  >("/supply-chain-steps", "POST", {
    onSuccess: () => {
      toast.success("Étape ajoutée avec succès");
      setIsAddDialogOpen(false);
      refetch();
    },
  });

  const handleAdd = () => {
    setFormData({
      batchId: searchQuery || (batches.length > 0 ? batches[0].id : ""),
      stepType: StepType.HARVEST,
      timestamp: new Date().toISOString().slice(0, 16),
      metadataHash: "",
      locationName: "",
      description: "",
      latitude: undefined,
      longitude: undefined,
      txHash: "",
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      timestamp: formData.timestamp
        ? new Date(formData.timestamp).toISOString()
        : undefined,
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
    });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        "La géolocalisation n'est pas supportée par votre navigateur"
      );
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        toast.success("Position récupérée avec succès");
        setIsGettingLocation(false);
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        let errorMessage = "Impossible de récupérer la position";

        if (error.code === 1) {
          // PERMISSION_DENIED
          errorMessage = "Vous avez refusé la permission de géolocalisation.";
        } else if (error.code === 2) {
          // POSITION_UNAVAILABLE
          errorMessage = "La position est indisponible actuement.";
        } else if (error.code === 3) {
          // TIMEOUT
          errorMessage = "La demande de position a expiré.";
        }

        toast.error(errorMessage);
        setIsGettingLocation(false);
      }
    );
  };

  // Effect to select the first step/latest step when data loads
  React.useEffect(() => {
    if (steps.length > 0 && !selectedStep) {
      setSelectedStep(steps[0]);
    }
  }, [steps]);

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Traçabilité</h1>
          <p className="text-muted-foreground mt-1">
            Visualisation en temps réel de la chaîne d'approvisionnement
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher lot ou produit..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={handleAdd}
            className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Étape
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#3A8F4C]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
          {/* Left Column: Timeline */}
          <Card className="lg:col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-4 shrink-0">
              <CardTitle>Journal de bord</CardTitle>
              <CardDescription>
                {steps.length} étapes enregistrées pour ce lot
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {steps.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  Aucune donnée trouvée. Commencez par rechercher un lot ou
                  ajoutez une étape.
                </div>
              ) : (
                <Timeline
                  steps={steps}
                  selectedStepId={selectedStep?.id}
                  onSelectStep={(step) =>
                    setSelectedStep(step as SupplyChainStep)
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Right Column: Map */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            <CardHeader className="pb-0 shrink-0 border-b">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <CardTitle>Carte Interactive</CardTitle>
                  <CardDescription>
                    Localisation en temps réel du produit
                  </CardDescription>
                </div>
                {selectedStep && (
                  <div className="text-xs text-right hidden sm:block">
                    <p className="font-medium">
                      {selectedStep.locationName || "Lieu inconnu"}
                    </p>
                    <p className="text-muted-foreground">
                      {selectedStep.latitude?.toFixed(4)},{" "}
                      {selectedStep.longitude?.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <TrackingMap
                steps={steps}
                selectedStepId={selectedStep?.id}
                onStepSelect={(step) =>
                  setSelectedStep(step as SupplyChainStep)
                }
              />

              {/* Overlay Info Card (Mobile/Desktop) */}
              {selectedStep && (
                <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-background/95 backdrop-blur shadow-lg border rounded-lg p-4 z-[9999]">
                  <h3 className="font-bold text-sm mb-1">
                    {selectedStep.stepType.toUpperCase()}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {new Date(selectedStep.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm line-clamp-2 mb-2">
                    {selectedStep.description ||
                      "Aucune description disponible."}
                  </p>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                    <span className="bg-muted px-1.5 py-0.5 rounded">
                      Meta: {selectedStep.metadataHash.slice(0, 8)}...
                    </span>
                    {selectedStep.txHash && (
                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded dark:bg-blue-900/20 dark:text-blue-300">
                        Tx: {selectedStep.txHash.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter une étape de traçabilité</DialogTitle>
            <DialogDescription>
              Enregistrez un nouvel événement dans le parcours du produit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="batchId">Lot (Batch) *</Label>
                  <select
                    id="batchId"
                    value={formData.batchId}
                    onChange={(e) =>
                      setFormData({ ...formData, batchId: e.target.value })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                    required
                  >
                    <option value="" disabled>
                      Sélectionner un lot
                    </option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.qrCode}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stepType">Type d'étape *</Label>
                  <select
                    id="stepType"
                    value={formData.stepType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stepType: e.target.value as StepType,
                      })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                    required
                  >
                    <option value={StepType.HARVEST}>Récolte</option>
                    <option value={StepType.DRYING}>Séchage</option>
                    <option value={StepType.PACKAGING}>Emballage</option>
                    <option value={StepType.EXPORT}>Export</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="timestamp">Date et Heure</Label>
                <Input
                  id="timestamp"
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) =>
                    setFormData({ ...formData, timestamp: e.target.value })
                  }
                />
              </div>

              <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Localisation</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                  >
                    {isGettingLocation ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Locate className="h-3 w-3" />
                    )}
                    Ma position
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="locationName">Nom du lieu</Label>
                  <Input
                    id="locationName"
                    placeholder="Ex: Entrepôt Principal, Mombasa"
                    value={formData.locationName}
                    onChange={(e) =>
                      setFormData({ ...formData, locationName: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="-4.0435"
                      value={formData.latitude || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          latitude: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="39.6682"
                      value={formData.longitude || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          longitude: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Détails sur l'opération..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="metadataHash">Hash Métadonnées IPFS *</Label>
                <Input
                  id="metadataHash"
                  placeholder="Qm..."
                  value={formData.metadataHash}
                  onChange={(e) =>
                    setFormData({ ...formData, metadataHash: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="txHash">Transaction ID (Cardano)</Label>
                <Input
                  id="txHash"
                  placeholder="Hash de la transaction..."
                  value={formData.txHash}
                  onChange={(e) =>
                    setFormData({ ...formData, txHash: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer l'étape"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
