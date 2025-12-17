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
    createdAt: string;
    updatedAt?: string;
}

export interface CreateBatchDto {
    harvestIds: string[];
    qrCode: string;
    batchHash: string;
    status?: BatchStatus;
}

export type UpdateBatchDto = Partial<CreateBatchDto>;
