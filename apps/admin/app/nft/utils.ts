import { NFTType, NFTStatus } from "./types";
import {
  NFT_TYPE_LABELS,
  NFT_STATUS_CONFIG,
  PINATA_GATEWAY,
} from "./constants";

/**
 * Convertit une URI IPFS en URL HTTP accessible
 */
export const ipfsUriToHttpUrl = (ipfsUri: string): string => {
  if (!ipfsUri || !ipfsUri.startsWith("ipfs://")) {
    return ipfsUri;
  }
  const cid = ipfsUri.replace("ipfs://", "");
  return `${PINATA_GATEWAY}${cid}`;
};

/**
 * Extrait le CID d'une URI IPFS
 */
export const extractCidFromIpfsUri = (ipfsUri: string): string | null => {
  if (!ipfsUri || !ipfsUri.startsWith("ipfs://")) {
    return null;
  }
  return ipfsUri.replace("ipfs://", "");
};

/**
 * Valide le format UUID
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Obtient le label d'un type de NFT
 */
export const getTypeLabel = (type: NFTType): string => {
  return NFT_TYPE_LABELS[type] || type;
};

/**
 * Obtient la configuration du badge de statut
 */
export const getStatusBadge = (status: NFTStatus) => {
  return NFT_STATUS_CONFIG[status] || NFT_STATUS_CONFIG[NFTStatus.DRAFT];
};

/**
 * Formate un prix en ADA avec 2 décimales
 */
export const formatPriceADA = (price: number | string): string => {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return `₳ ${Number(numPrice || 0).toFixed(2)}`;
};
