import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { CreditScoreEntity } from '../entities/credit-score.entity';
import {
  CreateCreditScoreDto,
  UpdateCreditScoreDto,
  GetCreditScoreDto,
} from '../dto/credit-score.dto';
import { FarmerEntity } from '@/modules/farmers/entities/entities';

@Injectable()
export class CreditScoreRepository {
  constructor(
    @InjectRepository(CreditScoreEntity)
    private readonly repository: Repository<CreditScoreEntity>,
    @InjectRepository(FarmerEntity)
    private readonly farmerRepository: Repository<FarmerEntity>,
  ) {}

  async create(dto: CreateCreditScoreDto): Promise<CreditScoreEntity> {
    const farmer = await this.farmerRepository.findOneBy({ id: dto.farmerId });

    const creditScore = this.repository.create({
      farmer: farmer!,
      score: dto.score || 0,
      harvestCount: 0,
      totalHarvestValue: 0,
      loanRepaymentRate: 0,
      lastUpdate: new Date(),
    });

    return this.repository.save(creditScore);
  }

  async findById(id: string): Promise<CreditScoreEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['farmer'],
    });
  }

  async findByFarmerId(farmerId: string): Promise<CreditScoreEntity | null> {
    return this.repository.findOne({
      where: { farmer: { id: farmerId } },
      relations: ['farmer'],
    });
  }

  async findAll(query: GetCreditScoreDto): Promise<CreditScoreEntity[]> {
    const qb = this.repository
      .createQueryBuilder('cs')
      .leftJoinAndSelect('cs.farmer', 'farmer');

    if (query.id) qb.andWhere('cs.id = :id', { id: query.id });
    if (query.farmerId)
      qb.andWhere('farmer.id = :farmerId', { farmerId: query.farmerId });
    if (query.minScore !== undefined && query.maxScore !== undefined) {
      qb.andWhere('cs.score BETWEEN :min AND :max', {
        min: query.minScore,
        max: query.maxScore,
      });
    } else if (query.minScore !== undefined) {
      qb.andWhere('cs.score >= :min', { min: query.minScore });
    } else if (query.maxScore !== undefined) {
      qb.andWhere('cs.score <= :max', { max: query.maxScore });
    }

    return qb.orderBy('cs.score', 'DESC').getMany();
  }

  async update(
    id: string,
    dto: UpdateCreditScoreDto,
  ): Promise<CreditScoreEntity | null> {
    await this.repository.update(id, {
      ...dto,
      lastUpdate: new Date(),
    });
    return this.findById(id);
  }

  async incrementHarvest(
    farmerId: string,
    harvestValue: number,
  ): Promise<CreditScoreEntity | null> {
    const creditScore = await this.findByFarmerId(farmerId);
    if (!creditScore) return null;

    creditScore.harvestCount += 1;
    creditScore.totalHarvestValue =
      Number(creditScore.totalHarvestValue) + harvestValue;
    creditScore.lastUpdate = new Date();

    return this.repository.save(creditScore);
  }

  async updateRepaymentRate(
    farmerId: string,
    rate: number,
  ): Promise<CreditScoreEntity | null> {
    const creditScore = await this.findByFarmerId(farmerId);
    if (!creditScore) return null;

    creditScore.loanRepaymentRate = rate;
    creditScore.lastUpdate = new Date();

    return this.repository.save(creditScore);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
