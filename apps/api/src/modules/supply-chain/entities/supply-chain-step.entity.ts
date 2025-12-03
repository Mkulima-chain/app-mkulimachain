import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ISupplyChainStep, StepType } from '../interfaces/isupply-chain-step';
import { BatchEntity } from '@/modules/batch/entities/batch.entity';

@Entity('supply_chain_steps')
export class SupplyChainStepEntity implements ISupplyChainStep {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => BatchEntity, (batch) => batch.supplyChainSteps)
  @JoinColumn({ name: 'batchId' })
  batch!: BatchEntity;

  @Column({ type: 'enum', enum: StepType })
  stepType!: StepType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @Column({ type: 'varchar', length: 255 })
  metadataHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
