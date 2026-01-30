"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChat } from "../../hooks/use-chat"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { api } from "@/lib/api-client"

interface Conversation {
  id: string
  participant1: {
    id: string
    firstName: string
    lastName: string
    role: string
  }
  participant2: {
    id: string
    firstName: string
    lastName: string
    role: string
  }
  product?: {
    name: string
    images: string[]
  }
  updatedAt: string
  lastMessage?: string
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)

  // Fetch conversations for the current user
  useEffect(() => {
    if (!user?.id) return

    const fetchConversations = async () => {
      setIsLoadingConversations(true)
      try {
        const data = await api.get<Conversation[]>(`/chat/conversations/${user.id}`)
        setConversations(data)
      } catch (error) {
        console.error("Failed to fetch conversations:", error)
      } finally {
        setIsLoadingConversations(false)
      }
    }

    fetchConversations()
  }, [user?.id])

  const { messages, sendMessage, isConnected, setConversationId } = useChat({
    userId: user?.id || "", 
    conversationId: selectedConversationId || undefined
  })

  // Update selected conversation in hook
  useEffect(() => {
    if (selectedConversationId) {
      setConversationId(selectedConversationId)
    }
  }, [selectedConversationId, setConversationId])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    sendMessage(newMessage.trim());
    setNewMessage("");
  }

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4 p-4">
      {/* Sidebar - Conversation List */}
      <Card className="w-1/3 flex flex-col">
        <CardHeader className="border-b px-4 py-3">
          <CardTitle>Messages</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="flex flex-col">
            {conversations.length === 0 && (
               <div className="p-4 text-center text-muted-foreground text-sm">
                 Aucune conversation trouvée.
               </div>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={cn(
                  "flex items-center gap-3 border-b p-4 text-left hover:bg-muted/50 transition-colors",
                  selectedConversationId === conv.id && "bg-muted"
                )}
              >
                <Avatar>
                  <AvatarFallback>
                    {conv.participant1.firstName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      {conv.participant1.firstName} {conv.participant1.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.product ? `Regarding: ${conv.product.name}` : "Discussion"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            <CardHeader className="border-b px-4 py-3 flex flex-row items-center gap-3">
               <Avatar>
                 <AvatarFallback>U</AvatarFallback>
               </Avatar>
               <div>
                 <CardTitle className="text-base">Utilisateur</CardTitle>
                 <div className="flex items-center gap-2">
                   {isConnected ? (
                     <span className="flex items-center text-xs text-green-600 gap-1">
                       <span className="h-2 w-2 rounded-full bg-green-600"></span>
                       En ligne
                     </span>
                   ) : (
                     <span className="flex items-center text-xs text-red-500 gap-1">
                       <span className="h-2 w-2 rounded-full bg-red-500"></span>
                       Déconnecté
                     </span>
                   )}
                 </div>
               </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg) => {
                 const isMe = msg.senderId === user?.id;
                 return (
                   <div key={msg.id} className={cn("flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm", 
                     isMe ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
                   )}>
                     {msg.content}
                     <span className="text-[10px] opacity-70 self-end">
                       {new Date(msg.createdAt).toLocaleTimeString()}
                     </span>
                   </div>
                 )
              })}
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..." 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button size="icon" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            Sélectionnez une conversation pour commencer
          </div>
        )}
      </Card>
    </div>
  )
}
