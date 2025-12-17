"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"
import { useChat } from "@/hooks/use-chat"

interface ProductChatProps {
  productId: string
  productName: string
  sellerName: string
  sellerId: string
  sellerAvatar?: string
  isOpen: boolean
  onClose: () => void
}

export function ProductChat({
  productId,
  productName,
  sellerName,
  sellerId,
  sellerAvatar,
  isOpen,
  onClose,
}: ProductChatProps) {
  const { data: session } = useSession()
  const [newMessage, setNewMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, isConnected, initializeConversation } = useChat({
    productId,
    sellerId,
  });

  // Init conversation when open
  useEffect(() => {
    if (isOpen) {
      initializeConversation();
    }
  }, [isOpen, initializeConversation]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOpen])

  // Focus
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    sendMessage(newMessage.trim())
    setNewMessage("")
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
            {isConnected ? (
              <span className="flex h-2 w-2 rounded-full bg-green-500" title="Connecté" />
            ) : (
              <span className="flex h-2 w-2 rounded-full bg-red-500" title="Déconnecté" />
            )}
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
                const isMe = message.senderId === session?.user?.id
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start gap-3",
                      isMe ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className={cn(
                        "text-xs",
                        isMe 
                          ? "bg-[#004D73] text-white" 
                          : "bg-[#3A8F4C] text-white"
                      )}>
                        {isMe ? "Moi" : sellerName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "flex flex-col max-w-[70%]",
                      isMe ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "px-4 py-2 rounded-2xl",
                        isMe
                          ? "bg-[#004D73] text-white rounded-br-sm"
                          : "bg-[#3A8F4C]/10 dark:bg-[#3A8F4C]/20 text-[#5A3E36] dark:text-white rounded-bl-sm"
                      )}>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      <p className="text-xs text-[#004D73] dark:text-white/60 mt-1 px-1">
                        {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
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
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
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
  )}
