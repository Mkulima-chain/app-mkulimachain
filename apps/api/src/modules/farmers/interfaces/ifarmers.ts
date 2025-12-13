import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';
import { IHarvest } from '@/modules/harvest/interfaces/iharvest';
import {
  FarmerStatus,
  FarmerGender,
  FarmerIdentificationType,
} from '../entities/entities';

export interface IFarmer {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  walletAddress?: string;
  city: string;
  state: string;
  cooperativeId?: string;
  cooperative?: CooperativeEntity;
  latitude: number;
  longitude: number;
  dateOfBirth?: Date;
  status?: FarmerStatus;
  photoUrl?: string;
  gender?: FarmerGender;
  identificationNumber?: string;
  identificationType?: FarmerIdentificationType;
  notes?: string;
  verified?: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  // location?: any; // PostGIS geometry - désactivé car PostGIS n'est pas installé
  harvests?: IHarvest[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
