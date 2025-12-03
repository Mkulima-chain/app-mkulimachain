export enum MobileMoneyProvider {
  AIRTEL = 'airtel',
  ORANGE = 'orange',
  MPESA = 'mpesa',
  VODACOM = 'vodacom',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

export interface IMobileMoneyTransaction {
  id: string;
  fromMobileNumber: string;
  toAdaAddress: string;
  amount: number;
  amountADA: number;
  provider: MobileMoneyProvider;
  status: TransactionStatus;
  type: TransactionType;
  transactionRef?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
