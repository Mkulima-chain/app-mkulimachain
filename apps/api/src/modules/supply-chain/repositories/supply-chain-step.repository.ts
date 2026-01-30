import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplyChainStepEntity } from '../entities/supply-chain-step.entity';
import {
  CreateSupplyChainStepDto,
  UpdateSupplyChainStepDto,
  GetSupplyChainStepDto,
} from '../dto/supply-chain-step.dto';
import { BatchEntity } from '@/modules/batch/entities/batch.entity';

@Injectable()
export class SupplyChainStepRepository {
  constructor(
    @InjectRepository(SupplyChainStepEntity)
    private readonly repository: Repository<SupplyChainStepEntity>,
    @InjectRepository(BatchEntity)
    private readonly batchRepository: Repository<BatchEntity>,
  ) {}

  async create(dto: CreateSupplyChainStepDto): Promise<SupplyChainStepEntity> {
    const batch = await this.batchRepository.findOneBy({ id: dto.batchId });

    const step = this.repository.create({
      batch: batch!,
      stepType: dto.stepType,
      timestamp: dto.timestamp || new Date(),
      metadataHash: dto.metadataHash,
    });

    return this.repository.save(step);
  }

  async findById(id: string): Promise<SupplyChainStepEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['batch'],
    });
  }

  async findAll(
    query: GetSupplyChainStepDto,
  ): Promise<SupplyChainStepEntity[]> {
    const qb = this.repository
      .createQueryBuilder('step')
      .leftJoinAndSelect('step.batch', 'batch');

    if (query.id) qb.andWhere('step.id = :id', { id: query.id });
    if (query.batchId)
      qb.andWhere('batch.id = :batchId', { batchId: query.batchId });
    if (query.stepType)
      qb.andWhere('step.stepType = :stepType', { stepType: query.stepType });

    return qb.getMany();
  }

  async findByBatchId(batchId: string): Promise<SupplyChainStepEntity[]> {
    return this.repository.find({
      where: { batch: { id: batchId } },
      relations: ['batch'],
      order: { timestamp: 'ASC' },
    });
  }

  async update(
    id: string,
    dto: UpdateSupplyChainStepDto,
  ): Promise<SupplyChainStepEntity | null> {
    const step = await this.findById(id);
    if (!step) return null;

    if (dto.batchId) {
      const batch = await this.batchRepository.findOneBy({ id: dto.batchId });
      if (batch) step.batch = batch;
    }
    if (dto.stepType) step.stepType = dto.stepType;
    if (dto.timestamp) step.timestamp = dto.timestamp;
    if (dto.metadataHash) step.metadataHash = dto.metadataHash;

    return this.repository.save(step);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
