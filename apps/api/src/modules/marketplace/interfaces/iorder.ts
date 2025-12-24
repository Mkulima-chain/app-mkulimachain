import { IMarketplaceItem } from './imarketplace-item';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// 7 étapes de traçabilité
export enum TraceabilityStep {
  ORDER = 'order', // Commande passée
  PREPARATION = 'preparation', // Préparation
  HARVEST = 'harvest', // Récolte
  PROCESSING = 'processing', // Transformation
  PACKAGING = 'packaging', // Emballage
  SHIPPING = 'shipping', // Expédition
  DELIVERY = 'delivery', // Livraison
}

export interface TraceabilityStepData {
  completed: boolean;
  date?: Date;
  txHash?: string; // Hash blockchain pour les étapes critiques
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

export const DEFAULT_TRACEABILITY: TraceabilityData = {
  order: { completed: false },
  preparation: { completed: false },
  harvest: { completed: false },
  processing: { completed: false },
  packaging: { completed: false },
  shipping: { completed: false },
  delivery: { completed: false },
};

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
  traceability?: TraceabilityData;
  paidAt?: Date;
  shippedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
