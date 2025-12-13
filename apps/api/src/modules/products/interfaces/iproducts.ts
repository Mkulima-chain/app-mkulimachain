import { IHarvest } from '@/modules/harvest/interfaces/iharvest';
import { ProductStatus } from '../entities/entities';

export interface IProduct {
  id?: string;
  sku: string;
  name: string;
  unit: string;
  description?: string;
  category: string;
  tags?: string[];
  price: number;
  currency?: string;
  stock?: number;
  originCountry?: string;
  isActive?: boolean;
  status?: ProductStatus;
  verified?: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  expiryDate?: Date | string;
  minStockLevel?: number;
  maxStockLevel?: number;
  supplier?: string;
  notes?: string;
  rating?: number;
  reviewCount?: number;
  minPrice?: number;
  maxPrice?: number;
  image?: string | string[];
  harvests?: IHarvest[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
