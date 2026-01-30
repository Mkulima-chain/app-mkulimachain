import { useCallback, useEffect, useRef, useState } from "react";
import { NFT } from "@/types/nft";
import { ipfsUriToHttpUrl, extractCidFromIpfsUri } from "@/utils/ipfs";

/**
 * État d'une image NFT
 */
export type NFTImageState = "loading" | "loaded" | "error" | "none";

/**
 * Hook personnalisé pour gérer la récupération des images NFT depuis IPFS
 */
export const useNFTImages = (nfts: NFT[]) => {
  const [nftImages, setNftImages] = useState<Record<string, string | null>>({});
  const [imageStates, setImageStates] = useState<Record<string, NFTImageState>>(
    {}
  );
  const fetchingRef = useRef<Set<string>>(new Set());

  const fetchNFTImage = useCallback(async (nft: NFT) => {
    if (!nft.metadataURI || fetchingRef.current.has(nft.id)) {
      return;
    }

    fetchingRef.current.add(nft.id);

    // Marquer comme en cours de chargement
    setImageStates((prev) => {
      if (prev[nft.id] === undefined) {
        return { ...prev, [nft.id]: "loading" };
      }
      return prev;
    });

    try {
      const cid = extractCidFromIpfsUri(nft.metadataURI);
      if (!cid) {
        setNftImages((prev) => {
          if (prev[nft.id] === undefined) {
            return { ...prev, [nft.id]: null };
          }
          return prev;
        });
        setImageStates((prev) => ({ ...prev, [nft.id]: "none" }));
        return;
      }

      const metadataUrl = ipfsUriToHttpUrl(nft.metadataURI);
      const response = await fetch(metadataUrl);

      if (!response.ok) {
        throw new Error("Failed to fetch metadata");
      }

      const metadata = await response.json();
      const imageUri = metadata.image || metadata.imageHash;

      if (imageUri) {
        const imageUrl = ipfsUriToHttpUrl(imageUri);
        setNftImages((prev) => {
          if (prev[nft.id] === undefined) {
            return { ...prev, [nft.id]: imageUrl };
          }
          return prev;
        });
        setImageStates((prev) => ({ ...prev, [nft.id]: "loaded" }));
      } else {
        setNftImages((prev) => {
          if (prev[nft.id] === undefined) {
            return { ...prev, [nft.id]: null };
          }
          return prev;
        });
        setImageStates((prev) => ({ ...prev, [nft.id]: "none" }));
      }
    } catch (error) {
      console.error(`Error fetching image for NFT ${nft.id}:`, error);
      setNftImages((prev) => {
        if (prev[nft.id] === undefined) {
          return { ...prev, [nft.id]: null };
        }
        return prev;
      });
      setImageStates((prev) => ({ ...prev, [nft.id]: "error" }));
    } finally {
      fetchingRef.current.delete(nft.id);
    }
  }, []);

  // Nettoyer les images des NFTs supprimés
  useEffect(() => {
    const currentNftIds = new Set(nfts.map((n) => n.id));
    setNftImages((prev) => {
      const filtered: Record<string, string | null> = {};
      let hasChanges = false;

      Object.keys(prev).forEach((id) => {
        if (currentNftIds.has(id)) {
          filtered[id] = prev[id];
        } else {
          hasChanges = true;
        }
      });

      return hasChanges ? filtered : prev;
    });

    setImageStates((prev) => {
      const filtered: Record<string, NFTImageState> = {};
      let hasChanges = false;

      Object.keys(prev).forEach((id) => {
        if (currentNftIds.has(id)) {
          filtered[id] = prev[id];
        } else {
          hasChanges = true;
        }
      });

      return hasChanges ? filtered : prev;
    });
  }, [nfts.map((n) => n.id).join(",")]);

  // Récupérer les images pour les nouveaux NFTs
  useEffect(() => {
    nfts.forEach((nft) => {
      if (nft.metadataURI && !fetchingRef.current.has(nft.id)) {
        setNftImages((prev) => {
          if (prev[nft.id] === undefined) {
            setTimeout(() => {
              fetchNFTImage(nft);
            }, 0);
          }
          return prev;
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nfts.map((n) => `${n.id}-${n.metadataURI}`).join(",")]);

  return { nftImages, imageStates };
};
