"use client";

import * as React from "react";
import { Loader2, UserPlus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useApiQuery } from "@/hooks/use-api-query";
import { useApiMutation } from "@/hooks/use-api-mutation";

type Farmer = {
  id: string;
  name: string;
  phone: string;
  cooperativeId?: string;
  cooperative?: {
    id: string;
  };
};

interface AddFarmerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cooperativeId: string;
  cooperativeName: string;
  onSuccess: () => void;
}

export function AddFarmerDialog({
  open,
  onOpenChange,
  cooperativeId,
  cooperativeName,
  onSuccess,
}: AddFarmerDialogProps) {
  const [selectedFarmerId, setSelectedFarmerId] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  // Récupérer la liste des agriculteurs
  const { data: farmers = [], isLoading: isLoadingFarmers } = useApiQuery<Farmer[]>(
    ["farmers"],
    "/farmers"
  );

  // Filtrer les agriculteurs qui ne sont pas déjà membres de cette coopérative
  const availableFarmers = React.useMemo(() => {
    return farmers.filter((farmer) => {
      // Exclure les agriculteurs déjà membres de cette coopérative
      const farmerCooperativeId = farmer.cooperativeId || (farmer as any).cooperative?.id;
      if (farmerCooperativeId === cooperativeId) {
        return false;
      }
      
      // Filtrer par recherche si une recherche est active
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = farmer.name.toLowerCase().includes(query);
        const phoneMatch = farmer.phone.toLowerCase().includes(query);
        return nameMatch || phoneMatch;
      }
      
      return true;
    });
  }, [farmers, cooperativeId, searchQuery]);

  // Mutation pour mettre à jour l'agriculteur
  const updateMutation = useApiMutation<Farmer, { cooperativeId: string }>(
    () => `/farmers/${selectedFarmerId}`,
    "PUT",
    {
      onSuccess: () => {
        toast.success("Agriculteur adhéré à la coopérative avec succès");
        setSelectedFarmerId("");
        setSearchQuery("");
        onOpenChange(false);
        onSuccess();
      },
      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Erreur lors de l'adhésion de l'agriculteur"
        );
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFarmerId) {
      toast.error("Veuillez sélectionner un agriculteur");
      return;
    }

    if (!cooperativeId) {
      toast.error("Erreur: ID de la coopérative manquant");
      return;
    }

    // Envoyer la mise à jour avec cooperativeId
    updateMutation.mutate({ cooperativeId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-[#3A8F4C]" />
            Adhérer un agriculteur
          </DialogTitle>
          <DialogDescription>
            Sélectionnez un agriculteur à adhérer à la coopérative{" "}
            <strong>{cooperativeName}</strong>. Si l'agriculteur est déjà membre d'une autre
            coopérative, il sera transféré à cette coopérative.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="search">Rechercher un agriculteur</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  type="search"
                  placeholder="Rechercher par nom ou téléphone..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="farmer">Agriculteur *</Label>
              {isLoadingFarmers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[#3A8F4C]" />
                </div>
              ) : availableFarmers.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  {searchQuery.trim() 
                    ? "Aucun agriculteur trouvé correspondant à votre recherche."
                    : "Aucun agriculteur disponible. Tous les agriculteurs sont déjà membres de cette coopérative."}
                </div>
              ) : (
                <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un agriculteur" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] max-h-[200px]">
                    {availableFarmers.map((farmer) => (
                      <SelectItem key={farmer.id} value={farmer.id}>
                        {farmer.name} - {farmer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {availableFarmers.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {availableFarmers.length} agriculteur{availableFarmers.length > 1 ? 's' : ''} disponible{availableFarmers.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedFarmerId("");
                setSearchQuery("");
                onOpenChange(false);
              }}
              disabled={updateMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
              disabled={updateMutation.isPending || !selectedFarmerId || availableFarmers.length === 0}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adhésion...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adhérer
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

