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

// Fonction pour valider un UUID
function isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}

export function useChat({ productId, sellerId, conversationId: initialConversationId }: UseChatOptions) {
    const { data: session } = useSession();
    const [ socket, setSocket ] = useState<Socket | null>(null);
    const [ messages, setMessages ] = useState<Message[]>([]);
    const [ conversationId, setConversationId ] = useState<string | undefined>(initialConversationId);
    const [ isConnected, setIsConnected ] = useState(false);

    // Initialize Socket
    useEffect(() => {
        if (!session?.user) {
            console.log('No session, skipping socket initialization');
            return;
        }

        // Construire l'URL de base de l'API (sans /api)
        let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5600/api';
        // Retirer /api de la fin si présent
        if (apiBaseUrl.endsWith('/api')) {
            apiBaseUrl = apiBaseUrl.slice(0, -4);
        } else if (apiBaseUrl.endsWith('/api/')) {
            apiBaseUrl = apiBaseUrl.slice(0, -5);
        }

        const socketUrl = `${apiBaseUrl}/chat`;
        console.log('Connecting to socket:', socketUrl);

        const newSocket = io(socketUrl, {
            path: '/socket.io',
            transports: [ 'websocket', 'polling' ],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        newSocket.on('newMessage', (message: Message) => {
            console.log('New message received:', message);
            setMessages((prev) => [ ...prev, message ]);
        });

        setSocket(newSocket);

        return () => {
            console.log('Cleaning up socket connection');
            newSocket.close();
        };
    }, [ session ]);

    // Join Conversation
    useEffect(() => {
        if (socket && conversationId && isConnected) {
            console.log('Joining conversation:', conversationId);
            socket.emit('joinConversation', conversationId);

            // Construire l'URL de l'API
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5600/api';
            // Fetch history
            fetch(`${apiUrl}/chat/messages/${conversationId}`)
                .then((res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then((data) => {
                    console.log('Messages loaded:', data);
                    setMessages(data || []);
                })
                .catch((error) => {
                    console.error('Failed to fetch messages:', error);
                });
        }
    }, [ socket, conversationId, isConnected ]);

    // Initialize Conversation if needed (when opening chat with a product/seller)
    const initializeConversation = useCallback(async () => {
        if (conversationId) {
            console.log('Conversation already exists:', conversationId);
            return;
        }
        if (!session?.user || !sellerId) {
            console.log('Missing session or sellerId:', { hasSession: !!session?.user, sellerId });
            return;
        }

        // Valider que sellerId est un UUID valide
        if (!sellerId || !isValidUUID(sellerId)) {
            console.error('Invalid sellerId (not a valid UUID):', sellerId);
            throw new Error('L\'ID du vendeur n\'est pas valide. Impossible de démarrer la conversation.');
        }

        // Valider que session.user.id est aussi un UUID valide
        if (!session.user.id || !isValidUUID(session.user.id)) {
            console.error('Invalid user ID (not a valid UUID):', session.user.id);
            throw new Error('Votre ID utilisateur n\'est pas valide. Veuillez vous reconnecter.');
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5600/api';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const accessToken = (session.user as any).accessToken || (session as any).accessToken;

            console.log('Creating conversation:', { participant1Id: session.user.id, participant2Id: sellerId, productId });

            const res = await fetch(`${apiUrl}/chat/conversations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
                },
                body: JSON.stringify({
                    participant1Id: session.user.id,
                    participant2Id: sellerId,
                    productId,
                }),
            });

            if (!res.ok) {
                const errorText = await res.text();
                let errorMessage = `HTTP error! status: ${res.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                console.error('Failed to create conversation:', errorMessage);
                throw new Error(errorMessage);
            }

            const conversation = await res.json();
            console.log('Conversation created:', conversation);
            if (conversation?.id) {
                setConversationId(conversation.id);
            } else {
                console.error('Conversation created but no ID returned:', conversation);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors de la création de la conversation';
            console.error('Failed to create conversation:', errorMessage, error);
            // Ne pas propager l'erreur pour éviter de bloquer l'interface
            // L'utilisateur verra que la connexion n'est pas établie
        }
    }, [ conversationId, session, sellerId, productId ]);

    const sendMessage = useCallback((content: string) => {
        if (!socket || !conversationId || !session?.user) {
            console.log('Cannot send message:', { hasSocket: !!socket, conversationId, hasUser: !!session?.user });
            return;
        }

        if (!isConnected) {
            console.warn('Socket not connected, cannot send message');
            return;
        }

        console.log('Sending message:', { senderId: session.user.id, conversationId, content });
        socket.emit('sendMessage', {
            senderId: session.user.id,
            conversationId,
            content,
        });
    }, [ socket, conversationId, session, isConnected ]);

    return {
        messages,
        sendMessage,
        isConnected,
        initializeConversation,
        conversationId,
    };
}
