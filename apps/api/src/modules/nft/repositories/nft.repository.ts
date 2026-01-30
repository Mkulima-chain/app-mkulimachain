import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NFTEntity } from '../entities/nft.entity';
import { UserEntity } from '@/modules/auth/entities/user.entity';
import {
  CreateNFTDto,
  UpdateNFTDto,
  GetNFTDto,
  MintNFTDto,
} from '../dto/nft.dto';
import { NFTStatus } from '../interfaces/inft';

@Injectable()
export class NFTRepository {
  constructor(
    @InjectRepository(NFTEntity)
    private readonly repository: Repository<NFTEntity>,
  ) {}

  async create(dto: CreateNFTDto): Promise<NFTEntity> {
    const nft = this.repository.create({
      ...dto,
      status: NFTStatus.DRAFT,
    });
    return this.repository.save(nft);
  }

  async findById(id: string): Promise<NFTEntity | null> {
    return this.repository
      .createQueryBuilder('nft')
      .leftJoinAndMapOne(
        'nft.creator',
        UserEntity,
        'creator',
        'creator.id = nft.creatorId',
      )
      .where('nft.id = :id', { id })
      .getOne();
  }

  async findByOnChainHash(onChainHash: string): Promise<NFTEntity | null> {
    return this.repository.findOne({ where: { onChainHash } });
  }

  async findAll(query: GetNFTDto): Promise<NFTEntity[]> {
    const qb = this.repository
      .createQueryBuilder('nft')
      .leftJoinAndMapOne(
        'nft.creator',
        UserEntity,
        'creator',
        'creator.id = nft.creatorId',
      );

    if (query.id) qb.andWhere('nft.id = :id', { id: query.id });
    if (query.creatorId)
      qb.andWhere('nft.creatorId = :creatorId', { creatorId: query.creatorId });
    if (query.type) qb.andWhere('nft.type = :type', { type: query.type });
    if (query.status)
      qb.andWhere('nft.status = :status', { status: query.status });
    if (query.minPrice !== undefined)
      qb.andWhere('nft.priceADA >= :minPrice', { minPrice: query.minPrice });
    if (query.maxPrice !== undefined)
      qb.andWhere('nft.priceADA <= :maxPrice', { maxPrice: query.maxPrice });
    if (query.search)
      qb.andWhere(
        '(nft.title ILIKE :search OR nft.description ILIKE :search)',
        { search: `%${query.search}%` },
      );

    return qb.orderBy('nft.createdAt', 'DESC').getMany();
  }

  async findByCreatorId(creatorId: string): Promise<NFTEntity[]> {
    return this.repository.find({
      where: { creatorId },
      order: { createdAt: 'DESC' },
    });
  }

  async findListed(): Promise<NFTEntity[]> {
    return this.repository.find({
      where: { status: NFTStatus.LISTED },
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(type: string): Promise<NFTEntity[]> {
    return this.repository.find({
      where: { type: type as any },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateNFTDto): Promise<NFTEntity | null> {
    await this.repository.update(id, dto);
    return this.findById(id);
  }

  async mint(id: string, dto: MintNFTDto): Promise<NFTEntity | null> {
    await this.repository.update(id, {
      ...dto,
      status: NFTStatus.MINTED,
      mintedAt: new Date(),
    });
    return this.findById(id);
  }

  async list(id: string): Promise<NFTEntity | null> {
    await this.repository.update(id, { status: NFTStatus.LISTED });
    return this.findById(id);
  }

  async markAsSold(id: string): Promise<NFTEntity | null> {
    await this.repository.update(id, {
      status: NFTStatus.SOLD,
      soldAt: new Date(),
    });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
