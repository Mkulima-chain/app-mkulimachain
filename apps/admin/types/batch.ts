/**
 * Types pour les lots (batches)
 */

export enum BatchStatus {
    CREATED = 'created',
    PROCESSED = 'processed',
    EXPORTED = 'exported',
}

export interface Batch {
    id: string;
    qrCode: string;
    batchHash: string;
    status: BatchStatus;
    harvests?: { id: string }[];
    batchHarvests?: Array<{
        harvestId: string;
        quantity: number;
        harvest?: { id: string; quantity: number; product?: { name: string }; farmer?: { name: string }; harvestAt: string };
    }>;
    createdAt: string;
    updatedAt?: string;
}

export interface HarvestQuantity {
    harvestId: string;
    quantity: number;
}

export interface CreateBatchDto {
    harvests?: HarvestQuantity[];
    harvestIds?: string[]; // Pour compatibilité avec l'ancien format
    qrCode: string;
    batchHash: string;
    status?: BatchStatus;
}

export type UpdateBatchDto = Partial<CreateBatchDto>;
