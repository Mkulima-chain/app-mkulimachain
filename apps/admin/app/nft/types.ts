export enum NFTType {
  RECIPE = "recipe",
  TALE = "tale",
  SONG = "song",
  ART = "art",
  TRADITION = "tradition",
}

export enum NFTStatus {
  DRAFT = "draft",
  MINTING = "minting",
  MINTED = "minted",
  LISTED = "listed",
  SOLD = "sold",
}

export interface RevenueDistribution {
  creatorPercent: number;
  schoolFundPercent: number;
  platformPercent: number;
}

export interface NFT {
  id: string;
  creatorId: string;
  type: NFTType;
  title: string;
  description?: string;
  metadataURI: string;
  priceADA: number;
  revenueDistribution: RevenueDistribution;
  status: NFTStatus;
  onChainHash?: string;
  policyId?: string;
  assetName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNFTDto {
  creatorId: string;
  type: NFTType;
  title: string;
  description?: string;
  metadataURI: string;
  priceADA: number;
  revenueDistribution: RevenueDistribution;
}

export interface UpdateNFTDto {
  title?: string;
  description?: string;
  metadataURI?: string;
  priceADA?: number;
  status?: NFTStatus;
  revenueDistribution?: RevenueDistribution;
}

export interface MintNFTDto {
  onChainHash: string;
  policyId: string;
  assetName: string;
}
