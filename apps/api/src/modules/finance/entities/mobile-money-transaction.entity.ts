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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
