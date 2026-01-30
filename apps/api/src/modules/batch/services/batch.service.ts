import { Injectable, NotFoundException } from '@nestjs/common';
import { BatchRepository } from '../repositories/batch.repository';
import { BatchEntity } from '../entities/batch.entity';
import { CreateBatchDto, UpdateBatchDto, GetBatchDto } from '../dto/batch.dto';

@Injectable()
export class BatchService {
  constructor(private readonly repository: BatchRepository) {}

  async create(dto: CreateBatchDto): Promise<BatchEntity> {
    return this.repository.create(dto);
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

  async findAll(query: GetBatchDto): Promise<BatchEntity[]> {
    return this.repository.findAll(query);
  }

  async update(id: string, dto: UpdateBatchDto): Promise<BatchEntity> {
    const batch = await this.repository.update(id, dto);
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
