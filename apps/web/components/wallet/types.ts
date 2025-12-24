import { Lucid } from "lucid-cardano";

export interface WalletInfo {
  name: string;
  icon?: string;
  version?: string;
}

export interface PopularWallet {
  name: string;
  icon?: string;
  installUrl: string;
  description: string;
}

export interface WalletData {
  balance: number | null;
  address: string | null;
  network: string | null;
  isLoadingBalance: boolean;
  isLoadingAddress: boolean;
}

export interface Asset {
  unit: string;
  quantity: string | number;
  name?: string;
  icon?: string;
}

// Legacy wallet interface for backward compatibility
export interface LegacyWalletInstance {
  getBalance?: () => Promise<Asset[] | { lovelace?: string | number }>;
  getLovelace?: () => Promise<string | number>;
  getUsedAddresses?: () => Promise<string[]>;
  getChangeAddress?: () => Promise<string>;
  getNetworkId?: () => Promise<number>;
}

// Union type that supports both Lucid and legacy wallets
export type WalletInstance = Lucid | LegacyWalletInstance | null;
