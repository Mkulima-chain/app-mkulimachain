/**
 * Types pour les produits marketplace
 */

export enum MarketplaceItemStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    SOLD_OUT = "sold_out",
    ARCHIVED = "archived",
}

export interface MarketplaceItem {
    id: string;
    batchId: string;
    farmerId: string;
    farmer?: {
        id: string;
        name: string;
        location?: string;
    };
    batch?: {
        id: string;
        harvests?: {
            id: string;
            quantity: number;
            product?: {
                id: string;
                name: string;
                description?: string;
            };
        }[];
    };
    title: string;
    description?: string;
    priceADA: number;
    stockKg: number;
    status: MarketplaceItemStatus;
    imageUrls?: string[];
    onPromotion?: boolean;
    originalPriceADA?: number;
    discountPercent?: number;
    createdAt: string;
    updatedAt: string;
}

export interface MarketplaceItemFilters {
    status?: MarketplaceItemStatus;
    farmerId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
}
