import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletEntity } from '../entities/wallet.entity';
import {
  CreateWalletDto,
  UpdateWalletDto,
  GetWalletDto,
  WalletStatsDto,
} from '../dto/wallet.dto';
import { OwnerType, WalletStatus } from '../interfaces/iwallet';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly repository: WalletRepository) {}

  async create(dto: CreateWalletDto): Promise<WalletEntity> {
    this.logger.log(
      `Création d'un nouveau portefeuille pour ${dto.ownerType} ${dto.ownerId}`,
    );

    try {
      // Check if wallet already exists for this owner
      const existing = await this.repository.findByOwner(
        dto.ownerType,
        dto.ownerId,
      );
      if (existing) {
        this.logger.warn(
          `Tentative de création avec propriétaire existant: ${dto.ownerType} ${dto.ownerId}`,
        );
        throw new ConflictException(
          `Un portefeuille existe déjà pour ${dto.ownerType} ${dto.ownerId}`,
        );
      }

      // Check if ADA address is already used
      const existingAddress = await this.repository.findByAdaAddress(
        dto.adaAddress,
      );
      if (existingAddress) {
        this.logger.warn(
          `Tentative de création avec adresse ADA existante: ${dto.adaAddress}`,
        );
        throw new ConflictException(
          'Cette adresse Cardano est déjà utilisée',
        );
      }

      // Validation du format de l'adresse Cardano
      if (!this.isValidCardanoAddress(dto.adaAddress)) {
        this.logger.warn(
          `Format d'adresse Cardano invalide: ${dto.adaAddress}`,
        );
        throw new BadRequestException(
          'Format d\'adresse Cardano invalide. L\'adresse doit commencer par "addr1" ou "addr_test1"',
        );
      }

      const wallet = await this.repository.create({
        ...dto,
        status: dto.status || WalletStatus.ACTIVE,
        balanceADA: dto.balanceADA || 0,
      });

      this.logger.log(`Portefeuille créé avec succès: ${wallet.id}`);
      return wallet;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création du portefeuille: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private isValidCardanoAddress(address: string): boolean {
    // Validation basique des adresses Cardano
    return (
      address.startsWith('addr1') || address.startsWith('addr_test1')
    );
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

  async findAll(query: GetWalletDto): Promise<{
    data: WalletEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.logger.log(
      `Recherche de portefeuilles avec filtres: ${JSON.stringify(query)}`,
    );
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
    this.logger.log(`Crédit de ${amount} ADA sur le portefeuille ${id}`);

    if (amount <= 0) {
      throw new BadRequestException(
        'Le montant du crédit doit être positif',
      );
    }

    const wallet = await this.findById(id);

    // Vérifier le statut du portefeuille
    if (wallet.status === WalletStatus.FROZEN) {
      throw new BadRequestException(
        'Impossible de créditer un portefeuille gelé',
      );
    }
    if (wallet.status === WalletStatus.SUSPENDED) {
      throw new BadRequestException(
        'Impossible de créditer un portefeuille suspendu',
      );
    }

    const updated = await this.repository.updateBalance(id, amount);
    if (!updated) {
      throw new NotFoundException(`Portefeuille avec ID ${id} introuvable`);
    }

    this.logger.log(
      `Portefeuille ${id} crédité avec succès. Nouveau solde: ${updated.balanceADA}`,
    );
    return updated;
  }

  async debit(id: string, amount: number): Promise<WalletEntity> {
    this.logger.log(`Débit de ${amount} ADA sur le portefeuille ${id}`);

    if (amount <= 0) {
      throw new BadRequestException(
        'Le montant du débit doit être positif',
      );
    }

    const wallet = await this.findById(id);

    // Vérifier le statut du portefeuille
    if (wallet.status === WalletStatus.FROZEN) {
      throw new BadRequestException(
        'Impossible de débiter un portefeuille gelé',
      );
    }
    if (wallet.status === WalletStatus.SUSPENDED) {
      throw new BadRequestException(
        'Impossible de débiter un portefeuille suspendu',
      );
    }

    if (Number(wallet.balanceADA) < amount) {
      this.logger.warn(
        `Solde insuffisant pour le portefeuille ${id}. Solde: ${wallet.balanceADA}, Montant demandé: ${amount}`,
      );
      throw new BadRequestException('Solde insuffisant');
    }

    const updated = await this.repository.updateBalance(id, -amount);
    if (!updated) {
      throw new NotFoundException(`Portefeuille avec ID ${id} introuvable`);
    }

    this.logger.log(
      `Portefeuille ${id} débité avec succès. Nouveau solde: ${updated.balanceADA}`,
    );
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Suppression du portefeuille ${id}`);
    await this.findById(id);
    await this.repository.delete(id);
    this.logger.log(`Portefeuille ${id} supprimé avec succès`);
  }

  async verifyWallet(id: string, verifiedBy: string): Promise<WalletEntity> {
    this.logger.log(
      `Vérification du portefeuille ${id} par l'utilisateur ${verifiedBy}`,
    );

    const wallet = await this.findById(id);
    const updated = await this.repository.update(id, {
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy,
    });

    if (!updated) {
      throw new NotFoundException(`Portefeuille avec ID ${id} introuvable`);
    }

    this.logger.log(`Portefeuille ${id} vérifié avec succès`);
    return updated;
  }

  async updateWalletStatus(
    id: string,
    status: WalletStatus,
  ): Promise<WalletEntity> {
    this.logger.log(
      `Mise à jour du statut du portefeuille ${id} vers ${status}`,
    );

    const wallet = await this.findById(id);
    const updated = await this.repository.update(id, { status });

    if (!updated) {
      throw new NotFoundException(`Portefeuille avec ID ${id} introuvable`);
    }

    this.logger.log(
      `Statut du portefeuille ${id} mis à jour avec succès: ${status}`,
    );
    return updated;
  }

  async getWalletStats(id: string): Promise<WalletStatsDto> {
    this.logger.log(`Récupération des statistiques du portefeuille ${id}`);

    const wallet = await this.findById(id);

    return {
      transactionCount: wallet.transactionCount,
      totalReceived: Number(wallet.totalReceived || 0),
      totalSent: Number(wallet.totalSent || 0),
      minBalance: wallet.minBalance ? Number(wallet.minBalance) : undefined,
      maxBalance: wallet.maxBalance ? Number(wallet.maxBalance) : undefined,
    };
  }

  async syncWalletBalance(id: string): Promise<WalletEntity> {
    this.logger.log(
      `Synchronisation du solde du portefeuille ${id} avec la blockchain`,
    );

    const wallet = await this.findById(id);

    // TODO: Implémenter la synchronisation avec la blockchain Cardano
    // Pour l'instant, on met juste à jour lastSyncedAt
    const updated = await this.repository.update(id, {
      lastSyncedAt: new Date(),
    });

    if (!updated) {
      throw new NotFoundException(`Portefeuille avec ID ${id} introuvable`);
    }

    this.logger.log(
      `Synchronisation du portefeuille ${id} terminée (placeholder)`,
    );
    return updated;
  }
}
