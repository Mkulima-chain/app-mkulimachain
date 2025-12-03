import { IHarvest } from '@/modules/harvest/interfaces/iharvest';

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
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
