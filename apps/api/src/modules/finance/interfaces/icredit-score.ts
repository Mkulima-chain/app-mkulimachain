import { IFarmer } from '@/modules/farmers/interfaces/ifarmers';

export interface ICreditScore {
  id: string;
  farmerId: string;
  farmer: IFarmer;
  score: number;
  harvestCount: number;
  totalHarvestValue: number;
  loanRepaymentRate: number;
  lastUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}
