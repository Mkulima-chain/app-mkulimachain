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
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';
import { StepStatus } from '../interfaces/isupply-chain-step';

@Injectable()
export class SupplyChainStepRepository {
  constructor(
    @InjectRepository(SupplyChainStepEntity)
    private readonly repository: Repository<SupplyChainStepEntity>,
    @InjectRepository(BatchEntity)
    private readonly batchRepository: Repository<BatchEntity>,
    @InjectRepository(CooperativeEntity)
    private readonly cooperativeRepository: Repository<CooperativeEntity>,
  ) {}

  async create(dto: CreateSupplyChainStepDto): Promise<SupplyChainStepEntity> {
    const batch = await this.batchRepository.findOneBy({ id: dto.batchId });

    // Calculate sequenceOrder if not provided
    let sequenceOrder = dto.sequenceOrder;
    if (!sequenceOrder && dto.batchId) {
      const lastStep = await this.repository.findOne({
        where: { batch: { id: dto.batchId } },
        order: { sequenceOrder: 'DESC' },
      });
      sequenceOrder = lastStep ? (lastStep.sequenceOrder || 0) + 1 : 1;
    }

    const stepData: any = {
      batch: batch!,
      stepType: dto.stepType,
      timestamp: dto.timestamp ? new Date(dto.timestamp) : new Date(),
      metadataHash: dto.metadataHash,
      name: dto.name,
      description: dto.description,
      location: dto.location,
      latitude: dto.latitude,
      longitude: dto.longitude,
      temperature: dto.temperature,
      humidity: dto.humidity,
      quantity: dto.quantity,
      weight: dto.weight,
      unit: dto.unit || 'kg',
      status: dto.status || StepStatus.PENDING,
      responsiblePerson: dto.responsiblePerson,
      responsiblePersonId: dto.responsiblePersonId,
      certificate: dto.certificate,
      notes: dto.notes,
      photos: dto.photos,
      documents: dto.documents,
      duration: dto.duration,
      equipment: dto.equipment,
      cost: dto.cost,
      quality: dto.quality,
      sequenceOrder,
      blockchainTxHash: dto.blockchainTxHash,
      qrCode: dto.qrCode,
      facilityId: dto.facilityId,
    };

    if (dto.cooperativeId) {
      const cooperative = await this.cooperativeRepository.findOneBy({
        id: dto.cooperativeId,
      });
      if (cooperative) stepData.cooperative = cooperative;
    }

    if (dto.previousStepId) {
      const previousStep = await this.findById(dto.previousStepId);
      if (previousStep) stepData.previousStep = previousStep;
    }

    if (dto.nextStepId) {
      const nextStep = await this.findById(dto.nextStepId);
      if (nextStep) stepData.nextStep = nextStep;
    }

    const step = this.repository.create(stepData);
    const savedStep = await this.repository.save(step);
    // TypeORM save can return Entity or Entity[], but we're saving a single entity
    return Array.isArray(savedStep) ? savedStep[0] : savedStep;
  }

  async findById(id: string): Promise<SupplyChainStepEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['batch', 'cooperative', 'nextStep', 'previousStep'],
    });
  }

  async findAll(
    query: GetSupplyChainStepDto,
  ): Promise<{
    data: SupplyChainStepEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const qb = this.repository
      .createQueryBuilder('step')
      .leftJoinAndSelect('step.batch', 'batch')
      .leftJoinAndSelect('step.cooperative', 'cooperative')
      .leftJoinAndSelect('step.nextStep', 'nextStep')
      .leftJoinAndSelect('step.previousStep', 'previousStep');

    // Filters
    if (query.id) qb.andWhere('step.id = :id', { id: query.id });
    if (query.batchId)
      qb.andWhere('batch.id = :batchId', { batchId: query.batchId });
    if (query.stepType)
      qb.andWhere('step.stepType = :stepType', { stepType: query.stepType });
    if (query.status)
      qb.andWhere('step.status = :status', { status: query.status });
    if (query.verified !== undefined)
      qb.andWhere('step.verified = :verified', { verified: query.verified });
    if (query.quality)
      qb.andWhere('step.quality = :quality', { quality: query.quality });
    if (query.location)
      qb.andWhere('step.location ILIKE :location', {
        location: `%${query.location}%`,
      });
    if (query.responsiblePersonId)
      qb.andWhere('step.responsiblePersonId = :responsiblePersonId', {
        responsiblePersonId: query.responsiblePersonId,
      });
    if (query.cooperativeId)
      qb.andWhere('cooperative.id = :cooperativeId', {
        cooperativeId: query.cooperativeId,
      });

    // Date range filter
    if (query.startDate || query.endDate) {
      if (query.startDate && query.endDate) {
        qb.andWhere('step.timestamp BETWEEN :startDate AND :endDate', {
          startDate: query.startDate,
          endDate: query.endDate,
        });
      } else if (query.startDate) {
        qb.andWhere('step.timestamp >= :startDate', {
          startDate: query.startDate,
        });
      } else if (query.endDate) {
        qb.andWhere('step.timestamp <= :endDate', {
          endDate: query.endDate,
        });
      }
    }

    // Text search
    if (query.search) {
      qb.andWhere(
        '(step.name ILIKE :search OR step.description ILIKE :search OR step.location ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Sorting
    const sortBy = query.sortBy || 'timestamp';
    const sortOrder = query.sortOrder || 'ASC';
    qb.orderBy(`step.${sortBy}`, sortOrder);

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByBatchId(batchId: string): Promise<SupplyChainStepEntity[]> {
    return this.repository.find({
      where: { batch: { id: batchId } },
      relations: ['batch', 'cooperative', 'nextStep', 'previousStep'],
      order: { sequenceOrder: 'ASC', timestamp: 'ASC' },
    });
  }

  async findTimelineByBatchId(
    batchId: string,
  ): Promise<SupplyChainStepEntity[]> {
    return this.repository.find({
      where: { batch: { id: batchId } },
      relations: ['batch', 'cooperative', 'nextStep', 'previousStep'],
      order: { sequenceOrder: 'ASC', timestamp: 'ASC' },
    });
  }

  async findByStatus(status: StepStatus): Promise<SupplyChainStepEntity[]> {
    return this.repository.find({
      where: { status },
      relations: ['batch', 'cooperative'],
      order: { timestamp: 'DESC' },
    });
  }

  async findPendingSteps(): Promise<SupplyChainStepEntity[]> {
    return this.findByStatus(StepStatus.PENDING);
  }

  async findByQrCode(qrCode: string): Promise<SupplyChainStepEntity | null> {
    return this.repository.findOne({
      where: { qrCode },
      relations: ['batch', 'cooperative', 'nextStep', 'previousStep'],
    });
  }

  async getNextStep(
    currentStepId: string,
  ): Promise<SupplyChainStepEntity | null> {
    const step = await this.findById(currentStepId);
    if (!step || !step.nextStepId) return null;
    return this.findById(step.nextStepId);
  }

  async getPreviousStep(
    currentStepId: string,
  ): Promise<SupplyChainStepEntity | null> {
    const step = await this.findById(currentStepId);
    if (!step || !step.previousStepId) return null;
    return this.findById(step.previousStepId);
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
    if (dto.stepType !== undefined) step.stepType = dto.stepType;
    if (dto.timestamp) step.timestamp = new Date(dto.timestamp);
    if (dto.metadataHash) step.metadataHash = dto.metadataHash;
    if (dto.name !== undefined) step.name = dto.name;
    if (dto.description !== undefined) step.description = dto.description;
    if (dto.location !== undefined) step.location = dto.location;
    if (dto.latitude !== undefined) step.latitude = dto.latitude;
    if (dto.longitude !== undefined) step.longitude = dto.longitude;
    if (dto.temperature !== undefined) step.temperature = dto.temperature;
    if (dto.humidity !== undefined) step.humidity = dto.humidity;
    if (dto.quantity !== undefined) step.quantity = dto.quantity;
    if (dto.weight !== undefined) step.weight = dto.weight;
    if (dto.unit !== undefined) step.unit = dto.unit;
    if (dto.status !== undefined) step.status = dto.status;
    if (dto.responsiblePerson !== undefined)
      step.responsiblePerson = dto.responsiblePerson;
    if (dto.responsiblePersonId !== undefined)
      step.responsiblePersonId = dto.responsiblePersonId;
    if (dto.certificate !== undefined) step.certificate = dto.certificate;
    if (dto.notes !== undefined) step.notes = dto.notes;
    if (dto.photos !== undefined) step.photos = dto.photos;
    if (dto.documents !== undefined) step.documents = dto.documents;
    if (dto.duration !== undefined) step.duration = dto.duration;
    if (dto.equipment !== undefined) step.equipment = dto.equipment;
    if (dto.cost !== undefined) step.cost = dto.cost;
    if (dto.quality !== undefined) step.quality = dto.quality;
    if (dto.sequenceOrder !== undefined)
      step.sequenceOrder = dto.sequenceOrder;
    if (dto.blockchainTxHash !== undefined)
      step.blockchainTxHash = dto.blockchainTxHash;
    if (dto.qrCode !== undefined) step.qrCode = dto.qrCode;
    if (dto.facilityId !== undefined) step.facilityId = dto.facilityId;

    if (dto.cooperativeId) {
      const cooperative = await this.cooperativeRepository.findOneBy({
        id: dto.cooperativeId,
      });
      if (cooperative) step.cooperative = cooperative;
    }

    if (dto.previousStepId) {
      const previousStep = await this.findById(dto.previousStepId);
      if (previousStep) step.previousStep = previousStep;
    }

    if (dto.nextStepId) {
      const nextStep = await this.findById(dto.nextStepId);
      if (nextStep) step.nextStep = nextStep;
    }

    return this.repository.save(step);
  }

  async verifyStep(id: string, verifiedBy: string): Promise<SupplyChainStepEntity> {
    const step = await this.findById(id);
    if (!step) throw new Error('Step not found');

    step.verified = true;
    step.verifiedAt = new Date();
    step.verifiedBy = verifiedBy;

    return this.repository.save(step);
  }

  async updateStepStatus(
    id: string,
    status: StepStatus,
  ): Promise<SupplyChainStepEntity> {
    const step = await this.findById(id);
    if (!step) throw new Error('Step not found');

    step.status = status;
    return this.repository.save(step);
  }

  async getChainStatistics(batchId?: string): Promise<{
    total: number;
    byStatus: Record<StepStatus, number>;
    byType: Record<string, number>;
    verified: number;
    unverified: number;
  }> {
    const qb = this.repository.createQueryBuilder('step');

    if (batchId) {
      qb.where('step.batchId = :batchId', { batchId });
    }

    const allSteps = await qb.getMany();

    const stats = {
      total: allSteps.length,
      byStatus: {} as Record<StepStatus, number>,
      byType: {} as Record<string, number>,
      verified: 0,
      unverified: 0,
    };

    allSteps.forEach((step) => {
      // Count by status
      const status = step.status || StepStatus.PENDING;
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Count by type
      stats.byType[step.stepType] = (stats.byType[step.stepType] || 0) + 1;

      // Count verified
      if (step.verified) {
        stats.verified++;
      } else {
        stats.unverified++;
      }
    });

    return stats;
  }

  async validateSequence(batchId: string): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const steps = await this.findByBatchId(batchId);
    const errors: string[] = [];

    // Check if steps are in order
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (step.sequenceOrder && step.sequenceOrder !== i + 1) {
        errors.push(
          `Step ${step.id} has incorrect sequence order: expected ${
            i + 1
          }, got ${step.sequenceOrder}`,
        );
      }

      // Check previous/next step links
      if (step.previousStepId && i > 0) {
        if (steps[i - 1].id !== step.previousStepId) {
          errors.push(
            `Step ${step.id} previousStepId doesn't match previous step`,
          );
        }
      }

      if (step.nextStepId && i < steps.length - 1) {
        if (steps[i + 1].id !== step.nextStepId) {
          errors.push(`Step ${step.id} nextStepId doesn't match next step`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
