"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft, 
  CreditCard, Truck, CheckCircle2, Wallet, AlertCircle
} from "lucide-react"
import { useCart } from "@/hooks"
import { useCardanoWallet } from "@/hooks"
import { ModalWallet } from "@/components/wallet/modal-wallet"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const router = useRouter()
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal, getItemCount } = useCart()
  const { connected } = useCardanoWallet()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Votre panier est vide")
      return
    }

    if (!connected) {
      toast.error("Wallet non connecté", {
        description: "Veuillez connecter votre wallet Cardano pour procéder au paiement",
      })
      return
    }

    setIsProcessing(true)
    
    // Simuler la création de commande
    setTimeout(() => {
      toast.success("Commande créée avec succès!", {
        description: `Votre commande de ${getItemCount()} article(s) a été enregistrée`,
      })
      clearCart()
      setIsProcessing(false)
      router.push("/dashboard")
    }, 1500)
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#004D73] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-[#004D73]/40 dark:text-white/40 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[#5A3E36] dark:text-white mb-4">
              Votre panier est vide
            </h1>
            <p className="text-[#004D73] dark:text-white/70 mb-8">
              Ajoutez des produits depuis le marketplace pour commencer
            </p>
            <Link href="/marketplace">
              <Button className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour au marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#004D73] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/marketplace">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au marketplace
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-[#5A3E36] dark:text-white">
            Mon panier
          </h1>
          <p className="text-[#004D73] dark:text-white/70 mt-2">
            {getItemCount()} {getItemCount() === 1 ? "article" : "articles"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <Card key={item.productId} className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-4xl">{item.productImage}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-[#5A3E36] dark:text-white mb-1 truncate">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-[#004D73] dark:text-white/70">
                        {item.price.toLocaleString()} {item.currency} / unité
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 border border-[#004D73]/20 dark:border-white/20 rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-[#5A3E36] dark:text-white text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => {
                          removeFromCart(item.productId)
                          toast.success("Article retiré du panier")
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-right min-w-[100px]">
                      <p className="font-bold text-lg text-[#3A8F4C] dark:text-[#3A8F4C]">
                        {(item.price * item.quantity).toLocaleString()} {item.currency}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Résumé de commande */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20 sticky top-24">
              <CardHeader>
                <CardTitle className="text-[#5A3E36] dark:text-white">Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Alerte si wallet non connecté */}
                {!connected && (
                  <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                            Wallet non connecté
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                            Vous devez connecter votre wallet Cardano pour procéder au paiement
                          </p>
                          <ModalWallet
                            triggerClassName="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium h-9"
                            triggerTextClassName="text-white"
                            triggerIconClassName="w-4 h-4 text-white"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Statut wallet connecté */}
                {connected && (
                  <Card className="bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 border-[#3A8F4C]/30 dark:border-[#3A8F4C]/50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#3A8F4C] animate-pulse" />
                        <p className="text-xs font-medium text-[#3A8F4C] dark:text-[#3A8F4C]">
                          Wallet connecté - Paiement disponible
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#004D73] dark:text-white/70">Sous-total</span>
                    <span className="text-[#5A3E36] dark:text-white font-medium">
                      {getTotal().toLocaleString()} USD
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#004D73] dark:text-white/70">Livraison</span>
                    <span className="text-[#5A3E36] dark:text-white font-medium">Gratuite</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-[#5A3E36] dark:text-white">Total</span>
                    <span className="text-[#3A8F4C] dark:text-[#3A8F4C]">
                      {getTotal().toLocaleString()} USD
                    </span>
                  </div>
                </div>

                <Button
                  className={cn(
                    "w-full h-12 text-base font-semibold",
                    connected
                      ? "bg-[#3A8F4C] hover:bg-[#2E7D32] text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  )}
                  onClick={handleCheckout}
                  disabled={isProcessing || !connected}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Traitement...
                    </>
                  ) : connected ? (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Passer la commande
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5 mr-2" />
                      Connecter le wallet
                    </>
                  )}
                </Button>

                {!connected && (
                  <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                    Le paiement nécessite une connexion wallet
                  </p>
                )}

                <div className="pt-4 space-y-2 text-xs text-[#004D73] dark:text-white/60">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#3A8F4C]" />
                    <span>Livraison gratuite</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3A8F4C]" />
                    <span>Paiement sécurisé</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

