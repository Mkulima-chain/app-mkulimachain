import { IHarvest } from '@/modules/harvest/interfaces/iharvest';

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
  minPrice?: number;
  maxPrice?: number;
  image?: string | string[];
  harvests?: IHarvest[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
