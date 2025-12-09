import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateCooperativeDto,
  GetCooperativeDto,
  UpdateCooperativeDto,
} from '../dto/cooperatives.dto';
import { CooperativeEntity } from '../entities/entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(CooperativeEntity)
    private cooperativeRepository: Repository<CooperativeEntity>,
  ) {}

  async createCooperative(
    cooperative: CreateCooperativeDto,
  ): Promise<CooperativeEntity> {
    const newCooperative = this.cooperativeRepository.create(cooperative);
    return this.cooperativeRepository.save(newCooperative);
  }

  async updateCooperative(
    id: string,
    cooperative: UpdateCooperativeDto,
  ): Promise<CooperativeEntity> {
    const updatedCooperative = await this.cooperativeRepository.preload({
      id,
      ...cooperative,
    });
    if (!updatedCooperative) {
      throw new NotFoundException('Coopérative introuvable');
    }
    return this.cooperativeRepository.save(updatedCooperative);
  }

  async getCooperativeById(id: string): Promise<CooperativeEntity> {
    const cooperative = await this.cooperativeRepository.findOne({
      where: { id },
    });
    if (!cooperative) {
      throw new NotFoundException('Coopérative introuvable');
    }
    return cooperative;
  }

  async getCooperatives(
    query: GetCooperativeDto,
  ): Promise<CooperativeEntity[]> {
    const qb = this.cooperativeRepository.createQueryBuilder('cooperative');

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
        `(cooperative.name ILIKE :search OR cooperative.location ILIKE :search OR cooperative.leader ILIKE :search)`,
        { search: `%${query.search}%` },
      );
    }

    qb.orderBy('cooperative.createdAt', 'DESC');

    return qb.getMany();
  }

  async deleteCooperative(id: string): Promise<void> {
    const result = await this.cooperativeRepository.softDelete(id);
    if (!result.affected) {
      throw new NotFoundException('Coopérative introuvable');
    }
  }
}
