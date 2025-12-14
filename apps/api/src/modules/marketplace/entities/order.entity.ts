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
  @Column({ type: 'varchar', length: 50, unique: true, nullable: true, name: 'orderNumber' })
  orderNumber?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'quantityKg' })
  quantityKg!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, name: 'unitPriceADA' })
  unitPriceADA!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, name: 'totalADA' })
  totalADA!: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true, default: 0, name: 'shippingCostADA' })
  shippingCostADA?: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true, default: 0, name: 'discountADA' })
  discountADA?: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, nullable: true, default: 0, name: 'taxADA' })
  taxADA?: number;

  @Index()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    name: 'status',
  })
  status!: OrderStatus;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'paymentHash' })
  paymentHash?: string;

  @Column({ type: 'text', nullable: true, name: 'shippingAddress' })
  shippingAddress?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'trackingNumber' })
  trackingNumber?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'paidAt' })
  paidAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'shippedAt' })
  shippedAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'completedAt' })
  completedAt?: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'cancelledAt' })
  cancelledAt?: Date;

  @Column({ type: 'uuid', nullable: true, name: 'cancelledBy' })
  cancelledBy?: string;

  @Column({ type: 'text', nullable: true, name: 'cancellationReason' })
  cancellationReason?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'refundedAt' })
  refundedAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'refundHash' })
  refundHash?: string;

  @Column({ type: 'timestamp', nullable: true, name: 'estimatedDeliveryDate' })
  estimatedDeliveryDate?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'deliveryMethod' })
  deliveryMethod?: string;

  @Column({ type: 'text', nullable: true, name: 'notes' })
  notes?: string;

  @Column({ type: 'text', nullable: true, name: 'buyerNotes' })
  buyerNotes?: string;

  @Column({ type: 'text', nullable: true, name: 'internalNotes' })
  internalNotes?: string;

  @Index()
  @Column({
    type: 'enum',
    enum: OrderPriority,
    nullable: true,
    default: OrderPriority.NORMAL,
    name: 'priority',
  })
  priority?: OrderPriority;

  @Column({ type: 'text', array: true, nullable: true, name: 'tags' })
  tags?: string[];

  @Index()
  @Column({ type: 'uuid', nullable: true, name: 'cooperativeId' })
  cooperativeId?: string;

  @ManyToOne(() => CooperativeEntity)
  @JoinColumn({ name: 'cooperativeId' })
  cooperative?: CooperativeEntity;

  @Index()
  @Column({ type: 'uuid', nullable: true, name: 'farmerId' })
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
