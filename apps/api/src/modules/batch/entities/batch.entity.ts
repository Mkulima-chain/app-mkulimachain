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
} from 'typeorm';
import { IBatch, BatchStatus } from '../interfaces/ibatch';
import { HarvestEntity } from '@/modules/harvest/entities/entities';
import { SupplyChainStepEntity } from '@/modules/supply-chain/entities/supply-chain-step.entity';

@Entity('batches')
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

  @OneToMany(() => SupplyChainStepEntity, (step) => step.batch)
  supplyChainSteps!: SupplyChainStepEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
