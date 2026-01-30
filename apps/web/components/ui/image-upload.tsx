"use client";

import * as React from "react";
import Image from "next/image";
import { X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5600/api";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  className,
  disabled,
}: ImageUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const uploadImageToIPFS = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    // We will use a specific endpoint for IPFS upload
    // Note: This endpoint needs to be implemented/verified in the backend
    const response = await fetch(`${API_BASE_URL}/upload/ipfs`, {
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
    return data.url; // Should return ipfs://CID
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadImageToIPFS(file);
      onChange(url);
      toast.success("Image uploadée avec succès sur IPFS");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload de l'image"
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  // Helper to display image preview (handling ipfs:// protocol for display if needed)
  // But usually we need an HTTP gateway for <Image />
  const getDisplayUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("ipfs://")) {
      return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
    }
    return url;
  };

  return (
    <div className={cn("space-y-4", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {!value ? (
        <div
          onClick={handleClick}
          className={cn(
            "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#004D73]/20 dark:border-white/20 rounded-lg transition-colors bg-black/5 dark:bg-white/5",
            disabled || uploading
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-[#3A8F4C] hover:bg-[#3A8F4C]/5"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 text-[#004D73] dark:text-white mb-2 animate-spin" />
              <p className="text-sm text-[#004D73] dark:text-white/80">
                Upload sur IPFS en cours...
              </p>
            </>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-[#004D73] dark:text-white/60 mb-2" />
              <p className="text-sm font-medium text-[#004D73] dark:text-white">
                Cliquez pour ajouter une image
              </p>
              <p className="text-xs text-[#004D73]/60 dark:text-white/50 mt-1">
                JPG, PNG, WEBP (Max 10MB)
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-[#004D73]/20 dark:border-white/20">
          <Image
            src={getDisplayUrl(value)}
            alt="Upload preview"
            fill
            className="object-cover"
            unoptimized
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
