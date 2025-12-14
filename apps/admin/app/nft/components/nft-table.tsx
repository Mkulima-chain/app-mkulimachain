import {
  Image,
  Edit,
  Trash2,
  MoreVertical,
  Sparkles,
  ShoppingCart,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NFT } from "../types";
import { getTypeLabel, getStatusBadge, formatPriceADA } from "../utils";
import { NFTImageSkeleton } from "./nft-image-skeleton";
import { NFTImageState } from "../hooks/use-nft-images";

interface NFTTableProps {
  nfts: NFT[];
  nftImages: Record<string, string | null>;
  imageStates: Record<string, NFTImageState>;
  onEdit: (nft: NFT) => void;
  onDelete: (nft: NFT) => void;
  onMint: (nft: NFT) => void;
  onList: (nft: NFT) => void;
}

export const NFTTable = ({
  nfts,
  nftImages,
  imageStates,
  onEdit,
  onDelete,
  onMint,
  onList,
}: NFTTableProps) => {
  const getCardanoScanBaseUrl = (): string => {
    // Détecter le réseau depuis la clé API Blockfrost
    if (typeof window !== "undefined") {
      const blockfrostKey = (
        process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY || ""
      ).toLowerCase();

      // Les clés API Blockfrost peuvent avoir le réseau dans le préfixe ou dans le contenu
      // Format possible: "testnet...", "preview...", "preprod...", ou "mainnet..."
      if (
        blockfrostKey.includes("testnet") ||
        blockfrostKey.startsWith("testnet")
      ) {
        return "https://testnet.cardanoscan.io";
      } else if (
        blockfrostKey.includes("preview") ||
        blockfrostKey.startsWith("preview")
      ) {
        return "https://preview.cardanoscan.io";
      } else if (
        blockfrostKey.includes("preprod") ||
        blockfrostKey.startsWith("preprod")
      ) {
        return "https://preprod.cardanoscan.io";
      }
      // Par défaut, on assume mainnet
      // Note: Si vous utilisez testnet/preview/preprod et que le lien ne fonctionne pas,
      // vérifiez que votre NEXT_PUBLIC_BLOCKFROST_API_KEY contient le nom du réseau
      return "https://cardanoscan.io";
    }
    // Par défaut mainnet si on ne peut pas détecter
    return "https://cardanoscan.io";
  };

  const getCardanoScanUrl = (nft: NFT): string | null => {
    const baseUrl = getCardanoScanBaseUrl();

    // Si on a un hash de transaction, on l'utilise (le plus fiable)
    if (nft.onChainHash) {
      // Nettoyer le hash (enlever les espaces, etc.)
      const cleanHash = nft.onChainHash.trim();

      // Valider que le hash a un format raisonnable (au moins 32 caractères hex)
      // Les hash Cardano font généralement 64 caractères hex
      if (cleanHash.length >= 32 && /^[0-9a-fA-F]+$/.test(cleanHash)) {
        return `${baseUrl}/transaction/${cleanHash}`;
      }
      // Si le format est invalide, on ne peut pas créer l'URL
      console.warn("Invalid transaction hash format:", cleanHash);
      return null;
    }
    // Sinon, si on a policyId et assetName, on peut voir l'asset
    if (nft.policyId && nft.assetName) {
      // Valider le format du policyId (56 caractères hex)
      if (!/^[0-9a-fA-F]{56}$/.test(nft.policyId)) {
        console.warn("Invalid policyId format:", nft.policyId);
        return null;
      }

      // Convertir assetName en hex pour Cardano Scan
      const assetNameHex = Array.from(nft.assetName)
        .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("");
      return `${baseUrl}/token/${nft.policyId}.${assetNameHex}`;
    }
    return null;
  };

  if (nfts.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="px-6 py-8 text-center text-muted-foreground">
          Aucun NFT trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Titre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {nfts.map((nft) => {
              const statusBadge = getStatusBadge(nft.status);
              const imageUrl = nftImages[nft.id];
              const imageState = imageStates[nft.id] || "loading";

              return (
                <tr key={nft.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {imageState === "loading" ? (
                      <NFTImageSkeleton />
                    ) : imageState === "loaded" && imageUrl ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-border">
                        <img
                          src={imageUrl}
                          alt={nft.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{nft.title}</div>
                    {nft.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {nft.description.slice(0, 50)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getTypeLabel(nft.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {formatPriceADA(nft.priceADA)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={statusBadge.variant}
                      className={statusBadge.className}
                    >
                      {statusBadge.label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 p-2">
                        <div className="space-y-1">
                          <button
                            onClick={() => onEdit(nft)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </button>
                          {nft.status !== "minted" &&
                            nft.status !== "listed" &&
                            nft.status !== "sold" && (
                              <button
                                onClick={() => onMint(nft)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[#3A8F4C]/10 text-[#3A8F4C] transition-colors"
                              >
                                <Sparkles className="h-4 w-4" />
                                Mint
                              </button>
                            )}
                          {nft.status === "minted" && (
                            <button
                              onClick={() => onList(nft)}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Mettre en vente
                            </button>
                          )}
                          {getCardanoScanUrl(nft) && (
                            <a
                              href={getCardanoScanUrl(nft) || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Voir la transaction sur ${getCardanoScanBaseUrl().replace("https://", "").replace(".cardanoscan.io", "").toUpperCase() || "Cardano Scan"}`}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-purple-500/10 text-purple-600 dark:text-purple-400 transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Voir sur Cardano Scan
                            </a>
                          )}
                          <button
                            onClick={() => onDelete(nft)}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-destructive/10 text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
