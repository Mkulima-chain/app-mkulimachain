import { Injectable } from '@nestjs/common';
import { FarmerEntity } from '../entities/entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFarmerDto, UpdateFarmerDto } from '../dto/farmers.dto';
import { IFarmer } from '../interfaces/ifarmers';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(FarmerEntity)
    private farmerRepository: Repository<FarmerEntity>,
  ) {}

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
