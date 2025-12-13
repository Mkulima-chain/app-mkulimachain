import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ProductEntity, ProductStatus } from '../entities/entities';
import { Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto, GetProductDto } from '../dto/products.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IProduct } from '../interfaces/iproducts';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  async createProduct(product: CreateProductDto): Promise<ProductEntity> {
    this.logger.log(`Création d'un nouveau produit: ${product.name} (SKU: ${product.sku})`);

    try {
      // Vérifier si le SKU existe déjà
    const exists = await this.productRepository.findOne({
      where: { sku: product.sku },
    });
    if (exists) {
        this.logger.warn(`Tentative de création avec SKU existant: ${product.sku}`);
      throw new ConflictException('SKU déjà utilisé');
    }

      // Vérifier si le code-barres existe déjà (si fourni)
      if (product.barcode) {
        const existsByBarcode = await this.productRepository.findOne({
          where: { barcode: product.barcode },
        });
        if (existsByBarcode) {
          this.logger.warn(`Tentative de création avec code-barres existant: ${product.barcode}`);
          throw new ConflictException('Code-barres déjà utilisé');
        }
      }

      // Valider le prix
      if (product.price < 0) {
        throw new BadRequestException('Le prix ne peut pas être négatif');
      }

      // Valider le stock
      if (product.stock !== undefined && product.stock < 0) {
        throw new BadRequestException('Le stock ne peut pas être négatif');
      }

      // Calculer le statut automatiquement selon le stock
      let status = product.status || ProductStatus.ACTIVE;
      if (product.stock !== undefined && product.stock === 0 && !product.status) {
        status = ProductStatus.OUT_OF_STOCK;
      }

    const newProduct = this.productRepository.create({
      ...product,
      currency: product.currency || 'USD',
      stock: product.stock ?? 0,
      isActive: product.isActive ?? true,
        status: status,
        verified: false,
        minStockLevel: product.minStockLevel ?? 0,
        reviewCount: 0,
    });

      const savedProduct = await this.productRepository.save(newProduct);
      this.logger.log(`Produit créé avec succès: ${savedProduct.id}`);
      return savedProduct;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la création du produit: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
  async updateProduct(
    id: string,
    product: UpdateProductDto,
  ): Promise<ProductEntity> {
    this.logger.log(`Mise à jour du produit: ${id}`);

    const existingProduct = await this.productRepository.findOne({
      where: { id },
    });

    if (!existingProduct) {
      this.logger.warn(`Tentative de mise à jour d'un produit inexistante: ${id}`);
      throw new NotFoundException('Produit introuvable');
    }

    // Vérifier si le SKU existe déjà (sauf pour le produit actuel)
    if (product.sku && product.sku !== existingProduct.sku) {
      const productWithSku = await this.productRepository.findOne({
        where: { sku: product.sku },
      });
      if (productWithSku) {
        throw new ConflictException('SKU déjà utilisé');
      }
    }

    // Vérifier si le code-barres existe déjà (sauf pour le produit actuel)
    if (product.barcode && product.barcode !== existingProduct.barcode) {
      const productWithBarcode = await this.productRepository.findOne({
        where: { barcode: product.barcode },
      });
      if (productWithBarcode) {
        throw new ConflictException('Code-barres déjà utilisé');
      }
    }

    // Valider le prix
    if (product.price !== undefined && product.price < 0) {
      throw new BadRequestException('Le prix ne peut pas être négatif');
    }

    // Valider le stock
    if (product.stock !== undefined && product.stock < 0) {
      throw new BadRequestException('Le stock ne peut pas être négatif');
    }

    // Mettre à jour le statut automatiquement si le stock change
    const finalStock = product.stock !== undefined ? product.stock : existingProduct.stock;
    if (product.status === undefined && finalStock === 0 && existingProduct.status !== ProductStatus.DISCONTINUED) {
      product.status = ProductStatus.OUT_OF_STOCK;
    } else if (product.status === undefined && finalStock > 0 && existingProduct.status === ProductStatus.OUT_OF_STOCK) {
      product.status = ProductStatus.ACTIVE;
    }

    const updatedProduct = await this.productRepository.preload({
      id,
      ...product,
    });

    if (!updatedProduct) {
      throw new NotFoundException('Produit introuvable');
    }

    const saved = await this.productRepository.save(updatedProduct);
    this.logger.log(`Produit mis à jour avec succès: ${id}`);
    return saved;
  }
  async getProductById(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Produit introuvable');
    }
    return product;
  }
  async getProducts(product: GetProductDto): Promise<{
    data: ProductEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = product.page || 1;
    const limit = product.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .where('1=1');

    if (product.id) qb.andWhere('product.id = :id', { id: product.id });
    if (product.sku) qb.andWhere('product.sku = :sku', { sku: product.sku });
    if (product.category)
      qb.andWhere('product.category = :category', { category: product.category });
    if (product.isActive !== undefined)
      qb.andWhere('product.isActive = :isActive', { isActive: product.isActive });
    if (product.status)
      qb.andWhere('product.status = :status', { status: product.status });
    if (product.verified !== undefined)
      qb.andWhere('product.verified = :verified', { verified: product.verified });
    if (product.originCountry)
      qb.andWhere('product.originCountry = :originCountry', {
        originCountry: product.originCountry,
      });
    if (product.minPrice !== undefined)
      qb.andWhere('product.price >= :minPrice', { minPrice: product.minPrice });
    if (product.maxPrice !== undefined)
      qb.andWhere('product.price <= :maxPrice', { maxPrice: product.maxPrice });
    if (product.minStock !== undefined)
      qb.andWhere('product.stock >= :minStock', { minStock: product.minStock });
    if (product.maxStock !== undefined)
      qb.andWhere('product.stock <= :maxStock', { maxStock: product.maxStock });
    if (product.search) {
      qb.andWhere(
        '(product.name ILIKE :s OR product.description ILIKE :s OR product.sku ILIKE :s OR product.barcode ILIKE :s)',
        { s: `%${product.search}%` },
      );
    }

    // Tri
    if (product.sortBy) {
      const sortOrder = product.sortOrder || 'ASC';
      qb.orderBy(`product.${product.sortBy}`, sortOrder as 'ASC' | 'DESC');
    } else {
      qb.orderBy('product.createdAt', 'DESC');
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    this.logger.log(
      `Recherche de produits: ${total} résultats trouvés (page ${page})`,
    );

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  async deleteProduct(id: string): Promise<void> {
    this.logger.log(`Suppression du produit: ${id}`);

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      this.logger.warn(`Tentative de suppression d'un produit inexistant: ${id}`);
      throw new NotFoundException('Produit introuvable');
    }

    await this.productRepository.softDelete(id);
    this.logger.log(`Produit supprimé avec succès: ${id}`);
  }

  async verifyProduct(
    id: string,
    verifiedBy: string | null,
  ): Promise<ProductEntity> {
    this.logger.log(
      `Vérification du produit: ${id} par ${verifiedBy || 'système'}`,
    );

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
    }

    product.verified = true;
    product.verifiedAt = new Date();
    product.verifiedBy = verifiedBy || undefined;

    const updatedProduct = await this.productRepository.save(product);
    this.logger.log(`Produit vérifié avec succès: ${id}`);
    return updatedProduct;
  }

  async updateProductStatus(
    id: string,
    status: ProductStatus,
  ): Promise<ProductEntity> {
    this.logger.log(`Mise à jour du statut du produit ${id}: ${status}`);

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
    }

    product.status = status;
    // Si le statut est inactif ou discontinué, désactiver aussi isActive
    if (status === ProductStatus.INACTIVE || status === ProductStatus.DISCONTINUED) {
      product.isActive = false;
    } else if (status === ProductStatus.ACTIVE) {
      product.isActive = true;
    }

    const updatedProduct = await this.productRepository.save(product);
    this.logger.log(`Statut mis à jour avec succès: ${id}`);
    return updatedProduct;
  }

  async updateProductStock(
    id: string,
    quantity: number,
  ): Promise<ProductEntity> {
    this.logger.log(`Mise à jour du stock du produit ${id}: ${quantity}`);

    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
    }

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw new BadRequestException('Stock insuffisant');
    }

    product.stock = newStock;

    // Mettre à jour le statut automatiquement selon le stock
    if (newStock === 0 && product.status !== ProductStatus.DISCONTINUED) {
      product.status = ProductStatus.OUT_OF_STOCK;
    } else if (newStock > 0 && product.status === ProductStatus.OUT_OF_STOCK) {
      product.status = ProductStatus.ACTIVE;
    }

    const updatedProduct = await this.productRepository.save(product);
    this.logger.log(`Stock mis à jour avec succès: ${id}`);
    return updatedProduct;
  }

  async getProductStats(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['harvests'],
    });

    if (!product) {
      throw new NotFoundException(`Produit avec l'ID ${id} non trouvé`);
    }

    const totalHarvests = product.harvests?.length || 0;
    const totalQuantity = product.harvests?.reduce(
      (sum, h) => sum + (Number(h.quantity) || 0),
      0,
    ) || 0;
    const stockValue = Number(product.price) * product.stock;

    return {
      totalHarvests,
      totalQuantity,
      stockValue,
      stock: product.stock,
      price: product.price,
      currency: product.currency,
    };
  }

  async getLowStockProducts(): Promise<ProductEntity[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.stock <= product."minStockLevel"')
      .andWhere('product.isActive = :isActive', { isActive: true })
      .andWhere('product.status != :status', { status: ProductStatus.DISCONTINUED })
      .orderBy('product.stock', 'ASC')
      .getMany();

    this.logger.log(`${products.length} produits en rupture de stock trouvés`);
    return products;
  }

  async getGlobalStats() {
    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      verifiedProducts,
      totalStockValue,
    ] = await Promise.all([
      this.productRepository.count(),
      this.productRepository.count({ where: { isActive: true } }),
      this.productRepository.count({ where: { status: ProductStatus.OUT_OF_STOCK } }),
      this.productRepository.count({ where: { verified: true } }),
      this.productRepository
        .createQueryBuilder('product')
        .select('SUM(product.price * product.stock)', 'total')
        .where('product.isActive = :isActive', { isActive: true })
        .getRawOne(),
    ]);

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      verifiedProducts,
      totalStockValue: totalStockValue?.total || 0,
    };
  }
}
