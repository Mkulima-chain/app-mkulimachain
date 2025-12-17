/**
 * Types pour les agriculteurs
 */

export interface Farmer {
    id: string;
    name: string;
    phone: string;
    walletAddress?: string;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    mobileMoneyNumber?: string;
    mobileMoneyProvider?: string;
    cooperativeId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFarmerDto {
    name: string;
    phone: string;
    walletAddress?: string;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    mobileMoneyNumber?: string;
    mobileMoneyProvider?: string;
    cooperativeId?: string;
}

export type UpdateFarmerDto = Partial<CreateFarmerDto>;
