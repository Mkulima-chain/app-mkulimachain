import { Injectable, NotFoundException } from '@nestjs/common';
import { SupplyChainStepRepository } from '../repositories/supply-chain-step.repository';
import { SupplyChainStepEntity } from '../entities/supply-chain-step.entity';
import {
  CreateSupplyChainStepDto,
  UpdateSupplyChainStepDto,
  GetSupplyChainStepDto,
  SupplyChainTimelineDto,
} from '../dto/supply-chain-step.dto';
import { StepStatus } from '../interfaces/isupply-chain-step';

@Injectable()
export class SupplyChainStepService {
  constructor(private readonly repository: SupplyChainStepRepository) {}

  async create(dto: CreateSupplyChainStepDto): Promise<SupplyChainStepEntity> {
    return this.repository.create(dto);
  }

  async findById(id: string): Promise<SupplyChainStepEntity> {
    const step = await this.repository.findById(id);
    if (!step) {
      throw new NotFoundException(`Supply chain step with ID ${id} not found`);
    }
    return step;
  }

  async findAll(
    query: GetSupplyChainStepDto,
  ): Promise<{
    data: SupplyChainStepEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.repository.findAll(query);
  }

  async findByBatchId(batchId: string): Promise<SupplyChainStepEntity[]> {
    return this.repository.findByBatchId(batchId);
  }

  async getBatchTimeline(batchId: string): Promise<SupplyChainTimelineDto> {
    const steps = await this.repository.findTimelineByBatchId(batchId);
    const completedSteps = steps.filter(
      (s) => s.status === StepStatus.COMPLETED,
    ).length;
    const pendingSteps = steps.filter(
      (s) => s.status === StepStatus.PENDING,
    ).length;

    return {
      batchId,
      steps,
      totalSteps: steps.length,
      completedSteps,
      pendingSteps,
    };
  }

  async getNextStep(
    currentStepId: string,
  ): Promise<SupplyChainStepEntity | null> {
    await this.findById(currentStepId); // Validate step exists
    return this.repository.getNextStep(currentStepId);
  }

  async getPreviousStep(
    currentStepId: string,
  ): Promise<SupplyChainStepEntity | null> {
    await this.findById(currentStepId); // Validate step exists
    return this.repository.getPreviousStep(currentStepId);
  }

  async verifyStep(id: string, verifiedBy: string): Promise<SupplyChainStepEntity> {
    await this.findById(id); // Validate step exists
    return this.repository.verifyStep(id, verifiedBy);
  }

  async updateStepStatus(
    id: string,
    status: StepStatus,
  ): Promise<SupplyChainStepEntity> {
    await this.findById(id); // Validate step exists
    return this.repository.updateStepStatus(id, status);
  }

  async getStatistics(batchId?: string): Promise<{
    total: number;
    byStatus: Record<StepStatus, number>;
    byType: Record<string, number>;
    verified: number;
    unverified: number;
  }> {
    return this.repository.getChainStatistics(batchId);
  }

  async getQualityMetrics(batchId: string): Promise<{
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    average: number;
  }> {
    const steps = await this.repository.findByBatchId(batchId);
    const qualityCounts = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
    };

    let totalWithQuality = 0;
    let qualitySum = 0;

    steps.forEach((step) => {
      if (step.quality) {
        totalWithQuality++;
        switch (step.quality) {
          case 'excellent':
            qualityCounts.excellent++;
            qualitySum += 4;
            break;
          case 'good':
            qualityCounts.good++;
            qualitySum += 3;
            break;
          case 'fair':
            qualityCounts.fair++;
            qualitySum += 2;
            break;
          case 'poor':
            qualityCounts.poor++;
            qualitySum += 1;
            break;
        }
      }
    });

    return {
      ...qualityCounts,
      average: totalWithQuality > 0 ? qualitySum / totalWithQuality : 0,
    };
  }

  async validateChainIntegrity(batchId: string): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    return this.repository.validateSequence(batchId);
  }

  async findByQrCode(qrCode: string): Promise<SupplyChainStepEntity> {
    const step = await this.repository.findByQrCode(qrCode);
    if (!step) {
      throw new NotFoundException(
        `Supply chain step with QR code ${qrCode} not found`,
      );
    }
    return step;
  }

  async findPendingSteps(): Promise<SupplyChainStepEntity[]> {
    return this.repository.findPendingSteps();
  }

  async update(
    id: string,
    dto: UpdateSupplyChainStepDto,
  ): Promise<SupplyChainStepEntity> {
    const step = await this.repository.update(id, dto);
    if (!step) {
      throw new NotFoundException(`Supply chain step with ID ${id} not found`);
    }
    return step;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
