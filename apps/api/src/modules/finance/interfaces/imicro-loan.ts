import { IFarmer } from '@/modules/farmers/interfaces/ifarmers';

export enum LoanStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REPAID = 'repaid',
  DEFAULTED = 'defaulted',
}

export interface IMicroLoan {
  id: string;
  farmerId: string;
  farmer: IFarmer;
  amountADA: number;
  interestRate: number;
  durationDays: number;
  status: LoanStatus;
  loanContractHash: string;
  startDate?: Date;
  dueDate?: Date;
  repaidAt?: Date;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  penaltyRate?: number;
  totalRepaymentAmount?: number;
  remainingAmount?: number;
  lastPaymentDate?: Date;
  paymentCount?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
