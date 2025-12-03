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
import { IOrder, OrderStatus } from '../interfaces/iorder';
import { MarketplaceItemEntity } from './marketplace-item.entity';

@Entity('orders')
export class OrderEntity implements IOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  buyerId!: string;

  @ManyToOne(() => MarketplaceItemEntity)
  @JoinColumn({ name: 'itemId' })
  item!: MarketplaceItemEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantityKg!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  unitPriceADA!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  totalADA!: number;

  @Index()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  paymentHash?: string;

  @Column({ type: 'text', nullable: true })
  shippingAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  trackingNumber?: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
