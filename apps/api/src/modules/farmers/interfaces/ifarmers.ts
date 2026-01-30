import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';
import { IHarvest } from '@/modules/harvest/interfaces/iharvest';

export interface IFarmer {
  id?: string;
  name: string;
  phone: string;
  address: string;
  walletAddress?: string;
  city: string;
  state: string;
  cooperative?: CooperativeEntity;
  latitude: number;
  longitude: number;
  harvests?: IHarvest[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
