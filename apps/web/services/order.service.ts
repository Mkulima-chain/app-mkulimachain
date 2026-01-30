/**
 * Service de gestion des commandes marketplace
 */

import { api } from "@/lib/api-client";
import type { Order, CreateOrderDto, PayOrderDto } from "@/types/order";

/**
 * Créer une commande
 */
export async function createOrder(dto: CreateOrderDto): Promise<Order> {
    return api.post<Order>("/orders", dto);
}

/**
 * Créer plusieurs commandes pour un panier multi-articles
 */
export async function createBatchOrders(
    orders: CreateOrderDto[]
): Promise<Order[]> {
    const results = await Promise.all(
        orders.map((order) => createOrder(order))
    );
    return results;
}

/**
 * Récupérer une commande par son ID
 */
export async function getOrderById(id: string): Promise<Order> {
    return api.get<Order>(`/orders/${id}`);
}

/**
 * Récupérer les commandes d'un acheteur
 */
export async function getOrdersByBuyerId(buyerId: string): Promise<Order[]> {
    return api.get<Order[]>(`/orders/buyer/${buyerId}`);
}

/**
 * Récupérer toutes les commandes (avec filtres optionnels)
 */
export async function getOrders(filters?: {
    status?: string;
    buyerId?: string;
}): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.buyerId) params.append("buyerId", filters.buyerId);

    const query = params.toString();
    return api.get<Order[]>(`/orders${query ? `?${query}` : ""}`);
}

/**
 * Marquer une commande comme payée
 */
export async function payOrder(id: string, dto: PayOrderDto): Promise<Order> {
    return api.post<Order>(`/orders/${id}/pay`, dto);
}

/**
 * Annuler une commande
 */
export async function cancelOrder(id: string): Promise<Order> {
    return api.post<Order>(`/orders/${id}/cancel`);
}
