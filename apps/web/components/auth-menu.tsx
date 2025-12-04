"use client"

import { useSession, signIn } from "next-auth/react"
import { useCardanoWallet } from "@/hooks"
import { LogIn, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ModalWallet } from "@/components/wallet/modal-wallet"
import { UserAvatar } from "@/components/user-avatar"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Composant pour le bouton Wallet avec le style de l'image
function WalletButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex-1 group relative overflow-hidden w-full",
          "px-4 py-3 h-auto",
          "rounded-lg",
          "border-2 transition-all duration-300",
          "bg-[#005A87] dark:bg-[#005A87]",
          "border-white/50 dark:border-white/50",
          "hover:border-white/70 dark:hover:border-white/70",
          "hover:bg-[#006699] dark:hover:bg-[#006699]",
          "text-white",
          "font-medium text-sm"
        )}
      >
        <div className="relative flex items-center justify-center gap-2.5 z-10">
          <Wallet className="w-5 h-5 text-white" />
          <span className="text-white">Cardano Wallet</span>
        </div>
      </Button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <ModalWallet />
          </div>
        </div>
      )}
    </>
  )
}

export function AuthMenu() {
  const { data: session } = useSession()
  const { connected } = useCardanoWallet()
  
  const isAuthenticated = session?.user || connected

  // Si l'utilisateur est connecté, afficher l'avatar ou le wallet
  if (isAuthenticated) {
    if (session?.user) {
      // Connecté via Google/Email
      return <UserAvatar />
    } else if (connected) {
      // Connecté via Wallet
      return <ModalWallet />
    }
  }

  // Si non connecté, afficher le menu de connexion
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "group relative overflow-hidden",
            "px-4 py-2.5 h-auto",
            "rounded-xl",
            "border-2 transition-all duration-300",
            "shadow-sm hover:shadow-lg",
            "hover:scale-[1.02] active:scale-[0.98]",
            "border-[#004D73]/30 dark:border-white/30",
            "bg-gradient-to-r from-[#004D73]/5 to-[#3A8F4C]/5 dark:from-white/5 dark:to-white/10",
            "hover:border-[#004D73]/50 dark:hover:border-white/50",
            "hover:from-[#004D73]/10 hover:to-[#3A8F4C]/10 dark:hover:from-white/10 dark:hover:to-white/20",
            "text-[#5A3E36] dark:text-white/90",
            "font-semibold text-sm"
          )}
        >
          {/* Effet de brillance au survol */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
          
          <div className="relative flex items-center gap-2.5 z-10">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#004D73]/20 dark:bg-white/20 rounded-lg blur-sm group-hover:bg-[#3A8F4C]/30 dark:group-hover:bg-[#3A8F4C]/30 transition-colors duration-300" />
              <LogIn className="relative w-4 h-4 text-[#004D73] dark:text-white/80 group-hover:text-[#3A8F4C] dark:group-hover:text-[#3A8F4C] transition-colors duration-300" />
            </div>
            <span className="font-semibold">Se connecter</span>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-[#004D73] dark:bg-[#004D73] border-white/20" align="end">
        <div className="space-y-4">
          <div className="text-center mb-2">
            <h3 className="font-semibold text-white text-sm mb-1">
              Choisissez votre méthode de connexion
            </h3>
            <p className="text-xs text-white/70">
              Connectez-vous avec votre wallet Cardano ou Google
            </p>
          </div>

          {/* Boutons côte à côte */}
          <div className="flex gap-3">
            {/* Bouton Google */}
            <Button
              onClick={() => signIn('google')}
              className={cn(
                "flex-1 group relative overflow-hidden",
                "px-4 py-3 h-auto",
                "rounded-lg",
                "border transition-all duration-300",
                "bg-[#004D73] dark:bg-[#004D73]",
                "border-white/30 dark:border-white/30",
                "hover:border-white/50 dark:hover:border-white/50",
                "hover:bg-[#005A87] dark:hover:bg-[#005A87]",
                "text-white",
                "font-medium text-sm"
              )}
            >
              <div className="relative flex items-center justify-center gap-2.5 z-10">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-white">Google</span>
              </div>
            </Button>

            {/* Bouton Cardano Wallet */}
            <WalletButton />
          </div>

          <Separator className="bg-white/20" />

          <div className="text-center">
            <p className="text-xs text-white/60">
              En vous connectant, vous acceptez nos{" "}
              <a href="/terms" className="text-[#3A8F4C] hover:underline">
                conditions d&apos;utilisation
              </a>
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

