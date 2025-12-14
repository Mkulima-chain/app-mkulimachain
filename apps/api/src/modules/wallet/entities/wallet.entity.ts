import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IWallet, OwnerType, WalletStatus } from '../interfaces/iwallet';

@Entity('wallets')
export class WalletEntity implements IWallet {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: OwnerType })
  ownerType!: OwnerType;

  @Index()
  @Column({ type: 'uuid' })
  ownerId!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 150 })
  adaAddress!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobileMoneyNumber?: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  balanceADA!: number;

  @Index()
  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.ACTIVE,
  })
  status!: WalletStatus;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  label?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index()
  @Column({ type: 'boolean', default: false })
  isVerified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  lastTransactionAt?: Date;

  @Index()
  @Column({ type: 'integer', default: 0 })
  transactionCount!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  totalReceived!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  totalSent!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  minBalance?: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  maxBalance?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Index('IDX_wallets_metadata', { synchronize: false })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
