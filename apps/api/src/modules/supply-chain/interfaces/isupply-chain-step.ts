import { IBatch } from '@/modules/batch/interfaces/ibatch';

export enum StepType {
  HARVEST = 'harvest',
  DRYING = 'drying',
  PACKAGING = 'packaging',
  EXPORT = 'export',
}

export interface ISupplyChainStep {
  id: string;
  batchId: string;
  batch: IBatch;
  stepType: StepType;
  timestamp: Date;
  metadataHash: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
