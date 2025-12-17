import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
// In admin we might not use next-auth session the same way or maybe we do.
// Assuming admin also uses next-auth, if not we need to adjust.
// Looking at package.json, admin DOES NOT have next-auth listed?
// Wait, checking apps/admin/package.json
// It was not listed in dependencies! only next, react, etc.
// But apps/web has it.
// Checking apps/admin/package.json again from my memory/logs.
// apps/admin/package.json Log 255: "next-auth" is NOT in dependencies.
// Admin might use a different auth or just not installed yet?
// Wait, `apps/admin/app/login/page.tsx` exists.
// Let's assume for now we might need to fetch the token differently or passing user id manually.
// For now, I'll create a generic hook that accepts token/userId.

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: Date;
  sender?: {
    firstName: string;
    lastName: string;
  };
}

export interface UseChatOptions {
  userId?: string;
  accessToken?: string;
  conversationId?: string;
}

export function useChat({ userId, accessToken, conversationId: initialConversationId }: UseChatOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize Socket
  useEffect(() => {
    if (!userId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5600';
    const newSocket = io(`${apiUrl}/chat`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId]);

  // Join Conversation
  useEffect(() => {
    if (socket && conversationId) {
      socket.emit('joinConversation', conversationId);
      // Fetch history
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/messages/${conversationId}`)
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch(console.error);
    }
  }, [socket, conversationId]);

  const sendMessage = useCallback((content: string) => {
    if (!socket || !conversationId || !userId) return;

    socket.emit('sendMessage', {
      senderId: userId,
      conversationId,
      content,
    });
  }, [socket, conversationId, userId]);

  return {
    messages,
    sendMessage,
    isConnected,
    setConversationId, // Expose this to switch conversations
    conversationId,
  };
}
