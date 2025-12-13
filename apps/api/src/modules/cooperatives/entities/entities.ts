import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ICooperative } from '../interfaces/icooperative';
import { FarmerEntity } from '@/modules/farmers/entities/entities';

export enum CooperativeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('cooperatives')
@Index('IDX_cooperatives_email', ['email'])
@Index('IDX_cooperatives_phone', ['phone'])
@Index('IDX_cooperatives_status', ['status'])
@Index('IDX_cooperatives_verified', ['verified'])
@Index('IDX_cooperatives_status_verified', ['status', 'verified'])
@Index('IDX_cooperatives_registrationNumber', ['registrationNumber'])
@Index('IDX_cooperatives_name', ['name'])
@Index('IDX_cooperatives_location', ['location'])
export class CooperativeEntity implements ICooperative {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  location!: string;

  @Column({ type: 'varchar', length: 100 })
  leader!: string;

  // Nouvelles colonnes améliorées
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Index()
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: CooperativeStatus,
    default: CooperativeStatus.ACTIVE,
  })
  status!: CooperativeStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registrationNumber?: string;

  @Column({ type: 'date', nullable: true })
  foundedDate?: Date;

  @Column({ type: 'integer', default: 0 })
  memberCount!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: false })
  verified!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

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
  // locationPoint?: any;

  // Relations
  @OneToMany(() => FarmerEntity, (farmer) => farmer.cooperative)
  farmers?: FarmerEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
