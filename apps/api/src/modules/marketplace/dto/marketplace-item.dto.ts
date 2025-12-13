import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsUrl,
  MaxLength,
  Min,
  Max,
  IsArray,
  IsBoolean,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { MarketplaceItemStatus } from '../interfaces/imarketplace-item';
import { Type } from 'class-transformer';

export class CreateMarketplaceItemDto {
  @ApiProperty({
    description: 'ID du lot de production',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  batchId!: string;

  @ApiProperty({
    description: "ID de l'agriculteur vendeur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  farmerId!: string;

  @ApiProperty({
    description: 'Titre du produit',
    example: 'Cacao premium du Kasaï',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    description: 'Description détaillée',
    example: 'Cacao de qualité supérieure, cultivé sans pesticides...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Prix par kg en ADA',
    example: 2.5,
    minimum: 0.000001,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.000001)
  priceADA!: number;

  @ApiProperty({
    description: 'Stock disponible en kg',
    example: 500,
    minimum: 0.01,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  stockKg!: number;

  @ApiPropertyOptional({
    description: "URL de l'image du produit (déprécié, utiliser photos)",
    example: 'https://cdn.mkulimachain.com/products/cacao-kasai.jpg',
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'SKU du produit',
    example: 'MP-2024-001',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({
    description: 'Catégorie du produit',
    example: 'Cacao',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Tags pour la recherche',
    example: ['bio', 'premium', 'kasai'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'URLs des photos du produit',
    example: ['https://cdn.mkulimachain.com/products/cacao-1.jpg', 'https://cdn.mkulimachain.com/products/cacao-2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({
    description: 'Quantité minimale de commande en kg',
    example: 1.0,
    minimum: 0.01,
  })
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  minOrderKg?: number;

  @ApiPropertyOptional({
    description: 'Quantité maximale de commande en kg',
    example: 1000.0,
    minimum: 0.01,
  })
  @IsNumber()
  @IsOptional()
  @Min(0.01)
  maxOrderKg?: number;

  @ApiPropertyOptional({
    description: 'Coût de livraison en ADA',
    example: 0.5,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  shippingCostADA?: number;

  @ApiPropertyOptional({
    description: 'Localisation du vendeur',
    example: 'Kasaï, RDC',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'Certifications',
    example: ['Bio', 'Fair Trade'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  certifications?: string[];

  @ApiPropertyOptional({
    description: 'Notes internes',
    example: 'Produit de qualité supérieure',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Mettre en avant le produit',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Date d\'expiration de l\'annonce',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'ID de la coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;
}

export class UpdateMarketplaceItemDto extends PartialType(
  CreateMarketplaceItemDto,
) {
  @ApiPropertyOptional({
    description: 'Nouveau statut',
    enum: MarketplaceItemStatus,
  })
  @IsEnum(MarketplaceItemStatus)
  @IsOptional()
  status?: MarketplaceItemStatus;
}

export class GetMarketplaceItemDto {
  @ApiPropertyOptional({
    description: "ID de l'article",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par lot',
  })
  @IsUUID()
  @IsOptional()
  batchId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par vendeur',
  })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par coopérative',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: MarketplaceItemStatus,
  })
  @IsEnum(MarketplaceItemStatus)
  @IsOptional()
  status?: MarketplaceItemStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par catégorie',
    example: 'Cacao',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par tag',
    example: 'bio',
  })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par certification',
    example: 'Bio',
  })
  @IsString()
  @IsOptional()
  certification?: string;

  @ApiPropertyOptional({
    description: 'Filtrer les produits mis en avant',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Prix minimum',
    example: 1.0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Prix maximum',
    example: 10.0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Stock minimum disponible',
    example: 10.0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({
    description: 'Note minimum',
    example: 4.0,
    minimum: 0,
    maximum: 5,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    description: 'Recherche textuelle (titre, description, SKU)',
    example: 'cacao',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Numéro de page (pour pagination)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'createdAt',
    enum: ['createdAt', 'priceADA', 'stockKg', 'rating', 'views', 'salesCount'],
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class UpdateStockDto {
  @ApiProperty({
    description: 'Quantité à ajouter (positif) ou retirer (négatif)',
    example: -50,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;
}

export class MarketplaceItemResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  batchId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  farmerId!: string;

  @ApiPropertyOptional({ example: 'MP-2024-001' })
  sku?: string;

  @ApiProperty({ example: 'Cacao premium du Kasaï' })
  title!: string;

  @ApiPropertyOptional({ example: 'Cacao de qualité supérieure...' })
  description?: string;

  @ApiPropertyOptional({ example: 'Cacao' })
  category?: string;

  @ApiPropertyOptional({ example: ['bio', 'premium'] })
  tags?: string[];

  @ApiPropertyOptional({ example: ['https://cdn.mkulimachain.com/products/cacao-1.jpg'] })
  photos?: string[];

  @ApiPropertyOptional({
    example: 'https://cdn.mkulimachain.com/products/cacao.jpg',
  })
  imageUrl?: string;

  @ApiProperty({ example: 2.5 })
  priceADA!: number;

  @ApiProperty({ example: 500 })
  stockKg!: number;

  @ApiPropertyOptional({ example: 1.0 })
  minOrderKg?: number;

  @ApiPropertyOptional({ example: 1000.0 })
  maxOrderKg?: number;

  @ApiPropertyOptional({ example: 0.5 })
  shippingCostADA?: number;

  @ApiPropertyOptional({ example: 'Kasaï, RDC' })
  location?: string;

  @ApiPropertyOptional({ example: ['Bio', 'Fair Trade'] })
  certifications?: string[];

  @ApiPropertyOptional({ example: 4.5 })
  rating?: number;

  @ApiProperty({ example: 10 })
  reviewCount!: number;

  @ApiProperty({ example: 150 })
  views!: number;

  @ApiProperty({ example: 25 })
  salesCount!: number;

  @ApiPropertyOptional({ example: 'Notes internes' })
  notes?: string;

  @ApiProperty({ example: false })
  featured!: boolean;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59Z' })
  expiresAt?: Date;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  cooperativeId?: string;

  @ApiProperty({
    enum: MarketplaceItemStatus,
    example: MarketplaceItemStatus.ACTIVE,
  })
  status!: MarketplaceItemStatus;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt!: Date;
}
