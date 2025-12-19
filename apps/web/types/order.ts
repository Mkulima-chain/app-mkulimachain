/**
 * Types pour les commandes marketplace
 */

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  SHIPPED = "shipped",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description?: string;
  priceADA: number;
  stockKg: number;
  imageUrls?: string[];
  farmer?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  buyerId: string;
  item: MarketplaceItem;
  quantityKg: number;
  unitPriceADA: number;
  totalADA: number;
  status: OrderStatus;
  paymentHash?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  paidAt?: string;
  shippedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  buyerId: string;
  itemId: string;
  quantityKg: number;
  shippingAddress?: string;
}

export interface PayOrderDto {
  paymentHash: string;
}

export interface ShipOrderDto {
  trackingNumber: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
}
