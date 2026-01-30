"use client"

import { WalletIcon, CheckIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WalletTriggerButtonProps {
    connected: boolean
    walletName: string | undefined | null
    address: string | null | undefined
    onClick: () => void
    className?: string
    iconClassName?: string
    textClassName?: string
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

export function WalletTriggerButton({ connected, walletName, address, onClick, className, iconClassName, textClassName }: WalletTriggerButtonProps) {
    const displayText = connected 
        ? (address ? formatAddress(address) : walletName || "Connected")
        : "Cardano Wallet"
    
    // Si className est fourni, utiliser le style personnalisé
    const useCustomStyle = !!className
    
    return (
        <Button
            onClick={onClick}
            type="button"
            variant="outline"
            className={cn(
                !useCustomStyle && "group relative overflow-hidden",
                !useCustomStyle && "px-4 py-2.5 h-auto",
                !useCustomStyle && "rounded-xl",
                !useCustomStyle && "border-2 transition-all duration-300",
                !useCustomStyle && "shadow-sm hover:shadow-lg",
                !useCustomStyle && "hover:scale-[1.02] active:scale-[0.98]",
                !useCustomStyle && connected
                    ? "border-[#3A8F4C]/40 dark:border-[#3A8F4C]/60 bg-gradient-to-r from-[#3A8F4C]/5 to-[#3A8F4C]/10 dark:from-[#3A8F4C]/10 dark:to-[#3A8F4C]/20 hover:border-[#3A8F4C] dark:hover:border-[#3A8F4C] hover:from-[#3A8F4C]/10 hover:to-[#3A8F4C]/20 dark:hover:from-[#3A8F4C]/20 dark:hover:to-[#3A8F4C]/30"
                    : !useCustomStyle && "border-[#004D73]/30 dark:border-white/30 bg-gradient-to-r from-[#004D73]/5 to-[#3A8F4C]/5 dark:from-white/5 dark:to-white/10 hover:border-[#004D73]/50 dark:hover:border-white/50 hover:from-[#004D73]/10 hover:to-[#3A8F4C]/10 dark:hover:from-white/10 dark:hover:to-white/20",
                !useCustomStyle && "text-[#5A3E36] dark:text-white/90",
                !useCustomStyle && "font-semibold text-sm",
                className
            )}
        >
            {!useCustomStyle && (
                <>
                    {/* Effet de brillance au survol */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                </>
            )}
            
            <div className="relative flex items-center gap-2.5 z-10">
                {connected ? (
                    <>
                        <div className="relative">
                            {!useCustomStyle && <div className="absolute inset-0 bg-[#3A8F4C] rounded-full animate-ping opacity-20" />}
                            <div className={cn("relative flex items-center justify-center size-5 rounded-full bg-[#3A8F4C] dark:bg-[#3A8F4C]", useCustomStyle && "size-5")}>
                                <CheckIcon className={cn("w-3 h-3 text-white", iconClassName)} />
                            </div>
                        </div>
                        <span className={cn("font-semibold text-[#3A8F4C] dark:text-[#3A8F4C]", textClassName)}>
                            {displayText}
                        </span>
                        {!useCustomStyle && <Sparkles className="w-3.5 h-3.5 text-[#3A8F4C] dark:text-[#3A8F4C] opacity-70" />}
                    </>
                ) : (
                    <>
                        {useCustomStyle ? (
                            <WalletIcon className={cn("w-4 h-4 mr-2", iconClassName || "text-[#5A3E36] dark:text-white/90")} />
                        ) : (
                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-[#004D73]/20 dark:bg-white/20 rounded-lg blur-sm group-hover:bg-[#3A8F4C]/30 dark:group-hover:bg-[#3A8F4C]/30 transition-colors duration-300" />
                                <WalletIcon className="relative w-4 h-4 text-[#004D73] dark:text-white/80 group-hover:text-[#3A8F4C] dark:group-hover:text-[#3A8F4C] transition-colors duration-300" />
                            </div>
                        )}
                        <span className={cn(useCustomStyle ? "font-medium" : "font-semibold", textClassName)}>
                            {displayText}
                        </span>
                    </>
                )}
            </div>
        </Button>
    )
}

