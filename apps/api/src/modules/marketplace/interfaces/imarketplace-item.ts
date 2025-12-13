import { IBatch } from '@/modules/batch/interfaces/ibatch';
import { IFarmer } from '@/modules/farmers/interfaces/ifarmers';
import { ICooperative } from '@/modules/cooperatives/interfaces/icooperative';

export enum MarketplaceItemStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SOLD_OUT = 'sold_out',
  ARCHIVED = 'archived',
}

export interface IMarketplaceItem {
  id: string;
  batchId: string;
  batch: IBatch;
  farmerId: string;
  farmer: IFarmer;
  sku?: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  photos?: string[];
  imageUrl?: string; // Gardé pour compatibilité
  priceADA: number;
  stockKg: number;
  minOrderKg?: number;
  maxOrderKg?: number;
  shippingCostADA?: number;
  location?: string;
  certifications?: string[];
  rating?: number;
  reviewCount: number;
  views: number;
  salesCount: number;
  notes?: string;
  featured: boolean;
  expiresAt?: Date;
  cooperativeId?: string;
  cooperative?: ICooperative;
  status: MarketplaceItemStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
