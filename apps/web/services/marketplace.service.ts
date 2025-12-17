/**
 * Service de gestion des produits marketplace
 */

import { api } from "@/lib/api-client";
import type { MarketplaceItem, MarketplaceItemFilters } from "@/types/marketplace";

/**
 * Récupérer tous les items du marketplace avec filtres optionnels
 */
export async function getMarketplaceItems(
    filters?: MarketplaceItemFilters
): Promise<MarketplaceItem[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.farmerId) params.append("farmerId", filters.farmerId);
    if (filters?.minPrice) params.append("minPrice", filters.minPrice.toString());
    if (filters?.maxPrice) params.append("maxPrice", filters.maxPrice.toString());
    if (filters?.search) params.append("search", filters.search);

    const query = params.toString();
    return api.get<MarketplaceItem[]>(`/marketplace${query ? `?${query}` : ""}`);
}

/**
 * Récupérer uniquement les items actifs (en vente)
 */
export async function getActiveMarketplaceItems(): Promise<MarketplaceItem[]> {
    return api.get<MarketplaceItem[]>("/marketplace/active");
}

/**
 * Récupérer un item par son ID
 */
export async function getMarketplaceItemById(id: string): Promise<MarketplaceItem> {
    return api.get<MarketplaceItem>(`/marketplace/${id}`);
}

/**
 * Récupérer les items d'un vendeur
 */
export async function getMarketplaceItemsByFarmer(
    farmerId: string
): Promise<MarketplaceItem[]> {
    return api.get<MarketplaceItem[]>(`/marketplace/farmer/${farmerId}`);
}
