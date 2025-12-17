import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IMarketplaceItem,
  MarketplaceItemStatus,
} from '../interfaces/imarketplace-item';
import { BatchEntity } from '@/modules/batch/entities/batch.entity';
import { FarmerEntity } from '@/modules/farmers/entities/entities';

@Entity('marketplace_items')
export class MarketplaceItemEntity implements IMarketplaceItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => BatchEntity)
  @JoinColumn({ name: 'batchId' })
  batch!: BatchEntity;

  @Index()
  @ManyToOne(() => FarmerEntity)
  @JoinColumn({ name: 'farmerId' })
  farmer!: FarmerEntity;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  priceADA!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  stockKg!: number;

  @Index()
  @Column({
    type: 'enum',
    enum: MarketplaceItemStatus,
    default: MarketplaceItemStatus.DRAFT,
  })
  status!: MarketplaceItemStatus;

  @Column({ type: 'simple-array', nullable: true })
  imageUrls?: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
