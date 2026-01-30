import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreditScoreRepository } from '../repositories/credit-score.repository';
import { CreditScoreEntity } from '../entities/credit-score.entity';
import {
  CreateCreditScoreDto,
  UpdateCreditScoreDto,
  GetCreditScoreDto,
} from '../dto/credit-score.dto';

@Injectable()
export class CreditScoreService {
  constructor(private readonly repository: CreditScoreRepository) {}

  async create(dto: CreateCreditScoreDto): Promise<CreditScoreEntity> {
    const existing = await this.repository.findByFarmerId(dto.farmerId);
    if (existing) {
      throw new ConflictException(
        `Credit score already exists for farmer ${dto.farmerId}`,
      );
    }
    return this.repository.create(dto);
  }

  async findById(id: string): Promise<CreditScoreEntity> {
    const creditScore = await this.repository.findById(id);
    if (!creditScore) {
      throw new NotFoundException(`Credit score with ID ${id} not found`);
    }
    return creditScore;
  }

  async findByFarmerId(farmerId: string): Promise<CreditScoreEntity> {
    const creditScore = await this.repository.findByFarmerId(farmerId);
    if (!creditScore) {
      throw new NotFoundException(
        `Credit score for farmer ${farmerId} not found`,
      );
    }
    return creditScore;
  }

  async findOrCreate(farmerId: string): Promise<CreditScoreEntity> {
    let creditScore = await this.repository.findByFarmerId(farmerId);
    if (!creditScore) {
      creditScore = await this.repository.create({ farmerId });
    }
    return creditScore;
  }

  async findAll(query: GetCreditScoreDto): Promise<CreditScoreEntity[]> {
    return this.repository.findAll(query);
  }

  async update(
    id: string,
    dto: UpdateCreditScoreDto,
  ): Promise<CreditScoreEntity> {
    const creditScore = await this.repository.update(id, dto);
    if (!creditScore) {
      throw new NotFoundException(`Credit score with ID ${id} not found`);
    }
    return creditScore;
  }

  async recalculateScore(farmerId: string): Promise<CreditScoreEntity> {
    const creditScore = await this.findByFarmerId(farmerId);

    // Score calculation based on:
    // - Harvest count (max 300 points)
    // - Total harvest value (max 400 points)
    // - Loan repayment rate (max 300 points)
    const harvestPoints = Math.min(creditScore.harvestCount * 10, 300);
    const valuePoints = Math.min(
      Math.floor(Number(creditScore.totalHarvestValue) / 100),
      400,
    );
    const repaymentPoints = Math.floor(
      Number(creditScore.loanRepaymentRate) * 3,
    );

    const newScore = harvestPoints + valuePoints + repaymentPoints;

    const updated = await this.repository.update(creditScore.id, {
      score: Math.min(newScore, 1000),
    });

    if (!updated) {
      throw new NotFoundException(
        `Credit score for farmer ${farmerId} not found`,
      );
    }

    return updated;
  }

  async recordHarvest(
    farmerId: string,
    harvestValue: number,
  ): Promise<CreditScoreEntity> {
    await this.findOrCreate(farmerId);

    const updated = await this.repository.incrementHarvest(
      farmerId,
      harvestValue,
    );
    if (!updated) {
      throw new NotFoundException(
        `Credit score for farmer ${farmerId} not found`,
      );
    }

    return this.recalculateScore(farmerId);
  }

  async updateLoanRepaymentRate(
    farmerId: string,
    totalLoans: number,
    repaidLoans: number,
  ): Promise<CreditScoreEntity> {
    await this.findOrCreate(farmerId);

    const rate = totalLoans > 0 ? (repaidLoans / totalLoans) * 100 : 0;

    const updated = await this.repository.updateRepaymentRate(farmerId, rate);
    if (!updated) {
      throw new NotFoundException(
        `Credit score for farmer ${farmerId} not found`,
      );
    }

    return this.recalculateScore(farmerId);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
