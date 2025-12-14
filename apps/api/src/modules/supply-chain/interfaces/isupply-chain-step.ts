import { IBatch } from '@/modules/batch/interfaces/ibatch';
import { ICooperative } from '@/modules/cooperatives/interfaces/icooperative';

export enum StepType {
  HARVEST = 'harvest',
  DRYING = 'drying',
  PACKAGING = 'packaging',
  EXPORT = 'export',
  TRANSPORT = 'transport',
  STORAGE = 'storage',
  PROCESSING = 'processing',
  QUALITY_CHECK = 'quality_check',
  CERTIFICATION = 'certification',
  DISTRIBUTION = 'distribution',
  RETAIL = 'retail',
}

export enum StepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum Quality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

export interface ISupplyChainStep {
  id: string;
  batchId: string;
  batch: IBatch;
  stepType: StepType;
  timestamp: Date;
  metadataHash: string;
  name?: string;
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  temperature?: number;
  humidity?: number;
  quantity?: number;
  weight?: number;
  unit?: string;
  status?: StepStatus;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  responsiblePerson?: string;
  responsiblePersonId?: string;
  certificate?: string;
  notes?: string;
  photos?: string[];
  documents?: string[];
  duration?: number;
  equipment?: string;
  cost?: number;
  quality?: Quality;
  nextStepId?: string;
  nextStep?: ISupplyChainStep;
  previousStepId?: string;
  previousStep?: ISupplyChainStep;
  sequenceOrder?: number;
  blockchainTxHash?: string;
  qrCode?: string;
  cooperativeId?: string;
  cooperative?: ICooperative;
  facilityId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
