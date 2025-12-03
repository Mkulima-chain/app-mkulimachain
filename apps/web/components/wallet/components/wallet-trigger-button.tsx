"use client"

import { WalletIcon, CheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WalletTriggerButtonProps {
    connected: boolean
    walletName: string | undefined | null
    address: string | null | undefined
    onClick: () => void
}

/**
 * Formate une adresse Cardano pour afficher les premiers et derniers caractères
 * Exemple: "addr1qy...xyz" -> "addr1qy...xyz" (6 premiers + 4 derniers)
 */
function formatAddress(address: string | null | undefined): string {
    if (!address) return ""
    
    if (address.length <= 10) return address
    
    const start = address.slice(0, 6)
    const end = address.slice(-4)
    return `${start}...${end}`
}

export function WalletTriggerButton({ connected, walletName, address, onClick }: WalletTriggerButtonProps) {
    const displayText = connected 
        ? (address ? formatAddress(address) : walletName || "Connected")
        : "Cardano Wallet"
    
    return (
        <Button
            onClick={onClick}
            type="button"
            variant="outline"
            className="w-full border-[#004D73]/20 hover:bg-[#E3F2FD] hover:border-[#004D73]/40 text-[#5A3E36] transition-all duration-200"
        >
            {connected ? (
                <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    {displayText}
                </>
            ) : (
                <>
                    <WalletIcon className="w-4 h-4 mr-2" />
                    {displayText}
                </>
            )}
        </Button>
    )
}

