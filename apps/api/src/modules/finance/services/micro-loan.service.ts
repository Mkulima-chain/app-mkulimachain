import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { MicroLoanRepository } from '../repositories/micro-loan.repository';
import { MicroLoanEntity } from '../entities/micro-loan.entity';
import {
  CreateMicroLoanDto,
  UpdateMicroLoanDto,
  GetMicroLoanDto,
} from '../dto/micro-loan.dto';
import { LoanStatus } from '../interfaces/imicro-loan';
import { CreditScoreService } from './credit-score.service';

@Injectable()
export class MicroLoanService {
  private readonly logger = new Logger(MicroLoanService.name);

  constructor(
    private readonly repository: MicroLoanRepository,
    private readonly creditScoreService: CreditScoreService,
  ) {}

  async create(dto: CreateMicroLoanDto): Promise<MicroLoanEntity> {
    try {
      this.logger.log(`Création d'un nouveau prêt pour l'agriculteur ${dto.farmerId}`);
      
      // Vérifier le score de crédit
      try {
        const creditScore = await this.creditScoreService.findByFarmerId(dto.farmerId);
        if (creditScore.score < 300) {
          this.logger.warn(`Score de crédit faible (${creditScore.score}) pour l'agriculteur ${dto.farmerId}`);
        }
      } catch (error) {
        this.logger.warn(`Aucun score de crédit trouvé pour l'agriculteur ${dto.farmerId}`);
      }

      const loan = await this.repository.create(dto);
      this.logger.log(`Prêt créé avec succès: ${loan.id}`);
      return loan;
    } catch (error) {
      this.logger.error(`Erreur lors de la création du prêt: ${error.message}`, error.stack);
      throw error;
    }
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

    if (loan.status !== LoanStatus.PENDING) {
      throw new BadRequestException(
        `Loan can only be activated from pending status. Current: ${loan.status}`,
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

  async calculateRemainingAmount(loanId: string): Promise<number> {
    const loan = await this.findById(loanId);
    const totalRepayment = this.calculateRepaymentAmount(loan);
    const remaining = loan.remainingAmount ?? totalRepayment;
    return Number(remaining);
  }

  async getLoanStatistics(farmerId?: string): Promise<{
    total: number;
    active: number;
    repaid: number;
    defaulted: number;
    pending: number;
    totalAmount: number;
    totalRepaid: number;
  }> {
    try {
      const loans = farmerId
        ? await this.findByFarmerId(farmerId)
        : await this.repository.findAll({});

      return {
        total: loans.length,
        active: loans.filter((l) => l.status === LoanStatus.ACTIVE).length,
        repaid: loans.filter((l) => l.status === LoanStatus.REPAID).length,
        defaulted: loans.filter((l) => l.status === LoanStatus.DEFAULTED).length,
        pending: loans.filter((l) => l.status === LoanStatus.PENDING).length,
        totalAmount: loans.reduce((sum, l) => sum + Number(l.amountADA), 0),
        totalRepaid: loans
          .filter((l) => l.status === LoanStatus.REPAID)
          .reduce((sum, l) => sum + Number(l.amountADA), 0),
      };
    } catch (error) {
      this.logger.error(`Erreur lors du calcul des statistiques: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRepaymentSchedule(loanId: string): Promise<{
    totalAmount: number;
    remainingAmount: number;
    dueDate: Date;
    daysRemaining: number;
    isOverdue: boolean;
  }> {
    const loan = await this.findById(loanId);
    const totalAmount = this.calculateRepaymentAmount(loan);
    const remainingAmount = loan.remainingAmount ?? totalAmount;
    const dueDate = loan.dueDate;
    const now = new Date();
    const daysRemaining = dueDate
      ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const isOverdue = dueDate ? dueDate < now : false;

    return {
      totalAmount,
      remainingAmount: Number(remainingAmount),
      dueDate: dueDate || new Date(),
      daysRemaining,
      isOverdue,
    };
  }

  async approveLoan(loanId: string, approvedBy: string): Promise<MicroLoanEntity> {
    try {
      this.logger.log(`Approbation du prêt ${loanId} par ${approvedBy}`);
      const loan = await this.findById(loanId);

      if (loan.status !== LoanStatus.PENDING) {
        throw new BadRequestException(
          `Seuls les prêts en attente peuvent être approuvés. Statut actuel: ${loan.status}`,
        );
      }

      const updated = await this.repository.update(loanId, {
        status: LoanStatus.ACTIVE,
        approvedBy,
        approvedAt: new Date(),
      });

      if (!updated) {
        throw new NotFoundException(`Prêt avec l'ID ${loanId} introuvable`);
      }

      // Activer le prêt (définir les dates)
      const activated = await this.repository.activate(loanId);
      this.logger.log(`Prêt ${loanId} approuvé avec succès`);
      return activated || updated;
    } catch (error) {
      this.logger.error(`Erreur lors de l'approbation du prêt: ${error.message}`, error.stack);
      throw error;
    }
  }

  async rejectLoan(loanId: string, rejectionReason: string, approvedBy: string): Promise<MicroLoanEntity> {
    try {
      this.logger.log(`Rejet du prêt ${loanId} par ${approvedBy}`);
      const loan = await this.findById(loanId);

      if (loan.status !== LoanStatus.PENDING) {
        throw new BadRequestException(
          `Seuls les prêts en attente peuvent être rejetés. Statut actuel: ${loan.status}`,
        );
      }

      const updated = await this.repository.update(loanId, {
        rejectionReason,
        approvedBy,
        approvedAt: new Date(),
      });

      if (!updated) {
        throw new NotFoundException(`Prêt avec l'ID ${loanId} introuvable`);
      }

      this.logger.log(`Prêt ${loanId} rejeté avec succès`);
      return updated;
    } catch (error) {
      this.logger.error(`Erreur lors du rejet du prêt: ${error.message}`, error.stack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Suppression du prêt ${id}`);
      const loan = await this.findById(id);

      if (loan.status === LoanStatus.ACTIVE) {
        throw new BadRequestException('Impossible de supprimer un prêt actif');
      }

      await this.repository.delete(id);
      this.logger.log(`Prêt ${id} supprimé avec succès`);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du prêt: ${error.message}`, error.stack);
      throw error;
    }
  }
}
