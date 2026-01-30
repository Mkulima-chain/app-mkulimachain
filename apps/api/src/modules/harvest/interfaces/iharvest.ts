import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { ProductEntity } from '@/modules/products/entities/entities';

export interface IHarvest {
  id?: string;
  farmer: FarmerEntity;
  product: ProductEntity;
  quantity: number;
  harvestAt?: Date;
  latitude?: number;
  longitude?: number;
  proofHash: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
