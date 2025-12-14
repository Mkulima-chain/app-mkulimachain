import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { NFTEntity } from '../entities/nft.entity';
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

  async findById(id: string, includeCreator = true): Promise<NFTEntity | null> {
    const qb = this.repository.createQueryBuilder('nft');
    if (includeCreator) {
      qb.leftJoinAndSelect('nft.creator', 'creator');
    }
    qb.where('nft.id = :id', { id });
    return qb.getOne();
  }

  async findByOnChainHash(onChainHash: string): Promise<NFTEntity | null> {
    return this.repository.findOne({ where: { onChainHash } });
  }

  async findAll(
    query: GetNFTDto,
  ): Promise<{ data: NFTEntity[]; total: number; page: number; limit: number }> {
    const qb = this.repository.createQueryBuilder('nft');
    qb.leftJoinAndSelect('nft.creator', 'creator');

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
    if (query.collection)
      qb.andWhere('nft.collection = :collection', {
        collection: query.collection,
      });
    if (query.verified !== undefined)
      qb.andWhere('nft.verified = :verified', { verified: query.verified });
    if (query.featured !== undefined)
      qb.andWhere('nft.featured = :featured', { featured: query.featured });
    if (query.rarity)
      qb.andWhere('nft.rarity = :rarity', { rarity: query.rarity });
    if (query.tags && query.tags.length > 0) {
      qb.andWhere('nft.tags @> :tags', { tags: JSON.stringify(query.tags) });
    }

    // Tri
    if (query.sortBy === 'views') {
      qb.orderBy('nft.views', query.sortOrder || 'DESC');
    } else if (query.sortBy === 'likes') {
      qb.orderBy('nft.likes', query.sortOrder || 'DESC');
    } else if (query.sortBy === 'price') {
      qb.orderBy('nft.priceADA', query.sortOrder || 'ASC');
    } else {
      qb.orderBy('nft.createdAt', 'DESC');
    }

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findByCreatorId(
    creatorId: string,
    includeCreator = false,
  ): Promise<NFTEntity[]> {
    const qb = this.repository.createQueryBuilder('nft');
    if (includeCreator) {
      qb.leftJoinAndSelect('nft.creator', 'creator');
    }
    qb.where('nft.creatorId = :creatorId', { creatorId });
    qb.orderBy('nft.createdAt', 'DESC');
    return qb.getMany();
  }

  async findListed(includeCreator = true): Promise<NFTEntity[]> {
    const qb = this.repository.createQueryBuilder('nft');
    if (includeCreator) {
      qb.leftJoinAndSelect('nft.creator', 'creator');
    }
    qb.where('nft.status = :status', { status: NFTStatus.LISTED });
    qb.orderBy('nft.createdAt', 'DESC');
    return qb.getMany();
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

  async setFeatured(id: string, featured: boolean): Promise<NFTEntity | null> {
    const updateData: Partial<NFTEntity> = { featured };
    if (featured) {
      updateData.featuredAt = new Date();
    } else {
      updateData.featuredAt = null;
    }
    await this.repository.update(id, updateData);
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

  async findFeatured(limit = 10): Promise<NFTEntity[]> {
    return this.repository.find({
      where: { featured: true, status: NFTStatus.LISTED },
      relations: ['creator'],
      order: { featuredAt: 'DESC' },
      take: limit,
    });
  }

  async findTrending(limit = 10): Promise<NFTEntity[]> {
    return this.repository.find({
      where: { status: NFTStatus.LISTED },
      relations: ['creator'],
      order: { views: 'DESC', likes: 'DESC' },
      take: limit,
    });
  }

  async findByTags(tags: string[]): Promise<NFTEntity[]> {
    return this.repository
      .createQueryBuilder('nft')
      .leftJoinAndSelect('nft.creator', 'creator')
      .where('nft.tags @> :tags', { tags: JSON.stringify(tags) })
      .andWhere('nft.status = :status', { status: NFTStatus.LISTED })
      .orderBy('nft.createdAt', 'DESC')
      .getMany();
  }

  async incrementViews(id: string): Promise<void> {
    await this.repository.increment({ id }, 'views', 1);
  }

  async incrementLikes(id: string): Promise<void> {
    await this.repository.increment({ id }, 'likes', 1);
  }

  async decrementLikes(id: string): Promise<void> {
    await this.repository.decrement({ id }, 'likes', 1);
  }

  async getStats(): Promise<{
    total: number;
    listed: number;
    sold: number;
    totalRevenue: number;
    totalViews: number;
    totalLikes: number;
    byType: Record<string, number>;
    byCollection: Record<string, number>;
  }> {
    const [total, listed, sold] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { status: NFTStatus.LISTED } }),
      this.repository.count({ where: { status: NFTStatus.SOLD } }),
    ]);

    const revenueResult = await this.repository
      .createQueryBuilder('nft')
      .select('SUM(nft.priceADA)', 'total')
      .where('nft.status = :status', { status: NFTStatus.SOLD })
      .getRawOne();

    const viewsResult = await this.repository
      .createQueryBuilder('nft')
      .select('SUM(nft.views)', 'total')
      .getRawOne();

    const likesResult = await this.repository
      .createQueryBuilder('nft')
      .select('SUM(nft.likes)', 'total')
      .getRawOne();

    const byTypeResult = await this.repository
      .createQueryBuilder('nft')
      .select('nft.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('nft.type')
      .getRawMany();

    const byCollectionResult = await this.repository
      .createQueryBuilder('nft')
      .select('nft.collection', 'collection')
      .addSelect('COUNT(*)', 'count')
      .where('nft.collection IS NOT NULL')
      .groupBy('nft.collection')
      .getRawMany();

    const byType: Record<string, number> = {};
    byTypeResult.forEach((row) => {
      byType[row.type] = parseInt(row.count);
    });

    const byCollection: Record<string, number> = {};
    byCollectionResult.forEach((row) => {
      byCollection[row.collection] = parseInt(row.count);
    });

    return {
      total,
      listed,
      sold,
      totalRevenue: parseFloat(revenueResult?.total || '0'),
      totalViews: parseInt(viewsResult?.total || '0'),
      totalLikes: parseInt(likesResult?.total || '0'),
      byType,
      byCollection,
    };
  }
}
