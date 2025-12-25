import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IBatch, BatchStatus } from '../interfaces/ibatch';
import { HarvestEntity } from '@/modules/harvest/entities/entities';
import { SupplyChainStepEntity } from '@/modules/supply-chain/entities/supply-chain-step.entity';
import { BatchHarvestEntity } from './batch-harvest.entity';

@Entity('batches')
export class BatchEntity implements IBatch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => BatchHarvestEntity, (batchHarvest) => batchHarvest.batch, { cascade: true })
  batchHarvests!: BatchHarvestEntity[];

  // Propriété calculée pour compatibilité avec l'interface
  get harvests(): HarvestEntity[] {
    return this.batchHarvests?.map(bh => bh.harvest) || [];
  }

  @Column({ type: 'varchar', length: 255, unique: true })
  qrCode!: string;

  @Column({ type: 'varchar', length: 255 })
  batchHash!: string;

  @Column({ type: 'enum', enum: BatchStatus, default: BatchStatus.CREATED })
  status!: BatchStatus;

  @OneToMany(() => SupplyChainStepEntity, (step) => step.batch)
  supplyChainSteps!: SupplyChainStepEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
