export enum OwnerType {
  FARMER = 'farmer',
  BUYER = 'buyer',
  COOPERATIVE = 'cooperative',
}

export interface IWallet {
  id: string;
  ownerType: OwnerType;
  ownerId: string;
  adaAddress: string;
  mobileMoneyNumber?: string;
  balanceADA: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
