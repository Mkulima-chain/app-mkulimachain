import { useState, useCallback } from "react";
import { toast } from "sonner";

const COPY_FEEDBACK_DURATION = 2000;

export function useCopyAddress() {
  const [copied, setCopied] = useState(false);

  const copyAddress = useCallback(async (address: string | null) => {
    if (!address) {
      toast.error("Aucune adresse à copier");
      return;
    }

    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast.success("Adresse copiée");

      setTimeout(() => {
        setCopied(false);
      }, COPY_FEEDBACK_DURATION);
    } catch (error) {
      console.error("Failed to copy address:", error);
      toast.error("Erreur lors de la copie");
    }
  }, []);

  return {
    copied,
    copyAddress,
  };
}
