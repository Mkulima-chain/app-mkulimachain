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

  @Column({ type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  // Documents pour la demande de prêt
  @Column({ type: 'varchar', length: 50, nullable: true })
  identificationNumber?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  idCardPhotoUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  harvestProofUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  guaranteeDocumentUrl?: string;

  @Column({ type: 'text', nullable: true })
  loanPurpose?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
