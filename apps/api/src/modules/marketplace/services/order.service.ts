import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { OrderEntity } from '../entities/order.entity';
import { CreateOrderDto, UpdateOrderDto, GetOrderDto } from '../dto/order.dto';
import { OrderStatus } from '../interfaces/iorder';
import { MarketplaceItemService } from './marketplace-item.service';
import { MarketplaceItemStatus } from '../interfaces/imarketplace-item';
import { NotificationService } from '../../notifications/notification.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly repository: OrderRepository,
    private readonly itemService: MarketplaceItemService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderEntity> {
    const item = await this.itemService.findById(dto.itemId);

    if (item.status !== MarketplaceItemStatus.ACTIVE) {
      throw new BadRequestException('Item is not available for purchase');
    }

    if (Number(item.stockKg) < dto.quantityKg) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${item.stockKg}kg`,
      );
    }

    const order = await this.repository.create(dto);

    // Reserve stock
    await this.itemService.reduceStock(dto.itemId, dto.quantityKg);

    // Notify buyer
    this.notificationService.notifyUser(
      order.buyerId,
      'Commande créée',
      `Votre commande #${order.id.slice(0, 8)} a été créée avec succès.`,
      'success',
    );

    return order;
  }

  async findById(id: string): Promise<OrderEntity> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findAll(query: GetOrderDto): Promise<OrderEntity[]> {
    return this.repository.findAll(query);
  }

  async findByBuyerId(buyerId: string): Promise<OrderEntity[]> {
    return this.repository.findByBuyerId(buyerId);
  }

  async findBySellerId(farmerId: string): Promise<OrderEntity[]> {
    return this.repository.findBySellerId(farmerId);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderEntity> {
    const order = await this.repository.update(id, dto);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (dto.status) {
      this.notificationService.notifyOrderUpdate(
        order.buyerId,
        order.id,
        dto.status,
      );
    }

    return order;
  }

  async pay(id: string, paymentHash: string): Promise<OrderEntity> {
    const order = await this.findById(id);

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `Order cannot be paid. Current status: ${order.status}`,
      );
    }

    const paid = await this.repository.markAsPaid(id, paymentHash);
    if (!paid) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    this.notificationService.notifyUser(
      paid.buyerId,
      'Paiement reçu',
      `Le paiement pour la commande #${paid.id.slice(0, 8)} a été confirmé.`,
      'success',
    );

    return paid;
  }

  async ship(id: string, trackingNumber: string): Promise<OrderEntity> {
    const order = await this.findById(id);

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException(
        `Order cannot be shipped. Current status: ${order.status}`,
      );
    }

    const shipped = await this.repository.markAsShipped(id, trackingNumber);
    if (!shipped) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    this.notificationService.notifyUser(
      shipped.buyerId,
      'Commande expédiée',
      `Votre commande #${shipped.id.slice(0, 8)} est en route! Suivi: ${trackingNumber}`,
      'info',
    );

    return shipped;
  }

  async complete(id: string): Promise<OrderEntity> {
    const order = await this.findById(id);

    if (order.status !== OrderStatus.SHIPPED) {
      throw new BadRequestException(
        `Order cannot be completed. Current status: ${order.status}`,
      );
    }

    const completed = await this.repository.markAsCompleted(id);
    if (!completed) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    this.notificationService.notifyUser(
      completed.buyerId,
      'Commande livrée',
      `Votre commande #${completed.id.slice(0, 8)} a été livrée. Merci de votre confiance!`,
      'success',
    );

    return completed;
  }

  async cancel(id: string): Promise<OrderEntity> {
    const order = await this.findById(id);

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PAID
    ) {
      throw new BadRequestException(
        `Order cannot be cancelled. Current status: ${order.status}`,
      );
    }

    // Restore stock
    await this.itemService.addStock(order.item.id, Number(order.quantityKg));

    const cancelled = await this.repository.markAsCancelled(id);
    if (!cancelled) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    this.notificationService.notifyUser(
      cancelled.buyerId,
      'Commande annulée',
      `La commande #${cancelled.id.slice(0, 8)} a été annulée.`,
      'warning',
    );

    return cancelled;
  }

  async delete(id: string): Promise<void> {
    const order = await this.findById(id);

    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.SHIPPED
    ) {
      throw new BadRequestException('Cannot delete a paid or shipped order');
    }

    await this.repository.delete(id);
  }
}
