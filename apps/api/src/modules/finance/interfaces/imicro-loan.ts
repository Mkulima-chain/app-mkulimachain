import { IFarmer } from '@/modules/farmers/interfaces/ifarmers';

export enum LoanStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  ACTIVE = 'active',
  REPAID = 'repaid',
  DEFAULTED = 'defaulted',
  REJECTED = 'rejected',
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
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
