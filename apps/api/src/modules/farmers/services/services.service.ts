import { Injectable } from '@nestjs/common';
import { FarmerEntity } from '../entities/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateFarmerDto,
  UpdateFarmerDto,
  GetFarmerDto,
} from '../dto/farmers.dto';
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

  async getFarmers(query: GetFarmerDto): Promise<FarmerEntity[]> {
    const qb = this.farmerRepository.createQueryBuilder('farmer');

    if (query.id) {
      qb.andWhere('farmer.id = :id', { id: query.id });
    }
    if (query.name) {
      qb.andWhere('farmer.name ILIKE :name', { name: `%${query.name}%` });
    }
    if (query.phone) {
      qb.andWhere('farmer.phone ILIKE :phone', { phone: `%${query.phone}%` });
    }
    if (query.city) {
      qb.andWhere('farmer.city ILIKE :city', { city: `%${query.city}%` });
    }
    if (query.state) {
      qb.andWhere('farmer.state ILIKE :state', { state: `%${query.state}%` });
    }

    if (query.search) {
      qb.andWhere(
        `(farmer.name ILIKE :search OR farmer.phone ILIKE :search OR farmer.city ILIKE :search OR farmer.state ILIKE :search)`,
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('farmer.createdAt', 'DESC');

    return qb.getMany();
  }

  async deleteFarmer(id: string): Promise<void> {
    await this.farmerRepository.softDelete(id);
  }
}
