import { Injectable } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(private readonly gateway: NotificationGateway) {}

  notifyUser(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
  ) {
    this.gateway.notifyUser(userId, 'notification', {
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  notifyOrderUpdate(userId: string, orderId: string, status: string) {
    const title = 'Mise à jour de commande';
    const message = `Votre commande #${orderId.slice(0, 8)} est maintenant ${status}.`;

    this.notifyUser(userId, title, message, 'info');
  }
}
