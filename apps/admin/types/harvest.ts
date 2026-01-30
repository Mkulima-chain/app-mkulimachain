/**
 * Types pour les récoltes (harvests)
 */

export interface Harvest {
    id: string;
    farmerId?: string;
    productId?: string;
    farmer?: {
        id: string;
        name: string;
    };
    product?: {
        id: string;
        name: string;
        sku?: string;
    };
    quantity: number;
    harvestAt: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    proofHash?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface CreateHarvestDto {
    farmerId: string;
    productId: string;
    quantity: number;
    harvestAt: string;
    latitude?: number;
    longitude?: number;
    proofHash?: string;
}

export type UpdateHarvestDto = Partial<CreateHarvestDto>;
