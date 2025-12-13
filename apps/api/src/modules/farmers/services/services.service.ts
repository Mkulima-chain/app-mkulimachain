import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FarmerEntity, FarmerStatus } from '../entities/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import {
  CreateFarmerDto,
  UpdateFarmerDto,
  GetFarmerDto,
} from '../dto/farmers.dto';
import { IFarmer } from '../interfaces/ifarmers';
import { CooperativeEntity } from '@/modules/cooperatives/entities/entities';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    @InjectRepository(FarmerEntity)
    private farmerRepository: Repository<FarmerEntity>,
    @InjectRepository(CooperativeEntity)
    private cooperativeRepository: Repository<CooperativeEntity>,
  ) {}

  async createFarmer(farmer: CreateFarmerDto): Promise<FarmerEntity> {
    this.logger.log(`Création d'un nouvel agriculteur: ${farmer.name}`);

    try {
      // Vérifier si la coopérative existe si fournie
      if (farmer.cooperativeId) {
        const cooperative = await this.cooperativeRepository.findOne({
          where: { id: farmer.cooperativeId },
        });
        if (!cooperative) {
          this.logger.warn(
            `Tentative de création avec coopérative inexistante: ${farmer.cooperativeId}`,
          );
          throw new BadRequestException(
            `La coopérative avec l'ID ${farmer.cooperativeId} n'existe pas`,
          );
        }
      }

      // Vérifier si le téléphone existe déjà
      const existingFarmerByPhone = await this.farmerRepository.findOne({
        where: { phone: farmer.phone },
      });
      if (existingFarmerByPhone) {
        this.logger.warn(
          `Tentative de création avec téléphone existant: ${farmer.phone}`,
        );
        throw new BadRequestException(
          'Un agriculteur avec ce numéro de téléphone existe déjà',
        );
      }

      // Vérifier si l'email existe déjà (si fourni)
      if (farmer.email) {
        const existingFarmerByEmail = await this.farmerRepository.findOne({
          where: { email: farmer.email },
        });
        if (existingFarmerByEmail) {
          this.logger.warn(
            `Tentative de création avec email existant: ${farmer.email}`,
          );
          throw new BadRequestException(
            'Un agriculteur avec cet email existe déjà',
          );
        }
      }

      // Vérifier si le numéro d'identification existe déjà (si fourni)
      if (farmer.identificationNumber) {
        const existingFarmerByIdentification =
          await this.farmerRepository.findOne({
            where: { identificationNumber: farmer.identificationNumber },
          });
        if (existingFarmerByIdentification) {
          this.logger.warn(
            `Tentative de création avec numéro d'identification existant: ${farmer.identificationNumber}`,
          );
          throw new BadRequestException(
            'Un agriculteur avec ce numéro d\'identification existe déjà',
          );
        }
      }

      // Créer l'entité avec les valeurs par défaut
      const newFarmer = this.farmerRepository.create({
        ...farmer,
        status: farmer.status || FarmerStatus.ACTIVE,
        verified: false,
      });

      // Note: La colonne location (PostGIS) est désactivée car PostGIS n'est pas installé
      // Si PostGIS est installé plus tard, décommentez la colonne dans l'entité
      // et utilisez le code suivant pour créer la géométrie :
      // if (farmer.latitude && farmer.longitude) {
      //   try {
      //     newFarmer.location = {
      //       type: 'Point',
      //       coordinates: [farmer.longitude, farmer.latitude],
      //     };
      //   } catch (error) {
      //     this.logger.warn('Impossible de créer la géométrie PostGIS', error);
      //   }
      // }

      const savedFarmer = await this.farmerRepository.save(newFarmer);
      this.logger.log(`Agriculteur créé avec succès: ${savedFarmer.id}`);
      return savedFarmer;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de l'agriculteur: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateFarmer(
    id: string,
    farmer: UpdateFarmerDto,
  ): Promise<FarmerEntity> {
    const existingFarmer = await this.farmerRepository.findOne({
      where: { id },
    });

    if (!existingFarmer) {
      throw new NotFoundException(`Agriculteur avec l'ID ${id} non trouvé`);
    }

    // Vérifier si la coopérative existe si fournie
    if (farmer.cooperativeId) {
      const cooperative = await this.cooperativeRepository.findOne({
        where: { id: farmer.cooperativeId },
      });
      if (!cooperative) {
        throw new BadRequestException(
          `La coopérative avec l'ID ${farmer.cooperativeId} n'existe pas`,
        );
      }
    }

    // Vérifier si le téléphone existe déjà (sauf pour l'agriculteur actuel)
    if (farmer.phone && farmer.phone !== existingFarmer.phone) {
      const farmerWithPhone = await this.farmerRepository.findOne({
        where: { phone: farmer.phone },
      });
      if (farmerWithPhone) {
        throw new BadRequestException(
          'Un agriculteur avec ce numéro de téléphone existe déjà',
        );
      }
    }

    const updatedFarmer = await this.farmerRepository.preload({
      id,
      ...farmer,
    });

    if (!updatedFarmer) {
      throw new NotFoundException(`Agriculteur avec l'ID ${id} non trouvé`);
    }

    return this.farmerRepository.save(updatedFarmer);
  }

  async getFarmerById(id: string): Promise<FarmerEntity> {
    const farmer = await this.farmerRepository.findOne({
      where: { id },
      relations: ['cooperative', 'harvests', 'loans', 'creditScore'],
    });

    if (!farmer) {
      throw new NotFoundException(`Agriculteur avec l'ID ${id} non trouvé`);
    }

    return farmer;
  }

  async getFarmers(query: GetFarmerDto): Promise<{
    data: FarmerEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.farmerRepository
      .createQueryBuilder('farmer')
      .leftJoinAndSelect('farmer.cooperative', 'cooperative');

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
    if (query.cooperativeId) {
      qb.andWhere('farmer.cooperativeId = :cooperativeId', {
        cooperativeId: query.cooperativeId,
      });
    }

    if (query.search) {
      qb.andWhere(
        `(farmer.name ILIKE :search OR farmer.phone ILIKE :search OR farmer.email ILIKE :search OR farmer.city ILIKE :search OR farmer.state ILIKE :search OR cooperative.name ILIKE :search)`,
        { search: `%${query.search}%` },
      );
    }

    // Filtrer par statut
    if (query.status) {
      qb.andWhere('farmer.status = :status', { status: query.status });
    }

    // Filtrer par vérifié
    if (query.verified !== undefined) {
      qb.andWhere('farmer.verified = :verified', {
        verified: query.verified,
      });
    }

    // Recherche géospatiale (si PostGIS est disponible)
    if (query.locationSearch) {
      try {
        const locationData = JSON.parse(query.locationSearch);
        if (
          locationData.latitude &&
          locationData.longitude &&
          locationData.radius
        ) {
          // Utiliser ST_DWithin pour rechercher dans un rayon
          qb.andWhere(
            `ST_DWithin(
              farmer.location::geography,
              ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
              :radius * 1000
            )`,
            {
              lat: locationData.latitude,
              lng: locationData.longitude,
              radius: locationData.radius,
            },
          );
        }
      } catch (error) {
        this.logger.warn(
          'Erreur lors du parsing de locationSearch',
          error,
        );
      }
    }

    qb.orderBy('farmer.createdAt', 'DESC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    this.logger.log(
      `Recherche d'agriculteurs: ${total} résultats trouvés (page ${page})`,
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteFarmer(id: string): Promise<void> {
    this.logger.log(`Suppression de l'agriculteur: ${id}`);

    const farmer = await this.farmerRepository.findOne({ where: { id } });

    if (!farmer) {
      this.logger.warn(`Tentative de suppression d'un agriculteur inexistant: ${id}`);
      throw new NotFoundException(`Agriculteur avec l'ID ${id} non trouvé`);
    }

    await this.farmerRepository.softDelete(id);
    this.logger.log(`Agriculteur supprimé avec succès: ${id}`);
  }

  async verifyFarmer(
    id: string,
    verifiedBy: string | null,
  ): Promise<FarmerEntity> {
    this.logger.log(
      `Vérification de l'agriculteur: ${id} par ${verifiedBy || 'système'}`,
    );

    const farmer = await this.farmerRepository.findOne({ where: { id } });

    if (!farmer) {
      throw new NotFoundException(`Agriculteur avec l'ID ${id} non trouvé`);
    }

    farmer.verified = true;
    farmer.verifiedAt = new Date();
    farmer.verifiedBy = verifiedBy || undefined; // null devient undefined pour TypeORM

    const updatedFarmer = await this.farmerRepository.save(farmer);
    this.logger.log(`Agriculteur vérifié avec succès: ${id}`);
    return updatedFarmer;
  }

  async updateFarmerStatus(
    id: string,
    status: FarmerStatus,
  ): Promise<FarmerEntity> {
    this.logger.log(`Mise à jour du statut de l'agriculteur ${id}: ${status}`);

    const farmer = await this.farmerRepository.findOne({ where: { id } });

    if (!farmer) {
      throw new NotFoundException(`Agriculteur avec l'ID ${id} non trouvé`);
    }

    farmer.status = status;
    const updatedFarmer = await this.farmerRepository.save(farmer);
    this.logger.log(`Statut mis à jour avec succès: ${id}`);
    return updatedFarmer;
  }

  async getFarmerStats(id: string) {
    const farmer = await this.farmerRepository.findOne({
      where: { id },
      relations: ['harvests', 'loans', 'creditScore'],
    });

    if (!farmer) {
      throw new NotFoundException(`Agriculteur avec l'ID ${id} non trouvé`);
    }

    const totalHarvests = farmer.harvests?.length || 0;
    const totalHarvestQuantity =
      farmer.harvests?.reduce((sum, h) => sum + Number(h.quantity), 0) || 0;
    const activeLoans =
      farmer.loans?.filter((l) => l.status === 'active').length || 0;
    const totalLoanAmount =
      farmer.loans
        ?.filter((l) => l.status === 'active')
        .reduce((sum, l) => sum + Number(l.amountADA), 0) || 0;
    const creditScore = farmer.creditScore?.score || 0;

    return {
      totalHarvests,
      totalHarvestQuantity,
      activeLoans,
      totalLoanAmount,
      creditScore,
    };
  }
}
