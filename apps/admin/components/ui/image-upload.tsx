"use client";

import * as React from "react";
import Image from "next/image";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5600/api";

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  className,
}: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Erreur lors de l'upload" }));
      throw new Error(error.message || "Erreur lors de l'upload");
    }

    const data = await response.json();
    return data.url;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (newFiles.length > remainingSlots) {
      toast.error(
        `Vous ne pouvez ajouter que ${remainingSlots} image(s) supplémentaire(s)`
      );
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = newFiles
        .filter((file) => file.type.startsWith("image/"))
        .map((file) => uploadImageToCloudinary(file));

      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploadée(s) avec succès`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload des images"
      );
    } finally {
      setUploading(false);
      // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Images du produit{" "}
          {images.length > 0 && `(${images.length}/${maxImages})`}
        </label>
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            className="gap-2"
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Upload...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Ajouter
              </>
            )}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={images.length >= maxImages || uploading}
      />

      {images.length === 0 ? (
        <div
          onClick={handleClick}
          className={cn(
            "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg transition-colors",
            uploading
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-muted-foreground/50"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
              <p className="text-sm text-muted-foreground">
                Upload en cours...
              </p>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Cliquez pour ajouter des images
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum {maxImages} images
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-muted"
            >
              <Image
                src={image}
                alt={`Produit ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {images.length < maxImages && (
            <div
              onClick={uploading ? undefined : handleClick}
              className={cn(
                "flex flex-col items-center justify-center aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg transition-colors",
                uploading
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:border-muted-foreground/50"
              )}
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 text-muted-foreground mb-2 animate-spin" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    Ajouter
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
