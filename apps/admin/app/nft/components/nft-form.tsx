import { Image, X, Music, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NFTType, CreateNFTDto, RevenueDistribution } from "../types";
import { isValidUUID } from "../utils";
import { MIN_PRICE_ADA } from "../constants";

interface NFTFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateNFTDto,
    imageFile?: File,
    audioFile?: File
  ) => Promise<void>;
  formData: CreateNFTDto;
  onFormDataChange: (data: Partial<CreateNFTDto>) => void;
  imageFile: File | null;
  audioFile: File | null;
  imagePreview: string | null;
  audioPreview: string | null;
  onImageSelect: (file: File) => void;
  onAudioSelect: (file: File) => void;
  onRemoveImage: () => void;
  onRemoveAudio: () => void;
  isLoading?: boolean;
}

export const NFTForm = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormDataChange,
  imageFile,
  audioFile,
  imagePreview,
  audioPreview,
  onImageSelect,
  onAudioSelect,
  onRemoveImage,
  onRemoveAudio,
  isLoading = false,
}: NFTFormProps) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, imageFile || undefined, audioFile || undefined);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        onImageSelect(file);
      } catch (error) {
        // Error handling should be done in parent component
      }
    }
  };

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        onAudioSelect(file);
      } catch (error: unknown) {
        // Error handling should be done in parent component
      }
    }
  };

  const updateRevenueDistribution = (
    field: keyof RevenueDistribution,
    value: number
  ) => {
    onFormDataChange({
      revenueDistribution: {
        ...formData.revenueDistribution,
        [field]: value,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter un NFT</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour ajouter un nouveau NFT culturel
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="creatorId">ID du créateur *</Label>
              <Input
                id="creatorId"
                value={formData.creatorId}
                onChange={(e) =>
                  onFormDataChange({ creatorId: e.target.value })
                }
                placeholder="123e4567-e89b-12d3-a456-426614174000"
                required
                className={
                  formData.creatorId && !isValidUUID(formData.creatorId)
                    ? "border-red-500"
                    : ""
                }
              />
              {formData.creatorId && !isValidUUID(formData.creatorId) && (
                <p className="text-xs text-red-500">
                  Format UUID invalide. Exemple:
                  123e4567-e89b-12d3-a456-426614174000
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Format UUID requis (ex: 123e4567-e89b-12d3-a456-426614174000)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) =>
                  onFormDataChange({ type: e.target.value as NFTType })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                required
              >
                <option value={NFTType.RECIPE}>Recette</option>
                <option value={NFTType.TALE}>Conte</option>
                <option value={NFTType.SONG}>Chant</option>
                <option value={NFTType.ART}>Art</option>
                <option value={NFTType.TRADITION}>Tradition</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => onFormDataChange({ title: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  onFormDataChange({ description: e.target.value })
                }
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="metadataURI">
                URI des métadonnées
                {!imageFile && !audioFile && " *"}
              </Label>
              <Input
                id="metadataURI"
                value={formData.metadataURI}
                onChange={(e) =>
                  onFormDataChange({ metadataURI: e.target.value })
                }
                placeholder="ipfs://... (optionnel si fichiers fournis)"
                required={!imageFile && !audioFile}
              />
              {(imageFile || audioFile) && (
                <p className="text-xs text-muted-foreground">
                  L&apos;URI sera générée automatiquement depuis les fichiers
                  uploadés
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="grid gap-2">
              <Label htmlFor="image">Image du NFT</Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={onRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        Cliquez pour uploader une image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP (max 50MB)
                      </p>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Audio Upload */}
            <div className="grid gap-2">
              <Label htmlFor="audio">Fichier audio (optionnel)</Label>
              {audioPreview ? (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm">{audioPreview}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onRemoveAudio}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="audio-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Music className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        Cliquez pour uploader un fichier audio
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP3, WAV, OGG (max 50MB)
                      </p>
                    </div>
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleAudioChange}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priceADA">Prix (₳) *</Label>
              <Input
                id="priceADA"
                type="number"
                step="0.000001"
                min={MIN_PRICE_ADA}
                value={formData.priceADA}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  onFormDataChange({
                    priceADA:
                      isNaN(value) || value < MIN_PRICE_ADA
                        ? MIN_PRICE_ADA
                        : value,
                  });
                }}
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum: {MIN_PRICE_ADA} ADA
              </p>
            </div>

            <div className="grid gap-4">
              <Label>Distribution des revenus (%)</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="creatorPercent">Créateur</Label>
                  <Input
                    id="creatorPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.revenueDistribution.creatorPercent}
                    onChange={(e) =>
                      updateRevenueDistribution(
                        "creatorPercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schoolFundPercent">Fonds scolaire</Label>
                  <Input
                    id="schoolFundPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.revenueDistribution.schoolFundPercent}
                    onChange={(e) =>
                      updateRevenueDistribution(
                        "schoolFundPercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="platformPercent">Plateforme</Label>
                  <Input
                    id="platformPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.revenueDistribution.platformPercent}
                    onChange={(e) =>
                      updateRevenueDistribution(
                        "platformPercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-[#3A8F4C] hover:bg-[#2E7D32]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ajout...
                </>
              ) : (
                "Ajouter"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
