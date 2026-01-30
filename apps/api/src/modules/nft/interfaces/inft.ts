export enum NFTType {
  RECIPE = 'recipe',
  TALE = 'tale',
  SONG = 'song',
  ART = 'art',
  TRADITION = 'tradition',
}

export enum NFTStatus {
  DRAFT = 'draft',
  MINTING = 'minting',
  MINTED = 'minted',
  LISTED = 'listed',
  SOLD = 'sold',
}

export interface IRevenueDistribution {
  creatorPercent: number;
  schoolFundPercent: number;
  platformPercent: number;
}

export interface INFT {
  id: string;
  creatorId: string;
  type: NFTType;
  title: string;
  description?: string;
  metadataURI: string;
  priceADA: number;
  revenueDistribution: IRevenueDistribution;
  onChainHash?: string;
  policyId?: string;
  assetName?: string;
  status: NFTStatus;
  mintedAt?: Date;
  soldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
