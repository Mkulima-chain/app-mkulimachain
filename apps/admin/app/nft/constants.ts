import { NFTType, NFTStatus } from "./types";

export const NFT_TYPE_LABELS: Record<NFTType, string> = {
  [NFTType.RECIPE]: "Recette",
  [NFTType.TALE]: "Conte",
  [NFTType.SONG]: "Chant",
  [NFTType.ART]: "Art",
  [NFTType.TRADITION]: "Tradition",
};

export const NFT_STATUS_CONFIG: Record<
  NFTStatus,
  {
    variant: "default" | "secondary" | "outline";
    className: string;
    label: string;
  }
> = {
  [NFTStatus.LISTED]: {
    variant: "default",
    className: "bg-[#3A8F4C] text-white",
    label: "En vente",
  },
  [NFTStatus.MINTED]: {
    variant: "secondary",
    className: "bg-[#004D73] text-white",
    label: "Minté",
  },
  [NFTStatus.SOLD]: {
    variant: "secondary",
    className: "bg-[#5A3E36] text-white",
    label: "Vendu",
  },
  [NFTStatus.DRAFT]: {
    variant: "outline",
    className: "",
    label: "Brouillon",
  },
  [NFTStatus.MINTING]: {
    variant: "outline",
    className: "",
    label: "En minting",
  },
};

export const DEFAULT_REVENUE_DISTRIBUTION = {
  creatorPercent: 70,
  schoolFundPercent: 20,
  platformPercent: 10,
} as const;

export const MIN_PRICE_ADA = 0.000001;
export const MAX_FILE_SIZE_MB = 50;
export const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";
