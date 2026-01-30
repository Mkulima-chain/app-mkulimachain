import { FarmerEntity } from '@/modules/farmers/entities/entities';

export interface ICooperative {
  id?: string;
  name: string;
  location: string;
  leader: string;
  farmers?: FarmerEntity[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
