/**
 * Hooks React Query pour les produits marketplace
 */

import { useQuery } from "@tanstack/react-query";
import type { MarketplaceItemFilters } from "@/types/marketplace";
import * as marketplaceService from "@/services/marketplace.service";

// Clés pour le cache React Query
export const marketplaceKeys = {
    all: [ "marketplace" ] as const,
    active: () => [ ...marketplaceKeys.all, "active" ] as const,
    filters: (filters: MarketplaceItemFilters) => [ ...marketplaceKeys.all, filters ] as const,
    detail: (id: string) => [ ...marketplaceKeys.all, "detail", id ] as const,
    byFarmer: (farmerId: string) => [ ...marketplaceKeys.all, "farmer", farmerId ] as const,
};

/**
 * Hook pour récupérer tous les items du marketplace
 */
export function useMarketplaceItems(filters?: MarketplaceItemFilters) {
    return useQuery({
        queryKey: filters ? marketplaceKeys.filters(filters) : marketplaceKeys.all,
        queryFn: () => marketplaceService.getMarketplaceItems(filters),
    });
}

/**
 * Hook pour récupérer uniquement les items actifs
 */
export function useActiveMarketplaceItems() {
    return useQuery({
        queryKey: marketplaceKeys.active(),
        queryFn: () => marketplaceService.getActiveMarketplaceItems(),
    });
}

/**
 * Hook pour récupérer un item par son ID
 */
export function useMarketplaceItem(id: string | undefined) {
    return useQuery({
        queryKey: marketplaceKeys.detail(id || ""),
        queryFn: () => marketplaceService.getMarketplaceItemById(id!),
        enabled: !!id,
    });
}

/**
 * Hook pour récupérer les items d'un vendeur
 */
export function useMarketplaceItemsByFarmer(farmerId: string | undefined) {
    return useQuery({
        queryKey: marketplaceKeys.byFarmer(farmerId || ""),
        queryFn: () => marketplaceService.getMarketplaceItemsByFarmer(farmerId!),
        enabled: !!farmerId,
    });
}
