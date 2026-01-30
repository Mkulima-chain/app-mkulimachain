import { useState, useCallback } from "react";
import { CreateNFTDto, NFTType } from "../types";
import { DEFAULT_REVENUE_DISTRIBUTION, MIN_PRICE_ADA } from "../constants";

interface UseNFTFormOptions {
  initialCreatorId?: string;
  onSuccess?: () => void;
}

/**
 * Hook personnalisé pour gérer le formulaire de création/édition de NFT
 */
export const useNFTForm = (options: UseNFTFormOptions = {}) => {
  const { initialCreatorId = "", onSuccess } = options;

  const [formData, setFormData] = useState<CreateNFTDto>({
    creatorId: initialCreatorId,
    type: NFTType.RECIPE,
    title: "",
    description: "",
    metadataURI: "",
    priceADA: 1,
    revenueDistribution: DEFAULT_REVENUE_DISTRIBUTION,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setFormData({
      creatorId: initialCreatorId,
      type: NFTType.RECIPE,
      title: "",
      description: "",
      metadataURI: "",
      priceADA: 1,
      revenueDistribution: DEFAULT_REVENUE_DISTRIBUTION,
    });
    setImageFile(null);
    setAudioFile(null);
    setImagePreview(null);
    setAudioPreview(null);
  }, [initialCreatorId]);

  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Veuillez sélectionner un fichier image");
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAudioSelect = useCallback((file: File) => {
    if (!file.type.startsWith("audio/")) {
      throw new Error("Veuillez sélectionner un fichier audio");
    }
    setAudioFile(file);
    setAudioPreview(file.name);
  }, []);

  const removeImage = useCallback(() => {
    setImageFile(null);
    setImagePreview(null);
  }, []);

  const removeAudio = useCallback(() => {
    setAudioFile(null);
    setAudioPreview(null);
  }, []);

  const updateFormData = useCallback((updates: Partial<CreateNFTDto>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const updatePrice = useCallback((price: number) => {
    const validPrice =
      isNaN(price) || price < MIN_PRICE_ADA ? MIN_PRICE_ADA : price;
    setFormData((prev) => ({ ...prev, priceADA: validPrice }));
  }, []);

  return {
    formData,
    imageFile,
    audioFile,
    imagePreview,
    audioPreview,
    setFormData,
    updateFormData,
    updatePrice,
    handleImageSelect,
    handleAudioSelect,
    removeImage,
    removeAudio,
    resetForm,
  };
};
