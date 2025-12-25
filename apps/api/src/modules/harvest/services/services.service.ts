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
    const qb = this.harvestRepository.createQueryBuilder('harvest');
    qb.leftJoinAndSelect('harvest.farmer', 'farmer');
    qb.leftJoinAndSelect('harvest.product', 'product');
    qb.where('harvest.id = :id', { id });
    
    // Inclure explicitement farmerId et productId dans la réponse
    qb.addSelect('harvest.farmerId', 'harvest_farmerId');
    qb.addSelect('harvest.productId', 'harvest_productId');
    
    const { entities, raw } = await qb.getRawAndEntities();
    
    if (!entities || entities.length === 0) {
      throw new NotFoundException('Récolte introuvable');
    }
    
    const harvest = entities[0];
    const rawData = raw[0];
    
    // Mapper les IDs depuis les résultats bruts vers l'entité
    return {
      ...harvest,
      farmerId: rawData?.harvest_farmerId || harvest.farmer?.id,
      productId: rawData?.harvest_productId || harvest.product?.id,
    } as HarvestEntity;
  }

  async getHarvests(query: GetHarvestDto): Promise<HarvestEntity[]> {
    const qb = this.harvestRepository.createQueryBuilder('harvest');
    qb.leftJoinAndSelect('harvest.farmer', 'farmer');
    qb.leftJoinAndSelect('harvest.product', 'product');
    
    // Inclure explicitement farmerId et productId dans la réponse
    qb.addSelect('harvest.farmerId', 'harvest_farmerId');
    qb.addSelect('harvest.productId', 'harvest_productId');

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

    const { entities, raw } = await qb.getRawAndEntities();
    
    // Mapper les IDs depuis les résultats bruts vers les entités
    return entities.map((harvest, index) => {
      const rawData = raw[index];
      return {
        ...harvest,
        farmerId: rawData?.harvest_farmerId || harvest.farmer?.id,
        productId: rawData?.harvest_productId || harvest.product?.id,
      } as HarvestEntity;
    });
  }

  async updateHarvest(
    id: string,
    harvest: UpdateHarvestDto,
  ): Promise<HarvestEntity> {
    // Charger l'entité existante avec ses relations
    const existingHarvest = await this.harvestRepository.findOne({
      where: { id },
      relations: ['farmer', 'product'],
    });
    
    if (!existingHarvest) {
      throw new NotFoundException('Récolte introuvable');
    }
    
    // Mettre à jour les champs fournis
    if (harvest.farmerId !== undefined) {
      existingHarvest.farmer = { id: harvest.farmerId } as any;
    }
    if (harvest.productId !== undefined) {
      existingHarvest.product = { id: harvest.productId } as any;
    }
    if (harvest.quantity !== undefined) {
      existingHarvest.quantity = harvest.quantity;
    }
    if (harvest.harvestAt !== undefined) {
      existingHarvest.harvestAt = new Date(harvest.harvestAt);
    }
    if (harvest.latitude !== undefined) {
      existingHarvest.latitude = harvest.latitude;
    }
    if (harvest.longitude !== undefined) {
      existingHarvest.longitude = harvest.longitude;
    }
    if (harvest.proofHash !== undefined) {
      existingHarvest.proofHash = harvest.proofHash;
    }
    
    return this.harvestRepository.save(existingHarvest);
  }

  async deleteHarvest(id: string): Promise<void> {
    const result = await this.harvestRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException('Récolte introuvable');
    }
  }
}
