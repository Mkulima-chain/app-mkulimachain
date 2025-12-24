import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../entities/entities';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductDto,
} from '../dto/products.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductEntity> {
    const exists = await this.repository.findOne({
      where: { sku: dto.sku },
    });
    if (exists) {
      throw new Error('SKU déjà utilisé');
    }

    const product = this.repository.create({
      ...dto,
      currency: dto.currency || 'USD',
      stock: dto.stock ?? 0,
      isActive: dto.isActive ?? true,
    });

    return this.repository.save(product);
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['harvests'],
    });
  }

  async findBySku(sku: string): Promise<ProductEntity | null> {
    return this.repository.findOne({
      where: { sku },
      relations: ['harvests'],
    });
  }

  async findAll(query: GetProductDto): Promise<ProductEntity[]> {
    const qb = this.repository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.harvests', 'harvests')
      .where('1=1');

    if (query.id) qb.andWhere('product.id = :id', { id: query.id });
    if (query.sku) qb.andWhere('product.sku = :sku', { sku: query.sku });
    if (query.category)
      qb.andWhere('product.category = :category', {
        category: query.category,
      });
    if (query.isActive !== undefined)
      qb.andWhere('product.isActive = :isActive', {
        isActive: query.isActive,
      });
    if (query.originCountry)
      qb.andWhere('product.originCountry = :originCountry', {
        originCountry: query.originCountry,
      });
    if (query.minPrice !== undefined)
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    if (query.maxPrice !== undefined)
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    if (query.search) {
      qb.andWhere(
        '(product.name ILIKE :s OR product.description ILIKE :s OR product.sku ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    return qb.orderBy('product.createdAt', 'DESC').getMany();
  }

  async findActive(): Promise<ProductEntity[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['harvests'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCategory(category: string): Promise<ProductEntity[]> {
    return this.repository.find({
      where: { category, isActive: true },
      relations: ['harvests'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<ProductEntity | null> {
    const product = await this.findById(id);
    if (!product) return null;

    Object.assign(product, dto);
    return this.repository.save(product);
  }

  async updateStock(
    id: string,
    quantity: number,
  ): Promise<ProductEntity | null> {
    const product = await this.findById(id);
    if (!product) return null;

    const newStock = Number(product.stock) + quantity;
    product.stock = Math.max(0, newStock);

    return this.repository.save(product);
  }

  async activate(id: string): Promise<ProductEntity | null> {
    await this.repository.update(id, { isActive: true });
    return this.findById(id);
  }

  async deactivate(id: string): Promise<ProductEntity | null> {
    await this.repository.update(id, { isActive: false });
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async getStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    totalStock: number;
    categories: { category: string; count: number }[];
  }> {
    const allProducts = await this.repository.find();

    const stats = {
      totalProducts: allProducts.length,
      activeProducts: 0,
      inactiveProducts: 0,
      totalStock: 0,
      categories: {} as Record<string, number>,
    };

    for (const product of allProducts) {
      if (product.isActive) {
        stats.activeProducts++;
      } else {
        stats.inactiveProducts++;
      }

      stats.totalStock += Number(product.stock) || 0;

      if (product.category) {
        stats.categories[product.category] =
          (stats.categories[product.category] || 0) + 1;
      }
    }

    return {
      ...stats,
      categories: Object.entries(stats.categories).map(([category, count]) => ({
        category,
        count,
      })),
    };
  }
}
