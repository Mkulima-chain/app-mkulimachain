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

  async findAll(query: GetWalletDto): Promise<WalletEntity[]> {
    const where: Record<string, unknown> = {};

    if (query.id) where.id = query.id;
    if (query.ownerType) where.ownerType = query.ownerType;
    if (query.ownerId) where.ownerId = query.ownerId;
    if (query.adaAddress) where.adaAddress = query.adaAddress;

    return this.repository.find({ where });
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

    wallet.balanceADA = Number(wallet.balanceADA) + amount;
    return this.repository.save(wallet);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
