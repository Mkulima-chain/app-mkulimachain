"use client"

import { useState } from "react"
import { WalletIcon, CheckIcon, XIcon, CopyIcon, Globe, Coins, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { WalletData } from "../types"

interface WalletInfoCardProps {
    walletName: string
    walletData: WalletData
    onCopyAddress: () => void
    copied: boolean
    onDisconnect: () => void
}

export function WalletInfoCard({
    walletName,
    walletData,
    onCopyAddress,
    copied,
    onDisconnect,
}: WalletInfoCardProps) {
    const { balance, address, network, isLoadingBalance, isLoadingAddress } = walletData
    const [isBalanceVisible, setIsBalanceVisible] = useState(true)

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
                                <p className="font-semibold text-sm text-foreground">{walletName}</p>
                                <div className="flex items-center gap-1">
                                    <div className="size-1 rounded-full bg-[#3A8F4C] dark:bg-[#3A8F4C]" />
                                    <p className="text-xs text-[#3A8F4C] dark:text-[#3A8F4C]">Connecté</p>
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
    )
}

function NetworkSection({ network }: { network: string | null }) {
    return (
        <div className={cn(
            "p-2 rounded-lg border",
            network ? "bg-muted/50 border-border" : "bg-muted/30 border-border"
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Globe className={cn("size-3.5", network ? "text-[#004D73] dark:text-white/80" : "text-muted-foreground")} />
                    <p className={cn("text-xs font-medium", network ? "text-foreground" : "text-muted-foreground")}>
                        Réseau
                    </p>
                </div>
                {network ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background border border-border">
                        <div className={cn(
                            "size-2 rounded-full",
                            network === "Mainnet" ? "bg-[#3A8F4C]" : "bg-[#F2C94C]"
                        )} />
                        <p className="text-xs font-semibold text-[#004D73] dark:text-white/90">{network}</p>
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">Non disponible</p>
                )}
            </div>
        </div>
    )
}

function BalanceSection({ 
    balance, 
    isLoading,
    isVisible,
    onToggleVisibility
}: { 
    balance: number | null
    isLoading: boolean
    isVisible: boolean
    onToggleVisibility: () => void
}) {
    return (
        <div className={cn(
            "p-2 rounded-lg border",
            balance !== null ? "bg-muted/50 border-border" : "bg-muted/30 border-border"
        )}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Coins className={cn("size-3.5", balance !== null ? "text-[#F2C94C]" : "text-muted-foreground")} />
                    <p className={cn("text-xs font-medium", balance !== null ? "text-foreground" : "text-muted-foreground")}>
                        Solde disponible
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    {isLoading ? (
                        <div className="flex items-center gap-1">
                            <div className="size-2.5 animate-spin rounded-full border-2 border-[#3A8F4C] border-t-transparent" />
                            <span className="text-xs text-muted-foreground">...</span>
                        </div>
                    ) : balance !== null ? (
                        <>
                            {isVisible ? (
                                <div className="flex items-baseline gap-1">
                                    <p className="text-base font-bold text-[#3A8F4C]">
                                        {balance.toLocaleString("fr-FR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 6,
                                        })}
                                    </p>
                                    <span className="text-xs text-foreground">ADA</span>
                                </div>
                            ) : (
                                <p className="text-base font-bold text-[#3A8F4C]">••••••</p>
                            )}
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
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">--</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function AddressSection({
    address,
    isLoading,
    onCopy,
    copied,
}: {
    address: string | null
    isLoading: boolean
    onCopy: () => void
    copied: boolean
}) {
    return (
        <div className={cn(
            "p-2 rounded-lg border",
            address ? "bg-muted/50 border-border" : "bg-muted/30 border-border"
        )}>
            <div className="space-y-1.5">
                <p className={cn(
                    "text-xs font-medium flex items-center gap-1.5",
                    address ? "text-foreground" : "text-muted-foreground"
                )}>
                    <CopyIcon className={cn("size-3.5", address ? "text-[#004D73] dark:text-white/80" : "text-muted-foreground")} />
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
                    <p className="text-xs text-muted-foreground p-1.5">Adresse non disponible</p>
                )}
            </div>
        </div>
    )
}

