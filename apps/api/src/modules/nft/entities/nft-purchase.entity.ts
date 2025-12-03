import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { INFTPurchase } from '../interfaces/inft-purchase';
import { NFTEntity } from './nft.entity';

@Entity('nft_purchases')
export class NFTPurchaseEntity implements INFTPurchase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => NFTEntity, (nft) => nft.purchases)
  @JoinColumn({ name: 'nftId' })
  nft!: NFTEntity;

  @Index()
  @Column({ type: 'uuid' })
  buyerId!: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  amountPaid!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  creatorShare!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  schoolFundContribution!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  platformShare!: number;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionHash?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
