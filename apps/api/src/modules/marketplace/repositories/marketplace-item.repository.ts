import { Injectable, ConflictException } from '@nestjs/common';
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
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';

@Injectable()
export class MarketplaceItemRepository {
  constructor(
    @InjectRepository(MarketplaceItemEntity)
    private readonly repository: Repository<MarketplaceItemEntity>,
    @InjectRepository(BatchEntity)
    private readonly batchRepository: Repository<BatchEntity>,
    @InjectRepository(FarmerEntity)
    private readonly farmerRepository: Repository<FarmerEntity>,
    @InjectRepository(CooperativeEntity)
    private readonly cooperativeRepository: Repository<CooperativeEntity>,
  ) {}

  /**
   * Génère un SKU unique pour un article marketplace
   * Format: MP-YYYYMMDD-XXXX où XXXX est un nombre séquentiel
   */
  private async generateUniqueSKU(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
    // Compter les items créés aujourd'hui
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const count = await this.repository
      .createQueryBuilder('item')
      .where('item.createdAt >= :startOfDay', { startOfDay })
      .getCount();

    // Générer un nombre séquentiel (4 chiffres, padding avec des zéros)
    const sequence = String(count + 1).padStart(4, '0');
    
    // Vérifier l'unicité
    let sku = `MP-${dateStr}-${sequence}`;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const exists = await this.repository.findOne({
        where: { sku },
      });

      if (!exists) {
        return sku;
      }

      // Si le SKU existe, incrémenter le numéro
      const newSequence = String(count + 1 + attempts + 1).padStart(4, '0');
      sku = `MP-${dateStr}-${newSequence}`;
      attempts++;
    }

    // Fallback: utiliser timestamp si on ne trouve pas de SKU unique
    const timestamp = Date.now().toString().slice(-6);
    return `MP-${dateStr}-${timestamp}`;
  }

  async create(dto: CreateMarketplaceItemDto): Promise<MarketplaceItemEntity> {
    const batch = await this.batchRepository.findOneBy({ id: dto.batchId });
    const farmer = await this.farmerRepository.findOneBy({ id: dto.farmerId });
    
    let cooperative = null;
    if (dto.cooperativeId) {
      cooperative = await this.cooperativeRepository.findOneBy({ id: dto.cooperativeId });
    }

    // Générer automatiquement le SKU s'il n'est pas fourni
    let sku = dto.sku?.trim();
    if (!sku || sku === '') {
      sku = await this.generateUniqueSKU();
    } else {
      // Vérifier que le SKU fourni est unique
      const existingItem = await this.repository.findOne({
        where: { sku },
      });
      if (existingItem) {
        throw new ConflictException(`Le SKU "${sku}" est déjà utilisé`);
      }
    }

    // Filtrer les photos vides
    const photos = dto.photos?.filter(p => p && p.trim() !== '') || [];
    // Si imageUrl est fourni mais pas photos, l'ajouter à photos
    if (dto.imageUrl && photos.length === 0) {
      photos.push(dto.imageUrl);
    }

    const item = this.repository.create({
      batch: batch!,
      farmer: farmer!,
      cooperative: cooperative || undefined,
      sku,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      tags: dto.tags,
      photos: photos.length > 0 ? photos : undefined,
      imageUrl: dto.imageUrl, // Gardé pour compatibilité
      priceADA: parseFloat(Number(dto.priceADA).toFixed(6)),
      stockKg: parseFloat(Number(dto.stockKg).toFixed(2)),
      minOrderKg: dto.minOrderKg ? parseFloat(Number(dto.minOrderKg).toFixed(2)) : undefined,
      maxOrderKg: dto.maxOrderKg ? parseFloat(Number(dto.maxOrderKg).toFixed(2)) : undefined,
      shippingCostADA: dto.shippingCostADA ? parseFloat(Number(dto.shippingCostADA).toFixed(6)) : undefined,
      location: dto.location,
      certifications: dto.certifications,
      notes: dto.notes,
      featured: dto.featured || false,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      cooperativeId: dto.cooperativeId,
      status: MarketplaceItemStatus.DRAFT,
    });

    return this.repository.save(item);
  }

  async findById(id: string): Promise<MarketplaceItemEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['batch', 'farmer', 'cooperative'],
    });
  }

  async findAll(
    query: GetMarketplaceItemDto,
  ): Promise<{ data: MarketplaceItemEntity[]; total: number; page: number; limit: number; totalPages: number }> {
    const qb = this.repository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.batch', 'batch')
      .leftJoinAndSelect('item.farmer', 'farmer')
      .leftJoinAndSelect('item.cooperative', 'cooperative');

    if (query.id) qb.andWhere('item.id = :id', { id: query.id });
    if (query.batchId)
      qb.andWhere('batch.id = :batchId', { batchId: query.batchId });
    if (query.farmerId)
      qb.andWhere('farmer.id = :farmerId', { farmerId: query.farmerId });
    if (query.cooperativeId)
      qb.andWhere('cooperative.id = :cooperativeId', { cooperativeId: query.cooperativeId });
    if (query.status)
      qb.andWhere('item.status = :status', { status: query.status });
    if (query.category)
      qb.andWhere('item.category = :category', { category: query.category });
    if (query.tag)
      qb.andWhere(':tag = ANY(item.tags)', { tag: query.tag });
    if (query.certification)
      qb.andWhere(':certification = ANY(item.certifications)', { certification: query.certification });
    if (query.featured !== undefined)
      qb.andWhere('item.featured = :featured', { featured: query.featured });
    if (query.minPrice !== undefined)
      qb.andWhere('item.priceADA >= :minPrice', { minPrice: query.minPrice });
    if (query.maxPrice !== undefined)
      qb.andWhere('item.priceADA <= :maxPrice', { maxPrice: query.maxPrice });
    if (query.minStock !== undefined)
      qb.andWhere('item.stockKg >= :minStock', { minStock: query.minStock });
    if (query.minRating !== undefined)
      qb.andWhere('item.rating >= :minRating', { minRating: query.minRating });
    if (query.search) {
      qb.andWhere(
        '(item.title ILIKE :search OR item.description ILIKE :search OR item.sku ILIKE :search)',
        {
          search: `%${query.search}%`,
        },
      );
    }

    // Tri
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';
    qb.orderBy(`item.${sortBy}`, sortOrder);

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findActive(): Promise<MarketplaceItemEntity[]> {
    return this.repository.find({
      where: { status: MarketplaceItemStatus.ACTIVE },
      relations: ['batch', 'farmer', 'cooperative'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByFarmerId(farmerId: string): Promise<MarketplaceItemEntity[]> {
    return this.repository.find({
      where: { farmer: { id: farmerId } },
      relations: ['batch', 'farmer', 'cooperative'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCooperativeId(cooperativeId: string): Promise<MarketplaceItemEntity[]> {
    return this.repository.find({
      where: { cooperative: { id: cooperativeId } },
      relations: ['batch', 'farmer', 'cooperative'],
      order: { createdAt: 'DESC' },
    });
  }

  async countByStatus(status: MarketplaceItemStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  async count(where?: any): Promise<number> {
    if (!where || Object.keys(where).length === 0) {
      return this.repository.count();
    }
    return this.repository.count({ where });
  }

  async findAllForStats(): Promise<MarketplaceItemEntity[]> {
    return this.repository.find({
      select: ['stockKg', 'priceADA', 'rating'],
    });
  }

  async update(
    id: string,
    dto: UpdateMarketplaceItemDto,
  ): Promise<MarketplaceItemEntity | null> {
    const updateData: any = { ...dto };
    
    // Gérer les relations
    if (dto.batchId) {
      const batch = await this.batchRepository.findOneBy({ id: dto.batchId });
      if (batch) updateData.batch = batch;
    }
    if (dto.farmerId) {
      const farmer = await this.farmerRepository.findOneBy({ id: dto.farmerId });
      if (farmer) updateData.farmer = farmer;
    }
    if (dto.cooperativeId !== undefined) {
      if (dto.cooperativeId) {
        const cooperative = await this.cooperativeRepository.findOneBy({ id: dto.cooperativeId });
        if (cooperative) updateData.cooperative = cooperative;
      } else {
        updateData.cooperative = null;
      }
    }

    // Filtrer les photos vides
    if (dto.photos) {
      updateData.photos = dto.photos.filter(p => p && p.trim() !== '');
    }

    // Convertir les dates
    if (dto.expiresAt) {
      updateData.expiresAt = new Date(dto.expiresAt);
    }

    // Formater les nombres
    if (dto.priceADA !== undefined) {
      updateData.priceADA = parseFloat(Number(dto.priceADA).toFixed(6));
    }
    if (dto.stockKg !== undefined) {
      updateData.stockKg = parseFloat(Number(dto.stockKg).toFixed(2));
    }
    if (dto.minOrderKg !== undefined) {
      updateData.minOrderKg = parseFloat(Number(dto.minOrderKg).toFixed(2));
    }
    if (dto.maxOrderKg !== undefined) {
      updateData.maxOrderKg = parseFloat(Number(dto.maxOrderKg).toFixed(2));
    }
    if (dto.shippingCostADA !== undefined) {
      updateData.shippingCostADA = parseFloat(Number(dto.shippingCostADA).toFixed(6));
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
