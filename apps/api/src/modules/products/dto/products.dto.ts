import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  IsArray,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { IProduct } from '../interfaces/iproducts';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductStatus } from '../entities/entities';

export class CreateProductDto {
  @ApiProperty({
    description: 'Référence unique (SKU)',
    example: 'PRD-CAKAO-001',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  sku: string;

  @ApiProperty({
    description: 'Nom du produit',
    example: 'Cacao premium',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Unité de mesure',
    example: 'kg',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  unit: string;

  @ApiProperty({
    description: 'Catégorie',
    example: 'Cacao',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  category: string;

  @ApiProperty({
    description: 'Description du produit',
    example: 'Cacao biologique provenant du Nord Kivu',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Prix unitaire',
    example: 12.5,
  })
  @IsNotEmpty()
  price: number;

  @ApiPropertyOptional({
    description: 'Devise ISO 4217',
    example: 'USD',
  })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({
    description: 'Stock disponible',
    example: 150,
  })
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({
    description: "Pays d'origine (ISO 3166-1 alpha-2)",
    example: 'CD',
  })
  @IsString()
  @IsOptional()
  @MaxLength(80)
  originCountry?: string;

  @ApiPropertyOptional({
    description: 'Produit actif',
    example: true,
  })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Tags (mots-clés)',
    example: ['bio', 'premium'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'URLs des images du produit',
    example: ['https://exemple.com/image1.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  image?: string[];

  @ApiPropertyOptional({
    description: 'Statut du produit',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Code-barres du produit',
    example: '1234567890123',
  })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  barcode?: string;

  @ApiPropertyOptional({
    description: 'Poids unitaire en kg',
    example: 1.5,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({
    description: 'Dimensions (LxWxH)',
    example: '10x5x3',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  dimensions?: string;

  @ApiPropertyOptional({
    description: 'Date d\'expiration (format ISO)',
    example: '2024-12-31',
  })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Niveau de stock minimum (alerte)',
    example: 10,
    default: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Niveau de stock maximum',
    example: 1000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  maxStockLevel?: number;

  @ApiPropertyOptional({
    description: 'Fournisseur',
    example: 'Coopérative Agricole du Kasaï',
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  supplier?: string;

  @ApiPropertyOptional({
    description: 'Notes internes',
    example: 'Produit certifié bio',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class GetProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Recherche plein texte sur nom/description/sku/barcode',
    example: 'cacao',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: ProductStatus,
  })
  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par vérifié',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @ApiPropertyOptional({
    description: 'Prix min',
    example: 5,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Prix max',
    example: 20,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Stock min',
    example: 0,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  minStock?: number;

  @ApiPropertyOptional({
    description: 'Stock max',
    example: 100,
  })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  maxStock?: number;

  @ApiPropertyOptional({
    description: 'Numéro de page pour la pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Colonne pour le tri',
    example: 'price',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
