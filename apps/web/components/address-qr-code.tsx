"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AddressQRCodeProps {
  address: string;
  title?: string;
  description?: string;
  size?: number;
  className?: string;
}

export function AddressQRCode({
  address,
  title = "Adresse de paiement",
  description,
  size = 200,
  className,
}: AddressQRCodeProps) {
  const [copied, setCopied] = useState(false);

  // Formater l'adresse en URI Cardano pour les wallets
  const cardanoUri = `cardano:${address}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Adresse copiée dans le presse-papier !");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
      toast.error("Impossible de copier l'adresse");
    }
  };

  const handleDownload = () => {
    try {
      const svg = document.querySelector(
        `[data-qr-code="${address}"]`
      ) as HTMLElement;
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `qr-code-${address.slice(0, 10)}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success("QR code téléchargé !");
      };

      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Impossible de télécharger le QR code");
    }
  };

  const formatAddress = (addr: string) => {
    if (addr.length <= 20) return addr;
    return `${addr.slice(0, 10)}...${addr.slice(-10)}`;
  };

  return (
    <Card className={cn("border-[#004D73]/20 dark:border-white/20", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-[#5A3E36] dark:text-white">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-[#004D73] dark:text-white/70">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center p-4 bg-white dark:bg-[#004D73]/20 rounded-lg border border-[#004D73]/10 dark:border-white/10">
          <div data-qr-code={address}>
            <QRCodeSVG
              value={cardanoUri}
              size={size}
              level="H"
              includeMargin={true}
              fgColor="#003D5C"
              bgColor="#FFFFFF"
            />
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#004D73] dark:text-white/70">
            Adresse Cardano
          </p>
          <div className="flex items-center gap-2 p-2 bg-muted/50 dark:bg-[#004D73]/30 rounded-lg border border-[#004D73]/10 dark:border-white/10">
            <code className="text-xs font-mono text-[#5A3E36] dark:text-white/90 flex-1 break-all">
              {formatAddress(address)}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className={cn(
                "h-7 w-7 shrink-0",
                copied && "bg-[#3A8F4C]/20 dark:bg-[#3A8F4C]/30"
              )}
              title="Copier l'adresse"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[#3A8F4C]" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-[#004D73] dark:text-white/70" />
              )}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1 border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white"
          >
            <Copy className="h-3.5 w-3.5 mr-2" />
            Copier
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1 border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white"
          >
            <Download className="h-3.5 w-3.5 mr-2" />
            Télécharger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
