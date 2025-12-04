"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ShoppingCart, Trash2, Plus, Minus, ArrowLeft, 
  CreditCard, Truck, CheckCircle2, Wallet,
  Coins, Smartphone, Check, Package, User
} from "lucide-react"
import { useCart } from "@/hooks"
import { useCardanoWallet } from "@/hooks"
import { ModalWallet } from "@/components/wallet/modal-wallet"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type PaymentMethod = "ada" | "airtel" | "orange" | "vodacom" | null
type ShippingOption = "buyer-choice" | "seller-choice"

const TRANSPORT_COMPANIES = [
  { id: "dhl", name: "DHL Express", logo: "🚚", description: "Livraison express internationale" },
  { id: "fedex", name: "FedEx", logo: "📦", description: "Service de livraison rapide" },
  { id: "ups", name: "UPS", logo: "🚛", description: "Transport et logistique" },
  { id: "tnt", name: "TNT Express", logo: "📮", description: "Livraison express" },
  { id: "local-1", name: "Transport Congo Express", logo: "🚐", description: "Transport local RDC" },
  { id: "local-2", name: "Kinshasa Logistics", logo: "🚚", description: "Logistique locale" },
  { id: "local-3", name: "Congo Transport", logo: "🚛", description: "Transport national" },
]

export default function CartPage() {
  const router = useRouter()
  const { cart, updateQuantity, removeFromCart, clearCart, getTotal, getItemCount } = useCart()
  const { connected } = useCardanoWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null)
  const [mobileMoneyPhone, setMobileMoneyPhone] = useState("")
  const [shippingOption, setShippingOption] = useState<ShippingOption>("seller-choice")
  const [selectedTransportCompany, setSelectedTransportCompany] = useState<string | null>(null)

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Votre panier est vide")
      return
    }

    if (!selectedPaymentMethod) {
      toast.error("Mode de paiement requis", {
        description: "Veuillez sélectionner un mode de paiement",
      })
      return
    }

    if (selectedPaymentMethod === "ada" && !connected) {
      toast.error("Wallet non connecté", {
        description: "Veuillez connecter votre wallet Cardano pour procéder au paiement",
      })
      return
    }

    if (selectedPaymentMethod !== "ada" && !mobileMoneyPhone.trim()) {
      toast.error("Numéro de téléphone requis", {
        description: "Veuillez entrer votre numéro de téléphone Mobile Money",
      })
      return
    }

    if (shippingOption === "buyer-choice" && !selectedTransportCompany) {
      toast.error("Entreprise de transport requise", {
        description: "Veuillez sélectionner une entreprise de transport",
      })
      return
    }

    setIsProcessing(true)
    
    // Simuler la création de commande
    setTimeout(() => {
      const methodName = 
        selectedPaymentMethod === "ada" ? "ADA (Cardano)" :
        selectedPaymentMethod === "airtel" ? "Airtel Money" :
        selectedPaymentMethod === "orange" ? "Orange Money" :
        "Vodacom M-Pesa"
      
      const shippingInfo = shippingOption === "buyer-choice" && selectedTransportCompany
        ? `Transport: ${TRANSPORT_COMPANIES.find(c => c.id === selectedTransportCompany)?.name || "Inconnu"}`
        : "Transport: Le vendeur choisira"
      
      toast.success("Commande créée avec succès!", {
        description: `Votre commande de ${getItemCount()} article(s) a été enregistrée. Paiement: ${methodName}. ${shippingInfo}`,
      })
      clearCart()
      setIsProcessing(false)
      setSelectedPaymentMethod(null)
      setMobileMoneyPhone("")
      setShippingOption("seller-choice")
      setSelectedTransportCompany(null)
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
                    <div className="w-20 h-20 rounded-lg bg-linear-to-br from-[#3A8F4C]/20 to-[#004D73]/20 dark:from-[#3A8F4C]/30 dark:to-[#004D73]/40 flex items-center justify-center shrink-0">
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
                {/* Sélection du mode de paiement */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-[#5A3E36] dark:text-white">
                    Mode de paiement
                  </Label>
                  
                  {/* ADA (Cardano) */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentMethod("ada")
                      setMobileMoneyPhone("")
                    }}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all text-left",
                      selectedPaymentMethod === "ada"
                        ? "border-[#3A8F4C] bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20"
                        : "border-[#004D73]/20 dark:border-white/20 hover:border-[#3A8F4C]/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          selectedPaymentMethod === "ada"
                            ? "bg-[#3A8F4C]"
                            : "bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20"
                        )}>
                          <Coins className={cn(
                            "w-5 h-5",
                            selectedPaymentMethod === "ada" ? "text-white" : "text-[#3A8F4C]"
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#5A3E36] dark:text-white">
                              ADA (Cardano)
                            </p>
                            {selectedPaymentMethod === "ada" && (
                              <Check className="w-4 h-4 text-[#3A8F4C]" />
                            )}
                          </div>
                          <p className="text-xs text-[#004D73] dark:text-white/70 mt-0.5">
                            Paiement en cryptomonnaie
                          </p>
                        </div>
                      </div>
                      {!connected && selectedPaymentMethod === "ada" && (
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          Wallet requis
                        </div>
                      )}
                    </div>
                    {selectedPaymentMethod === "ada" && !connected && (
                      <div className="mt-3 pt-3 border-t border-[#004D73]/10 dark:border-white/10">
                        <ModalWallet
                          triggerClassName="w-full bg-[#3A8F4C] hover:bg-[#2E7D32] text-white text-sm font-medium h-9"
                          triggerTextClassName="text-white"
                          triggerIconClassName="w-4 h-4 text-white"
                        />
                      </div>
                    )}
                    {selectedPaymentMethod === "ada" && connected && (
                      <div className="mt-3 pt-3 border-t border-[#004D73]/10 dark:border-white/10">
                        <div className="flex items-center gap-2 text-xs text-[#3A8F4C]">
                          <div className="w-2 h-2 rounded-full bg-[#3A8F4C] animate-pulse" />
                          <span>Wallet connecté</span>
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Mobile Money Options */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-4 h-4 text-[#004D73] dark:text-white/70" />
                      <p className="text-xs font-medium text-[#004D73] dark:text-white/70">
                        Mobile Money
                      </p>
                    </div>

                    {/* Airtel Money */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod("airtel")
                        if (!mobileMoneyPhone) setMobileMoneyPhone("")
                      }}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 transition-all text-left",
                        selectedPaymentMethod === "airtel"
                          ? "border-[#E60012] bg-[#E60012]/10 dark:bg-[#E60012]/20"
                          : "border-[#004D73]/10 dark:border-white/10 hover:border-[#E60012]/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded flex items-center justify-center",
                            selectedPaymentMethod === "airtel"
                              ? "bg-[#E60012]"
                              : "bg-[#E60012]/10 dark:bg-[#E60012]/20"
                          )}>
                            <span className={cn(
                              "text-xs font-bold",
                              selectedPaymentMethod === "airtel" ? "text-white" : "text-[#E60012]"
                            )}>A</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-[#5A3E36] dark:text-white">
                                Airtel Money
                              </p>
                              {selectedPaymentMethod === "airtel" && (
                                <Check className="w-3.5 h-3.5 text-[#E60012]" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Orange Money */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod("orange")
                        if (!mobileMoneyPhone) setMobileMoneyPhone("")
                      }}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 transition-all text-left",
                        selectedPaymentMethod === "orange"
                          ? "border-[#FF6600] bg-[#FF6600]/10 dark:bg-[#FF6600]/20"
                          : "border-[#004D73]/10 dark:border-white/10 hover:border-[#FF6600]/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded flex items-center justify-center",
                            selectedPaymentMethod === "orange"
                              ? "bg-[#FF6600]"
                              : "bg-[#FF6600]/10 dark:bg-[#FF6600]/20"
                          )}>
                            <span className={cn(
                              "text-xs font-bold",
                              selectedPaymentMethod === "orange" ? "text-white" : "text-[#FF6600]"
                            )}>O</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-[#5A3E36] dark:text-white">
                                Orange Money
                              </p>
                              {selectedPaymentMethod === "orange" && (
                                <Check className="w-3.5 h-3.5 text-[#FF6600]" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Vodacom M-Pesa */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod("vodacom")
                        if (!mobileMoneyPhone) setMobileMoneyPhone("")
                      }}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 transition-all text-left",
                        selectedPaymentMethod === "vodacom"
                          ? "border-[#E60000] bg-[#E60000]/10 dark:bg-[#E60000]/20"
                          : "border-[#004D73]/10 dark:border-white/10 hover:border-[#E60000]/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-5 h-5 rounded flex items-center justify-center",
                            selectedPaymentMethod === "vodacom"
                              ? "bg-[#E60000]"
                              : "bg-[#E60000]/10 dark:bg-[#E60000]/20"
                          )}>
                            <span className={cn(
                              "text-xs font-bold",
                              selectedPaymentMethod === "vodacom" ? "text-white" : "text-[#E60000]"
                            )}>V</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-[#5A3E36] dark:text-white">
                                Vodacom M-Pesa
                              </p>
                              {selectedPaymentMethod === "vodacom" && (
                                <Check className="w-3.5 h-3.5 text-[#E60000]" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Input téléphone pour Mobile Money */}
                  {selectedPaymentMethod && selectedPaymentMethod !== "ada" && (
                    <div className="pt-2 space-y-2">
                      <Label htmlFor="mobile-phone" className="text-xs text-[#004D73] dark:text-white/70">
                        Numéro de téléphone Mobile Money
                      </Label>
                      <Input
                        id="mobile-phone"
                        type="tel"
                        placeholder="+243 XXX XXX XXX"
                        value={mobileMoneyPhone}
                        onChange={(e) => setMobileMoneyPhone(e.target.value)}
                        className="bg-white dark:bg-[#004D73] border-[#004D73]/20 dark:border-white/20"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Sélection de l'entreprise de transport */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-[#5A3E36] dark:text-white">
                    Entreprise de transport
                  </Label>
                  
                  {/* Option: Laisser le vendeur choisir */}
                  <button
                    type="button"
                    onClick={() => {
                      setShippingOption("seller-choice")
                      setSelectedTransportCompany(null)
                    }}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all text-left",
                      shippingOption === "seller-choice"
                        ? "border-[#3A8F4C] bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20"
                        : "border-[#004D73]/20 dark:border-white/20 hover:border-[#3A8F4C]/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          shippingOption === "seller-choice"
                            ? "bg-[#3A8F4C]"
                            : "bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20"
                        )}>
                          <User className={cn(
                            "w-5 h-5",
                            shippingOption === "seller-choice" ? "text-white" : "text-[#3A8F4C]"
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#5A3E36] dark:text-white">
                              Laisser le vendeur choisir
                            </p>
                            {shippingOption === "seller-choice" && (
                              <Check className="w-4 h-4 text-[#3A8F4C]" />
                            )}
                          </div>
                          <p className="text-xs text-[#004D73] dark:text-white/70 mt-0.5">
                            Le vendeur sélectionnera l'entreprise de transport
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Option: L'acheteur choisit */}
                  <button
                    type="button"
                    onClick={() => {
                      setShippingOption("buyer-choice")
                      if (!selectedTransportCompany) {
                        setSelectedTransportCompany(TRANSPORT_COMPANIES[0].id)
                      }
                    }}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 transition-all text-left",
                      shippingOption === "buyer-choice"
                        ? "border-[#004D73] dark:border-white/30 bg-[#004D73]/5 dark:bg-white/5"
                        : "border-[#004D73]/20 dark:border-white/20 hover:border-[#004D73]/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          shippingOption === "buyer-choice"
                            ? "bg-[#004D73] dark:bg-white/20"
                            : "bg-[#004D73]/10 dark:bg-white/10"
                        )}>
                          <Package className={cn(
                            "w-5 h-5",
                            shippingOption === "buyer-choice" 
                              ? "text-white dark:text-[#004D73]" 
                              : "text-[#004D73] dark:text-white/70"
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#5A3E36] dark:text-white">
                              Je choisis l'entreprise
                            </p>
                            {shippingOption === "buyer-choice" && (
                              <Check className="w-4 h-4 text-[#004D73] dark:text-white" />
                            )}
                          </div>
                          <p className="text-xs text-[#004D73] dark:text-white/70 mt-0.5">
                            Sélectionnez votre entreprise de transport préférée
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Liste des entreprises si l'acheteur choisit */}
                  {shippingOption === "buyer-choice" && (
                    <div className="pt-2 space-y-2 max-h-64 overflow-y-auto">
                      {TRANSPORT_COMPANIES.map((company) => (
                        <button
                          key={company.id}
                          type="button"
                          onClick={() => setSelectedTransportCompany(company.id)}
                          className={cn(
                            "w-full p-3 rounded-lg border-2 transition-all text-left",
                            selectedTransportCompany === company.id
                              ? "border-[#3A8F4C] bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20"
                              : "border-[#004D73]/10 dark:border-white/10 hover:border-[#3A8F4C]/50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{company.logo}</div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm text-[#5A3E36] dark:text-white">
                                    {company.name}
                                  </p>
                                  {selectedTransportCompany === company.id && (
                                    <Check className="w-3.5 h-3.5 text-[#3A8F4C]" />
                                  )}
                                </div>
                                <p className="text-xs text-[#004D73] dark:text-white/70 mt-0.5">
                                  {company.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

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
                    selectedPaymentMethod && 
                    (selectedPaymentMethod === "ada" ? connected : mobileMoneyPhone.trim())
                      ? "bg-[#3A8F4C] hover:bg-[#2E7D32] text-white"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  )}
                  onClick={handleCheckout}
                  disabled={
                    isProcessing || 
                    !selectedPaymentMethod ||
                    (selectedPaymentMethod === "ada" ? !connected : !mobileMoneyPhone.trim())
                  }
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Traitement...
                    </>
                  ) : !selectedPaymentMethod ? (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Sélectionner un mode de paiement
                    </>
                  ) : selectedPaymentMethod === "ada" && !connected ? (
                    <>
                      <Wallet className="w-5 h-5 mr-2" />
                      Connecter le wallet
                    </>
                  ) : selectedPaymentMethod !== "ada" && !mobileMoneyPhone.trim() ? (
                    <>
                      <Smartphone className="w-5 h-5 mr-2" />
                      Entrer le numéro de téléphone
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Passer la commande
                    </>
                  )}
                </Button>

                {!selectedPaymentMethod && (
                  <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                    Veuillez sélectionner un mode de paiement
                  </p>
                )}
                {selectedPaymentMethod === "ada" && !connected && (
                  <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                    Le paiement ADA nécessite une connexion wallet
                  </p>
                )}
                {selectedPaymentMethod && selectedPaymentMethod !== "ada" && !mobileMoneyPhone.trim() && (
                  <p className="text-xs text-center text-amber-600 dark:text-amber-400">
                    Veuillez entrer votre numéro de téléphone Mobile Money
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

