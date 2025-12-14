import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IMobileMoneyTransaction,
  MobileMoneyProvider,
  TransactionStatus,
  TransactionType,
} from '../interfaces/imobile-money-transaction';
import { ManyToOne, JoinColumn } from 'typeorm';
import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { MicroLoanEntity } from './micro-loan.entity';

@Entity('mobile_money_transactions')
export class MobileMoneyTransactionEntity implements IMobileMoneyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  fromMobileNumber!: string;

  @Index()
  @Column({ type: 'varchar', length: 150 })
  toAdaAddress!: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  amountADA!: number;

  @Column({ type: 'enum', enum: MobileMoneyProvider })
  provider!: MobileMoneyProvider;

  @Index()
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ type: 'enum', enum: TransactionType })
  type!: TransactionType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionRef?: string;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalTransactionId?: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  farmerId?: string;

  @ManyToOne(() => FarmerEntity, { nullable: true })
  @JoinColumn({ name: 'farmerId' })
  farmer?: FarmerEntity;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  loanId?: string;

  @ManyToOne(() => MicroLoanEntity, { nullable: true })
  @JoinColumn({ name: 'loanId' })
  loan?: MicroLoanEntity;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'uuid', nullable: true })
  processedBy?: string;

  @Column({ type: 'int', nullable: true })
  processingTime?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
