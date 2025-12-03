import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ICreditScore } from '../interfaces/icredit-score';
import { FarmerEntity } from '@/modules/farmers/entities/entities';

@Entity('credit_scores')
export class CreditScoreEntity implements ICreditScore {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @OneToOne(() => FarmerEntity, (farmer) => farmer.creditScore)
  @JoinColumn({ name: 'farmerId' })
  farmer!: FarmerEntity;

  @Column({ type: 'int', default: 0 })
  score!: number;

  @Column({ type: 'int', default: 0 })
  harvestCount!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  totalHarvestValue!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  loanRepaymentRate!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
