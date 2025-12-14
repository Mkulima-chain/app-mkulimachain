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
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';

@Entity('marketplace_items')
export class MarketplaceItemEntity implements IMarketplaceItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  batchId!: string;

  @Index()
  @Column({ type: 'uuid' })
  farmerId!: string;

  @ManyToOne(() => BatchEntity)
  @JoinColumn({ name: 'batchId' })
  batch!: BatchEntity;

  @Index()
  @ManyToOne(() => FarmerEntity)
  @JoinColumn({ name: 'farmerId' })
  farmer!: FarmerEntity;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  sku?: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true })
  photos?: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string; // Gardé pour compatibilité, sera remplacé par photos

  @Index()
  @Column({ type: 'decimal', precision: 18, scale: 6 })
  priceADA!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  stockKg!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minOrderKg?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxOrderKg?: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true })
  shippingCostADA?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'text', array: true, nullable: true })
  certifications?: string[];

  @Index()
  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  rating?: number;

  @Column({ type: 'integer', default: 0 })
  reviewCount!: number;

  @Column({ type: 'integer', default: 0 })
  views!: number;

  @Column({ type: 'integer', default: 0 })
  salesCount!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Index()
  @Column({ type: 'boolean', default: false, name: 'featured' })
  featured!: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'expiresAt' })
  expiresAt?: Date;

  @Index()
  @Column({ type: 'uuid', nullable: true, name: 'cooperativeId' })
  cooperativeId?: string;

  @ManyToOne(() => CooperativeEntity)
  @JoinColumn({ name: 'cooperativeId' })
  cooperative?: CooperativeEntity;

  @Index()
  @Column({
    type: 'enum',
    enum: MarketplaceItemStatus,
    default: MarketplaceItemStatus.DRAFT,
    name: 'status',
  })
  status!: MarketplaceItemStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
