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
import { IProduct } from '../interfaces/iproducts';
import { HarvestEntity } from '@/modules/harvest/entities/entities';
import { IHarvest } from '@/modules/harvest/interfaces/iharvest';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}

@Entity('products')
@Index('IDX_products_name', ['name'])
@Index('IDX_products_category', ['category'])
@Index('IDX_products_isActive', ['isActive'])
@Index('IDX_products_status', ['status'])
@Index('IDX_products_verified', ['verified'])
@Index('IDX_products_price', ['price'])
@Index('IDX_products_stock', ['stock'])
@Index('IDX_products_originCountry', ['originCountry'])
@Index('IDX_products_category_isActive', ['category', 'isActive'])
@Index('IDX_products_createdAt', ['createdAt'])
@Index('IDX_products_barcode', ['barcode'])
export class ProductEntity implements IProduct {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  sku!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  unit!: string;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'int', default: 0 })
  stock!: number;

  @Column({ type: 'varchar', length: 80, nullable: true })
  originCountry?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
    name: 'status',
  })
  status!: ProductStatus;

  @Column({ type: 'boolean', default: false, name: 'verified' })
  verified!: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'verifiedAt' })
  verifiedAt?: Date;

  @Column({ type: 'uuid', nullable: true, name: 'verifiedBy' })
  verifiedBy?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'barcode' })
  barcode?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'weight' })
  weight?: number;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'dimensions' })
  dimensions?: string;

  @Column({ type: 'date', nullable: true, name: 'expiryDate' })
  expiryDate?: Date;

  @Column({ type: 'integer', default: 0, name: 'minStockLevel' })
  minStockLevel!: number;

  @Column({ type: 'integer', nullable: true, name: 'maxStockLevel' })
  maxStockLevel?: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'supplier' })
  supplier?: string;

  @Column({ type: 'text', nullable: true, name: 'notes' })
  notes?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true, name: 'rating' })
  rating?: number;

  @Column({ type: 'integer', default: 0, name: 'reviewCount' })
  reviewCount!: number;

  @Column({ type: 'jsonb', nullable: true, name: 'tags' })
  tags?: string[];

  @Column({ type: 'jsonb', nullable: true, name: 'image' })
  image?: string[];

  @OneToMany(() => HarvestEntity, (harvest) => harvest.product)
  harvests?: IHarvest[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
