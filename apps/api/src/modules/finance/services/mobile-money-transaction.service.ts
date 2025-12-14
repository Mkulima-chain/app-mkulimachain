import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { MobileMoneyTransactionRepository } from '../repositories/mobile-money-transaction.repository';
import { MobileMoneyTransactionEntity } from '../entities/mobile-money-transaction.entity';
import {
  CreateMobileMoneyTransactionDto,
  UpdateMobileMoneyTransactionDto,
  GetMobileMoneyTransactionDto,
  CompleteTransactionDto,
  FailTransactionDto,
} from '../dto/mobile-money-transaction.dto';
import { TransactionStatus } from '../interfaces/imobile-money-transaction';

@Injectable()
export class MobileMoneyTransactionService {
  private readonly logger = new Logger(MobileMoneyTransactionService.name);

  constructor(private readonly repository: MobileMoneyTransactionRepository) {}

  async create(
    dto: CreateMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    try {
      this.logger.log(`Création d'une transaction mobile money: ${dto.fromMobileNumber} -> ${dto.toAdaAddress}`);
      const transaction = await this.repository.create(dto);
      this.logger.log(`Transaction créée avec succès: ${transaction.id}`);
      return transaction;
    } catch (error) {
      this.logger.error(`Erreur lors de la création de la transaction: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<MobileMoneyTransactionEntity> {
    const transaction = await this.repository.findById(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async findAll(
    query: GetMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.repository.findAll(query);
  }

  async findByMobileNumber(
    mobileNumber: string,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.repository.findByMobileNumber(mobileNumber);
  }

  async findByAdaAddress(
    adaAddress: string,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.repository.findByAdaAddress(adaAddress);
  }

  async update(
    id: string,
    dto: UpdateMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    const transaction = await this.repository.update(id, dto);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  async complete(
    id: string,
    dto: CompleteTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    const transaction = await this.findById(id);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        `Transaction is not pending. Current status: ${transaction.status}`,
      );
    }

    const completed = await this.repository.markAsSuccess(
      id,
      dto.transactionRef,
      dto.amountADA,
    );

    if (!completed) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return completed;
  }

  async fail(
    id: string,
    dto: FailTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    const transaction = await this.findById(id);

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException(
        `Transaction is not pending. Current status: ${transaction.status}`,
      );
    }

    const failed = await this.repository.markAsFailed(id, dto.failureReason);

    if (!failed) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return failed;
  }

  async getStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    total: number;
    success: number;
    failed: number;
    pending: number;
    totalAmount: number;
    totalAmountADA: number;
  }> {
    try {
      this.logger.log('Calcul des statistiques des transactions');
      const transactions = await this.repository.findAll({});

      const filtered = transactions.filter((t) => {
        if (startDate && t.createdAt < startDate) return false;
        if (endDate && t.createdAt > endDate) return false;
        return true;
      });

      return {
        total: filtered.length,
        success: filtered.filter((t) => t.status === TransactionStatus.SUCCESS)
          .length,
        failed: filtered.filter((t) => t.status === TransactionStatus.FAILED)
          .length,
        pending: filtered.filter((t) => t.status === TransactionStatus.PENDING)
          .length,
        totalAmount: filtered
          .filter((t) => t.status === TransactionStatus.SUCCESS)
          .reduce((sum, t) => sum + Number(t.amount), 0),
        totalAmountADA: filtered
          .filter((t) => t.status === TransactionStatus.SUCCESS)
          .reduce((sum, t) => sum + Number(t.amountADA), 0),
      };
    } catch (error) {
      this.logger.error(`Erreur lors du calcul des statistiques: ${error.message}`, error.stack);
      throw error;
    }
  }

  async linkToLoan(transactionId: string, loanId: string): Promise<MobileMoneyTransactionEntity> {
    try {
      this.logger.log(`Liaison de la transaction ${transactionId} au prêt ${loanId}`);
      const transaction = await this.findById(transactionId);
      
      const updated = await this.repository.update(transactionId, {
        loanId,
      });

      if (!updated) {
        throw new NotFoundException(`Transaction avec l'ID ${transactionId} introuvable`);
      }

      this.logger.log(`Transaction ${transactionId} liée au prêt ${loanId} avec succès`);
      return updated;
    } catch (error) {
      this.logger.error(`Erreur lors de la liaison au prêt: ${error.message}`, error.stack);
      throw error;
    }
  }

  async linkToFarmer(transactionId: string, farmerId: string): Promise<MobileMoneyTransactionEntity> {
    try {
      this.logger.log(`Liaison de la transaction ${transactionId} à l'agriculteur ${farmerId}`);
      const transaction = await this.findById(transactionId);
      
      const updated = await this.repository.update(transactionId, {
        farmerId,
      });

      if (!updated) {
        throw new NotFoundException(`Transaction avec l'ID ${transactionId} introuvable`);
      }

      this.logger.log(`Transaction ${transactionId} liée à l'agriculteur ${farmerId} avec succès`);
      return updated;
    } catch (error) {
      this.logger.error(`Erreur lors de la liaison à l'agriculteur: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTransactionHistory(farmerId?: string): Promise<MobileMoneyTransactionEntity[]> {
    try {
      this.logger.log(`Récupération de l'historique des transactions${farmerId ? ` pour l'agriculteur ${farmerId}` : ''}`);
      if (farmerId) {
        return await this.repository.findAll({ farmerId });
      }
      return await this.repository.findAll({});
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'historique: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getStatsByDateRange(startDate: Date, endDate: Date): Promise<{
    total: number;
    success: number;
    failed: number;
    pending: number;
    totalAmount: number;
    totalAmountADA: number;
    averageProcessingTime: number;
  }> {
    try {
      this.logger.log(`Calcul des statistiques pour la période ${startDate.toISOString()} - ${endDate.toISOString()}`);
      const stats = await this.getStats(startDate, endDate);
      const transactions = await this.repository.findAll({});
      
      const filtered = transactions.filter((t) => {
        if (t.createdAt < startDate) return false;
        if (t.createdAt > endDate) return false;
        return true;
      });

      const processingTimes = filtered
        .filter((t) => t.processingTime !== undefined && t.processingTime !== null)
        .map((t) => Number(t.processingTime));

      const averageProcessingTime =
        processingTimes.length > 0
          ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
          : 0;

      return {
        ...stats,
        averageProcessingTime,
      };
    } catch (error) {
      this.logger.error(`Erreur lors du calcul des statistiques par période: ${error.message}`, error.stack);
      throw error;
    }
  }
}
