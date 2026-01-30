"use client";

import * as React from "react";
import { X, Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5600/api";

interface FileUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  accept?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  value,
  onChange,
  accept = "image/*,.pdf",
  label = "Document",
  placeholder = "Cliquez pour uploader un fichier",
  className,
  disabled = false,
}: FileUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const uploadFile = async (file: File): Promise<string> => {
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

    const file = files[0];

    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
      toast.success("Fichier uploadé avec succès");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'upload du fichier"
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const isImage = value?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPdf = value?.match(/\.pdf$/i);

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {!value ? (
        <div
          onClick={handleClick}
          className={cn(
            "flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg transition-colors",
            disabled || uploading
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:border-muted-foreground/50 hover:bg-muted/50"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 text-muted-foreground mb-1 animate-spin" />
              <p className="text-xs text-muted-foreground">Upload en cours...</p>
            </>
          ) : (
            <>
              <Upload className="h-6 w-6 text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground text-center px-2">
                {placeholder}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="relative flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
          {isImage ? (
            <div className="relative w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
              />
            </div>
          ) : isPdf ? (
            <div className="w-12 h-12 rounded bg-red-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{label}</p>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline truncate block"
            >
              Voir le fichier
            </a>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
