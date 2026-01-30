import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MobileMoneyTransactionEntity } from '../entities/mobile-money-transaction.entity';
import {
  CreateMobileMoneyTransactionDto,
  UpdateMobileMoneyTransactionDto,
  GetMobileMoneyTransactionDto,
} from '../dto/mobile-money-transaction.dto';
import { TransactionStatus } from '../interfaces/imobile-money-transaction';

@Injectable()
export class MobileMoneyTransactionRepository {
  constructor(
    @InjectRepository(MobileMoneyTransactionEntity)
    private readonly repository: Repository<MobileMoneyTransactionEntity>,
  ) {}

  async create(
    dto: CreateMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    const transaction = this.repository.create({
      ...dto,
      amountADA: 0,
      status: TransactionStatus.PENDING,
    });
    return this.repository.save(transaction);
  }

  async findById(id: string): Promise<MobileMoneyTransactionEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(
    query: GetMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity[]> {
    const where: Record<string, unknown> = {};

    if (query.id) where.id = query.id;
    if (query.fromMobileNumber) where.fromMobileNumber = query.fromMobileNumber;
    if (query.toAdaAddress) where.toAdaAddress = query.toAdaAddress;
    if (query.provider) where.provider = query.provider;
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findByMobileNumber(
    mobileNumber: string,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.repository.find({
      where: { fromMobileNumber: mobileNumber },
      order: { createdAt: 'DESC' },
    });
  }

  async findByAdaAddress(
    adaAddress: string,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.repository.find({
      where: { toAdaAddress: adaAddress },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    dto: UpdateMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity | null> {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  async markAsSuccess(
    id: string,
    transactionRef: string,
    amountADA: number,
  ): Promise<MobileMoneyTransactionEntity | null> {
    await this.repository.update(id, {
      status: TransactionStatus.SUCCESS,
      transactionRef,
      amountADA,
    });
    return this.findById(id);
  }

  async markAsFailed(
    id: string,
    failureReason: string,
  ): Promise<MobileMoneyTransactionEntity | null> {
    await this.repository.update(id, {
      status: TransactionStatus.FAILED,
      failureReason,
    });
    return this.findById(id);
  }
}
