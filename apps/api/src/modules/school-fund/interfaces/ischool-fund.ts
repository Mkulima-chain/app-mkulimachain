export enum SchoolStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

export interface ISchoolFund {
  id: string;
  schoolName: string;
  province: string;
  city?: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  walletAddress?: string;
  totalFundedADA: number;
  totalDisbursedADA: number;
  studentCount?: number;
  status: SchoolStatus;
  lastUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
