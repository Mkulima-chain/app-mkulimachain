import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IWallet, OwnerType } from '../interfaces/iwallet';

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

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
