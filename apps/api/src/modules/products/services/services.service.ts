import { Injectable } from '@nestjs/common';
import { ProductEntity } from '../entities/entities';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from '../dto/products.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IProduct } from '../interfaces/iproducts';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async createProduct(product: CreateProductDto): Promise<ProductEntity> {
    const newProduct = this.productRepository.create(product);
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
    return this.productRepository.save(updatedProduct);
  }
  async getProductById(id: string): Promise<ProductEntity> {
    return this.productRepository.findOne({ where: { id } });
  }
  async getProducts(product: Partial<IProduct>): Promise<ProductEntity[]> {
    return this.productRepository.find({
      where: product as FindOptionsWhere<ProductEntity>,
    });
  }
  async deleteProduct(id: string): Promise<void> {
    await this.productRepository.softDelete(id);
  }
}
