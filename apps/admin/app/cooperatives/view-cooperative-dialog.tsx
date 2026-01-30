"use client";

import * as React from "react";
import { Loader2, Building2, MapPin, User, Users, Calendar, Phone, UserMinus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "sonner";

type Cooperative = {
  id: string;
  name: string;
  location: string;
  leader: string;
  createdAt: string;
  updatedAt: string;
};

type Farmer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  cooperativeId?: string;
  cooperative?: {
    id: string;
  };
};

interface ViewCooperativeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cooperativeId: string;
  onSuccess?: () => void;
}

export function ViewCooperativeDialog({
  open,
  onOpenChange,
  cooperativeId,
  onSuccess,
}: ViewCooperativeDialogProps) {
  const [farmerToRemove, setFarmerToRemove] = React.useState<Farmer | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = React.useState(false);
  // Récupérer les détails de la coopérative
  const {
    data: cooperative,
    isLoading: isLoadingCooperative,
    refetch: refetchCooperative,
  } = useApiQuery<Cooperative>(
    ["cooperative", cooperativeId],
    `/cooperatives/${cooperativeId}`,
    {
      enabled: open && !!cooperativeId,
    }
  );

  // Récupérer tous les agriculteurs et filtrer par cooperativeId
  const { data: allFarmers = [], isLoading: isLoadingFarmers, refetch: refetchFarmers } = useApiQuery<Farmer[]>(
    ["farmers"],
    `/farmers`,
    {
      enabled: open && !!cooperativeId,
    }
  );

  // Filtrer les agriculteurs de cette coopérative
  const farmers = React.useMemo(() => {
    if (!cooperativeId || !allFarmers.length) return [];
    
    return allFarmers.filter((farmer) => {
      // Gérer les différents cas : cooperativeId direct, cooperative.id, ou dans les données brutes
      const farmerCooperativeId = 
        farmer.cooperativeId || 
        farmer.cooperative?.id || 
        (farmer as any).cooperativeId;
      
      // Comparaison stricte avec l'ID de la coopérative
      return farmerCooperativeId === cooperativeId;
    });
  }, [allFarmers, cooperativeId]);

  // Mutation pour désadhérer un agriculteur
  const removeFarmerMutation = useApiMutation<Farmer, { cooperativeId: string | null }>(
    () => `/farmers/${farmerToRemove?.id}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Agriculteur désadhéré de la coopérative avec succès");
        setFarmerToRemove(null);
        setIsRemoveDialogOpen(false);
        // Rafraîchir les données
        refetchFarmers();
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de la désadhésion de l'agriculteur"
        );
      },
    }
  );

  const handleRemoveFarmer = (farmer: Farmer) => {
    setFarmerToRemove(farmer);
    setIsRemoveDialogOpen(true);
  };

  const handleConfirmRemove = () => {
    if (!farmerToRemove) return;
    removeFarmerMutation.mutate({ cooperativeId: null });
  };

  const isLoading = isLoadingCooperative || isLoadingFarmers;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#3A8F4C]" />
            Détails de la coopérative
          </DialogTitle>
          <DialogDescription>
            Informations complètes sur la coopérative et ses membres
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#3A8F4C]" />
          </div>
        ) : cooperative ? (
          <div className="space-y-6">
            {/* Informations de la coopérative */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#3A8F4C]" />
                  Informations générales
                </h3>
                <div className="grid gap-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Nom</p>
                      <p className="text-base font-semibold">{cooperative.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Localisation</p>
                      <p className="text-base">{cooperative.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Leader</p>
                      <p className="text-base">{cooperative.leader}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                      <p className="text-base">
                        {new Date(cooperative.createdAt).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t my-4" />

            {/* Liste des agriculteurs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#3A8F4C]" />
                  Membres ({farmers.length})
                </h3>
              </div>

              {farmers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Aucun agriculteur membre de cette coopérative</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {farmers.map((farmer) => (
                    <div
                      key={farmer.id}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{farmer.name}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {farmer.phone}
                            </span>
                            <span>{farmer.city}, {farmer.state}</span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFarmer(farmer)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Désadhérer cet agriculteur"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Impossible de charger les détails de la coopérative</p>
          </div>
        )}
      </DialogContent>

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Désadhérer l'agriculteur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir désadhérer <strong>{farmerToRemove?.name}</strong> de la
              coopérative <strong>{cooperative?.name}</strong> ? Cette action peut être annulée en
              réadhérant l'agriculteur.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(false)}
              disabled={removeFarmerMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRemove}
              disabled={removeFarmerMutation.isPending}
            >
              {removeFarmerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Désadhésion...
                </>
              ) : (
                "Désadhérer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

