/**
 * Types pour les commandes
 */

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  SHIPPED = "shipped",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum TraceabilityStep {
  ORDER = "order",
  PREPARATION = "preparation",
  HARVEST = "harvest",
  PROCESSING = "processing",
  PACKAGING = "packaging",
  SHIPPING = "shipping",
  DELIVERY = "delivery",
}

export interface TraceabilityStepData {
  completed: boolean;
  date?: string;
  txHash?: string;
  note?: string;
}

export interface TraceabilityData {
  order: TraceabilityStepData;
  preparation: TraceabilityStepData;
  harvest: TraceabilityStepData;
  processing: TraceabilityStepData;
  packaging: TraceabilityStepData;
  shipping: TraceabilityStepData;
  delivery: TraceabilityStepData;
}

export interface OrderItem {
  id: string;
  title: string;
  priceADA: number;
  farmer?: {
    id: string;
    name: string;
  };
}

export interface Order {
  id: string;
  buyerId: string;
  item: {
    id: string;
    title: string;
    priceADA: number;
    stockKg: number;
    farmer: {
      id: string;
      name: string;
    };
  };
  quantityKg: number;
  unitPriceADA: number;
  totalADA: number;
  status: OrderStatus;
  paymentHash?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  traceability?: TraceabilityData;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  buyerId: string;
  itemId: string;
  quantityKg: number;
  shippingAddress?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  paymentHash?: string;
  shippingAddress?: string;
  trackingNumber?: string;
}
