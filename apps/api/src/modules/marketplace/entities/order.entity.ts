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
import { IOrder, OrderStatus, OrderPriority } from '../interfaces/iorder';
import { MarketplaceItemEntity } from './marketplace-item.entity';
import { UserEntity } from '@/modules/auth/entities/user.entity';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';
import { FarmerEntity } from '@/modules/farmers/entities/entities';

@Entity('orders')
export class OrderEntity implements IOrder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  buyerId!: string;

  @Column({ type: 'uuid' })
  itemId!: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'buyerId' })
  buyer?: UserEntity;

  @ManyToOne(() => MarketplaceItemEntity)
  @JoinColumn({ name: 'itemId' })
  item!: MarketplaceItemEntity;

  @Index()
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  orderNumber?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantityKg!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  unitPriceADA!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6 })
  totalADA!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true, default: 0 })
  shippingCostADA?: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true, default: 0 })
  discountADA?: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true, default: 0 })
  taxADA?: number;

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

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  cancelledBy?: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refundHash?: string;

  @Column({ type: 'timestamp', nullable: true })
  estimatedDeliveryDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deliveryMethod?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  buyerNotes?: string;

  @Column({ type: 'text', nullable: true })
  internalNotes?: string;

  @Index()
  @Column({
    type: 'enum',
    enum: OrderPriority,
    nullable: true,
    default: OrderPriority.NORMAL,
  })
  priority?: OrderPriority;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  @Index()
  @Column({ type: 'uuid', nullable: true })
  cooperativeId?: string;

  @ManyToOne(() => CooperativeEntity)
  @JoinColumn({ name: 'cooperativeId' })
  cooperative?: CooperativeEntity;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  farmerId?: string;

  @ManyToOne(() => FarmerEntity)
  @JoinColumn({ name: 'farmerId' })
  farmer?: FarmerEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
