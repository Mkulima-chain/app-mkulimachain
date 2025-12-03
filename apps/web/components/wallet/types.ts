export interface WalletInfo {
    name: string
    icon?: string
    version?: string
}

export interface PopularWallet {
    name: string
    icon?: string
    installUrl: string
    description: string
}

export interface WalletData {
    balance: number | null
    address: string | null
    network: string | null
    isLoadingBalance: boolean
    isLoadingAddress: boolean
}

