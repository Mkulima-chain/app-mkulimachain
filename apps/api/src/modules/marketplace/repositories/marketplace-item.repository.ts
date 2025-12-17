import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketplaceItemEntity } from '../entities/marketplace-item.entity';
import {
  CreateMarketplaceItemDto,
  UpdateMarketplaceItemDto,
  GetMarketplaceItemDto,
} from '../dto/marketplace-item.dto';
import { MarketplaceItemStatus } from '../interfaces/imarketplace-item';
import { BatchEntity } from '@/modules/batch/entities/batch.entity';
import { FarmerEntity } from '@/modules/farmers/entities/entities';

@Injectable()
export class MarketplaceItemRepository {
  constructor(
    @InjectRepository(MarketplaceItemEntity)
    private readonly repository: Repository<MarketplaceItemEntity>,
    @InjectRepository(BatchEntity)
    private readonly batchRepository: Repository<BatchEntity>,
    @InjectRepository(FarmerEntity)
    private readonly farmerRepository: Repository<FarmerEntity>,
  ) { }

  async create(dto: CreateMarketplaceItemDto): Promise<MarketplaceItemEntity> {
    const batch = await this.batchRepository.findOneBy({ id: dto.batchId });
    const farmer = await this.farmerRepository.findOneBy({ id: dto.farmerId });

    const item = this.repository.create({
      batch: batch!,
      farmer: farmer!,
      title: dto.title,
      description: dto.description,
      priceADA: dto.priceADA,
      stockKg: dto.stockKg,
      imageUrls: dto.imageUrls,
      status: MarketplaceItemStatus.DRAFT,
    });

    return this.repository.save(item);
  }

  async findById(id: string): Promise<MarketplaceItemEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: [ 'batch', 'farmer', 'batch.harvests', 'batch.harvests.product' ],
    });
  }

  async findAll(
    query: GetMarketplaceItemDto,
  ): Promise<MarketplaceItemEntity[]> {
    const qb = this.repository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.batch', 'batch')
      .leftJoinAndSelect('item.farmer', 'farmer')
      .leftJoinAndSelect('batch.harvests', 'harvests')
      .leftJoinAndSelect('harvests.product', 'product');

    if (query.id) qb.andWhere('item.id = :id', { id: query.id });
    if (query.batchId)
      qb.andWhere('batch.id = :batchId', { batchId: query.batchId });
    if (query.farmerId)
      qb.andWhere('farmer.id = :farmerId', { farmerId: query.farmerId });
    if (query.status)
      qb.andWhere('item.status = :status', { status: query.status });
    if (query.minPrice !== undefined)
      qb.andWhere('item.priceADA >= :minPrice', { minPrice: query.minPrice });
    if (query.maxPrice !== undefined)
      qb.andWhere('item.priceADA <= :maxPrice', { maxPrice: query.maxPrice });
    if (query.search)
      qb.andWhere(
        '(item.title ILIKE :search OR item.description ILIKE :search)',
        {
          search: `%${query.search}%`,
        },
      );

    return qb.orderBy('item.createdAt', 'DESC').getMany();
  }

  async findActive(): Promise<MarketplaceItemEntity[]> {
    return this.repository.find({
      where: { status: MarketplaceItemStatus.ACTIVE },
      relations: [ 'batch', 'farmer', 'batch.harvests', 'batch.harvests.product' ],
      order: { createdAt: 'DESC' },
    });
  }

  async findByFarmerId(farmerId: string): Promise<MarketplaceItemEntity[]> {
    return this.repository.find({
      where: { farmer: { id: farmerId } },
      relations: [ 'batch', 'farmer', 'batch.harvests', 'batch.harvests.product' ],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    dto: UpdateMarketplaceItemDto,
  ): Promise<MarketplaceItemEntity | null> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { batchId, farmerId, ...rest } = dto;
    const updateData: any = { ...rest };

    if (batchId) {
      updateData.batch = { id: batchId };
    }
    if (farmerId) {
      updateData.farmer = { id: farmerId };
    }

    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async updateStock(
    id: string,
    quantity: number,
  ): Promise<MarketplaceItemEntity | null> {
    const item = await this.findById(id);
    if (!item) return null;

    const newStock = Number(item.stockKg) + quantity;
    item.stockKg = Math.max(0, newStock);

    if (item.stockKg === 0 && item.status === MarketplaceItemStatus.ACTIVE) {
      item.status = MarketplaceItemStatus.SOLD_OUT;
    }

    return this.repository.save(item);
  }

  async publish(id: string): Promise<MarketplaceItemEntity | null> {
    await this.repository.update(id, { status: MarketplaceItemStatus.ACTIVE });
    return this.findById(id);
  }

  async archive(id: string): Promise<MarketplaceItemEntity | null> {
    await this.repository.update(id, {
      status: MarketplaceItemStatus.ARCHIVED,
    });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
