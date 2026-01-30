import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolFundEntity } from '../entities/school-fund.entity';
import {
  CreateSchoolFundDto,
  UpdateSchoolFundDto,
  GetSchoolFundDto,
} from '../dto/school-fund.dto';
import { SchoolStatus } from '../interfaces/ischool-fund';

@Injectable()
export class SchoolFundRepository {
  constructor(
    @InjectRepository(SchoolFundEntity)
    private readonly repository: Repository<SchoolFundEntity>,
  ) {}

  async create(dto: CreateSchoolFundDto): Promise<SchoolFundEntity> {
    const school = this.repository.create({
      ...dto,
      totalFundedADA: 0,
      totalDisbursedADA: 0,
      status: SchoolStatus.PENDING,
      lastUpdate: new Date(),
    });
    return this.repository.save(school);
  }

  async findById(id: string): Promise<SchoolFundEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(query: GetSchoolFundDto): Promise<SchoolFundEntity[]> {
    const qb = this.repository.createQueryBuilder('school');

    if (query.id) qb.andWhere('school.id = :id', { id: query.id });
    if (query.schoolName)
      qb.andWhere('school.schoolName ILIKE :name', {
        name: `%${query.schoolName}%`,
      });
    if (query.province)
      qb.andWhere('school.province = :province', { province: query.province });
    if (query.status)
      qb.andWhere('school.status = :status', { status: query.status });
    if (query.search)
      qb.andWhere(
        '(school.schoolName ILIKE :search OR school.province ILIKE :search OR school.city ILIKE :search)',
        { search: `%${query.search}%` },
      );

    return qb.orderBy('school.schoolName', 'ASC').getMany();
  }

  async findByProvince(province: string): Promise<SchoolFundEntity[]> {
    return this.repository.find({
      where: { province },
      order: { schoolName: 'ASC' },
    });
  }

  async findActive(): Promise<SchoolFundEntity[]> {
    return this.repository.find({
      where: { status: SchoolStatus.ACTIVE },
      order: { schoolName: 'ASC' },
    });
  }

  async update(
    id: string,
    dto: UpdateSchoolFundDto,
  ): Promise<SchoolFundEntity | null> {
    await this.repository.update(id, {
      ...dto,
      lastUpdate: new Date(),
    });
    return this.findById(id);
  }

  async addFunding(
    id: string,
    amount: number,
  ): Promise<SchoolFundEntity | null> {
    const school = await this.findById(id);
    if (!school) return null;

    school.totalFundedADA = Number(school.totalFundedADA) + amount;
    school.lastUpdate = new Date();

    return this.repository.save(school);
  }

  async disburse(id: string, amount: number): Promise<SchoolFundEntity | null> {
    const school = await this.findById(id);
    if (!school) return null;

    school.totalDisbursedADA = Number(school.totalDisbursedADA) + amount;
    school.lastUpdate = new Date();

    return this.repository.save(school);
  }

  async activate(id: string): Promise<SchoolFundEntity | null> {
    await this.repository.update(id, {
      status: SchoolStatus.ACTIVE,
      lastUpdate: new Date(),
    });
    return this.findById(id);
  }

  async deactivate(id: string): Promise<SchoolFundEntity | null> {
    await this.repository.update(id, {
      status: SchoolStatus.INACTIVE,
      lastUpdate: new Date(),
    });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async getTotalFunded(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('school')
      .select('SUM(school.totalFundedADA)', 'total')
      .getRawOne();

    return Number(result?.total || 0);
  }

  async getTotalDisbursed(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('school')
      .select('SUM(school.totalDisbursedADA)', 'total')
      .getRawOne();

    return Number(result?.total || 0);
  }

  async getProvinceStats(): Promise<
    { province: string; schools: number; totalFunded: number }[]
  > {
    return this.repository
      .createQueryBuilder('school')
      .select('school.province', 'province')
      .addSelect('COUNT(*)', 'schools')
      .addSelect('SUM(school.totalFundedADA)', 'totalFunded')
      .groupBy('school.province')
      .orderBy('totalFunded', 'DESC')
      .getRawMany();
  }
}
