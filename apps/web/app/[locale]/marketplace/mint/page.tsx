"use client";

import { useState } from "react";
import { useCardanoWallet } from "@/hooks/use-cardano-wallet";
import { MintingContractService } from "@/services/lucid/minting-contract.service";
import { useAtomValue } from "jotai";
import { walletAtom } from "@/lib/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/image-upload";

export default function MintPage() {
  const { connected, connect, wallets } = useCardanoWallet();
  const walletState = useAtomValue(walletAtom);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    mediaType: "image/jpeg",
  });
  const [isMinting, setIsMinting] = useState(false);
  const [mintedTxHash, setMintedTxHash] = useState<string | null>(null);

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connected || !walletState.lucid) {
      toast.error("Veuillez connecter votre wallet");
      return;
    }

    try {
      setIsMinting(true);
      const mintingService = new MintingContractService(walletState.lucid);

      const metadata = {
        name: formData.name,
        image: formData.image, // In a real app, this should be ipfs://...
        description: formData.description,
        mediaType: formData.mediaType,
      };

      // Ensure asset name is unique-ish or just use the name (Cardano asset names are limited in chars)
      const assetName = formData.name.replace(/\s+/g, "").substring(0, 32);

      const result = await mintingService.mintNFT(assetName, metadata);

      setMintedTxHash(result.txHash);
      toast.success("NFT minté avec succès !");

      // Reset form
      setFormData({
        name: "",
        description: "",
        image: "",
        mediaType: "image/jpeg",
      });
    } catch (error: any) {
      console.error("Minting error:", error);
      toast.error(
        `Erreur lors du minting: ${error.message || "Erreur inconnue"}`
      );
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#004D73] pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-[#004D73] dark:text-white/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[#5A3E36] dark:text-white">
              Créer un NFT (Minting)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!connected ? (
              <div className="text-center py-8">
                <p className="mb-4 text-[#004D73] dark:text-white/80">
                  Connectez votre wallet pour créer un NFT
                </p>
                <Button
                  onClick={() => setShowWalletModal(true)}
                  className="bg-[#3A8F4C] text-white"
                >
                  Connecter Wallet
                </Button>
              </div>
            ) : (
              <form onSubmit={handleMint} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du NFT</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Masque Traditionnel"
                    required
                    className="border-[#004D73]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Description du NFT..."
                    required
                    className="border-[#004D73]/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image du NFT</Label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url: string) =>
                      setFormData({ ...formData, image: url })
                    }
                  />
                  <p className="text-xs text-[#004D73]/60 dark:text-white/50">
                    L'image sera stockée sur IPFS de manière décentralisée.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isMinting}
                  className="w-full bg-[#3A8F4C] hover:bg-[#2E7D32] text-white"
                >
                  {isMinting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Minting en cours...
                    </>
                  ) : (
                    "Minter le NFT (Smart Contract)"
                  )}
                </Button>

                {mintedTxHash && (
                  <div className="mt-4 p-4 bg-[#3A8F4C]/10 rounded-lg text-sm text-[#3A8F4C]">
                    <p className="font-semibold">Transaction envoyée !</p>
                    <p className="break-all mt-1">Hash: {mintedTxHash}</p>
                    <a
                      href={`https://preprod.cardanoscan.io/transaction/${mintedTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mt-2 inline-block"
                    >
                      Voir sur Cardanoscan
                    </a>
                  </div>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper mock state for modal
function setShowWalletModal(show: boolean) {
  // This is a simplified version. In real implementation,
  // we would use the existing wallet modal context/state
  const btn = document.querySelector("[data-wallet-trigger]");
  if (btn instanceof HTMLButtonElement) btn.click();
}
