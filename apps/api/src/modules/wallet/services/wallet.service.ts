import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletEntity } from '../entities/wallet.entity';
import {
  CreateWalletDto,
  UpdateWalletDto,
  GetWalletDto,
} from '../dto/wallet.dto';
import { OwnerType } from '../interfaces/iwallet';

@Injectable()
export class WalletService {
  constructor(private readonly repository: WalletRepository) {}

  async create(dto: CreateWalletDto): Promise<WalletEntity> {
    // Check if wallet already exists for this owner
    const existing = await this.repository.findByOwner(
      dto.ownerType,
      dto.ownerId,
    );
    if (existing) {
      throw new ConflictException(
        `Wallet already exists for ${dto.ownerType} ${dto.ownerId}`,
      );
    }

    // Check if ADA address is already used
    const existingAddress = await this.repository.findByAdaAddress(
      dto.adaAddress,
    );
    if (existingAddress) {
      throw new ConflictException('ADA address is already in use');
    }

    return this.repository.create(dto);
  }

  async findById(id: string): Promise<WalletEntity> {
    const wallet = await this.repository.findById(id);
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return wallet;
  }

  async findByAdaAddress(adaAddress: string): Promise<WalletEntity> {
    const wallet = await this.repository.findByAdaAddress(adaAddress);
    if (!wallet) {
      throw new NotFoundException(
        `Wallet with ADA address ${adaAddress} not found`,
      );
    }
    return wallet;
  }

  async findByOwner(
    ownerType: OwnerType,
    ownerId: string,
  ): Promise<WalletEntity> {
    const wallet = await this.repository.findByOwner(ownerType, ownerId);
    if (!wallet) {
      throw new NotFoundException(
        `Wallet for ${ownerType} ${ownerId} not found`,
      );
    }
    return wallet;
  }

  async findAll(query: GetWalletDto): Promise<WalletEntity[]> {
    return this.repository.findAll(query);
  }

  async update(id: string, dto: UpdateWalletDto): Promise<WalletEntity> {
    const wallet = await this.repository.update(id, dto);
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return wallet;
  }

  async credit(id: string, amount: number): Promise<WalletEntity> {
    if (amount <= 0) {
      throw new BadRequestException('Credit amount must be positive');
    }
    const wallet = await this.repository.updateBalance(id, amount);
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return wallet;
  }

  async debit(id: string, amount: number): Promise<WalletEntity> {
    if (amount <= 0) {
      throw new BadRequestException('Debit amount must be positive');
    }

    const wallet = await this.findById(id);
    if (Number(wallet.balanceADA) < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const updated = await this.repository.updateBalance(id, -amount);
    if (!updated) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
