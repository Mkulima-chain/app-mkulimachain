import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SchoolFundRepository } from '../repositories/school-fund.repository';
import { SchoolFundEntity } from '../entities/school-fund.entity';
import {
  CreateSchoolFundDto,
  UpdateSchoolFundDto,
  GetSchoolFundDto,
} from '../dto/school-fund.dto';
import { SchoolStatus } from '../interfaces/ischool-fund';

@Injectable()
export class SchoolFundService {
  constructor(private readonly repository: SchoolFundRepository) {}

  async create(dto: CreateSchoolFundDto): Promise<SchoolFundEntity> {
    return this.repository.create(dto);
  }

  async findById(id: string): Promise<SchoolFundEntity> {
    const school = await this.repository.findById(id);
    if (!school) {
      throw new NotFoundException(`School fund with ID ${id} not found`);
    }
    return school;
  }

  async findAll(query: GetSchoolFundDto): Promise<SchoolFundEntity[]> {
    return this.repository.findAll(query);
  }

  async findByProvince(province: string): Promise<SchoolFundEntity[]> {
    return this.repository.findByProvince(province);
  }

  async findActive(): Promise<SchoolFundEntity[]> {
    return this.repository.findActive();
  }

  async update(
    id: string,
    dto: UpdateSchoolFundDto,
  ): Promise<SchoolFundEntity> {
    const school = await this.repository.update(id, dto);
    if (!school) {
      throw new NotFoundException(`School fund with ID ${id} not found`);
    }
    return school;
  }

  async addFunding(id: string, amount: number): Promise<SchoolFundEntity> {
    if (amount <= 0) {
      throw new BadRequestException('Funding amount must be positive');
    }

    const school = await this.findById(id);

    if (school.status !== SchoolStatus.ACTIVE) {
      throw new BadRequestException(
        `School is not active. Current status: ${school.status}`,
      );
    }

    const funded = await this.repository.addFunding(id, amount);
    if (!funded) {
      throw new NotFoundException(`School fund with ID ${id} not found`);
    }
    return funded;
  }

  async disburse(id: string, amount: number): Promise<SchoolFundEntity> {
    if (amount <= 0) {
      throw new BadRequestException('Disbursement amount must be positive');
    }

    const school = await this.findById(id);
    const availableBalance =
      Number(school.totalFundedADA) - Number(school.totalDisbursedADA);

    if (amount > availableBalance) {
      throw new BadRequestException(
        `Insufficient funds. Available: ${availableBalance} ADA`,
      );
    }

    const disbursed = await this.repository.disburse(id, amount);
    if (!disbursed) {
      throw new NotFoundException(`School fund with ID ${id} not found`);
    }
    return disbursed;
  }

  async activate(id: string): Promise<SchoolFundEntity> {
    const school = await this.repository.activate(id);
    if (!school) {
      throw new NotFoundException(`School fund with ID ${id} not found`);
    }
    return school;
  }

  async deactivate(id: string): Promise<SchoolFundEntity> {
    const school = await this.repository.deactivate(id);
    if (!school) {
      throw new NotFoundException(`School fund with ID ${id} not found`);
    }
    return school;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }

  async getStats(): Promise<{
    totalSchools: number;
    activeSchools: number;
    totalFunded: number;
    totalDisbursed: number;
    availableBalance: number;
  }> {
    const schools = await this.repository.findAll({});
    const totalFunded = await this.repository.getTotalFunded();
    const totalDisbursed = await this.repository.getTotalDisbursed();

    return {
      totalSchools: schools.length,
      activeSchools: schools.filter((s) => s.status === SchoolStatus.ACTIVE)
        .length,
      totalFunded,
      totalDisbursed,
      availableBalance: totalFunded - totalDisbursed,
    };
  }

  async getProvinceStats(): Promise<
    { province: string; schools: number; totalFunded: number }[]
  > {
    return this.repository.getProvinceStats();
  }

  getAvailableBalance(school: SchoolFundEntity): number {
    return Number(school.totalFundedADA) - Number(school.totalDisbursedADA);
  }
}
