import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from '../entities/wallet.entity';
import {
  CreateWalletDto,
  UpdateWalletDto,
  GetWalletDto,
} from '../dto/wallet.dto';
import { OwnerType } from '../interfaces/iwallet';

@Injectable()
export class WalletRepository {
  constructor(
    @InjectRepository(WalletEntity)
    private readonly repository: Repository<WalletEntity>,
  ) {}

  async create(dto: CreateWalletDto): Promise<WalletEntity> {
    const wallet = this.repository.create({
      ...dto,
      balanceADA: dto.balanceADA || 0,
    });
    return this.repository.save(wallet);
  }

  async findById(id: string): Promise<WalletEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByAdaAddress(adaAddress: string): Promise<WalletEntity | null> {
    return this.repository.findOne({ where: { adaAddress } });
  }

  async findByOwner(
    ownerType: OwnerType,
    ownerId: string,
  ): Promise<WalletEntity | null> {
    return this.repository.findOne({ where: { ownerType, ownerId } });
  }

  async findAll(
    query: GetWalletDto,
  ): Promise<{
    data: WalletEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const qb = this.repository.createQueryBuilder('wallet');

    // Filtres
    if (query.id) {
      qb.andWhere('wallet.id = :id', { id: query.id });
    }
    if (query.ownerType) {
      qb.andWhere('wallet.ownerType = :ownerType', {
        ownerType: query.ownerType,
      });
    }
    if (query.ownerId) {
      qb.andWhere('wallet.ownerId = :ownerId', { ownerId: query.ownerId });
    }
    if (query.adaAddress) {
      qb.andWhere('wallet.adaAddress = :adaAddress', {
        adaAddress: query.adaAddress,
      });
    }
    if (query.status) {
      qb.andWhere('wallet.status = :status', { status: query.status });
    }
    if (query.isVerified !== undefined) {
      qb.andWhere('wallet.isVerified = :isVerified', {
        isVerified: query.isVerified,
      });
    }
    if (query.minBalance !== undefined) {
      qb.andWhere('wallet.balanceADA >= :minBalance', {
        minBalance: query.minBalance,
      });
    }
    if (query.maxBalance !== undefined) {
      qb.andWhere('wallet.balanceADA <= :maxBalance', {
        maxBalance: query.maxBalance,
      });
    }
    if (query.search) {
      qb.andWhere(
        '(wallet.adaAddress ILIKE :search OR wallet.label ILIKE :search OR wallet.mobileMoneyNumber ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Tri
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'DESC';
    const validSortFields = [
      'balanceADA',
      'createdAt',
      'lastTransactionAt',
      'transactionCount',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`wallet.${sortField}`, sortOrder);

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(id: string, dto: UpdateWalletDto): Promise<WalletEntity | null> {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  async updateBalance(
    id: string,
    amount: number,
  ): Promise<WalletEntity | null> {
    const wallet = await this.findById(id);
    if (!wallet) return null;

    const oldBalance = Number(wallet.balanceADA);
    wallet.balanceADA = oldBalance + amount;

    // Mettre à jour les statistiques
    wallet.transactionCount += 1;
    wallet.lastTransactionAt = new Date();

    if (amount > 0) {
      wallet.totalReceived = Number(wallet.totalReceived || 0) + amount;
    } else {
      wallet.totalSent = Number(wallet.totalSent || 0) + Math.abs(amount);
    }

    // Mettre à jour minBalance et maxBalance
    const newBalance = Number(wallet.balanceADA);
    if (wallet.minBalance === null || newBalance < Number(wallet.minBalance)) {
      wallet.minBalance = newBalance;
    }
    if (wallet.maxBalance === null || newBalance > Number(wallet.maxBalance)) {
      wallet.maxBalance = newBalance;
    }

    return this.repository.save(wallet);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
