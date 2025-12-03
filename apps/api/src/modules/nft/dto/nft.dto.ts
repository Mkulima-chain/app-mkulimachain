import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsUrl,
  IsObject,
  MaxLength,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { NFTType, NFTStatus } from '../interfaces/inft';

export class RevenueDistributionDto {
  @ApiProperty({
    description: 'Pourcentage pour le créateur',
    example: 70,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  creatorPercent!: number;

  @ApiProperty({
    description: 'Pourcentage pour le fonds scolaire',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  schoolFundPercent!: number;

  @ApiProperty({
    description: 'Pourcentage pour la plateforme',
    example: 10,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  platformPercent!: number;
}

export class CreateNFTDto {
  @ApiProperty({
    description: 'ID du créateur (artiste/auteur)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  creatorId!: string;

  @ApiProperty({
    description: 'Type de NFT culturel',
    enum: NFTType,
    example: NFTType.RECIPE,
  })
  @IsEnum(NFTType)
  @IsNotEmpty()
  type!: NFTType;

  @ApiProperty({
    description: 'Titre du NFT',
    example: 'Recette traditionnelle du Fufu',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({
    description: 'Description détaillée',
    example: 'Recette ancestrale transmise de génération en génération...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'URI des métadonnées CIP-25',
    example: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    maxLength: 500,
  })
  @IsUrl()
  @IsNotEmpty()
  @MaxLength(500)
  metadataURI!: string;

  @ApiProperty({
    description: 'Prix en ADA',
    example: 50,
    minimum: 0.000001,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.000001)
  priceADA!: number;

  @ApiProperty({
    description: 'Distribution des revenus',
    type: RevenueDistributionDto,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => RevenueDistributionDto)
  revenueDistribution!: RevenueDistributionDto;
}

export class UpdateNFTDto extends PartialType(CreateNFTDto) {
  @ApiPropertyOptional({
    description: 'Nouveau statut',
    enum: NFTStatus,
  })
  @IsEnum(NFTStatus)
  @IsOptional()
  status?: NFTStatus;
}

export class GetNFTDto {
  @ApiPropertyOptional({
    description: 'ID du NFT',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par créateur',
  })
  @IsUUID()
  @IsOptional()
  creatorId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par type',
    enum: NFTType,
  })
  @IsEnum(NFTType)
  @IsOptional()
  type?: NFTType;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: NFTStatus,
  })
  @IsEnum(NFTStatus)
  @IsOptional()
  status?: NFTStatus;

  @ApiPropertyOptional({
    description: 'Prix minimum',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Prix maximum',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Recherche textuelle',
    example: 'recette',
  })
  @IsString()
  @IsOptional()
  search?: string;
}

export class MintNFTDto {
  @ApiProperty({
    description: 'Hash on-chain après minting',
    example: '0xabc123def456...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  onChainHash!: string;

  @ApiProperty({
    description: 'Policy ID Cardano',
    example: '5e4a2ee0e32d18b5de4ac2f5b0cc9541c9aeb5e7b8d53a2d9c8f6b7a',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  policyId!: string;

  @ApiProperty({
    description: "Nom de l'asset",
    example: 'MkulimaRecipe001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  assetName!: string;
}

export class SellNFTDto {
  @ApiProperty({
    description: "ID de l'acheteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  buyerId!: string;

  @ApiProperty({
    description: 'Hash de la transaction',
    example: '0xdef789abc123...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  transactionHash!: string;
}

export class NFTResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  creatorId!: string;

  @ApiProperty({ enum: NFTType, example: NFTType.RECIPE })
  type!: NFTType;

  @ApiProperty({ example: 'Recette traditionnelle du Fufu' })
  title!: string;

  @ApiPropertyOptional({ example: 'Recette ancestrale...' })
  description?: string;

  @ApiProperty({
    example: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
  })
  metadataURI!: string;

  @ApiProperty({ example: 50 })
  priceADA!: number;

  @ApiProperty({ type: RevenueDistributionDto })
  revenueDistribution!: RevenueDistributionDto;

  @ApiProperty({ enum: NFTStatus, example: NFTStatus.LISTED })
  status!: NFTStatus;

  @ApiPropertyOptional({ example: '0xabc123def456...' })
  onChainHash?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;
}
