import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { MicroLoanRepository } from '../repositories/micro-loan.repository';
import { MicroLoanEntity } from '../entities/micro-loan.entity';
import {
  CreateMicroLoanDto,
  UpdateMicroLoanDto,
  GetMicroLoanDto,
  LoanStatsDto,
  EligibilityResponseDto,
} from '../dto/micro-loan.dto';
import { LoanStatus } from '../interfaces/imicro-loan';
import { CreditScoreRepository } from '../repositories/credit-score.repository';

// Constantes pour l'éligibilité
const MINIMUM_CREDIT_SCORE = 200;
const SCORE_TO_AMOUNT_RATIO = 5; // 1 point de score = 5 ADA max
const MAX_ACTIVE_LOANS = 3;

@Injectable()
export class MicroLoanService {
  constructor(
    private readonly repository: MicroLoanRepository,
    private readonly creditScoreRepository: CreditScoreRepository,
  ) { }

  async create(dto: CreateMicroLoanDto): Promise<MicroLoanEntity> {
    return this.repository.create(dto);
  }

  async findById(id: string): Promise<MicroLoanEntity> {
    const loan = await this.repository.findById(id);
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return loan;
  }

  async findAll(query: GetMicroLoanDto): Promise<MicroLoanEntity[]> {
    return this.repository.findAll(query);
  }

  async findByFarmerId(farmerId: string): Promise<MicroLoanEntity[]> {
    return this.repository.findByFarmerId(farmerId);
  }

  async findOverdueLoans(): Promise<MicroLoanEntity[]> {
    return this.repository.findOverdueLoans();
  }

  async update(id: string, dto: UpdateMicroLoanDto): Promise<MicroLoanEntity> {
    const loan = await this.repository.update(id, dto);
    if (!loan) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return loan;
  }

  async activate(id: string): Promise<MicroLoanEntity> {
    const loan = await this.findById(id);

    if (loan.status !== LoanStatus.PENDING && loan.status !== LoanStatus.APPROVED) {
      throw new BadRequestException(
        `Loan can only be activated from pending or approved status. Current: ${loan.status}`,
      );
    }

    const activated = await this.repository.activate(id);
    if (!activated) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return activated;
  }

  async repay(id: string): Promise<MicroLoanEntity> {
    const loan = await this.findById(id);

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new BadRequestException(
        `Only active loans can be repaid. Current: ${loan.status}`,
      );
    }

    const repaid = await this.repository.markAsRepaid(id);
    if (!repaid) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return repaid;
  }

  async markDefaulted(id: string): Promise<MicroLoanEntity> {
    const loan = await this.findById(id);

    if (loan.status !== LoanStatus.ACTIVE) {
      throw new BadRequestException(
        `Only active loans can be marked as defaulted. Current: ${loan.status}`,
      );
    }

    const defaulted = await this.repository.markAsDefaulted(id);
    if (!defaulted) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return defaulted;
  }

  calculateRepaymentAmount(loan: MicroLoanEntity): number {
    const principal = Number(loan.amountADA);
    const rate = Number(loan.interestRate) / 100;
    return principal + principal * rate;
  }

  async delete(id: string): Promise<void> {
    const loan = await this.findById(id);

    if (loan.status === LoanStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete an active loan');
    }

    await this.repository.delete(id);
  }

  async approve(id: string, approvedBy?: string): Promise<MicroLoanEntity> {
    const loan = await this.findById(id);

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException(
        `Loan can only be approved from pending status. Current: ${loan.status}`,
      );
    }

    const approved = await this.repository.approve(id, approvedBy);
    if (!approved) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return approved;
  }

  async reject(
    id: string,
    reason: string,
    rejectedBy?: string,
  ): Promise<MicroLoanEntity> {
    const loan = await this.findById(id);

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException(
        `Loan can only be rejected from pending status. Current: ${loan.status}`,
      );
    }

    const rejected = await this.repository.reject(id, reason, rejectedBy);
    if (!rejected) {
      throw new NotFoundException(`Loan with ID ${id} not found`);
    }
    return rejected;
  }

  async getStats(): Promise<LoanStatsDto> {
    const stats = await this.repository.getStats();

    const completedLoans = stats.repaidLoans + stats.defaultedLoans;
    const repaymentRate =
      completedLoans > 0 ? (stats.repaidLoans / completedLoans) * 100 : 0;

    return {
      ...stats,
      repaymentRate: Math.round(repaymentRate * 100) / 100,
    };
  }

  async checkEligibility(
    farmerId: string,
    amountADA: number,
  ): Promise<EligibilityResponseDto> {
    // Récupérer le score de crédit
    let creditScore = 0;
    try {
      const score = await this.creditScoreRepository.findByFarmerId(farmerId);
      if (score) {
        creditScore = score.score;
      }
    } catch {
      // Si pas de score, on utilise 0
    }

    // Compter les prêts actifs
    const activeLoansCount =
      await this.repository.countActiveByFarmerId(farmerId);

    // Calculer le montant maximum autorisé
    const maxAmountAllowed = creditScore * SCORE_TO_AMOUNT_RATIO;

    // Vérifier l'éligibilité
    const reasons: string[] = [];

    if (creditScore < MINIMUM_CREDIT_SCORE) {
      reasons.push(
        `Score de crédit insuffisant (${creditScore} < ${MINIMUM_CREDIT_SCORE})`,
      );
    }

    if (activeLoansCount >= MAX_ACTIVE_LOANS) {
      reasons.push(
        `Trop de prêts actifs (${activeLoansCount} >= ${MAX_ACTIVE_LOANS})`,
      );
    }

    if (amountADA > maxAmountAllowed) {
      reasons.push(
        `Montant demandé trop élevé (${amountADA} > ${maxAmountAllowed} ADA max)`,
      );
    }

    return {
      eligible: reasons.length === 0,
      creditScore,
      minimumScoreRequired: MINIMUM_CREDIT_SCORE,
      maxAmountAllowed,
      reason: reasons.length > 0 ? reasons.join('; ') : undefined,
      activeLoansCount,
    };
  }
}
