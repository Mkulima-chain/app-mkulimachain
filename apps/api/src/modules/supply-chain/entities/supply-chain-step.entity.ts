import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  ISupplyChainStep,
  StepType,
  StepStatus,
  Quality,
} from '../interfaces/isupply-chain-step';
import { BatchEntity } from '@/modules/batch/entities/batch.entity';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';

@Entity('supply_chain_steps')
@Index('IDX_supply_chain_steps_name', ['name'])
@Index('IDX_supply_chain_steps_location', ['location'])
@Index('IDX_supply_chain_steps_status', ['status'])
@Index('IDX_supply_chain_steps_verified', ['verified'])
@Index('IDX_supply_chain_steps_stepType', ['stepType'])
@Index('IDX_supply_chain_steps_timestamp', ['timestamp'])
@Index('IDX_supply_chain_steps_sequenceOrder', ['sequenceOrder'])
@Index('IDX_supply_chain_steps_quality', ['quality'])
@Index('IDX_supply_chain_steps_responsiblePersonId', ['responsiblePersonId'])
@Index('IDX_supply_chain_steps_cooperativeId', ['cooperativeId'])
@Index('IDX_supply_chain_steps_blockchainTxHash', ['blockchainTxHash'])
@Index('IDX_supply_chain_steps_qrCode', ['qrCode'])
@Index('IDX_supply_chain_steps_batchId_stepType', ['batchId', 'stepType'])
@Index('IDX_supply_chain_steps_batchId_timestamp', ['batchId', 'timestamp'])
export class SupplyChainStepEntity implements ISupplyChainStep {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  batchId!: string;

  @ManyToOne(() => BatchEntity, (batch) => batch.supplyChainSteps)
  @JoinColumn({ name: 'batchId' })
  batch!: BatchEntity;

  @Column({ type: 'enum', enum: StepType })
  stepType!: StepType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @Column({ type: 'varchar', length: 255 })
  metadataHash!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature?: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidity?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  quantity?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  weight?: number;

  @Column({ type: 'varchar', length: 20, nullable: true, default: 'kg' })
  unit?: string;

  @Column({ type: 'enum', enum: StepStatus, nullable: true, default: StepStatus.PENDING })
  status?: StepStatus;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  responsiblePerson?: string;

  @Column({ type: 'uuid', nullable: true })
  responsiblePersonId?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  certificate?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  photos?: string[];

  @Column({ type: 'jsonb', nullable: true })
  documents?: string[];

  @Column({ type: 'integer', nullable: true })
  duration?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  equipment?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'enum', enum: Quality, nullable: true })
  quality?: Quality;

  @Column({ type: 'uuid', nullable: true })
  nextStepId?: string;

  @ManyToOne(() => SupplyChainStepEntity, { nullable: true })
  @JoinColumn({ name: 'nextStepId' })
  nextStep?: SupplyChainStepEntity;

  @Column({ type: 'uuid', nullable: true })
  previousStepId?: string;

  @ManyToOne(() => SupplyChainStepEntity, { nullable: true })
  @JoinColumn({ name: 'previousStepId' })
  previousStep?: SupplyChainStepEntity;

  @Column({ type: 'integer', nullable: true })
  sequenceOrder?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  blockchainTxHash?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  qrCode?: string;

  @Column({ type: 'uuid', nullable: true })
  cooperativeId?: string;

  @ManyToOne(() => CooperativeEntity, { nullable: true })
  @JoinColumn({ name: 'cooperativeId' })
  cooperative?: CooperativeEntity;

  @Column({ type: 'uuid', nullable: true })
  facilityId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
