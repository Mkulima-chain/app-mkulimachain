"use client"

import { DownloadIcon, ExternalLinkIcon, WalletIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { POPULAR_WALLETS } from "../constants"

export function PopularWallets() {
    return (
        <div className="space-y-3">
            <div className="py-4 text-center">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex size-12 items-center justify-center rounded-full bg-muted border border-border">
                        <WalletIcon className="size-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-foreground mb-0.5">
                            Aucun wallet disponible
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Installez un wallet Cardano pour continuer
                        </p>
                    </div>
                </div>
            </div>

            {/* Popular Wallets to Install */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide px-1">
                    Wallets populaires
                </p>
                {POPULAR_WALLETS.map((popularWallet) => (
                    <Card
                        key={popularWallet.name}
                        className="border-border dark:border-white/20 hover:border-[#004D73]/50 dark:hover:border-[#004D73]/50 transition-colors"
                    >
                        <CardContent className="p-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-[#3A8F4C] dark:bg-[#3A8F4C] shrink-0">
                                        <WalletIcon className="size-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-foreground truncate">
                                            {popularWallet.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {popularWallet.description}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="shrink-0 border-[#004D73] dark:border-white/30 text-[#004D73] dark:text-white/90 hover:bg-[#004D73] dark:hover:bg-white/20 hover:text-white dark:hover:text-white"
                                    onClick={() => window.open(popularWallet.installUrl, "_blank")}
                                >
                                    <DownloadIcon className="size-3.5 mr-1" />
                                    Installer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="pt-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ExternalLinkIcon className="size-3" />
                    <p>
                        Après installation, rafraîchissez la page pour voir vos wallets
                    </p>
                </div>
            </div>
        </div>
    )
}

