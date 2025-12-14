import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IFarmer } from '../interfaces/ifarmers';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';
import { HarvestEntity } from '@/modules/harvest/entities/entities';
import { MicroLoanEntity } from '@/modules/finance/entities/micro-loan.entity';
import { CreditScoreEntity } from '@/modules/finance/entities/credit-score.entity';

@Entity('farmers')
export class FarmerEntity implements IFarmer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  walletAddress?: string;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({ type: 'varchar', length: 255 })
  city!: string;

  @Column({ type: 'varchar', length: 255 })
  state!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude!: number;

  // Relations

  @ManyToOne(() => CooperativeEntity, (cooperative) => cooperative.farmers)
  @JoinColumn({ name: 'cooperativeId' })
  cooperative?: CooperativeEntity;

  @OneToMany(() => HarvestEntity, (harvest) => harvest.farmer)
  harvests?: HarvestEntity[];

  @OneToMany(() => MicroLoanEntity, (loan) => loan.farmer)
  loans?: MicroLoanEntity[];

  @OneToOne(() => CreditScoreEntity, (creditScore) => creditScore.farmer)
  creditScore?: CreditScoreEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
