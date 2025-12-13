import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
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

export enum FarmerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export enum FarmerGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum FarmerIdentificationType {
  CNI = 'cni',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license',
  OTHER = 'other',
}

@Entity('farmers')
@Index('IDX_farmers_phone', ['phone'])
@Index('IDX_farmers_name', ['name'])
@Index('IDX_farmers_city', ['city'])
@Index('IDX_farmers_state', ['state'])
@Index('IDX_farmers_cooperativeId', ['cooperativeId'])
@Index('IDX_farmers_city_state', ['city', 'state'])
@Index('IDX_farmers_createdAt', ['createdAt'])
@Index('IDX_farmers_email', ['email'])
@Index('IDX_farmers_status', ['status'])
@Index('IDX_farmers_verified', ['verified'])
@Index('IDX_farmers_status_verified', ['status', 'verified'])
export class FarmerEntity implements IFarmer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Index()
  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  walletAddress?: string;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 100 })
  state!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude!: number;

  @Column({ type: 'uuid', nullable: true })
  cooperativeId?: string;

  // Nouvelles colonnes améliorées
  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({
    type: 'enum',
    enum: FarmerStatus,
    default: FarmerStatus.ACTIVE,
  })
  status!: FarmerStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photoUrl?: string;

  @Column({
    type: 'enum',
    enum: FarmerGender,
    nullable: true,
  })
  gender?: FarmerGender;

  @Column({ type: 'varchar', length: 50, nullable: true })
  identificationNumber?: string;

  @Column({
    type: 'enum',
    enum: FarmerIdentificationType,
    nullable: true,
  })
  identificationType?: FarmerIdentificationType;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy?: string;

  // Colonne géospatiale (PostGIS) - optionnelle
  // Note: Cette colonne nécessite PostGIS. Si PostGIS n'est pas disponible,
  // cette colonne sera ignorée lors de la synchronisation.
  // Pour utiliser cette fonctionnalité, installez PostGIS dans PostgreSQL.
  // @Column({
  //   type: 'geometry',
  //   spatialFeatureType: 'Point',
  //   srid: 4326,
  //   nullable: true,
  // })
  // location?: any;

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
