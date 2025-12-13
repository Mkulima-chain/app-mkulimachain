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
import { IMicroLoan, LoanStatus } from '../interfaces/imicro-loan';
import { FarmerEntity } from '@/modules/farmers/entities/entities';

@Entity('micro_loans')
export class MicroLoanEntity implements IMicroLoan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  farmerId!: string;

  @ManyToOne(() => FarmerEntity, (farmer) => farmer.loans)
  @JoinColumn({ name: 'farmerId' })
  farmer!: FarmerEntity;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  amountADA!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate!: number;

  @Column({ type: 'int' })
  durationDays!: number;

  @Index()
  @Column({ type: 'enum', enum: LoanStatus, default: LoanStatus.PENDING })
  status!: LoanStatus;

  @Column({ type: 'varchar', length: 255 })
  loanContractHash!: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  repaidAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
