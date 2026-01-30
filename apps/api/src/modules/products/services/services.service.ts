import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductEntity } from '../entities/entities';
import {
  CreateProductDto,
  UpdateProductDto,
  GetProductDto,
} from '../dto/products.dto';
import { ProductRepository } from '../repositories/products.repository';

@Injectable()
export class ServicesService {
  constructor(private readonly productRepository: ProductRepository) {}

  async createProduct(product: CreateProductDto): Promise<ProductEntity> {
    try {
      return await this.productRepository.create(product);
    } catch (error) {
      if (error.message === 'SKU déjà utilisé') {
        throw new ConflictException('SKU déjà utilisé');
      }
      throw error;
    }
  }

  async updateProduct(
    id: string,
    product: UpdateProductDto,
  ): Promise<ProductEntity> {
    const updatedProduct = await this.productRepository.update(id, product);
    if (!updatedProduct) {
      throw new NotFoundException('Produit introuvable');
    }
    return updatedProduct;
  }

  async getProductById(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    return product;
  }

  async getProducts(product: GetProductDto): Promise<ProductEntity[]> {
    return this.productRepository.findAll(product);
  }

  async getActiveProducts(): Promise<ProductEntity[]> {
    return this.productRepository.findActive();
  }

  async getProductsByCategory(category: string): Promise<ProductEntity[]> {
    return this.productRepository.findByCategory(category);
  }

  async updateStock(id: string, quantity: number): Promise<ProductEntity> {
    const product = await this.productRepository.updateStock(id, quantity);
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    return product;
  }

  async activateProduct(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.activate(id);
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    return product;
  }

  async deactivateProduct(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.deactivate(id);
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.productRepository.delete(id);
  }

  async getProductStats() {
    return this.productRepository.getStats();
  }
}
