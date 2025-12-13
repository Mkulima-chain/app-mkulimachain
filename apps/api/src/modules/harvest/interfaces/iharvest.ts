import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { ProductEntity } from '@/modules/products/entities/entities';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';
import { HarvestStatus } from '../entities/entities';

export interface IHarvest {
  id?: string;
  farmerId: string;
  farmer: FarmerEntity;
  productId: string;
  product: ProductEntity;
  quantity: number;
  harvestAt?: Date;
  latitude?: number;
  longitude?: number;
  proofHash: string;
  status?: HarvestStatus;
  verified?: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  unit?: string;
  quality?: string;
  notes?: string;
  photos?: string[];
  weatherConditions?: string;
  harvestMethod?: string;
  storageLocation?: string;
  batchNumber?: string;
  certification?: string;
  estimatedValue?: number;
  cooperativeId?: string;
  cooperative?: CooperativeEntity;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
