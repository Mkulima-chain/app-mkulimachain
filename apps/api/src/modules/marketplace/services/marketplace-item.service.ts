import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MarketplaceItemRepository } from '../repositories/marketplace-item.repository';
import { MarketplaceItemEntity } from '../entities/marketplace-item.entity';
import {
  CreateMarketplaceItemDto,
  UpdateMarketplaceItemDto,
  GetMarketplaceItemDto,
} from '../dto/marketplace-item.dto';
import { MarketplaceItemStatus } from '../interfaces/imarketplace-item';

@Injectable()
export class MarketplaceItemService {
  constructor(private readonly repository: MarketplaceItemRepository) {}

  async create(dto: CreateMarketplaceItemDto): Promise<MarketplaceItemEntity> {
    return this.repository.create(dto);
  }

  async findById(id: string): Promise<MarketplaceItemEntity> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`Marketplace item with ID ${id} not found`);
    }
    return item;
  }

  async findAll(
    query: GetMarketplaceItemDto,
  ): Promise<{ data: MarketplaceItemEntity[]; total: number; page: number; limit: number; totalPages: number }> {
    return this.repository.findAll(query);
  }

  async findActive(): Promise<MarketplaceItemEntity[]> {
    return this.repository.findActive();
  }

  async findByFarmerId(farmerId: string): Promise<MarketplaceItemEntity[]> {
    return this.repository.findByFarmerId(farmerId);
  }

  async update(
    id: string,
    dto: UpdateMarketplaceItemDto,
  ): Promise<MarketplaceItemEntity> {
    const item = await this.repository.update(id, dto);
    if (!item) {
      throw new NotFoundException(`Marketplace item with ID ${id} not found`);
    }
    return item;
  }

  async addStock(id: string, quantity: number): Promise<MarketplaceItemEntity> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    const item = await this.repository.updateStock(id, quantity);
    if (!item) {
      throw new NotFoundException(`Marketplace item with ID ${id} not found`);
    }
    return item;
  }

  async reduceStock(
    id: string,
    quantity: number,
  ): Promise<MarketplaceItemEntity> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be positive');
    }

    const currentItem = await this.findById(id);
    if (Number(currentItem.stockKg) < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${currentItem.stockKg}kg`,
      );
    }

    const item = await this.repository.updateStock(id, -quantity);
    if (!item) {
      throw new NotFoundException(`Marketplace item with ID ${id} not found`);
    }
    return item;
  }

  async publish(id: string): Promise<MarketplaceItemEntity> {
    const currentItem = await this.findById(id);

    if (currentItem.status === MarketplaceItemStatus.ACTIVE) {
      throw new BadRequestException('Item is already published');
    }

    if (Number(currentItem.stockKg) <= 0) {
      throw new BadRequestException('Cannot publish item with no stock');
    }

    const item = await this.repository.publish(id);
    if (!item) {
      throw new NotFoundException(`Marketplace item with ID ${id} not found`);
    }
    return item;
  }

  async archive(id: string): Promise<MarketplaceItemEntity> {
    const item = await this.repository.archive(id);
    if (!item) {
      throw new NotFoundException(`Marketplace item with ID ${id} not found`);
    }
    return item;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }

  async getGlobalStats(): Promise<{
    total: number;
    active: number;
    draft: number;
    soldOut: number;
    archived: number;
    totalStock: number;
    totalValue: number;
    averageRating: number;
    featured: number;
  }> {
    const [
      total,
      active,
      draft,
      soldOut,
      archived,
      featured,
    ] = await Promise.all([
      this.repository.count(),
      this.repository.countByStatus(MarketplaceItemStatus.ACTIVE),
      this.repository.countByStatus(MarketplaceItemStatus.DRAFT),
      this.repository.countByStatus(MarketplaceItemStatus.SOLD_OUT),
      this.repository.countByStatus(MarketplaceItemStatus.ARCHIVED),
      this.repository.count({ featured: true }),
    ]);

    // Calculer le stock total et la valeur totale - utiliser une requête directe
    const items = await this.repository.findAllForStats();
    const totalStock = items.reduce((sum, item) => sum + Number(item.stockKg || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + Number(item.priceADA || 0) * Number(item.stockKg || 0), 0);
    
    // Calculer la note moyenne
    const ratedItems = items.filter(item => item.rating !== null && item.rating !== undefined);
    const averageRating = ratedItems.length > 0
      ? ratedItems.reduce((sum, item) => sum + Number(item.rating || 0), 0) / ratedItems.length
      : 0;

    return {
      total,
      active,
      draft,
      soldOut,
      archived,
      totalStock: parseFloat(totalStock.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(6)),
      averageRating: parseFloat(averageRating.toFixed(2)),
      featured,
    };
  }

  async getStatsByFarmer(farmerId: string): Promise<{
    total: number;
    active: number;
    totalStock: number;
    totalValue: number;
  }> {
    const items = await this.repository.findByFarmerId(farmerId);
    const active = items.filter(item => item.status === MarketplaceItemStatus.ACTIVE);
    const totalStock = items.reduce((sum, item) => sum + Number(item.stockKg || 0), 0);
    const totalValue = items.reduce((sum, item) => sum + Number(item.priceADA || 0) * Number(item.stockKg || 0), 0);

    return {
      total: items.length,
      active: active.length,
      totalStock: parseFloat(totalStock.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(6)),
    };
  }
}
