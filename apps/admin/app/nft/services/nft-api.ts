import { api } from "@/lib/api-client";
import { NFT, CreateNFTDto, UpdateNFTDto, MintNFTDto } from "../types";

/**
 * Service API pour les opérations NFT
 */
export const nftApi = {
  /**
   * Récupère tous les NFTs avec recherche optionnelle
   */
  getAll: async (searchQuery?: string): Promise<NFT[]> => {
    const url = `/nfts${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ""}`;
    return api.get<NFT[]>(url);
  },

  /**
   * Crée un nouveau NFT avec fichiers optionnels
   */
  create: async (
    data: CreateNFTDto,
    imageFile?: File,
    audioFile?: File
  ): Promise<NFT> => {
    // Si des fichiers sont fournis ou si metadataURI n'est pas fourni, utiliser FormData
    if (imageFile || audioFile || !data.metadataURI) {
      const formData = new FormData();

      // Ajouter les champs du formulaire
      formData.append("creatorId", data.creatorId);
      formData.append("type", data.type);
      formData.append("title", data.title);
      if (data.description) {
        formData.append("description", data.description);
      }
      if (data.metadataURI) {
        formData.append("metadataURI", data.metadataURI);
      }
      formData.append("priceADA", data.priceADA.toString());
      formData.append(
        "revenueDistribution[creatorPercent]",
        data.revenueDistribution.creatorPercent.toString()
      );
      formData.append(
        "revenueDistribution[schoolFundPercent]",
        data.revenueDistribution.schoolFundPercent.toString()
      );
      formData.append(
        "revenueDistribution[platformPercent]",
        data.revenueDistribution.platformPercent.toString()
      );

      // Ajouter les fichiers
      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (audioFile) {
        formData.append("audio", audioFile);
      }

      return api.post<NFT>("/nfts", formData);
    }

    // Sinon, utiliser JSON normal
    return api.post<NFT>("/nfts", data);
  },

  /**
   * Met à jour un NFT
   */
  update: async (id: string, data: UpdateNFTDto): Promise<NFT> => {
    return api.put<NFT>(`/nfts/${id}`, data);
  },

  /**
   * Supprime un NFT
   */
  delete: async (id: string): Promise<void> => {
    return api.delete<void>(`/nfts/${id}`);
  },

  /**
   * Mint un NFT sur la blockchain
   */
  mint: async (id: string, data: MintNFTDto): Promise<NFT> => {
    return api.post<NFT>(`/nfts/${id}/mint`, data);
  },

  /**
   * Mettre un NFT en vente (le lister sur le marketplace)
   */
  list: async (id: string): Promise<NFT> => {
    return api.post<NFT>(`/nfts/${id}/list`);
  },

  /**
   * Marquer un NFT comme vendu
   */
  sell: async (id: string): Promise<NFT> => {
    return api.post<NFT>(`/nfts/${id}/sell`);
  },
};
