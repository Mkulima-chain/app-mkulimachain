"use client"

import { Sparkles } from "lucide-react"

interface ModalFooterProps {
    walletsCount: number
}

export function ModalFooter({ walletsCount }: ModalFooterProps) {
    return (
        <>
            <div className="border-t border-border"></div>
            <div className="flex flex-col items-center gap-3 p-4">
                <div className="flex items-center justify-center gap-1.5">
                    <div className="size-1.5 rounded-full bg-[#3A8F4C]" />
                    <p className="text-xs text-foreground font-medium">
                        {walletsCount} {walletsCount === 1 ? "wallet disponible" : "wallets disponibles"}
                    </p>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                    <Sparkles className="size-3 text-[#004D73] dark:text-white/70" />
                    <p className="text-xs text-[#004D73] dark:text-white/70">
                        Sécurisé par Cardano Blockchain
                    </p>
                </div>
            </div>
        </>
    )
}

