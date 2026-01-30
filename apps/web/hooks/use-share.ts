"use client";

import { useLocale } from "next-intl";
import { toast } from "sonner";

interface ShareProductOptions {
  productId: string;
  productName: string;
  productDescription?: string;
  productImage?: string;
  productPrice?: number;
}

export function useShare() {
  const locale = useLocale();

  const shareProduct = async ({
    productId,
    productName,
    productDescription,
    productImage,
    productPrice,
  }: ShareProductOptions) => {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    
    // Construire l'URL du produit
    // Pour l'instant, on partage la page marketplace avec un paramètre de produit
    // Vous pouvez créer une page dédiée pour chaque produit plus tard
    const productUrl = `${baseUrl}/${locale}/marketplace?product=${productId}`;

    const shareText = productPrice
      ? `Découvrez ${productName} sur Mkulima Chain pour ${productPrice} ₳${productDescription ? ` - ${productDescription}` : ""}`
      : `Découvrez ${productName} sur Mkulima Chain${productDescription ? ` - ${productDescription}` : ""}`;

    const shareData: ShareData = {
      title: `${productName} - Mkulima Chain`,
      text: shareText,
      url: productUrl,
    };

    // Vérifier si l'API Web Share est disponible
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Produit partagé avec succès !");
      } catch (error: unknown) {
        // L'utilisateur a annulé le partage ou une erreur s'est produite
        if (
          error instanceof Error &&
          error.name !== "AbortError"
        ) {
          console.error("Erreur lors du partage:", error);
          // Fallback: copier dans le presse-papier
          await copyToClipboard(productUrl, productName);
        }
      }
    } else {
      // Fallback: copier dans le presse-papier
      await copyToClipboard(productUrl, productName);
    }
  };

  const copyToClipboard = async (url: string, productName: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(
        `Lien de ${productName} copié dans le presse-papier !`,
        {
          description: "Vous pouvez maintenant le partager.",
        }
      );
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
      toast.error("Impossible de copier le lien", {
        description: "Veuillez copier manuellement l'URL.",
      });
    }
  };

  return { shareProduct };
}

