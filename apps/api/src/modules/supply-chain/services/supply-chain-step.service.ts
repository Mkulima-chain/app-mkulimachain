import { Injectable, NotFoundException } from '@nestjs/common';
import { SupplyChainStepRepository } from '../repositories/supply-chain-step.repository';
import { SupplyChainStepEntity } from '../entities/supply-chain-step.entity';
import {
  CreateSupplyChainStepDto,
  UpdateSupplyChainStepDto,
  GetSupplyChainStepDto,
} from '../dto/supply-chain-step.dto';

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
  ): Promise<SupplyChainStepEntity[]> {
    return this.repository.findAll(query);
  }

  async findByBatchId(batchId: string): Promise<SupplyChainStepEntity[]> {
    return this.repository.findByBatchId(batchId);
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
