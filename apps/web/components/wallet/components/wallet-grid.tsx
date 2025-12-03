"use client"

import Image from "next/image"
import { WalletIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WalletInfo } from "../types"

interface WalletGridProps {
    wallets: WalletInfo[]
    onConnect: (walletName: string) => void
    isConnecting: boolean
    connectingWalletName: string | null
}

export function WalletGrid({ wallets, onConnect, isConnecting, connectingWalletName }: WalletGridProps) {
    return (
        <>
            <div className="grid grid-cols-3 gap-2">
                {wallets.map((wallet) => {
                    const isThisWalletConnecting = connectingWalletName === wallet.name

                    return (
                        <button
                            key={wallet.name}
                            onClick={() => onConnect(wallet.name)}
                            disabled={isConnecting}
                            className={cn(
                                "relative group flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg border transition-all",
                                "hover:border-[#3A8F4C] hover:bg-muted/50",
                                "bg-background border-muted",
                                isThisWalletConnecting && "border-[#3A8F4C] bg-muted/50",
                                isConnecting && !isThisWalletConnecting && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {!isThisWalletConnecting && (
                                <div className="absolute top-1 right-1 flex size-2 items-center justify-center rounded-full bg-green-500 border border-background">
                                    <div className="size-1 rounded-full bg-background" />
                                </div>
                            )}

                            {wallet.icon ? (
                                <div className={cn(
                                    "flex size-10 items-center justify-center rounded-lg bg-background p-1 transition-all",
                                    isThisWalletConnecting && "opacity-50"
                                )}>
                                    <Image
                                        src={wallet.icon}
                                        alt={wallet.name}
                                        width={32}
                                        height={32}
                                        className="rounded"
                                        unoptimized
                                    />
                                </div>
                            ) : (
                                <div className={cn(
                                    "flex size-10 items-center justify-center rounded-lg bg-[#3A8F4C] transition-all",
                                    isThisWalletConnecting && "opacity-50"
                                )}>
                                    <WalletIcon className="size-5 text-white" />
                                </div>
                            )}

                            <p className={cn(
                                "text-[10px] font-semibold text-foreground text-center leading-tight transition-all",
                                isThisWalletConnecting && "opacity-50"
                            )}>
                                {wallet.name}
                            </p>

                            {isThisWalletConnecting && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg backdrop-blur-sm">
                                    <div className="size-5 animate-spin rounded-full border-2 border-[#3A8F4C] border-t-transparent" />
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-2">
                <div className="size-1.5 rounded-full bg-green-500" />
                <p className="text-xs text-muted-foreground font-medium">
                    {wallets.length} {wallets.length === 1 ? "wallet disponible" : "wallets disponibles"}
                </p>
            </div>
        </>
    )
}

