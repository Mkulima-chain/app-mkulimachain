import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NFTPurchaseEntity } from '../entities/nft-purchase.entity';
import { GetNFTPurchaseDto } from '../dto/nft-purchase.dto';

@Injectable()
export class NFTPurchaseRepository {
  constructor(
    @InjectRepository(NFTPurchaseEntity)
    private readonly repository: Repository<NFTPurchaseEntity>,
  ) {}

  async create(data: Partial<NFTPurchaseEntity>): Promise<NFTPurchaseEntity> {
    const purchase = this.repository.create(data);
    return this.repository.save(purchase);
  }

  async findById(id: string): Promise<NFTPurchaseEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['nft'],
    });
  }

  async findAll(query: GetNFTPurchaseDto): Promise<NFTPurchaseEntity[]> {
    const qb = this.repository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.nft', 'nft');

    if (query.id) qb.andWhere('purchase.id = :id', { id: query.id });
    if (query.nftId) qb.andWhere('nft.id = :nftId', { nftId: query.nftId });
    if (query.buyerId)
      qb.andWhere('purchase.buyerId = :buyerId', { buyerId: query.buyerId });
    if (query.transactionHash)
      qb.andWhere('purchase.transactionHash = :hash', {
        hash: query.transactionHash,
      });

    return qb.orderBy('purchase.timestamp', 'DESC').getMany();
  }

  async findByBuyerId(buyerId: string): Promise<NFTPurchaseEntity[]> {
    return this.repository.find({
      where: { buyerId },
      relations: ['nft'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByNftId(nftId: string): Promise<NFTPurchaseEntity[]> {
    return this.repository.find({
      where: { nft: { id: nftId } },
      relations: ['nft'],
      order: { timestamp: 'DESC' },
    });
  }

  async findByCreatorId(creatorId: string): Promise<NFTPurchaseEntity[]> {
    return this.repository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.nft', 'nft')
      .where('nft.creatorId = :creatorId', { creatorId })
      .orderBy('purchase.timestamp', 'DESC')
      .getMany();
  }

  async getTotalSchoolFundContributions(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('purchase')
      .select('SUM(purchase.schoolFundContribution)', 'total')
      .getRawOne();

    return Number(result?.total || 0);
  }

  async getSchoolFundContributionsByPeriod(
    year: number,
    month?: number,
  ): Promise<number> {
    const qb = this.repository
      .createQueryBuilder('purchase')
      .select('SUM(purchase.schoolFundContribution)', 'total')
      .where('EXTRACT(YEAR FROM purchase.timestamp) = :year', { year });

    if (month) {
      qb.andWhere('EXTRACT(MONTH FROM purchase.timestamp) = :month', { month });
    }

    const result = await qb.getRawOne();
    return Number(result?.total || 0);
  }

  async getCreatorEarnings(creatorId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('purchase')
      .leftJoin('purchase.nft', 'nft')
      .select('SUM(purchase.creatorShare)', 'total')
      .where('nft.creatorId = :creatorId', { creatorId })
      .getRawOne();

    return Number(result?.total || 0);
  }
}
