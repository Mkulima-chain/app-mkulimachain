import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ISchoolFund, SchoolStatus } from '../interfaces/ischool-fund';

@Entity('school_funds')
export class SchoolFundEntity implements ISchoolFund {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 200 })
  schoolName!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  province!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactPerson?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactPhone?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  walletAddress?: string;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  totalFundedADA!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, default: 0 })
  totalDisbursedADA!: number;

  @Column({ type: 'int', nullable: true })
  studentCount?: number;

  @Index()
  @Column({
    type: 'enum',
    enum: SchoolStatus,
    default: SchoolStatus.PENDING,
  })
  status!: SchoolStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdate!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
