import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
// @ts-ignore
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'notifications',
})
export class NotificationGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private logger = new Logger('NotificationGateway');

    handleConnection(client: Socket) {
        this.logger.log(`Client connected to notifications: ${client.id}`);
        const userId = client.handshake.query.userId as string;
        if (userId) {
            client.join(`user_${userId}`);
            this.logger.log(`Client ${client.id} joined room user_${userId}`);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected from notifications: ${client.id}`);
    }

    notifyUser(userId: string, event: string, data: any) {
        this.server.to(`user_${userId}`).emit(event, data);
    }
}
