import { IMarketplaceItem } from './imarketplace-item';
import { ICooperative } from '@/modules/cooperatives/interfaces/icooperative';
import { IFarmer } from '@/modules/farmers/interfaces/ifarmers';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum OrderPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface IOrder {
  id: string;
  buyerId: string;
  itemId: string;
  item: IMarketplaceItem;
  orderNumber?: string;
  quantityKg: number;
  unitPriceADA: number;
  totalADA: number;
  shippingCostADA?: number;
  discountADA?: number;
  taxADA?: number;
  status: OrderStatus;
  paymentHash?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  paidAt?: Date;
  shippedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  refundedAt?: Date;
  refundHash?: string;
  estimatedDeliveryDate?: Date;
  deliveryMethod?: string;
  notes?: string;
  buyerNotes?: string;
  internalNotes?: string;
  priority?: OrderPriority;
  tags?: string[];
  cooperativeId?: string;
  cooperative?: ICooperative;
  farmerId?: string;
  farmer?: IFarmer;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
