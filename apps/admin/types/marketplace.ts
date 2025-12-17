/**
 * Types pour les items marketplace
 */

export enum MarketplaceItemStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    SOLD_OUT = 'sold_out',
    ARCHIVED = 'archived',
}

export interface MarketplaceItem {
    id: string;
    batchId: string;
    farmerId: string;
    title: string;
    description?: string;
    priceADA: number;
    stockKg: number;
    status: MarketplaceItemStatus;
    imageUrl?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateMarketplaceItemDto {
    batchId: string;
    farmerId: string;
    title: string;
    description?: string;
    priceADA: number;
    stockKg: number;
    imageUrl?: string;
    status?: MarketplaceItemStatus;
}

export type UpdateMarketplaceItemDto = Partial<CreateMarketplaceItemDto>;
