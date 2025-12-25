import { Injectable, NotFoundException } from '@nestjs/common';
import { FarmerEntity } from '../entities/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateFarmerDto,
  UpdateFarmerDto,
  GetFarmerDto,
} from '../dto/farmers.dto';
import { IFarmer } from '../interfaces/ifarmers';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(FarmerEntity)
    private farmerRepository: Repository<FarmerEntity>,
    @InjectRepository(CooperativeEntity)
    private cooperativeRepository: Repository<CooperativeEntity>,
  ) {}

  async createFarmer(farmer: CreateFarmerDto): Promise<FarmerEntity> {
    const newFarmer = this.farmerRepository.create(farmer);
    return this.farmerRepository.save(newFarmer);
  }

  async updateFarmer(
    id: string,
    farmer: UpdateFarmerDto,
  ): Promise<FarmerEntity> {
    // Récupérer l'agriculteur existant
    const existingFarmer = await this.farmerRepository.findOne({ where: { id } });
    if (!existingFarmer) {
      throw new NotFoundException('Agriculteur introuvable');
    }
    
    // Si cooperativeId est fourni, charger la coopérative et l'assigner
    if (farmer.cooperativeId !== undefined) {
      if (farmer.cooperativeId) {
        // Vérifier que la coopérative existe
        const cooperative = await this.cooperativeRepository.findOne({
          where: { id: farmer.cooperativeId },
        });
        if (!cooperative) {
          throw new NotFoundException('Coopérative introuvable');
        }
        existingFarmer.cooperative = cooperative;
      } else {
        // Si cooperativeId est null, retirer la relation
        existingFarmer.cooperative = null as any;
      }
    }
    
    // Mettre à jour les autres propriétés
    const { cooperativeId, ...otherFields } = farmer;
    if (Object.keys(otherFields).length > 0) {
      Object.assign(existingFarmer, otherFields);
    }
    
    return this.farmerRepository.save(existingFarmer);
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

    // TypeORM ne sérialise pas automatiquement cooperativeId car c'est une colonne de jointure
    // On doit utiliser getRawAndEntities pour obtenir les données brutes incluant cooperativeId
    const { entities, raw } = await qb.getRawAndEntities();
    
    // Mapper pour inclure cooperativeId depuis les données brutes
    return entities.map((farmer, index) => {
      const rawData = raw[index];
      const farmerObj = { ...farmer } as any;
      // Extraire cooperativeId depuis les données brutes
      // Le nom de la colonne dans raw sera "farmer_cooperativeId" ou similaire
      if (rawData) {
        // Chercher cooperativeId dans les clés de rawData
        const cooperativeIdKey = Object.keys(rawData).find(key => 
          key.toLowerCase().includes('cooperativeid')
        );
        farmerObj.cooperativeId = cooperativeIdKey ? rawData[cooperativeIdKey] : undefined;
      }
      // Si on a une relation cooperative chargée, utiliser son ID
      if (!farmerObj.cooperativeId && farmerObj.cooperative?.id) {
        farmerObj.cooperativeId = farmerObj.cooperative.id;
      }
      return farmerObj as FarmerEntity;
    });
  }

  async deleteFarmer(id: string): Promise<void> {
    await this.farmerRepository.softDelete(id);
  }
}
