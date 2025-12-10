import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductEntity } from '../entities/entities';
import { Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto, GetProductDto } from '../dto/products.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IProduct } from '../interfaces/iproducts';
import { Like } from 'typeorm';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async createProduct(product: CreateProductDto): Promise<ProductEntity> {
    const exists = await this.productRepository.findOne({
      where: { sku: product.sku },
    });
    if (exists) {
      throw new ConflictException('SKU déjà utilisé');
    }

    const newProduct = this.productRepository.create({
      ...product,
      currency: product.currency || 'USD',
      stock: product.stock ?? 0,
      isActive: product.isActive ?? true,
    });
    return this.productRepository.save(newProduct);
  }
  async updateProduct(
    id: string,
    product: UpdateProductDto,
  ): Promise<ProductEntity> {
    const updatedProduct = await this.productRepository.preload({
      id,
      ...product,
    });
    if (!updatedProduct) {
      throw new NotFoundException('Produit introuvable');
    }
    return this.productRepository.save(updatedProduct);
  }
  async getProductById(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    return product;
  }
  async getProducts(product: GetProductDto): Promise<ProductEntity[]> {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .where('1=1');

    if (product.id) qb.andWhere('product.id = :id', { id: product.id });
    if (product.sku) qb.andWhere('product.sku = :sku', { sku: product.sku });
    if (product.category)
      qb.andWhere('product.category = :category', { category: product.category });
    if (product.isActive !== undefined)
      qb.andWhere('product.isActive = :isActive', { isActive: product.isActive });
    if (product.originCountry)
      qb.andWhere('product.originCountry = :originCountry', {
        originCountry: product.originCountry,
      });
    if (product.minPrice !== undefined)
      qb.andWhere('product.price >= :minPrice', { minPrice: product.minPrice });
    if (product.maxPrice !== undefined)
      qb.andWhere('product.price <= :maxPrice', { maxPrice: product.maxPrice });
    if (product.search) {
      qb.andWhere(
        '(product.name ILIKE :s OR product.description ILIKE :s OR product.sku ILIKE :s)',
        { s: `%${product.search}%` },
      );
    }

    return qb.getMany();
  }
  async deleteProduct(id: string): Promise<void> {
    await this.productRepository.softDelete(id);
  }
}
