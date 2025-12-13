import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BatchEntity } from '../entities/batch.entity';
import { BatchStatus } from '../interfaces/ibatch';
import {
  CreateBatchDto,
  UpdateBatchDto,
  GetBatchDto,
} from '../dto/batch.dto';
import { HarvestEntity } from '@/modules/harvest/entities/entities';

@Injectable()
export class BatchRepository {
  constructor(
    @InjectRepository(BatchEntity)
    private readonly repository: Repository<BatchEntity>,
    @InjectRepository(HarvestEntity)
    private readonly harvestRepository: Repository<HarvestEntity>,
  ) {}

  async create(dto: any): Promise<BatchEntity> {
    const harvests = await this.harvestRepository.findBy({
      id: In(dto.harvestIds),
    });

    const batchData: any = {
      qrCode: dto.qrCode,
      batchHash: dto.batchHash,
      status: dto.status || BatchStatus.CREATED,
      harvests,
      verified: dto.verified !== undefined ? dto.verified : false,
      unit: dto.unit || 'kg',
    };

    // Ajouter les champs optionnels
    if (dto.name) batchData.name = dto.name;
    if (dto.description) batchData.description = dto.description;
    if (dto.totalQuantity !== undefined) batchData.totalQuantity = dto.totalQuantity;
    if (dto.totalWeight !== undefined) batchData.totalWeight = dto.totalWeight;
    if (dto.productionDate) batchData.productionDate = dto.productionDate;
    if (dto.expirationDate) batchData.expirationDate = dto.expirationDate;
    if (dto.quality) batchData.quality = dto.quality;
    if (dto.notes) batchData.notes = dto.notes;
    if (dto.photos) batchData.photos = dto.photos;
    if (dto.originLocation) batchData.originLocation = dto.originLocation;
    if (dto.destinationLocation)
      batchData.destinationLocation = dto.destinationLocation;
    if (dto.certification) batchData.certification = dto.certification;
    if (dto.estimatedValue !== undefined)
      batchData.estimatedValue = dto.estimatedValue;
    if (dto.cooperativeId) batchData.cooperativeId = dto.cooperativeId;
    if (dto.farmerId) batchData.farmerId = dto.farmerId;
    if (dto.productId) batchData.productId = dto.productId;
    if (dto.verifiedAt) batchData.verifiedAt = dto.verifiedAt;
    if (dto.verifiedBy) batchData.verifiedBy = dto.verifiedBy;

    const batch = this.repository.create(batchData);
    const savedBatch = await this.repository.save(batch);
    // TypeORM save peut retourner un array ou un objet unique
    return Array.isArray(savedBatch) ? savedBatch[0] : savedBatch;
  }

  async findById(id: string): Promise<BatchEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: [
        'harvests',
        'supplyChainSteps',
        'cooperative',
        'farmer',
        'product',
      ],
    });
  }

  async findByQrCode(qrCode: string): Promise<BatchEntity | null> {
    return this.repository.findOne({
      where: { qrCode },
      relations: [
        'harvests',
        'supplyChainSteps',
        'cooperative',
        'farmer',
        'product',
      ],
    });
  }

  async findAll(query: GetBatchDto): Promise<{
    data: BatchEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';

    const qb = this.repository.createQueryBuilder('batch');
    qb.leftJoinAndSelect('batch.harvests', 'harvests');
    qb.leftJoinAndSelect('batch.cooperative', 'cooperative');
    qb.leftJoinAndSelect('batch.farmer', 'farmer');
    qb.leftJoinAndSelect('batch.product', 'product');

    if (query.id) {
      qb.andWhere('batch.id = :id', { id: query.id });
    }
    if (query.qrCode) {
      qb.andWhere('batch.qrCode = :qrCode', { qrCode: query.qrCode });
    }
    if (query.status) {
      qb.andWhere('batch.status = :status', { status: query.status });
    }
    if (query.verified !== undefined) {
      qb.andWhere('batch.verified = :verified', { verified: query.verified });
    }
    if (query.quality) {
      qb.andWhere('batch.quality = :quality', { quality: query.quality });
    }
    if (query.cooperativeId) {
      qb.andWhere('batch.cooperativeId = :cooperativeId', {
        cooperativeId: query.cooperativeId,
      });
    }
    if (query.farmerId) {
      qb.andWhere('batch.farmerId = :farmerId', { farmerId: query.farmerId });
    }
    if (query.productId) {
      qb.andWhere('batch.productId = :productId', {
        productId: query.productId,
      });
    }
    if (query.search) {
      qb.andWhere(
        '(batch.qrCode ILIKE :search OR batch.name ILIKE :search OR batch.notes ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Tri
    const validSortFields = [
      'createdAt',
      'updatedAt',
      'productionDate',
      'expirationDate',
      'totalQuantity',
      'estimatedValue',
      'name',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`batch.${sortField}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(id: string, dto: UpdateBatchDto): Promise<BatchEntity | null> {
    const batch = await this.findById(id);
    if (!batch) return null;

    if (dto.harvestIds) {
      batch.harvests = await this.harvestRepository.findBy({
        id: In(dto.harvestIds),
      });
    }

    // Mettre à jour tous les champs fournis
    if (dto.qrCode !== undefined) batch.qrCode = dto.qrCode;
    if (dto.batchHash !== undefined) batch.batchHash = dto.batchHash;
    if (dto.status !== undefined) batch.status = dto.status;
    if (dto.name !== undefined) batch.name = dto.name;
    if (dto.description !== undefined) batch.description = dto.description;
    if (dto.totalQuantity !== undefined)
      batch.totalQuantity = dto.totalQuantity;
    if (dto.totalWeight !== undefined) batch.totalWeight = dto.totalWeight;
    if (dto.unit !== undefined) batch.unit = dto.unit;
    if (dto.productionDate !== undefined)
      batch.productionDate = dto.productionDate as any;
    if (dto.expirationDate !== undefined)
      batch.expirationDate = dto.expirationDate as any;
    if (dto.verified !== undefined) batch.verified = dto.verified;
    if (dto.verifiedAt !== undefined) batch.verifiedAt = dto.verifiedAt as any;
    if (dto.verifiedBy !== undefined) batch.verifiedBy = dto.verifiedBy;
    if (dto.quality !== undefined) batch.quality = dto.quality;
    if (dto.notes !== undefined) batch.notes = dto.notes;
    if (dto.photos !== undefined) batch.photos = dto.photos;
    if (dto.originLocation !== undefined)
      batch.originLocation = dto.originLocation;
    if (dto.destinationLocation !== undefined)
      batch.destinationLocation = dto.destinationLocation;
    if (dto.certification !== undefined) batch.certification = dto.certification;
    if (dto.estimatedValue !== undefined)
      batch.estimatedValue = dto.estimatedValue;
    if (dto.cooperativeId !== undefined) batch.cooperativeId = dto.cooperativeId;
    if (dto.farmerId !== undefined) batch.farmerId = dto.farmerId;
    if (dto.productId !== undefined) batch.productId = dto.productId;

    return this.repository.save(batch);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async calculateTotalQuantity(harvestIds: string[]): Promise<number> {
    const result = await this.harvestRepository
      .createQueryBuilder('harvest')
      .select('SUM(harvest.quantity)', 'total')
      .where('harvest.id IN (:...ids)', { ids: harvestIds })
      .getRawOne();

    return parseFloat(result?.total || '0');
  }

  async getBatchStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    verified: number;
    unverified: number;
    totalQuantity: number;
    totalValue: number;
  }> {
    const total = await this.repository.count();

    const byStatus = await this.repository
      .createQueryBuilder('batch')
      .select('batch.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('batch.status')
      .getRawMany();

    const statusMap: Record<string, number> = {};
    byStatus.forEach((item) => {
      statusMap[item.status] = parseInt(item.count);
    });

    const verified = await this.repository.count({
      where: { verified: true },
    });

    const unverified = total - verified;

    const quantityResult = await this.repository
      .createQueryBuilder('batch')
      .select('SUM(batch.totalQuantity)', 'totalQuantity')
      .getRawOne();

    const valueResult = await this.repository
      .createQueryBuilder('batch')
      .select('SUM(batch.estimatedValue)', 'totalValue')
      .getRawOne();

    return {
      total,
      byStatus: statusMap,
      verified,
      unverified,
      totalQuantity: parseFloat(quantityResult?.totalQuantity || '0'),
      totalValue: parseFloat(valueResult?.totalValue || '0'),
    };
  }

  async getGlobalStats(): Promise<{
    totalBatches: number;
    totalQuantity: number;
    totalValue: number;
    verifiedBatches: number;
    batchesByStatus: Record<string, number>;
    batchesByQuality: Record<string, number>;
  }> {
    const totalBatches = await this.repository.count();

    const quantityResult = await this.repository
      .createQueryBuilder('batch')
      .select('SUM(batch.totalQuantity)', 'totalQuantity')
      .getRawOne();

    const valueResult = await this.repository
      .createQueryBuilder('batch')
      .select('SUM(batch.estimatedValue)', 'totalValue')
      .getRawOne();

    const verifiedBatches = await this.repository.count({
      where: { verified: true },
    });

    const statusStats = await this.repository
      .createQueryBuilder('batch')
      .select('batch.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('batch.status')
      .getRawMany();

    const batchesByStatus: Record<string, number> = {};
    statusStats.forEach((item) => {
      batchesByStatus[item.status] = parseInt(item.count);
    });

    const qualityStats = await this.repository
      .createQueryBuilder('batch')
      .select('batch.quality', 'quality')
      .addSelect('COUNT(*)', 'count')
      .where('batch.quality IS NOT NULL')
      .groupBy('batch.quality')
      .getRawMany();

    const batchesByQuality: Record<string, number> = {};
    qualityStats.forEach((item) => {
      batchesByQuality[item.quality] = parseInt(item.count);
    });

    return {
      totalBatches,
      totalQuantity: parseFloat(quantityResult?.totalQuantity || '0'),
      totalValue: parseFloat(valueResult?.totalValue || '0'),
      verifiedBatches,
      batchesByStatus,
      batchesByQuality,
    };
  }
}
