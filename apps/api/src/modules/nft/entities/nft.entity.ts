import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  INFT,
  NFTType,
  NFTStatus,
  IRevenueDistribution,
} from '../interfaces/inft';
import { NFTPurchaseEntity } from './nft-purchase.entity';
import { UserEntity } from '@/modules/auth/entities/user.entity';

@Entity('nfts')
export class NFTEntity implements INFT {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  creatorId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'creatorId' })
  creator?: UserEntity;

  @Index()
  @Column({ type: 'enum', enum: NFTType })
  type!: NFTType;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500 })
  metadataURI!: string;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  priceADA!: number;

  @Column({ type: 'jsonb' })
  revenueDistribution!: IRevenueDistribution;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  onChainHash?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  policyId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  assetName?: string;

  @Index()
  @Column({
    type: 'enum',
    enum: NFTStatus,
    default: NFTStatus.DRAFT,
  })
  status!: NFTStatus;

  @OneToMany(() => NFTPurchaseEntity, (purchase) => purchase.nft)
  purchases?: NFTPurchaseEntity[];

  @Column({ type: 'timestamp', nullable: true })
  mintedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  soldAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
