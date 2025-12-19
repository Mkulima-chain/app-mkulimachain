// Types correspondant aux contrats Aiken

/**
 * Order Contract Types
 */

export enum OrderStatus {
  Pending = "Pending",
  Paid = "Paid",
  Shipped = "Shipped",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface OrderDatum {
  buyerAddress: string; // Cardano address
  sellerAddress: string;
  itemId: string;
  quantityKg: number;
  unitPriceLovelace: bigint;
  totalLovelace: bigint;
  platformFeePercent: number;
  platformAddress: string;
  status: OrderStatus;
  createdAt: number; // Unix timestamp
}

export type OrderAction =
  | { Pay: { paymentHash: string } }
  | { Ship: { trackingNumber: string } }
  | { Complete: {} }
  | { Cancel: {} };

export interface OrderRedeemer {
  action: OrderAction;
}

/**
 * Loan Contract Types
 */

export enum LoanStatus {
  Pending = "Pending",
  Approved = "Approved",
  Active = "Active",
  Repaid = "Repaid",
  Defaulted = "Defaulted",
  Rejected = "Rejected",
}

export interface LoanDatum {
  farmerAddress: string;
  amountLovelace: bigint;
  interestRate: number; // Base 100 (5 = 5%)
  durationDays: number;
  startTimestamp: number;
  dueTimestamp: number;
  lenderAddress: string;
  platformAddress: string;
  status: LoanStatus;
  approvedBy: string | null;
}

export type LoanAction =
  | { Approve: { approverSignature: string } }
  | { Activate: { transactionHash: string } }
  | { Repay: { paymentAmount: bigint } }
  | { MarkDefaulted: {} }
  | { Reject: { reason: string } };

export interface LoanRedeemer {
  action: LoanAction;
}

/**
 * Escrow Contract Types
 */

export enum EscrowStatus {
  Locked = "Locked",
  Released = "Released",
  Refunded = "Refunded",
  Disputed = "Disputed",
}

export type DisputeDecision =
  | { ReleaseToBeneficiary: {} }
  | { RefundToPayer: {} }
  | { Split: { beneficiaryPercent: number } };

export interface EscrowDatum {
  payerAddress: string;
  beneficiaryAddress: string;
  amountLovelace: bigint;
  arbiterAddress: string;
  deadlineTimestamp: number;
  description: string;
  status: EscrowStatus;
}

export type EscrowAction =
  | { Release: {} }
  | { Refund: {} }
  | { Dispute: { reason: string } }
  | { ResolveDispute: { decision: DisputeDecision } };

export interface EscrowRedeemer {
  action: EscrowAction;
}

/**
 * Auth Contract Types
 */

export enum UserRole {
  Farmer = "Farmer",
  Buyer = "Buyer",
  Admin = "Admin",
  Platform = "Platform",
}

export interface AuthDatum {
  userAddress: string;
  role: UserRole;
  registeredAt: number;
  isActive: boolean;
  metadataHash: string | null;
}

export type AuthAction =
  | { Register: { signature: string } }
  | { Verify: { actionHash: string } }
  | { Deactivate: {} }
  | { UpdateRole: { newRole: UserRole } };

export interface AuthRedeemer {
  action: AuthAction;
}

/**
 * Utility Types
 */

export interface ContractConfig {
  orderValidatorCode: string;
  loanValidatorCode: string;
  escrowValidatorCode: string;
  authValidatorCode: string;
}

export interface TransactionResult {
  txHash: string;
  success: boolean;
  error?: string;
}
