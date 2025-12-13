import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { OrderEntity } from '../entities/order.entity';
import { CreateOrderDto, UpdateOrderDto, GetOrderDto, OrdersResponseDto, CancelOrderDto, RefundOrderDto } from '../dto/order.dto';
import { OrderStatus } from '../interfaces/iorder';
import { MarketplaceItemService } from './marketplace-item.service';
import { MarketplaceItemStatus } from '../interfaces/imarketplace-item';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly repository: OrderRepository,
    private readonly itemService: MarketplaceItemService,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderEntity> {
    const item = await this.itemService.findById(dto.itemId);

    if (!item) {
      throw new NotFoundException(`Item with ID ${dto.itemId} not found`);
    }

    // Avertissement si l'article n'est pas actif (mais on permet quand même pour l'admin)
    if (item.status !== MarketplaceItemStatus.ACTIVE) {
      this.logger.warn(
        `Order created for item with status "${item.status}" (ID: ${item.id}). This is allowed for admin operations.`,
      );
    }

    if (Number(item.stockKg) < dto.quantityKg) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${item.stockKg}kg, requested: ${dto.quantityKg}kg`,
      );
    }

    const order = await this.repository.create(dto);

    // Reserve stock seulement si l'article est actif
    if (item.status === MarketplaceItemStatus.ACTIVE) {
      await this.itemService.reduceStock(dto.itemId, dto.quantityKg);
    } else {
      this.logger.warn(
        `Stock not reserved for order ${order.orderNumber} because item status is "${item.status}".`,
      );
    }

    this.logger.log(`Order created: ${order.orderNumber} (${order.id})`);
    return order;
  }

  async findById(id: string): Promise<OrderEntity> {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async findAll(query: GetOrderDto): Promise<OrdersResponseDto> {
    return this.repository.findAll(query);
  }

  async findByBuyerId(buyerId: string): Promise<OrderEntity[]> {
    return this.repository.findByBuyerId(buyerId);
  }

  async findBySellerId(farmerId: string): Promise<OrderEntity[]> {
    return this.repository.findBySellerId(farmerId);
  }

  async findByCooperative(cooperativeId: string): Promise<OrderEntity[]> {
    return this.repository.findByCooperative(cooperativeId);
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderEntity> {
    const order = await this.repository.update(id, dto);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
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
    return completed;
  }

  async cancel(id: string, dto: CancelOrderDto, cancelledBy?: string): Promise<OrderEntity> {
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

    const cancelled = await this.repository.markAsCancelled(
      id,
      cancelledBy,
      dto.cancellationReason,
    );
    if (!cancelled) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return cancelled;
  }

  async refund(id: string, dto: RefundOrderDto): Promise<OrderEntity> {
    const order = await this.findById(id);

    if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.PAID) {
      throw new BadRequestException(
        `Order cannot be refunded. Current status: ${order.status}`,
      );
    }

    const refunded = await this.repository.markAsRefunded(id, dto.refundHash);
    if (!refunded) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return refunded;
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

  async getOrderStats(): Promise<{
    pending: number;
    paid: number;
    shipped: number;
    completed: number;
    cancelled: number;
    refunded: number;
  }> {
    const [pending, paid, shipped, completed, cancelled, refunded] =
      await Promise.all([
        this.repository.countByStatus(OrderStatus.PENDING),
        this.repository.countByStatus(OrderStatus.PAID),
        this.repository.countByStatus(OrderStatus.SHIPPED),
        this.repository.countByStatus(OrderStatus.COMPLETED),
        this.repository.countByStatus(OrderStatus.CANCELLED),
        this.repository.countByStatus(OrderStatus.REFUNDED),
      ]);

    return {
      pending,
      paid,
      shipped,
      completed,
      cancelled,
      refunded,
    };
  }

  async getGlobalStats(): Promise<{
    total: number;
    active: number;
    totalValue: number;
    averageValue: number;
    thisMonth: number;
    thisYear: number;
    byStatus: {
      pending: number;
      paid: number;
      shipped: number;
      completed: number;
      cancelled: number;
      refunded: number;
    };
  }> {
    const orders = await this.repository.findAllForStats();
    const total = orders.length;
    const active = orders.filter(
      (o) =>
        o.status === OrderStatus.PENDING ||
        o.status === OrderStatus.PAID ||
        o.status === OrderStatus.SHIPPED,
    ).length;

    const totalValue = orders.reduce(
      (sum, o) => sum + Number(o.totalADA || 0),
      0,
    );
    const averageValue = total > 0 ? totalValue / total : 0;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const thisMonth = orders.filter(
      (o) => new Date(o.createdAt) >= startOfMonth,
    ).length;
    const thisYear = orders.filter(
      (o) => new Date(o.createdAt) >= startOfYear,
    ).length;

    const byStatus = await this.getOrderStats();

    return {
      total,
      active,
      totalValue: parseFloat(totalValue.toFixed(6)),
      averageValue: parseFloat(averageValue.toFixed(6)),
      thisMonth,
      thisYear,
      byStatus,
    };
  }

  async getStatsByFarmer(farmerId: string): Promise<{
    total: number;
    totalValue: number;
    averageValue: number;
    byStatus: {
      pending: number;
      paid: number;
      shipped: number;
      completed: number;
      cancelled: number;
      refunded: number;
    };
  }> {
    const orders = await this.repository.findBySellerId(farmerId);
    const total = orders.length;
    const totalValue = orders.reduce(
      (sum, o) => sum + Number(o.totalADA || 0),
      0,
    );
    const averageValue = total > 0 ? totalValue / total : 0;

    const byStatus = {
      pending: orders.filter((o) => o.status === OrderStatus.PENDING).length,
      paid: orders.filter((o) => o.status === OrderStatus.PAID).length,
      shipped: orders.filter((o) => o.status === OrderStatus.SHIPPED).length,
      completed: orders.filter((o) => o.status === OrderStatus.COMPLETED)
        .length,
      cancelled: orders.filter((o) => o.status === OrderStatus.CANCELLED)
        .length,
      refunded: orders.filter((o) => o.status === OrderStatus.REFUNDED)
        .length,
    };

    return {
      total,
      totalValue: parseFloat(totalValue.toFixed(6)),
      averageValue: parseFloat(averageValue.toFixed(6)),
      byStatus,
    };
  }

  async getStatsByCooperative(cooperativeId: string): Promise<{
    total: number;
    totalValue: number;
    averageValue: number;
    byStatus: {
      pending: number;
      paid: number;
      shipped: number;
      completed: number;
      cancelled: number;
      refunded: number;
    };
  }> {
    const orders = await this.repository.findByCooperative(cooperativeId);
    const total = orders.length;
    const totalValue = orders.reduce(
      (sum, o) => sum + Number(o.totalADA || 0),
      0,
    );
    const averageValue = total > 0 ? totalValue / total : 0;

    const byStatus = {
      pending: orders.filter((o) => o.status === OrderStatus.PENDING).length,
      paid: orders.filter((o) => o.status === OrderStatus.PAID).length,
      shipped: orders.filter((o) => o.status === OrderStatus.SHIPPED).length,
      completed: orders.filter((o) => o.status === OrderStatus.COMPLETED)
        .length,
      cancelled: orders.filter((o) => o.status === OrderStatus.CANCELLED)
        .length,
      refunded: orders.filter((o) => o.status === OrderStatus.REFUNDED)
        .length,
    };

    return {
      total,
      totalValue: parseFloat(totalValue.toFixed(6)),
      averageValue: parseFloat(averageValue.toFixed(6)),
      byStatus,
    };
  }
}
