import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { CreateOrderDto, UpdateOrderDto, GetOrderDto } from '../dto/order.dto';
import { OrderStatus } from '../interfaces/iorder';
import { MarketplaceItemEntity } from '../entities/marketplace-item.entity';

@Injectable()
export class OrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repository: Repository<OrderEntity>,
    @InjectRepository(MarketplaceItemEntity)
    private readonly itemRepository: Repository<MarketplaceItemEntity>,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderEntity> {
    const item = await this.itemRepository.findOneBy({ id: dto.itemId });

    const unitPrice = Number(item!.priceADA);
    const total = unitPrice * dto.quantityKg;

    const order = this.repository.create({
      buyerId: dto.buyerId,
      item: item!,
      quantityKg: dto.quantityKg,
      unitPriceADA: unitPrice,
      totalADA: total,
      shippingAddress: dto.shippingAddress,
      status: OrderStatus.PENDING,
    });

    return this.repository.save(order);
  }

  async findById(id: string): Promise<OrderEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['item', 'item.farmer', 'item.batch'],
    });
  }

  async findAll(query: GetOrderDto): Promise<OrderEntity[]> {
    const qb = this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.item', 'item')
      .leftJoinAndSelect('item.farmer', 'farmer')
      .leftJoinAndSelect('item.batch', 'batch');

    if (query.id) qb.andWhere('order.id = :id', { id: query.id });
    if (query.buyerId)
      qb.andWhere('order.buyerId = :buyerId', { buyerId: query.buyerId });
    if (query.itemId)
      qb.andWhere('item.id = :itemId', { itemId: query.itemId });
    if (query.status)
      qb.andWhere('order.status = :status', { status: query.status });

    return qb.orderBy('order.createdAt', 'DESC').getMany();
  }

  async findByBuyerId(buyerId: string): Promise<OrderEntity[]> {
    return this.repository.find({
      where: { buyerId },
      relations: ['item', 'item.farmer', 'item.batch'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySellerId(farmerId: string): Promise<OrderEntity[]> {
    return this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.item', 'item')
      .leftJoinAndSelect('item.farmer', 'farmer')
      .leftJoinAndSelect('item.batch', 'batch')
      .where('farmer.id = :farmerId', { farmerId })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderEntity | null> {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  async markAsPaid(
    id: string,
    paymentHash: string,
  ): Promise<OrderEntity | null> {
    await this.repository.update(id, {
      status: OrderStatus.PAID,
      paymentHash,
      paidAt: new Date(),
    });
    return this.findById(id);
  }

  async markAsShipped(
    id: string,
    trackingNumber: string,
  ): Promise<OrderEntity | null> {
    await this.repository.update(id, {
      status: OrderStatus.SHIPPED,
      trackingNumber,
      shippedAt: new Date(),
    });
    return this.findById(id);
  }

  async markAsCompleted(id: string): Promise<OrderEntity | null> {
    await this.repository.update(id, {
      status: OrderStatus.COMPLETED,
      completedAt: new Date(),
    });
    return this.findById(id);
  }

  async markAsCancelled(id: string): Promise<OrderEntity | null> {
    await this.repository.update(id, {
      status: OrderStatus.CANCELLED,
    });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
