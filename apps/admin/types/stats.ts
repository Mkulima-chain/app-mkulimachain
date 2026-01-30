/**
 * Types pour les statistiques globales
 */

export interface ServiceStatus {
    name: string;
    status: "online" | "offline" | "degraded";
    value: string;
}

export interface StatsSummary {
    farmers: number;
    products: number;
    orders: number;
    revenueAda: number;
    systemStatus: ServiceStatus[];
}
