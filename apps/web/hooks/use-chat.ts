import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

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
    productId?: string;
    sellerId?: string;
    conversationId?: string;
}

export function useChat({ productId, sellerId, conversationId: initialConversationId }: UseChatOptions) {
    const { data: session } = useSession();
    const [ socket, setSocket ] = useState<Socket | null>(null);
    const [ messages, setMessages ] = useState<Message[]>([]);
    const [ conversationId, setConversationId ] = useState<string | undefined>(initialConversationId);
    const [ isConnected, setIsConnected ] = useState(false);

    // Initialize Socket
    useEffect(() => {
        if (!session?.user) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5600';
        const newSocket = io(`${apiUrl}/chat`, {
            path: '/socket.io',
            transports: [ 'websocket', 'polling' ],
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
            setMessages((prev) => [ ...prev, message ]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [ session ]);

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
    }, [ socket, conversationId ]);

    // Initialize Conversation if needed (when opening chat with a product/seller)
    const initializeConversation = useCallback(async () => {
        if (conversationId) return;
        if (!session?.user || !sellerId) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${(session as any).accessToken}`, // Assuming session has accessToken
                },
                body: JSON.stringify({
                    participant1Id: session.user.id,
                    participant2Id: sellerId,
                    productId,
                }),
            });
            const conversation = await res.json();
            setConversationId(conversation.id);
        } catch (error) {
            console.error('Failed to create conversation', error);
        }
    }, [ conversationId, session, sellerId, productId ]);

    const sendMessage = useCallback((content: string) => {
        if (!socket || !conversationId || !session?.user) return;

        socket.emit('sendMessage', {
            senderId: session.user.id,
            conversationId,
            content,
        });
    }, [ socket, conversationId, session ]);

    return {
        messages,
        sendMessage,
        isConnected,
        initializeConversation,
        conversationId,
    };
}
