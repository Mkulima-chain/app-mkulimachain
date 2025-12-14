export enum OwnerType {
  FARMER = 'farmer',
  BUYER = 'buyer',
  COOPERATIVE = 'cooperative',
}

export enum WalletStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FROZEN = 'frozen',
  SUSPENDED = 'suspended',
}

export interface IWallet {
  id: string;
  ownerType: OwnerType;
  ownerId: string;
  adaAddress: string;
  mobileMoneyNumber?: string;
  balanceADA: number;
  status: WalletStatus;
  label?: string;
  description?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  lastTransactionAt?: Date;
  transactionCount: number;
  totalReceived: number;
  totalSent: number;
  minBalance?: number;
  maxBalance?: number;
  notes?: string;
  metadata?: Record<string, unknown>;
  lastSyncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
