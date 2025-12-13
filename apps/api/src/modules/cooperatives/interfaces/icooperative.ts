import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { CooperativeStatus } from '../entities/entities';

export interface ICooperative {
  id?: string;
  name: string;
  location: string;
  leader: string;
  email?: string;
  phone?: string;
  status?: CooperativeStatus;
  logoUrl?: string;
  description?: string;
  registrationNumber?: string;
  foundedDate?: Date;
  memberCount?: number;
  notes?: string;
  verified?: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  latitude?: number;
  longitude?: number;
  farmers?: FarmerEntity[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
