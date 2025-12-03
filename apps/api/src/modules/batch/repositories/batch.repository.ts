import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BatchEntity } from '../entities/batch.entity';
import { CreateBatchDto, UpdateBatchDto, GetBatchDto } from '../dto/batch.dto';
import { HarvestEntity } from '@/modules/harvest/entities/entities';

@Injectable()
export class BatchRepository {
  constructor(
    @InjectRepository(BatchEntity)
    private readonly repository: Repository<BatchEntity>,
    @InjectRepository(HarvestEntity)
    private readonly harvestRepository: Repository<HarvestEntity>,
  ) {}

  async create(dto: CreateBatchDto): Promise<BatchEntity> {
    const harvests = await this.harvestRepository.findBy({
      id: In(dto.harvestIds),
    });

    const batch = this.repository.create({
      qrCode: dto.qrCode,
      batchHash: dto.batchHash,
      status: dto.status,
      harvests,
    });

    return this.repository.save(batch);
  }

  async findById(id: string): Promise<BatchEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['harvests', 'supplyChainSteps'],
    });
  }

  async findByQrCode(qrCode: string): Promise<BatchEntity | null> {
    return this.repository.findOne({
      where: { qrCode },
      relations: ['harvests', 'supplyChainSteps'],
    });
  }

  async findAll(query: GetBatchDto): Promise<BatchEntity[]> {
    const where: Record<string, unknown> = {};

    if (query.id) where.id = query.id;
    if (query.qrCode) where.qrCode = query.qrCode;
    if (query.status) where.status = query.status;

    return this.repository.find({
      where,
      relations: ['harvests', 'supplyChainSteps'],
    });
  }

  async update(id: string, dto: UpdateBatchDto): Promise<BatchEntity | null> {
    const batch = await this.findById(id);
    if (!batch) return null;

    if (dto.harvestIds) {
      batch.harvests = await this.harvestRepository.findBy({
        id: In(dto.harvestIds),
      });
    }

    if (dto.qrCode) batch.qrCode = dto.qrCode;
    if (dto.batchHash) batch.batchHash = dto.batchHash;
    if (dto.status) batch.status = dto.status;

    return this.repository.save(batch);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
