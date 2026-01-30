import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitEntity } from '../entities/unit.entity';
import { CreateUnitDto, UpdateUnitDto } from '../dto/settings.dto';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(UnitEntity)
    private unitRepository: Repository<UnitEntity>,
  ) {}

  async create(unit: CreateUnitDto): Promise<UnitEntity> {
    const newUnit = this.unitRepository.create(unit);
    return this.unitRepository.save(newUnit);
  }

  async update(id: string, unit: UpdateUnitDto): Promise<UnitEntity> {
    const updatedUnit = await this.unitRepository.preload({
      id,
      ...unit,
    });
    if (!updatedUnit) {
      throw new Error('Unit not found');
    }
    return this.unitRepository.save(updatedUnit);
  }

  async findOne(id: string): Promise<UnitEntity> {
    return this.unitRepository.findOne({ where: { id } });
  }

  async findAll(activeOnly?: boolean): Promise<UnitEntity[]> {
    const where = activeOnly ? { isActive: true } : {};
    return this.unitRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.unitRepository.softDelete(id);
  }
}
