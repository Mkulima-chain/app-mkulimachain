import { IHarvest } from '@/modules/harvest/interfaces/iharvest';

export interface IProduct {
  id?: string;
  name: string;
  unit: string;
  description: string;
  image?: string | string[];
  harvests?: IHarvest[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
