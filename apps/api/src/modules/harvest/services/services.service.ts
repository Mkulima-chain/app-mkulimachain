import { Injectable, NotFoundException } from '@nestjs/common';
import { HarvestEntity } from '../entities/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateHarvestDto,
  GetHarvestDto,
  UpdateHarvestDto,
} from '../dto/harvest.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(HarvestEntity)
    private readonly harvestRepository: Repository<HarvestEntity>,
  ) {}

  async createHarvest(harvest: CreateHarvestDto): Promise<HarvestEntity> {
    const newHarvest = this.harvestRepository.create({
      ...harvest,
      harvestAt: new Date(harvest.harvestAt),
      farmer: { id: harvest.farmerId } as any,
      product: { id: harvest.productId } as any,
    });
    return this.harvestRepository.save(newHarvest);
  }

  async getHarvestById(id: string): Promise<HarvestEntity> {
    const harvest = await this.harvestRepository.findOne({
      where: { id },
      relations: ['farmer', 'product'],
    });
    if (!harvest) {
      throw new NotFoundException('Récolte introuvable');
    }
    return harvest;
  }

  async getHarvests(query: GetHarvestDto): Promise<HarvestEntity[]> {
    const qb = this.harvestRepository.createQueryBuilder('harvest');
    qb.leftJoinAndSelect('harvest.farmer', 'farmer');
    qb.leftJoinAndSelect('harvest.product', 'product');

    if (query.id) {
      qb.andWhere('harvest.id = :id', { id: query.id });
    }
    if (query.farmerId) {
      qb.andWhere('harvest.farmerId = :farmerId', { farmerId: query.farmerId });
    }
    if (query.productId) {
      qb.andWhere('harvest.productId = :productId', {
        productId: query.productId,
      });
    }
    if (query.quantity) {
      qb.andWhere('harvest.quantity = :quantity', { quantity: query.quantity });
    }
    if (query.search) {
      qb.andWhere('harvest.proofHash ILIKE :search', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('harvest.harvestAt', 'DESC');

    return qb.getMany();
  }

  async updateHarvest(
    id: string,
    harvest: UpdateHarvestDto,
  ): Promise<HarvestEntity> {
    const updatedHarvest = await this.harvestRepository.preload({
      id,
      ...harvest,
      harvestAt: harvest.harvestAt ? new Date(harvest.harvestAt) : undefined,
      farmer: harvest.farmerId ? ({ id: harvest.farmerId } as any) : undefined,
      product: harvest.productId
        ? ({ id: harvest.productId } as any)
        : undefined,
    });
    if (!updatedHarvest) {
      throw new NotFoundException('Récolte introuvable');
    }
    return this.harvestRepository.save(updatedHarvest);
  }

  async deleteHarvest(id: string): Promise<void> {
    const result = await this.harvestRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException('Récolte introuvable');
    }
  }
}
