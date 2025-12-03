import { Injectable } from '@nestjs/common';
import { HarvestEntity } from '../entities/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHarvestDto, UpdateHarvestDto } from '../dto/harvest.dto';
import { IHarvest } from '../interfaces/iharvest';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(HarvestEntity)
    private readonly harvestRepository: Repository<HarvestEntity>,
  ) {}

  async createHarvest(harvest: CreateHarvestDto): Promise<HarvestEntity> {
    const newHarvest = this.harvestRepository.create(harvest);
    return this.harvestRepository.save(newHarvest);
  }

  async getHarvestById(id: string): Promise<HarvestEntity> {
    return this.harvestRepository.findOne({ where: { id } });
  }

  async getHarvests(harvest: Partial<IHarvest>): Promise<HarvestEntity[]> {
    return this.harvestRepository.find({ where: harvest });
  }

  async updateHarvest(
    id: string,
    harvest: UpdateHarvestDto,
  ): Promise<HarvestEntity> {
    const updatedHarvest = await this.harvestRepository.preload({
      id,
      ...harvest,
    });
    return this.harvestRepository.save(updatedHarvest);
  }

  async deleteHarvest(id: string): Promise<void> {
    await this.harvestRepository.softDelete(id);
  }
}
