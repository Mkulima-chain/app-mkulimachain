import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { CreateOrderDto, UpdateOrderDto, GetOrderDto, OrdersResponseDto } from '../dto/order.dto';
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

  /**
   * Génère un numéro de commande unique
   * Format: ORD-YYYYMMDD-XXXX où XXXX est un nombre séquentiel
   */
  private async generateUniqueOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
    // Compter les commandes créées aujourd'hui
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const count = await this.repository
      .createQueryBuilder('order')
      .where('order.createdAt >= :startOfDay', { startOfDay })
      .getCount();

    // Générer un nombre séquentiel (4 chiffres, padding avec des zéros)
    const sequence = String(count + 1).padStart(4, '0');
    
    // Vérifier l'unicité
    let orderNumber = `ORD-${dateStr}-${sequence}`;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const exists = await this.repository.findOne({
        where: { orderNumber },
      });

      if (!exists) {
        return orderNumber;
      }

      // Si le numéro existe, incrémenter le numéro
      const newSequence = String(count + 1 + attempts + 1).padStart(4, '0');
      orderNumber = `ORD-${dateStr}-${newSequence}`;
      attempts++;
    }

    // Fallback: utiliser timestamp si on ne trouve pas de numéro unique
    const timestamp = Date.now().toString().slice(-6);
    return `ORD-${dateStr}-${timestamp}`;
  }

  async create(dto: CreateOrderDto): Promise<OrderEntity> {
    const item = await this.itemRepository.findOneBy({ id: dto.itemId });

    if (!item) {
      throw new Error('Item not found');
    }

    const unitPrice = Number(item.priceADA);
    const shippingCost = Number(dto.shippingCostADA || 0);
    const discount = Number(dto.discountADA || 0);
    const tax = Number(0); // Pour l'instant, pas de taxe par défaut
    
    // Calculer le total: (prix unitaire * quantité) + frais de livraison - réduction + taxes
    const subtotal = unitPrice * dto.quantityKg;
    const total = subtotal + shippingCost - discount + tax;

    // Générer le numéro de commande
    const orderNumber = await this.generateUniqueOrderNumber();

    // Récupérer farmerId depuis l'item
    const farmerId = item.farmerId;

    const order = this.repository.create({
      buyerId: dto.buyerId,
      item: item,
      orderNumber,
      quantityKg: parseFloat(dto.quantityKg.toFixed(2)),
      unitPriceADA: parseFloat(unitPrice.toFixed(6)),
      totalADA: parseFloat(total.toFixed(6)),
      shippingCostADA: shippingCost > 0 ? parseFloat(shippingCost.toFixed(6)) : undefined,
      discountADA: discount > 0 ? parseFloat(discount.toFixed(6)) : undefined,
      taxADA: tax > 0 ? parseFloat(tax.toFixed(6)) : undefined,
      shippingAddress: dto.shippingAddress,
      buyerNotes: dto.buyerNotes,
      deliveryMethod: dto.deliveryMethod,
      estimatedDeliveryDate: dto.estimatedDeliveryDate ? new Date(dto.estimatedDeliveryDate) : undefined,
      cooperativeId: dto.cooperativeId,
      farmerId: farmerId,
      status: OrderStatus.PENDING,
    });

    return this.repository.save(order);
  }

  async findById(id: string): Promise<OrderEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['item', 'item.farmer', 'item.batch', 'cooperative', 'farmer', 'buyer'],
    });
  }

  async findAll(query: GetOrderDto): Promise<OrdersResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.item', 'item')
      .leftJoinAndSelect('item.farmer', 'farmer')
      .leftJoinAndSelect('item.batch', 'batch')
      .leftJoinAndSelect('order.cooperative', 'cooperative')
      .leftJoinAndSelect('order.farmer', 'orderFarmer')
      .leftJoinAndSelect('order.buyer', 'buyer');

    // Filtres
    if (query.id) {
      qb.andWhere('order.id = :id', { id: query.id });
    }
    if (query.orderNumber) {
      qb.andWhere('order.orderNumber ILIKE :orderNumber', { orderNumber: `%${query.orderNumber}%` });
    }
    if (query.buyerId) {
      qb.andWhere('order.buyerId = :buyerId', { buyerId: query.buyerId });
    }
    if (query.itemId) {
      qb.andWhere('item.id = :itemId', { itemId: query.itemId });
    }
    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }
    if (query.cooperativeId) {
      qb.andWhere('order.cooperativeId = :cooperativeId', { cooperativeId: query.cooperativeId });
    }
    if (query.farmerId) {
      qb.andWhere('order.farmerId = :farmerId', { farmerId: query.farmerId });
    }
    if (query.minTotalADA !== undefined) {
      qb.andWhere('order.totalADA >= :minTotalADA', { minTotalADA: query.minTotalADA });
    }
    if (query.maxTotalADA !== undefined) {
      qb.andWhere('order.totalADA <= :maxTotalADA', { maxTotalADA: query.maxTotalADA });
    }
    if (query.minCreatedAt) {
      qb.andWhere('order.createdAt >= :minCreatedAt', { minCreatedAt: new Date(query.minCreatedAt) });
    }
    if (query.maxCreatedAt) {
      qb.andWhere('order.createdAt <= :maxCreatedAt', { maxCreatedAt: new Date(query.maxCreatedAt) });
    }
    if (query.priority) {
      qb.andWhere('order.priority = :priority', { priority: query.priority });
    }
    if (query.tags && query.tags.length > 0) {
      qb.andWhere('order.tags && :tags', { tags: query.tags });
    }

    // Tri
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';
    qb.orderBy(`order.${sortBy}`, sortOrder);

    // Pagination
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAllForStats(): Promise<OrderEntity[]> {
    return this.repository.find({
      relations: ['item', 'item.farmer', 'cooperative', 'farmer'],
    });
  }

  async findByBuyerId(buyerId: string): Promise<OrderEntity[]> {
    return this.repository.find({
      where: { buyerId },
      relations: ['item', 'item.farmer', 'item.batch', 'cooperative', 'farmer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySellerId(farmerId: string): Promise<OrderEntity[]> {
    return this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.item', 'item')
      .leftJoinAndSelect('item.farmer', 'farmer')
      .leftJoinAndSelect('item.batch', 'batch')
      .leftJoinAndSelect('order.cooperative', 'cooperative')
      .where('farmer.id = :farmerId', { farmerId })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  async findByCooperative(cooperativeId: string): Promise<OrderEntity[]> {
    return this.repository.find({
      where: { cooperativeId },
      relations: ['item', 'item.farmer', 'item.batch', 'cooperative', 'farmer'],
      order: { createdAt: 'DESC' },
    });
  }

  async countByStatus(status: OrderStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  async count(where?: any): Promise<number> {
    return this.repository.count(where || {});
  }

  async update(id: string, dto: UpdateOrderDto): Promise<OrderEntity | null> {
    const updateData: any = { ...dto };
    
    // Convertir les dates
    if (dto.estimatedDeliveryDate) {
      updateData.estimatedDeliveryDate = new Date(dto.estimatedDeliveryDate);
    }
    
    // Formater les nombres
    if (dto.shippingCostADA !== undefined) {
      updateData.shippingCostADA = parseFloat(Number(dto.shippingCostADA).toFixed(6));
    }
    if (dto.discountADA !== undefined) {
      updateData.discountADA = parseFloat(Number(dto.discountADA).toFixed(6));
    }
    if (dto.taxADA !== undefined) {
      updateData.taxADA = parseFloat(Number(dto.taxADA).toFixed(6));
    }

    await this.repository.update(id, updateData);
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

  async markAsCancelled(
    id: string,
    cancelledBy?: string,
    cancellationReason?: string,
  ): Promise<OrderEntity | null> {
    await this.repository.update(id, {
      status: OrderStatus.CANCELLED,
      cancelledAt: new Date(),
      cancelledBy,
      cancellationReason,
    });
    return this.findById(id);
  }

  async markAsRefunded(
    id: string,
    refundHash: string,
  ): Promise<OrderEntity | null> {
    await this.repository.update(id, {
      status: OrderStatus.REFUNDED,
      refundedAt: new Date(),
      refundHash,
    });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
