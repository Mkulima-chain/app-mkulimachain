import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { BatchRepository } from '../repositories/batch.repository';
import { BatchEntity } from '../entities/batch.entity';
import { BatchStatus } from '../interfaces/ibatch';
import {
  CreateBatchDto,
  UpdateBatchDto,
  GetBatchDto,
} from '../dto/batch.dto';

@Injectable()
export class BatchService {
  private readonly logger = new Logger(BatchService.name);

  constructor(private readonly repository: BatchRepository) {}

  async create(dto: CreateBatchDto): Promise<BatchEntity> {
    this.logger.debug(`Création d'un lot: ${JSON.stringify(dto, null, 2)}`);

    // Calculer automatiquement totalQuantity si non fourni
    let totalQuantity = dto.totalQuantity;
    if (!totalQuantity && dto.harvestIds && dto.harvestIds.length > 0) {
      totalQuantity = await this.repository.calculateTotalQuantity(
        dto.harvestIds,
      );
      this.logger.debug(
        `Quantité totale calculée automatiquement: ${totalQuantity}`,
      );
    }

    const batchData = {
      ...dto,
      totalQuantity,
      verified: false,
      status: dto.status || BatchStatus.CREATED,
      unit: dto.unit || 'kg',
    };

    // Convertir les dates si fournies
    if (dto.productionDate) {
      batchData.productionDate = new Date(dto.productionDate) as any;
    }
    if (dto.expirationDate) {
      batchData.expirationDate = new Date(dto.expirationDate) as any;
    }

    // Filtrer les photos vides
    if (dto.photos && Array.isArray(dto.photos)) {
      batchData.photos = dto.photos.filter(
        (photo) => photo && typeof photo === 'string' && photo.trim() !== '',
      );
      if (batchData.photos.length === 0) {
        delete batchData.photos;
      }
    }

    return this.repository.create(batchData);
  }

  async findById(id: string): Promise<BatchEntity> {
    const batch = await this.repository.findById(id);
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async findByQrCode(qrCode: string): Promise<BatchEntity> {
    const batch = await this.repository.findByQrCode(qrCode);
    if (!batch) {
      throw new NotFoundException(`Batch with QR code ${qrCode} not found`);
    }
    return batch;
  }

  async findAll(query: GetBatchDto): Promise<{
    data: BatchEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.repository.findAll(query);
  }

  async update(id: string, dto: UpdateBatchDto): Promise<BatchEntity> {
    const batch = await this.findById(id);

    // Calculer totalQuantity si harvestIds est modifié
    if (dto.harvestIds && dto.harvestIds.length > 0) {
      if (!dto.totalQuantity) {
        dto.totalQuantity = await this.repository.calculateTotalQuantity(
          dto.harvestIds,
        );
      }
    }

    // Convertir les dates si fournies
    const updateData: any = { ...dto };
    if (dto.productionDate) {
      updateData.productionDate = new Date(dto.productionDate);
    }
    if (dto.expirationDate) {
      updateData.expirationDate = new Date(dto.expirationDate);
    }

    // Filtrer les photos vides
    if (dto.photos && Array.isArray(dto.photos)) {
      updateData.photos = dto.photos.filter(
        (photo) => photo && typeof photo === 'string' && photo.trim() !== '',
      );
      if (updateData.photos.length === 0) {
        delete updateData.photos;
      }
    }

    const updatedBatch = await this.repository.update(id, updateData);
    if (!updatedBatch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return updatedBatch;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }

  async verifyBatch(id: string, userId: string): Promise<BatchEntity> {
    const batch = await this.findById(id);

    if (batch.verified) {
      throw new BadRequestException('Le lot est déjà vérifié');
    }

    return this.repository.update(id, {
      verified: true,
      verifiedAt: new Date() as any,
      verifiedBy: userId,
    } as any);
  }

  async updateBatchStatus(
    id: string,
    status: BatchStatus,
  ): Promise<BatchEntity> {
    const batch = await this.findById(id);

    if (!Object.values(BatchStatus).includes(status)) {
      throw new BadRequestException(`Statut invalide: ${status}`);
    }

    return this.repository.update(id, { status });
  }

  async getBatchStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    verified: number;
    unverified: number;
    totalQuantity: number;
    totalValue: number;
  }> {
    return this.repository.getBatchStats();
  }

  async getGlobalStats(): Promise<{
    totalBatches: number;
    totalQuantity: number;
    totalValue: number;
    verifiedBatches: number;
    batchesByStatus: Record<string, number>;
    batchesByQuality: Record<string, number>;
  }> {
    return this.repository.getGlobalStats();
  }
}
