import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IHarvest } from '../interfaces/iharvest';
import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { ProductEntity } from '@/modules/products/entities/entities';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';

export enum HarvestStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

@Entity('harvests')
@Index('IDX_harvests_farmerId', ['farmerId'])
@Index('IDX_harvests_productId', ['productId'])
@Index('IDX_harvests_status', ['status'])
@Index('IDX_harvests_verified', ['verified'])
@Index('IDX_harvests_harvestAt', ['harvestAt'])
@Index('IDX_harvests_quality', ['quality'])
@Index('IDX_harvests_batchNumber', ['batchNumber'])
@Index('IDX_harvests_cooperativeId', ['cooperativeId'])
@Index('IDX_harvests_createdAt', ['createdAt'])
@Index('IDX_harvests_farmerId_productId', ['farmerId', 'productId'])
export class HarvestEntity implements IHarvest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  farmerId!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @ManyToOne(() => FarmerEntity, (farmer) => farmer.harvests)
  @JoinColumn({ name: 'farmerId' })
  farmer!: FarmerEntity;

  @ManyToOne(() => ProductEntity, (product) => product.harvests)
  @JoinColumn({ name: 'productId' })
  product!: ProductEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  harvestAt!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'varchar', length: 255 })
  proofHash!: string;

  @Column({
    type: 'enum',
    enum: HarvestStatus,
    default: HarvestStatus.PENDING,
    name: 'status',
  })
  status!: HarvestStatus;

  @Column({ type: 'boolean', default: false, name: 'verified' })
  verified!: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'verifiedAt' })
  verifiedAt?: Date;

  @Column({ type: 'uuid', nullable: true, name: 'verifiedBy' })
  verifiedBy?: string;

  @Column({ type: 'varchar', length: 20, nullable: true, default: 'kg', name: 'unit' })
  unit?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'quality' })
  quality?: string;

  @Column({ type: 'text', nullable: true, name: 'notes' })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true, name: 'photos' })
  photos?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'weatherConditions' })
  weatherConditions?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'harvestMethod' })
  harvestMethod?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'storageLocation' })
  storageLocation?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'batchNumber' })
  batchNumber?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'certification' })
  certification?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'estimatedValue' })
  estimatedValue?: number;

  @Column({ type: 'uuid', nullable: true, name: 'cooperativeId' })
  cooperativeId?: string;

  @ManyToOne(() => CooperativeEntity, { nullable: true })
  @JoinColumn({ name: 'cooperativeId' })
  cooperative?: CooperativeEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
