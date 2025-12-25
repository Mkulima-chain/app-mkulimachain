import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Column,
} from 'typeorm';
import { BatchEntity } from './batch.entity';
import { HarvestEntity } from '@/modules/harvest/entities/entities';

@Entity('batch_harvests')
export class BatchHarvestEntity {
  @PrimaryColumn({ type: 'uuid', name: 'batchId' })
  batchId!: string;

  @PrimaryColumn({ type: 'uuid', name: 'harvestId' })
  harvestId!: string;

  @ManyToOne(() => BatchEntity, (batch) => batch.batchHarvests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batchId' })
  batch!: BatchEntity;

  @ManyToOne(() => HarvestEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'harvestId' })
  harvest!: HarvestEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  quantity!: number;
}

