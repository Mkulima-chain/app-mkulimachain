import { Injectable } from '@nestjs/common';
import {
  CreateCooperativeDto,
  UpdateCooperativeDto,
} from '../dto/cooperatives.dto';
import { CooperativeEntity } from '../entities/entities';
import { ICooperative } from '../interfaces/icooperative';
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
    return this.cooperativeRepository.save(updatedCooperative);
  }

  async getCooperativeById(id: string): Promise<CooperativeEntity> {
    return this.cooperativeRepository.findOne({ where: { id } });
  }

  async getCooperatives(
    cooperative: Partial<ICooperative>,
  ): Promise<CooperativeEntity[]> {
    return this.cooperativeRepository.find({ where: cooperative });
  }

  async deleteCooperative(id: string): Promise<void> {
    await this.cooperativeRepository.softDelete(id);
  }
}
