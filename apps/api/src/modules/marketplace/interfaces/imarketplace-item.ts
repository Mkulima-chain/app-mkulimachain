import { IBatch } from '@/modules/batch/interfaces/ibatch';
import { IFarmer } from '@/modules/farmers/interfaces/ifarmers';

export enum MarketplaceItemStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SOLD_OUT = 'sold_out',
  ARCHIVED = 'archived',
}

export interface IMarketplaceItem {
  id: string;
  batch: IBatch;
  farmer: IFarmer;
  title: string;
  description?: string;
  priceADA: number;
  stockKg: number;
  status: MarketplaceItemStatus;
  imageUrls?: string[];
  onPromotion?: boolean;
  originalPriceADA?: number;
  discountPercent?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
