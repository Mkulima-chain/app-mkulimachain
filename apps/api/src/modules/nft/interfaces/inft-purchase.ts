import { INFT } from './inft';

export interface INFTPurchase {
  id: string;
  nft: INFT;
  buyerId: string;
  amountPaid: number;
  creatorShare: number;
  schoolFundContribution: number;
  platformShare: number;
  transactionHash?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
