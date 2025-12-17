/**
 * Types pour les commandes
 */

export enum OrderStatus {
    PENDING = 'pending',
    PAID = 'paid',
    SHIPPED = 'shipped',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
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
    item: OrderItem;
    quantityKg: number;
    unitPriceADA: number;
    totalADA: number;
    status: OrderStatus;
    paymentHash?: string;
    shippingAddress?: string;
    trackingNumber?: string;
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
