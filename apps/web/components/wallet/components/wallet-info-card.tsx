"use client";

import { useState, useEffect } from "react";
import {
  WalletIcon,
  CheckIcon,
  XIcon,
  CopyIcon,
  Globe,
  Coins,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WalletData } from "../types";

// Constants for conversion
const LOVELACE_PER_ADA = 1_000_000;

// Hook to fetch ADA price in USD
function useAdaPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // Try to fetch from CoinGecko API
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd"
        );
        if (response.ok) {
          const data = await response.json();
          setPrice(data.cardano?.usd || null);
        }
      } catch (error) {
        console.error("Error fetching ADA price:", error);
        // Fallback price if API fails
        setPrice(0.35); // Approximate fallback
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    // Refresh price every 5 minutes
    const interval = setInterval(fetchPrice, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { price, loading };
}

interface WalletInfoCardProps {
  walletName: string;
  walletData: WalletData;
  onCopyAddress: () => void;
  copied: boolean;
  onDisconnect: () => void;
}

export function WalletInfoCard({
  walletName,
  walletData,
  onCopyAddress,
  copied,
  onDisconnect,
}: WalletInfoCardProps) {
  const { balance, address, network, isLoadingBalance, isLoadingAddress } =
    walletData;
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const { price: adaPrice, loading: priceLoading } = useAdaPrice();

  return (
    <div className="space-y-2">
      <Card className="border border-border">
        <CardContent className="pt-3">
          <div className="space-y-2">
            {/* Wallet Name and Status */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
              <div className="relative">
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#3A8F4C]">
                  <WalletIcon className="size-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 flex size-3 items-center justify-center rounded-full bg-[#3A8F4C] border border-background">
                  <CheckIcon className="size-2 text-white" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {walletName}
                </p>
                <div className="flex items-center gap-1">
                  <div className="size-1 rounded-full bg-[#3A8F4C] dark:bg-[#3A8F4C]" />
                  <p className="text-xs text-[#3A8F4C] dark:text-[#3A8F4C]">
                    Connecté
                  </p>
                </div>
              </div>
            </div>

            {/* Network */}
            <NetworkSection network={network} />

            {/* Balance */}
            <BalanceSection
              balance={balance}
              isLoading={isLoadingBalance}
              isVisible={isBalanceVisible}
              onToggleVisibility={() => setIsBalanceVisible(!isBalanceVisible)}
              adaPrice={adaPrice}
              priceLoading={priceLoading}
            />

            {/* Wallet Address */}
            <AddressSection
              address={address}
              isLoading={isLoadingAddress}
              onCopy={onCopyAddress}
              copied={copied}
            />
          </div>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        className="w-full h-8 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30"
        onClick={onDisconnect}
      >
        <XIcon className="size-3 mr-1.5" />
        Déconnecter le wallet
      </Button>
    </div>
  );
}

function NetworkSection({ network }: { network: string | null }) {
  return (
    <div
      className={cn(
        "p-2 rounded-lg border",
        network ? "bg-muted/50 border-border" : "bg-muted/30 border-border"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Globe
            className={cn(
              "size-3.5",
              network
                ? "text-[#004D73] dark:text-white/80"
                : "text-muted-foreground"
            )}
          />
          <p
            className={cn(
              "text-xs font-medium",
              network ? "text-foreground" : "text-muted-foreground"
            )}
          >
            Réseau
          </p>
        </div>
        {network ? (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border border-border">
            <div
              className={cn(
                "size-2 rounded-full",
                network === "Mainnet" ? "bg-[#3A8F4C]" : "bg-[#F2C94C]"
              )}
            />
            <p className="text-xs font-semibold text-[#004D73] dark:text-white/90">
              {network}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Non disponible</p>
        )}
      </div>
    </div>
  );
}

function BalanceSection({
  balance,
  isLoading,
  isVisible,
  onToggleVisibility,
  adaPrice,
  priceLoading,
}: {
  balance: number | null;
  isLoading: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
  adaPrice: number | null;
  priceLoading: boolean;
}) {
  // Calculate values
  const lovelaceAmount =
    balance !== null ? Math.floor(balance * LOVELACE_PER_ADA) : null;
  const usdAmount =
    balance !== null && adaPrice !== null ? balance * adaPrice : null;

  return (
    <div
      className={cn(
        "p-3 rounded-lg border",
        balance !== null
          ? "bg-muted/50 border-border"
          : "bg-muted/30 border-border"
      )}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Coins
              className={cn(
                "size-3.5",
                balance !== null ? "text-[#F2C94C]" : "text-muted-foreground"
              )}
            />
            <p
              className={cn(
                "text-xs font-medium",
                balance !== null ? "text-foreground" : "text-muted-foreground"
              )}
            >
              Solde disponible
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0"
            onClick={onToggleVisibility}
            title={isVisible ? "Masquer le montant" : "Afficher le montant"}
          >
            {isVisible ? (
              <EyeOff className="size-3 text-muted-foreground" />
            ) : (
              <Eye className="size-3 text-muted-foreground" />
            )}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-1">
            <div className="size-2.5 animate-spin rounded-full border-2 border-[#3A8F4C] border-t-transparent" />
            <span className="text-xs text-muted-foreground">Chargement...</span>
          </div>
        ) : balance !== null ? (
          <div className="space-y-2">
            {/* ADA Amount - Main Display */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-[#0033AD]/10">
                  <span className="text-sm font-bold text-[#0033AD]">₳</span>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    ADA
                  </p>
                  {isVisible ? (
                    <p className="text-lg font-bold text-[#3A8F4C]">
                      {balance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}
                    </p>
                  ) : (
                    <p className="text-lg font-bold text-[#3A8F4C]">••••••</p>
                  )}
                </div>
              </div>
            </div>

            {/* Secondary displays: Lovelace and USD */}
            <div className="grid grid-cols-2 gap-2">
              {/* Lovelace */}
              <div className="p-2 rounded-lg bg-background border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Lovelace
                </p>
                {isVisible ? (
                  <p className="text-sm font-semibold text-foreground">
                    {lovelaceAmount?.toLocaleString("en-US")}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-foreground">
                    ••••••
                  </p>
                )}
              </div>

              {/* USD */}
              <div className="p-2 rounded-lg bg-background border border-border">
                <div className="flex items-center gap-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    USD
                  </p>
                  {priceLoading && (
                    <div className="size-2 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
                  )}
                </div>
                {isVisible ? (
                  <p className="text-sm font-semibold text-green-600">
                    $
                    {usdAmount?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || "--"}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-green-600">••••••</p>
                )}
              </div>
            </div>

            {/* Current ADA Price */}
            {adaPrice && (
              <p className="text-[10px] text-center text-muted-foreground">
                1 ₳ = ${adaPrice.toFixed(4)} USD
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">--</p>
        )}
      </div>
    </div>
  );
}

function AddressSection({
  address,
  isLoading,
  onCopy,
  copied,
}: {
  address: string | null;
  isLoading: boolean;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div
      className={cn(
        "p-2 rounded-lg border",
        address ? "bg-muted/50 border-border" : "bg-muted/30 border-border"
      )}
    >
      <div className="space-y-1.5">
        <p
          className={cn(
            "text-xs font-medium flex items-center gap-1.5",
            address ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <CopyIcon
            className={cn(
              "size-3.5",
              address
                ? "text-[#004D73] dark:text-white/80"
                : "text-muted-foreground"
            )}
          />
          Adresse du wallet
        </p>
        {isLoading ? (
          <div className="flex items-center gap-1 p-1.5 rounded bg-muted/50">
            <div className="size-2.5 animate-spin rounded-full border-2 border-[#3A8F4C] border-t-transparent" />
            <span className="text-xs text-muted-foreground">...</span>
          </div>
        ) : address ? (
          <div className="flex items-center gap-1 p-1.5 bg-background rounded border border-border">
            <code className="text-[10px] flex-1 break-all font-mono text-[#004D73] dark:text-white/80">
              {address}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-6 shrink-0",
                copied && "bg-[#3A8F4C]/20 dark:bg-[#3A8F4C]/30"
              )}
              onClick={onCopy}
              title="Copier l'adresse"
            >
              {copied ? (
                <CheckIcon className="size-3 text-[#3A8F4C] dark:text-[#3A8F4C]" />
              ) : (
                <CopyIcon className="size-3 text-[#004D73] dark:text-white/70" />
              )}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground p-1.5">
            Adresse non disponible
          </p>
        )}
      </div>
    </div>
  );
}
