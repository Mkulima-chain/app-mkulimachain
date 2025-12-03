import { IMarketplaceItem } from './imarketplace-item';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export interface IOrder {
  id: string;
  buyerId: string;
  item: IMarketplaceItem;
  quantityKg: number;
  unitPriceADA: number;
  totalADA: number;
  status: OrderStatus;
  paymentHash?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  paidAt?: Date;
  shippedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
