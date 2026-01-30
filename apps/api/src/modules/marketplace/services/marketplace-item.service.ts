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
  ): Promise<MarketplaceItemEntity[]> {
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
}
