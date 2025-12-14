import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { CreditScoreRepository } from '../repositories/credit-score.repository';
import { CreditScoreEntity } from '../entities/credit-score.entity';
import {
  CreateCreditScoreDto,
  UpdateCreditScoreDto,
  GetCreditScoreDto,
} from '../dto/credit-score.dto';
import { RiskLevel } from '../interfaces/icredit-score';

@Injectable()
export class CreditScoreService {
  private readonly logger = new Logger(CreditScoreService.name);

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

  calculateRiskLevel(score: number): RiskLevel {
    if (score >= 750) return RiskLevel.LOW;
    if (score >= 500) return RiskLevel.MEDIUM;
    if (score >= 300) return RiskLevel.HIGH;
    return RiskLevel.VERY_HIGH;
  }

  async recalculateScore(farmerId: string): Promise<CreditScoreEntity> {
    try {
      this.logger.log(`Recalcul du score de crédit pour l'agriculteur ${farmerId}`);
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

      const newScore = Math.min(harvestPoints + valuePoints + repaymentPoints, 1000);
      const riskLevel = this.calculateRiskLevel(newScore);

      const updated = await this.repository.update(creditScore.id, {
        score: newScore,
        riskLevel,
      });

      if (!updated) {
        throw new NotFoundException(
          `Score de crédit pour l'agriculteur ${farmerId} introuvable`,
        );
      }

      this.logger.log(`Score recalculé: ${newScore}, Niveau de risque: ${riskLevel}`);
      return updated;
    } catch (error) {
      this.logger.error(`Erreur lors du recalcul du score: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateRiskLevel(farmerId: string): Promise<CreditScoreEntity> {
    try {
      this.logger.log(`Mise à jour du niveau de risque pour l'agriculteur ${farmerId}`);
      const creditScore = await this.findByFarmerId(farmerId);
      const riskLevel = this.calculateRiskLevel(creditScore.score);

      const updated = await this.repository.update(creditScore.id, {
        riskLevel,
      });

      if (!updated) {
        throw new NotFoundException(
          `Score de crédit pour l'agriculteur ${farmerId} introuvable`,
        );
      }

      return updated;
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour du niveau de risque: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getCreditHistory(farmerId: string): Promise<CreditScoreEntity> {
    try {
      this.logger.log(`Récupération de l'historique de crédit pour l'agriculteur ${farmerId}`);
      return await this.findByFarmerId(farmerId);
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'historique: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getStatistics(): Promise<{
    total: number;
    averageScore: number;
    byRiskLevel: Record<RiskLevel, number>;
  }> {
    try {
      this.logger.log('Calcul des statistiques des scores de crédit');
      const scores = await this.repository.findAll({});

      const byRiskLevel: Record<RiskLevel, number> = {
        [RiskLevel.LOW]: 0,
        [RiskLevel.MEDIUM]: 0,
        [RiskLevel.HIGH]: 0,
        [RiskLevel.VERY_HIGH]: 0,
      };

      let totalScore = 0;
      scores.forEach((score) => {
        const riskLevel = score.riskLevel || this.calculateRiskLevel(score.score);
        byRiskLevel[riskLevel] = (byRiskLevel[riskLevel] || 0) + 1;
        totalScore += score.score;
      });

      return {
        total: scores.length,
        averageScore: scores.length > 0 ? totalScore / scores.length : 0,
        byRiskLevel,
      };
    } catch (error) {
      this.logger.error(`Erreur lors du calcul des statistiques: ${error.message}`, error.stack);
      throw error;
    }
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
