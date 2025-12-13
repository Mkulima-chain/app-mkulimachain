import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  CreateCooperativeDto,
  GetCooperativeDto,
  UpdateCooperativeDto,
} from '../dto/cooperatives.dto';
import {
  CooperativeEntity,
  CooperativeStatus,
} from '../entities/entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    @InjectRepository(CooperativeEntity)
    private cooperativeRepository: Repository<CooperativeEntity>,
  ) {}

  async createCooperative(
    cooperative: CreateCooperativeDto,
  ): Promise<CooperativeEntity> {
    this.logger.log(`Création d'une nouvelle coopérative: ${cooperative.name}`);

    try {
      // Vérifier si le nom existe déjà
      const existingCooperativeByName = await this.cooperativeRepository.findOne({
        where: { name: cooperative.name },
      });
      if (existingCooperativeByName) {
        this.logger.warn(
          `Tentative de création avec nom existant: ${cooperative.name}`,
        );
        throw new BadRequestException(
          'Une coopérative avec ce nom existe déjà',
        );
      }

      // Vérifier si l'email existe déjà (si fourni)
      if (cooperative.email) {
        const existingCooperativeByEmail =
          await this.cooperativeRepository.findOne({
            where: { email: cooperative.email },
          });
        if (existingCooperativeByEmail) {
          this.logger.warn(
            `Tentative de création avec email existant: ${cooperative.email}`,
          );
          throw new BadRequestException(
            'Une coopérative avec cet email existe déjà',
          );
        }
      }

      // Vérifier si le téléphone existe déjà (si fourni)
      if (cooperative.phone) {
        const existingCooperativeByPhone =
          await this.cooperativeRepository.findOne({
            where: { phone: cooperative.phone },
          });
        if (existingCooperativeByPhone) {
          this.logger.warn(
            `Tentative de création avec téléphone existant: ${cooperative.phone}`,
          );
          throw new BadRequestException(
            'Une coopérative avec ce numéro de téléphone existe déjà',
          );
        }
      }

      // Vérifier si le numéro d'enregistrement existe déjà (si fourni)
      if (cooperative.registrationNumber) {
        const existingCooperativeByRegistration =
          await this.cooperativeRepository.findOne({
            where: { registrationNumber: cooperative.registrationNumber },
          });
        if (existingCooperativeByRegistration) {
          this.logger.warn(
            `Tentative de création avec numéro d'enregistrement existant: ${cooperative.registrationNumber}`,
          );
          throw new BadRequestException(
            'Une coopérative avec ce numéro d\'enregistrement existe déjà',
          );
        }
      }

      // Créer l'entité avec les valeurs par défaut
      const newCooperative = this.cooperativeRepository.create({
        ...cooperative,
        status: cooperative.status || CooperativeStatus.ACTIVE,
        verified: false,
        memberCount: cooperative.memberCount || 0,
      });

      const savedCooperative =
        await this.cooperativeRepository.save(newCooperative);
      this.logger.log(
        `Coopérative créée avec succès: ${savedCooperative.id}`,
      );
      return savedCooperative;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création de la coopérative: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async updateCooperative(
    id: string,
    cooperative: UpdateCooperativeDto,
  ): Promise<CooperativeEntity> {
    this.logger.log(`Mise à jour de la coopérative: ${id}`);

    const existingCooperative = await this.cooperativeRepository.findOne({
      where: { id },
    });

    if (!existingCooperative) {
      this.logger.warn(`Tentative de mise à jour d'une coopérative inexistante: ${id}`);
      throw new NotFoundException(`Coopérative avec l'ID ${id} non trouvée`);
    }

    // Vérifier si le nom existe déjà (sauf pour la coopérative actuelle)
    if (cooperative.name && cooperative.name !== existingCooperative.name) {
      const cooperativeWithName = await this.cooperativeRepository.findOne({
        where: { name: cooperative.name },
      });
      if (cooperativeWithName) {
        throw new BadRequestException(
          'Une coopérative avec ce nom existe déjà',
        );
      }
    }

    // Vérifier si l'email existe déjà (sauf pour la coopérative actuelle)
    if (
      cooperative.email &&
      cooperative.email !== existingCooperative.email
    ) {
      const cooperativeWithEmail = await this.cooperativeRepository.findOne({
        where: { email: cooperative.email },
      });
      if (cooperativeWithEmail) {
        throw new BadRequestException(
          'Une coopérative avec cet email existe déjà',
        );
      }
    }

    // Vérifier si le téléphone existe déjà (sauf pour la coopérative actuelle)
    if (
      cooperative.phone &&
      cooperative.phone !== existingCooperative.phone
    ) {
      const cooperativeWithPhone = await this.cooperativeRepository.findOne({
        where: { phone: cooperative.phone },
      });
      if (cooperativeWithPhone) {
        throw new BadRequestException(
          'Une coopérative avec ce numéro de téléphone existe déjà',
        );
      }
    }

    const updatedCooperative = await this.cooperativeRepository.preload({
      id,
      ...cooperative,
    });

    if (!updatedCooperative) {
      throw new NotFoundException(`Coopérative avec l'ID ${id} non trouvée`);
    }

    const saved = await this.cooperativeRepository.save(updatedCooperative);
    this.logger.log(`Coopérative mise à jour avec succès: ${id}`);
    return saved;
  }

  async getCooperativeById(id: string): Promise<CooperativeEntity> {
    const cooperative = await this.cooperativeRepository.findOne({
      where: { id },
      relations: ['farmers'],
    });

    if (!cooperative) {
      throw new NotFoundException(`Coopérative avec l'ID ${id} non trouvée`);
    }

    return cooperative;
  }

  async getCooperatives(query: GetCooperativeDto): Promise<{
    data: CooperativeEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.cooperativeRepository
      .createQueryBuilder('cooperative')
      .leftJoinAndSelect('cooperative.farmers', 'farmers');

    if (query.id) {
      qb.andWhere('cooperative.id = :id', { id: query.id });
    }
    if (query.name) {
      qb.andWhere('cooperative.name ILIKE :name', {
        name: `%${query.name}%`,
      });
    }
    if (query.location) {
      qb.andWhere('cooperative.location ILIKE :location', {
        location: `%${query.location}%`,
      });
    }
    if (query.leader) {
      qb.andWhere('cooperative.leader ILIKE :leader', {
        leader: `%${query.leader}%`,
      });
    }

    if (query.search) {
      qb.andWhere(
        `(cooperative.name ILIKE :search OR cooperative.location ILIKE :search OR cooperative.leader ILIKE :search OR cooperative.email ILIKE :search OR cooperative.phone ILIKE :search)`,
        { search: `%${query.search}%` },
      );
    }

    // Filtrer par statut
    if (query.status) {
      qb.andWhere('cooperative.status = :status', { status: query.status });
    }

    // Filtrer par vérifié
    if (query.verified !== undefined) {
      qb.andWhere('cooperative.verified = :verified', {
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
          // Note: Cette fonctionnalité nécessite PostGIS et la colonne locationPoint
          qb.andWhere(
            `ST_DWithin(
              cooperative.locationPoint::geography,
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

    qb.orderBy('cooperative.createdAt', 'DESC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    // Calculer le nombre de membres pour chaque coopérative
    data.forEach((coop) => {
      coop.memberCount = coop.farmers?.length || 0;
    });

    this.logger.log(
      `Recherche de coopératives: ${total} résultats trouvés (page ${page})`,
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteCooperative(id: string): Promise<void> {
    this.logger.log(`Suppression de la coopérative: ${id}`);

    const cooperative = await this.cooperativeRepository.findOne({
      where: { id },
    });

    if (!cooperative) {
      this.logger.warn(
        `Tentative de suppression d'une coopérative inexistante: ${id}`,
      );
      throw new NotFoundException(`Coopérative avec l'ID ${id} non trouvée`);
    }

    await this.cooperativeRepository.softDelete(id);
    this.logger.log(`Coopérative supprimée avec succès: ${id}`);
  }

  async verifyCooperative(
    id: string,
    verifiedBy: string | null,
  ): Promise<CooperativeEntity> {
    this.logger.log(
      `Vérification de la coopérative: ${id} par ${verifiedBy || 'système'}`,
    );

    const cooperative = await this.cooperativeRepository.findOne({
      where: { id },
    });

    if (!cooperative) {
      throw new NotFoundException(`Coopérative avec l'ID ${id} non trouvée`);
    }

    cooperative.verified = true;
    cooperative.verifiedAt = new Date();
    cooperative.verifiedBy = verifiedBy || undefined; // null devient undefined pour TypeORM

    const updatedCooperative = await this.cooperativeRepository.save(cooperative);
    this.logger.log(`Coopérative vérifiée avec succès: ${id}`);
    return updatedCooperative;
  }

  async updateCooperativeStatus(
    id: string,
    status: CooperativeStatus,
  ): Promise<CooperativeEntity> {
    this.logger.log(`Mise à jour du statut de la coopérative ${id}: ${status}`);

    const cooperative = await this.cooperativeRepository.findOne({
      where: { id },
    });

    if (!cooperative) {
      throw new NotFoundException(`Coopérative avec l'ID ${id} non trouvée`);
    }

    cooperative.status = status;
    const updatedCooperative = await this.cooperativeRepository.save(cooperative);
    this.logger.log(`Statut mis à jour avec succès: ${id}`);
    return updatedCooperative;
  }

  async getCooperativeStats(id: string) {
    const cooperative = await this.cooperativeRepository.findOne({
      where: { id },
      relations: ['farmers'],
    });

    if (!cooperative) {
      throw new NotFoundException(`Coopérative avec l'ID ${id} non trouvée`);
    }

    const totalMembers = cooperative.farmers?.length || 0;
    const activeMembers =
      cooperative.farmers?.filter((f) => f.status === 'active').length || 0;
    const verifiedMembers =
      cooperative.farmers?.filter((f) => f.verified).length || 0;

    return {
      totalMembers,
      activeMembers,
      verifiedMembers,
      memberCount: totalMembers,
    };
  }
}
