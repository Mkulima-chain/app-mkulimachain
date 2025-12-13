import { IHarvest } from '@/modules/harvest/interfaces/iharvest';
import { ICooperative } from '@/modules/cooperatives/interfaces/icooperative';
import { IFarmer } from '@/modules/farmers/interfaces/ifarmers';
import { IProduct } from '@/modules/products/interfaces/iproducts';

export enum BatchStatus {
  CREATED = 'created',
  PROCESSED = 'processed',
  EXPORTED = 'exported',
}

export interface IBatch {
  id: string;
  harvests: IHarvest[];
  qrCode: string;
  batchHash: string;
  status: BatchStatus;
  name?: string;
  description?: string;
  totalQuantity?: number;
  totalWeight?: number;
  unit?: string;
  productionDate?: Date;
  expirationDate?: Date;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  quality?: string;
  notes?: string;
  photos?: string[];
  originLocation?: string;
  destinationLocation?: string;
  certification?: string;
  estimatedValue?: number;
  cooperativeId?: string;
  cooperative?: ICooperative;
  farmerId?: string;
  farmer?: IFarmer;
  productId?: string;
  product?: IProduct;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
