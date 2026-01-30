import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
  constructor(private readonly repository: MobileMoneyTransactionRepository) {}

  async create(
    dto: CreateMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.repository.create(dto);
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
  }
}
