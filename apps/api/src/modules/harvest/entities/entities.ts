import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IHarvest } from '../interfaces/iharvest';
import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { ProductEntity } from '@/modules/products/entities/entities';

@Entity('harvests')
export class HarvestEntity implements IHarvest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => FarmerEntity, (farmer) => farmer.harvests)
  @JoinColumn({ name: 'farmerId' })
  farmer!: FarmerEntity;

  @ManyToOne(() => ProductEntity, (product) => product.harvests)
  @JoinColumn({ name: 'productId' })
  product!: ProductEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  harvestAt!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  @Column({ type: 'varchar', length: 255 })
  proofHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
