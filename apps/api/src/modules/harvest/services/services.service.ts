import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { HarvestEntity, HarvestStatus } from '../entities/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateHarvestDto,
  GetHarvestDto,
  UpdateHarvestDto,
  HarvestResponseDto,
} from '../dto/harvest.dto';
import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { ProductEntity } from '@/modules/products/entities/entities';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    @InjectRepository(HarvestEntity)
    private readonly harvestRepository: Repository<HarvestEntity>,
    @InjectRepository(FarmerEntity)
    private readonly farmerRepository: Repository<FarmerEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async createHarvest(harvest: CreateHarvestDto): Promise<HarvestEntity> {
    this.logger.log(
      `Création d'une nouvelle récolte: Farmer ${harvest.farmerId}, Product ${harvest.productId}`,
    );

    try {
      // Vérifier que le farmer existe
      const farmer = await this.farmerRepository.findOne({
        where: { id: harvest.farmerId },
      });
      if (!farmer) {
        throw new NotFoundException('Agriculteur introuvable');
      }

      // Vérifier que le product existe
      const product = await this.productRepository.findOne({
        where: { id: harvest.productId },
      });
      if (!product) {
        throw new NotFoundException('Produit introuvable');
      }

      // Valider la quantité
      if (harvest.quantity <= 0) {
        throw new BadRequestException('La quantité doit être positive');
      }

      // Valider et convertir la quantité d'abord
      // Utiliser parseFloat pour éviter les problèmes de précision
      const quantity = parseFloat(String(harvest.quantity));
      if (isNaN(quantity) || quantity < 0) {
        throw new BadRequestException('La quantité doit être un nombre positif');
      }
      // decimal(10, 2) peut stocker jusqu'à 99999999.99
      if (quantity > 99999999.99) {
        throw new BadRequestException(
          `La quantité ne peut pas dépasser 99999999.99. Valeur reçue: ${quantity}`
        );
      }
      // Limiter à 2 décimales pour correspondre à decimal(10, 2)
      const quantityRounded = parseFloat(quantity.toFixed(2));

      // Construire l'objet avec seulement les champs essentiels d'abord
      const harvestData: Partial<HarvestEntity> = {
        farmerId: harvest.farmerId,
        productId: harvest.productId,
        quantity: quantityRounded, // Utiliser la valeur validée et arrondie
        harvestAt: new Date(harvest.harvestAt),
        proofHash: harvest.proofHash,
        // Status est requis (non nullable), utiliser la valeur fournie ou la valeur par défaut
        status: harvest.status || HarvestStatus.PENDING,
        verified: false,
      };

      // Ajouter les champs optionnels seulement s'ils sont fournis et non vides
      
      if (harvest.unit && harvest.unit.trim() !== '') {
        harvestData.unit = harvest.unit;
      }
      
      // S'assurer que les valeurs numériques sont dans les limites
      if (harvest.latitude !== undefined && harvest.latitude !== null) {
        // decimal(10, 7) peut stocker jusqu'à 999.9999999
        const lat = parseFloat(String(harvest.latitude));
        if (!isNaN(lat) && lat >= -999.9999999 && lat <= 999.9999999) {
          // Limiter à 7 décimales pour correspondre à decimal(10, 7)
          harvestData.latitude = parseFloat(lat.toFixed(7));
        } else {
          this.logger.warn(`Latitude hors limites: ${lat}, valeur ignorée`);
        }
      }
      
      if (harvest.longitude !== undefined && harvest.longitude !== null) {
        // decimal(10, 7) peut stocker jusqu'à 999.9999999
        const lng = parseFloat(String(harvest.longitude));
        if (!isNaN(lng) && lng >= -999.9999999 && lng <= 999.9999999) {
          // Limiter à 7 décimales pour correspondre à decimal(10, 7)
          harvestData.longitude = parseFloat(lng.toFixed(7));
        } else {
          this.logger.warn(`Longitude hors limites: ${lng}, valeur ignorée`);
        }
      }
      
      if (harvest.quality && harvest.quality.trim() !== '') {
        harvestData.quality = harvest.quality;
      }
      
      if (harvest.notes && harvest.notes.trim() !== '') {
        harvestData.notes = harvest.notes;
      }
      
      // Gérer le champ photos - convertir en JSON pour jsonb
      if (harvest.photos && Array.isArray(harvest.photos) && harvest.photos.length > 0) {
        const validPhotos = harvest.photos.filter(photo => photo && typeof photo === 'string' && photo.trim() !== '');
        if (validPhotos.length > 0) {
          harvestData.photos = validPhotos;
        }
      }
      
      if (harvest.weatherConditions && harvest.weatherConditions.trim() !== '') {
        harvestData.weatherConditions = harvest.weatherConditions;
      }
      
      if (harvest.harvestMethod && harvest.harvestMethod.trim() !== '') {
        harvestData.harvestMethod = harvest.harvestMethod;
      }
      
      if (harvest.storageLocation && harvest.storageLocation.trim() !== '') {
        harvestData.storageLocation = harvest.storageLocation;
      }
      
      if (harvest.batchNumber && harvest.batchNumber.trim() !== '') {
        harvestData.batchNumber = harvest.batchNumber;
      }
      
      if (harvest.certification && harvest.certification.trim() !== '') {
        harvestData.certification = harvest.certification;
      }
      
      if (harvest.estimatedValue !== undefined && harvest.estimatedValue !== null) {
        // decimal(12, 2) peut stocker jusqu'à 9999999999.99
        const value = parseFloat(String(harvest.estimatedValue));
        if (isNaN(value) || value < 0 || value > 9999999999.99) {
          throw new BadRequestException(
            `La valeur estimée doit être entre 0 et 9999999999.99. Valeur reçue: ${value}`
          );
        }
        // Limiter à 2 décimales pour correspondre à decimal(12, 2)
        harvestData.estimatedValue = parseFloat(value.toFixed(2));
      }
      
      if (harvest.cooperativeId && harvest.cooperativeId.trim() !== '') {
        harvestData.cooperativeId = harvest.cooperativeId;
      }

      // Logger les données avant création pour déboguer
      this.logger.debug(`Données à sauvegarder: ${JSON.stringify(harvestData, null, 2)}`);
      
      const newHarvest = this.harvestRepository.create(harvestData);
      
      // S'assurer que create retourne une seule entité, pas un array
      const harvestToSave = Array.isArray(newHarvest) ? newHarvest[0] : newHarvest;

      const savedHarvest = await this.harvestRepository.save(harvestToSave);
      this.logger.log(`Récolte créée avec succès: ${savedHarvest.id}`);
      return savedHarvest;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de la récolte: ${error.message}`,
        error.stack,
      );
      // Logger les données pour déboguer
      this.logger.error(`Données reçues: ${JSON.stringify(harvest, null, 2)}`);
      
      // Si c'est une erreur de base de données, la transformer en BadRequestException avec un message plus clair
      if (error.message && error.message.includes('column')) {
        throw new BadRequestException(
          `Erreur de base de données: ${error.message}. Vérifiez que la migration a été exécutée.`
        );
      }
      
      throw error;
    }
  }

  async getHarvestById(id: string): Promise<HarvestEntity> {
    const harvest = await this.harvestRepository.findOne({
      where: { id },
      relations: ['farmer', 'product', 'cooperative'],
    });
    if (!harvest) {
      throw new NotFoundException('Récolte introuvable');
    }
    return harvest;
  }

  async getHarvests(query: GetHarvestDto): Promise<HarvestResponseDto> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const sortBy = query.sortBy || 'harvestAt';
    const sortOrder = query.sortOrder || 'DESC';

    const qb = this.harvestRepository.createQueryBuilder('harvest');
    qb.leftJoinAndSelect('harvest.farmer', 'farmer');
    qb.leftJoinAndSelect('harvest.product', 'product');
    qb.leftJoinAndSelect('harvest.cooperative', 'cooperative');

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
    if (query.cooperativeId) {
      qb.andWhere('harvest.cooperativeId = :cooperativeId', {
        cooperativeId: query.cooperativeId,
      });
    }
    if (query.status) {
      qb.andWhere('harvest.status = :status', { status: query.status });
    }
    if (query.verified !== undefined) {
      qb.andWhere('harvest.verified = :verified', { verified: query.verified });
    }
    if (query.quality) {
      qb.andWhere('harvest.quality = :quality', { quality: query.quality });
    }
    if (query.minQuantity !== undefined) {
      qb.andWhere('harvest.quantity >= :minQuantity', {
        minQuantity: query.minQuantity,
      });
    }
    if (query.maxQuantity !== undefined) {
      qb.andWhere('harvest.quantity <= :maxQuantity', {
        maxQuantity: query.maxQuantity,
      });
    }
    if (query.startDate) {
      qb.andWhere('harvest.harvestAt >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }
    if (query.endDate) {
      qb.andWhere('harvest.harvestAt <= :endDate', {
        endDate: new Date(query.endDate),
      });
    }
    if (query.search) {
      qb.andWhere(
        '(harvest.proofHash ILIKE :search OR harvest.batchNumber ILIKE :search OR harvest.notes ILIKE :search)',
        {
          search: `%${query.search}%`,
        },
      );
    }

    // Tri
    if (sortBy === 'harvestAt') {
      qb.orderBy('harvest.harvestAt', sortOrder);
    } else if (sortBy === 'quantity') {
      qb.orderBy('harvest.quantity', sortOrder);
    } else if (sortBy === 'createdAt') {
      qb.orderBy('harvest.createdAt', sortOrder);
    } else {
      qb.orderBy('harvest.harvestAt', sortOrder);
    }

    // Pagination
    const skip = (page - 1) * limit;
    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async updateHarvest(
    id: string,
    harvest: UpdateHarvestDto,
  ): Promise<HarvestEntity> {
    this.logger.log(`Mise à jour de la récolte: ${id}`);

    const existingHarvest = await this.harvestRepository.findOne({
      where: { id },
    });

    if (!existingHarvest) {
      throw new NotFoundException('Récolte introuvable');
    }

    // Valider la quantité si fournie
    if (harvest.quantity !== undefined && harvest.quantity <= 0) {
      throw new BadRequestException('La quantité doit être positive');
    }

    const updatedHarvest = await this.harvestRepository.preload({
      id,
      ...harvest,
      harvestAt: harvest.harvestAt
        ? new Date(harvest.harvestAt)
        : undefined,
      farmer: harvest.farmerId ? ({ id: harvest.farmerId } as any) : undefined,
      product: harvest.productId
        ? ({ id: harvest.productId } as any)
        : undefined,
      cooperative: harvest.cooperativeId
        ? ({ id: harvest.cooperativeId } as any)
        : undefined,
    });

    if (!updatedHarvest) {
      throw new NotFoundException('Récolte introuvable');
    }

    const savedHarvest = await this.harvestRepository.save(updatedHarvest);
    this.logger.log(`Récolte mise à jour avec succès: ${id}`);
    return savedHarvest;
  }

  async deleteHarvest(id: string): Promise<void> {
    const result = await this.harvestRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException('Récolte introuvable');
    }
    this.logger.log(`Récolte supprimée: ${id}`);
  }

  async verifyHarvest(id: string, verifiedBy: string): Promise<HarvestEntity> {
    this.logger.log(`Vérification de la récolte: ${id} par ${verifiedBy}`);

    const harvest = await this.harvestRepository.findOne({ where: { id } });
    if (!harvest) {
      throw new NotFoundException('Récolte introuvable');
    }

    harvest.verified = true;
    harvest.verifiedAt = new Date();
    harvest.verifiedBy = verifiedBy;
    harvest.status = HarvestStatus.VERIFIED;

    const savedHarvest = await this.harvestRepository.save(harvest);
    this.logger.log(`Récolte vérifiée avec succès: ${id}`);
    return savedHarvest;
  }

  async updateHarvestStatus(
    id: string,
    status: HarvestStatus,
  ): Promise<HarvestEntity> {
    this.logger.log(`Mise à jour du statut de la récolte: ${id} -> ${status}`);

    const harvest = await this.harvestRepository.findOne({ where: { id } });
    if (!harvest) {
      throw new NotFoundException('Récolte introuvable');
    }

    harvest.status = status;
    if (status === HarvestStatus.VERIFIED) {
      harvest.verified = true;
      harvest.verifiedAt = new Date();
    }

    const savedHarvest = await this.harvestRepository.save(harvest);
    this.logger.log(`Statut de la récolte mis à jour: ${id}`);
    return savedHarvest;
  }

  async getHarvestsByFarmer(farmerId: string): Promise<HarvestEntity[]> {
    return this.harvestRepository.find({
      where: { farmerId },
      relations: ['product', 'cooperative'],
      order: { harvestAt: 'DESC' },
    });
  }

  async getHarvestsByProduct(productId: string): Promise<HarvestEntity[]> {
    return this.harvestRepository.find({
      where: { productId },
      relations: ['farmer', 'cooperative'],
      order: { harvestAt: 'DESC' },
    });
  }

  async getHarvestStats(id: string): Promise<any> {
    const harvest = await this.getHarvestById(id);
    return {
      id: harvest.id,
      quantity: harvest.quantity,
      unit: harvest.unit || 'kg',
      status: harvest.status,
      verified: harvest.verified,
      estimatedValue: harvest.estimatedValue,
      quality: harvest.quality,
      harvestAt: harvest.harvestAt,
    };
  }

  async getGlobalStats(): Promise<any> {
    const [totalHarvests, verifiedHarvests] = await Promise.all([
      this.harvestRepository.count(),
      this.harvestRepository.count({ where: { verified: true } }),
    ]);

    const quantityResult = await this.harvestRepository
      .createQueryBuilder('harvest')
      .select('SUM(harvest.quantity)', 'totalQuantity')
      .getRawOne();

    const valueResult = await this.harvestRepository
      .createQueryBuilder('harvest')
      .select('SUM(harvest.estimatedValue)', 'totalValue')
      .where('harvest.estimatedValue IS NOT NULL')
      .getRawOne();

    return {
      totalHarvests,
      verifiedHarvests,
      totalQuantity: parseFloat(quantityResult?.totalQuantity || '0'),
      totalValue: parseFloat(valueResult?.totalValue || '0'),
    };
  }
}
