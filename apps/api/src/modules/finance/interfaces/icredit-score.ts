import { IFarmer } from '@/modules/farmers/interfaces/ifarmers';

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export interface ICreditScore {
  id: string;
  farmerId: string;
  farmer: IFarmer;
  score: number;
  harvestCount: number;
  totalHarvestValue: number;
  loanRepaymentRate: number;
  riskLevel?: RiskLevel;
  lastLoanDate?: Date;
  totalLoansCount?: number;
  repaidLoansCount?: number;
  defaultedLoansCount?: number;
  averageLoanAmount?: number;
  lastUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}
