import { IFarmer } from '@/modules/farmers/interfaces/ifarmers';

export enum LoanStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REPAID = 'repaid',
  DEFAULTED = 'defaulted',
}

export interface IMicroLoan {
  id: string;
  farmer: IFarmer;
  amountADA: number;
  interestRate: number;
  durationDays: number;
  status: LoanStatus;
  loanContractHash: string;
  startDate?: Date;
  dueDate?: Date;
  repaidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
