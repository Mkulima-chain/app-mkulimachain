"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, MessageCircle, X, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

interface Message {
  id: string
  sender: "buyer" | "seller"
  content: string
  timestamp: Date
  senderName: string
  senderAvatar?: string
}

interface ProductChatProps {
  productId: string
  productName: string
  sellerName: string
  sellerAvatar?: string
  isOpen: boolean
  onClose: () => void
}

export function ProductChat({
  productId,
  productName,
  sellerName,
  sellerAvatar,
  isOpen,
  onClose,
}: ProductChatProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "seller",
      content: `Bonjour ! Merci de votre intérêt pour "${productName}". Comment puis-je vous aider ?`,
      timestamp: new Date(Date.now() - 3600000),
      senderName: sellerName,
      senderAvatar: sellerAvatar,
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const buyerName = session?.user?.name || "Acheteur"
  const buyerAvatar = session?.user?.image

  // Auto-scroll vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    const messageContent = newMessage.trim()
    setNewMessage("")
    setIsSending(true)

    // Créer le message de l'acheteur
    const buyerMessage: Message = {
      id: Date.now().toString(),
      sender: "buyer",
      content: messageContent,
      timestamp: new Date(),
      senderName: buyerName,
      senderAvatar: buyerAvatar || undefined,
    }

    setMessages((prev) => [...prev, buyerMessage])

    // Simuler une réponse du vendeur après 1-2 secondes
    setTimeout(() => {
      const sellerResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "seller",
        content: getAutoResponse(messageContent),
        timestamp: new Date(),
        senderName: sellerName,
        senderAvatar: sellerAvatar,
      }
      setMessages((prev) => [...prev, sellerResponse])
      setIsSending(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col bg-white dark:bg-[#003D5C] border-[#004D73]/20 dark:border-white/20 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#004D73]/10 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={sellerAvatar} alt={sellerName} />
              <AvatarFallback className="bg-[#3A8F4C] text-white">
                {sellerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-[#5A3E36] dark:text-white">
                {sellerName}
              </CardTitle>
              <p className="text-xs text-[#004D73] dark:text-white/70">
                À propos de: {productName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-[#5A3E36] dark:text-white/70 hover:text-[#5A3E36] dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <div className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => {
                const isBuyer = message.sender === "buyer"
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start gap-3",
                      isBuyer ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                      <AvatarFallback className={cn(
                        "text-xs",
                        isBuyer 
                          ? "bg-[#004D73] text-white" 
                          : "bg-[#3A8F4C] text-white"
                      )}>
                        {message.senderName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "flex flex-col max-w-[70%]",
                      isBuyer ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "px-4 py-2 rounded-2xl",
                        isBuyer
                          ? "bg-[#004D73] text-white rounded-br-sm"
                          : "bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 text-[#5A3E36] dark:text-white rounded-bl-sm"
                      )}>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      <p className="text-xs text-[#004D73] dark:text-white/60 mt-1 px-1">
                        {message.timestamp.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
              {isSending && (
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 shrink-0 bg-[#3A8F4C]">
                    <AvatarFallback className="text-white text-xs">
                      {sellerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#3A8F4C] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-[#3A8F4C] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-[#3A8F4C] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-[#004D73]/10 dark:border-white/10 p-4">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 bg-white dark:bg-[#004D73] border-[#004D73]/20 dark:border-white/20 text-[#5A3E36] dark:text-white placeholder:text-[#004D73]/50 dark:placeholder:text-white/50"
                disabled={isSending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                className="bg-[#3A8F4C] hover:bg-[#2E7D32] text-white shrink-0"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Fonction pour générer des réponses automatiques (simulation)
function getAutoResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes("prix") || lowerMessage.includes("coût") || lowerMessage.includes("tarif")) {
    return "Le prix indiqué est le prix unitaire. Pour les commandes en gros, je peux vous proposer une remise. Souhaitez-vous discuter des quantités ?"
  }
  
  if (lowerMessage.includes("livraison") || lowerMessage.includes("expédition") || lowerMessage.includes("shipping")) {
    return "La livraison est gratuite pour les commandes supérieures à 100 USD. Les délais de livraison varient selon votre localisation. Où souhaitez-vous recevoir la commande ?"
  }
  
  if (lowerMessage.includes("qualité") || lowerMessage.includes("certifié") || lowerMessage.includes("bio")) {
    return "Tous nos produits sont certifiés biologiques et traçables via la blockchain. Je peux vous fournir tous les certificats nécessaires. Souhaitez-vous plus d'informations ?"
  }
  
  if (lowerMessage.includes("quantité") || lowerMessage.includes("stock") || lowerMessage.includes("disponible")) {
    return "Le stock disponible est indiqué sur la fiche produit. Pour les grandes quantités, je peux vérifier la disponibilité avec notre entrepôt. Quelle quantité vous intéresse ?"
  }
  
  if (lowerMessage.includes("bonjour") || lowerMessage.includes("salut") || lowerMessage.includes("hello")) {
    return "Bonjour ! Je suis ravi de vous aider. Avez-vous des questions sur ce produit ?"
  }
  
  if (lowerMessage.includes("merci") || lowerMessage.includes("remercie")) {
    return "De rien ! N'hésitez pas si vous avez d'autres questions. Je suis là pour vous aider."
  }
  
  // Réponse par défaut
  return "Merci pour votre message. Je vais examiner votre demande et vous répondre dans les plus brefs délais. Y a-t-il autre chose que je puisse vous aider ?"
}

