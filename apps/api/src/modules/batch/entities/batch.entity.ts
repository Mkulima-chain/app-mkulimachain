import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { IBatch, BatchStatus } from '../interfaces/ibatch';
import { HarvestEntity } from '@/modules/harvest/entities/entities';
import { SupplyChainStepEntity } from '@/modules/supply-chain/entities/supply-chain-step.entity';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';
import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { ProductEntity } from '@/modules/products/entities/entities';

@Entity('batches')
@Index('IDX_batches_name', ['name'])
@Index('IDX_batches_status', ['status'])
@Index('IDX_batches_verified', ['verified'])
@Index('IDX_batches_productionDate', ['productionDate'])
@Index('IDX_batches_expirationDate', ['expirationDate'])
@Index('IDX_batches_quality', ['quality'])
@Index('IDX_batches_cooperativeId', ['cooperativeId'])
@Index('IDX_batches_farmerId', ['farmerId'])
@Index('IDX_batches_productId', ['productId'])
@Index('IDX_batches_createdAt', ['createdAt'])
export class BatchEntity implements IBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToMany(() => HarvestEntity)
  @JoinTable({
    name: 'batch_harvests',
    joinColumn: { name: 'batchId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'harvestId', referencedColumnName: 'id' },
  })
  harvests!: HarvestEntity[];

  @Column({ type: 'varchar', length: 255, unique: true })
  qrCode!: string;

  @Column({ type: 'varchar', length: 255 })
  batchHash!: string;

  @Column({ type: 'enum', enum: BatchStatus, default: BatchStatus.CREATED })
  status!: BatchStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalQuantity?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  totalWeight?: number;

  @Column({ type: 'varchar', length: 20, nullable: true, default: 'kg' })
  unit?: string;

  @Column({ type: 'timestamp', nullable: true })
  productionDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate?: Date;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  quality?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  photos?: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  originLocation?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  destinationLocation?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  certification?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedValue?: number;

  @Column({ type: 'uuid', nullable: true })
  cooperativeId?: string;

  @ManyToOne(() => CooperativeEntity, { nullable: true })
  @JoinColumn({ name: 'cooperativeId' })
  cooperative?: CooperativeEntity;

  @Column({ type: 'uuid', nullable: true })
  farmerId?: string;

  @ManyToOne(() => FarmerEntity, { nullable: true })
  @JoinColumn({ name: 'farmerId' })
  farmer?: FarmerEntity;

  @Column({ type: 'uuid', nullable: true })
  productId?: string;

  @ManyToOne(() => ProductEntity, { nullable: true })
  @JoinColumn({ name: 'productId' })
  product?: ProductEntity;

  @OneToMany(() => SupplyChainStepEntity, (step) => step.batch)
  supplyChainSteps!: SupplyChainStepEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
