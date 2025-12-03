import { Injectable, NotFoundException } from '@nestjs/common';
import { NFTPurchaseRepository } from '../repositories/nft-purchase.repository';
import { NFTPurchaseEntity } from '../entities/nft-purchase.entity';
import {
  CreateNFTPurchaseDto,
  GetNFTPurchaseDto,
} from '../dto/nft-purchase.dto';
import { NFTService } from './nft.service';

@Injectable()
export class NFTPurchaseService {
  constructor(
    private readonly repository: NFTPurchaseRepository,
    private readonly nftService: NFTService,
  ) {}

  async create(dto: CreateNFTPurchaseDto): Promise<NFTPurchaseEntity> {
    const nft = await this.nftService.findById(dto.nftId);

    // Calculate revenue shares based on NFT distribution model
    const shares = this.nftService.calculateRevenueShares(nft);

    const purchase = await this.repository.create({
      nft,
      buyerId: dto.buyerId,
      amountPaid: Number(nft.priceADA),
      creatorShare: shares.creator,
      schoolFundContribution: shares.schoolFund,
      platformShare: shares.platform,
      transactionHash: dto.transactionHash,
      timestamp: new Date(),
    });

    // Mark NFT as sold
    await this.nftService.sell(dto.nftId);

    return purchase;
  }

  async findById(id: string): Promise<NFTPurchaseEntity> {
    const purchase = await this.repository.findById(id);
    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }
    return purchase;
  }

  async findAll(query: GetNFTPurchaseDto): Promise<NFTPurchaseEntity[]> {
    return this.repository.findAll(query);
  }

  async findByBuyerId(buyerId: string): Promise<NFTPurchaseEntity[]> {
    return this.repository.findByBuyerId(buyerId);
  }

  async findByNftId(nftId: string): Promise<NFTPurchaseEntity[]> {
    return this.repository.findByNftId(nftId);
  }

  async findByCreatorId(creatorId: string): Promise<NFTPurchaseEntity[]> {
    return this.repository.findByCreatorId(creatorId);
  }

  async getTotalSchoolFundContributions(): Promise<number> {
    return this.repository.getTotalSchoolFundContributions();
  }

  async getSchoolFundContributionsByPeriod(
    year: number,
    month?: number,
  ): Promise<number> {
    return this.repository.getSchoolFundContributionsByPeriod(year, month);
  }

  async getCreatorEarnings(creatorId: string): Promise<number> {
    return this.repository.getCreatorEarnings(creatorId);
  }

  async getStats(): Promise<{
    totalPurchases: number;
    totalRevenue: number;
    totalSchoolFund: number;
    totalCreatorEarnings: number;
    totalPlatformEarnings: number;
  }> {
    const purchases = await this.repository.findAll({});

    return {
      totalPurchases: purchases.length,
      totalRevenue: purchases.reduce((sum, p) => sum + Number(p.amountPaid), 0),
      totalSchoolFund: purchases.reduce(
        (sum, p) => sum + Number(p.schoolFundContribution),
        0,
      ),
      totalCreatorEarnings: purchases.reduce(
        (sum, p) => sum + Number(p.creatorShare),
        0,
      ),
      totalPlatformEarnings: purchases.reduce(
        (sum, p) => sum + Number(p.platformShare),
        0,
      ),
    };
  }
}
