import { Repository } from 'typeorm';
import { FarmerEntity } from '../entities/entities';
import { IFarmer } from '../interfaces/ifarmers';
import { CreateFarmerDto, UpdateFarmerDto } from '../dto/farmers.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RepositoriesService {
  @InjectRepository(FarmerEntity)
  private farmerRepository: Repository<FarmerEntity>;

  async createFarmer(farmer: CreateFarmerDto): Promise<FarmerEntity> {
    const newFarmer = this.farmerRepository.create(farmer);
    return this.farmerRepository.save(newFarmer);
  }

  async updateFarmer(
    id: string,
    farmer: UpdateFarmerDto,
  ): Promise<FarmerEntity> {
    const updatedFarmer = await this.farmerRepository.preload({
      id,
      ...farmer,
    });
    return this.farmerRepository.save(updatedFarmer);
  }

  async getFarmerById(id: string): Promise<FarmerEntity> {
    return this.farmerRepository.findOne({ where: { id } });
  }
  async getFarmers(farmer: Partial<IFarmer>): Promise<FarmerEntity[]> {
    return this.farmerRepository.find({ where: farmer });
  }

  async deleteFarmer(id: string): Promise<void> {
    await this.farmerRepository.softDelete(id);
  }
}
