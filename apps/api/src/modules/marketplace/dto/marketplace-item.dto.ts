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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { MarketplaceItemStatus } from '../interfaces/imarketplace-item';

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
    description: "URL de l'image du produit",
    example: 'https://cdn.mkulimachain.com/products/cacao-kasai.jpg',
  })
  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  imageUrl?: string;
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
    description: 'Filtrer par statut',
    enum: MarketplaceItemStatus,
  })
  @IsEnum(MarketplaceItemStatus)
  @IsOptional()
  status?: MarketplaceItemStatus;

  @ApiPropertyOptional({
    description: 'Prix minimum',
    example: 1.0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Prix maximum',
    example: 10.0,
  })
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Recherche textuelle',
    example: 'cacao',
  })
  @IsString()
  @IsOptional()
  search?: string;
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

  @ApiProperty({ example: 'Cacao premium du Kasaï' })
  title!: string;

  @ApiPropertyOptional({ example: 'Cacao de qualité supérieure...' })
  description?: string;

  @ApiProperty({ example: 2.5 })
  priceADA!: number;

  @ApiProperty({ example: 500 })
  stockKg!: number;

  @ApiProperty({
    enum: MarketplaceItemStatus,
    example: MarketplaceItemStatus.ACTIVE,
  })
  status!: MarketplaceItemStatus;

  @ApiPropertyOptional({
    example: 'https://cdn.mkulimachain.com/products/cacao.jpg',
  })
  imageUrl?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;
}
