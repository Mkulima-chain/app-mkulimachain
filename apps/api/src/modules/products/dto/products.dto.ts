import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  IsArray,
} from 'class-validator';
import { IProduct } from '../interfaces/iproducts';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateProductDto implements IProduct {
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
    description: 'Recherche plein texte sur nom/description/sku',
    example: 'cacao',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Prix min',
    example: 5,
  })
  @IsOptional()
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Prix max',
    example: 20,
  })
  @IsOptional()
  maxPrice?: number;
}
