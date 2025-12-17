/**
 * Hooks React Query pour les commandes
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Order, CreateOrderDto, PayOrderDto } from "@/types/order";
import * as orderService from "@/services/order.service";

// Clés pour le cache React Query
export const orderKeys = {
    all: [ "orders" ] as const,
    byBuyer: (buyerId: string) => [ ...orderKeys.all, "buyer", buyerId ] as const,
    detail: (id: string) => [ ...orderKeys.all, "detail", id ] as const,
};

/**
 * Hook pour créer une commande
 */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: CreateOrderDto) => orderService.createOrder(dto),
        onSuccess: (newOrder) => {
            // Invalider le cache des commandes pour forcer un refresh
            queryClient.invalidateQueries({ queryKey: orderKeys.all });

            // Optionnellement, ajouter la nouvelle commande au cache
            queryClient.setQueryData<Order[]>(
                orderKeys.byBuyer(newOrder.buyerId),
                (old) => (old ? [ newOrder, ...old ] : [ newOrder ])
            );
        },
    });
}

/**
 * Hook pour créer plusieurs commandes (panier)
 */
export function useCreateBatchOrders() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orders: CreateOrderDto[]) =>
            orderService.createBatchOrders(orders),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
}

/**
 * Hook pour payer une commande
 */
export function usePayOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: PayOrderDto }) =>
            orderService.payOrder(id, dto),
        onSuccess: (updatedOrder) => {
            // Mettre à jour le cache
            queryClient.setQueryData<Order>(
                orderKeys.detail(updatedOrder.id),
                updatedOrder
            );
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
}

/**
 * Hook pour annuler une commande
 */
export function useCancelOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => orderService.cancelOrder(id),
        onSuccess: (updatedOrder) => {
            queryClient.setQueryData<Order>(
                orderKeys.detail(updatedOrder.id),
                updatedOrder
            );
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
}

/**
 * Hook pour récupérer les commandes d'un acheteur
 */
export function useMyOrders(buyerId: string | undefined) {
    return useQuery({
        queryKey: orderKeys.byBuyer(buyerId || ""),
        queryFn: () => orderService.getOrdersByBuyerId(buyerId!),
        enabled: !!buyerId,
    });
}

/**
 * Hook pour récupérer une commande par son ID
 */
export function useOrder(orderId: string | undefined) {
    return useQuery({
        queryKey: orderKeys.detail(orderId || ""),
        queryFn: () => orderService.getOrderById(orderId!),
        enabled: !!orderId,
    });
}
