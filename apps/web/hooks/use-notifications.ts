import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

let socket: Socket | null = null;

export const useNotifications = () => {
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user?.id || socket) return;

        const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5600';

        socket = io(`${apiUrl}/notifications`, {
            path: '/socket.io',
            transports: [ 'websocket', 'polling' ],
            query: {
                userId: session.user.id,
            },
        });

        socket.on('connect', () => {
            console.log('Connected to notifications');
        });

        socket.on('notification', (data: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }) => {
            switch (data.type) {
                case 'success':
                    toast.success(data.title, { description: data.message });
                    break;
                case 'error':
                    toast.error(data.title, { description: data.message });
                    break;
                case 'warning':
                    toast.warning(data.title, { description: data.message });
                    break;
                default:
                    toast.info(data.title, { description: data.message });
            }
        });

        return () => {
            if (socket) {
                socket.disconnect();
                socket = null;
            }
        };
    }, [ session?.user?.id ]);

    return null;
};
