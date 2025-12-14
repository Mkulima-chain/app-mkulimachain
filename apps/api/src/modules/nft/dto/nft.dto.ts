import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsUrl,
  IsObject,
  IsArray,
  IsBoolean,
  MaxLength,
  Min,
  Max,
  ValidateNested,
  IsIn,
  Matches,
} from 'class-validator';
import { Type, Transform, Expose } from 'class-transformer';
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
    description: 'URI des métadonnées CIP-25 (peut être IPFS ou HTTP/HTTPS)',
    example: 'ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Matches(/^(ipfs:\/\/|https?:\/\/|ar:\/\/)/i, {
    message: 'metadataURI must be a valid URI (ipfs://, http://, https://, or ar://)',
  })
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

  @ApiPropertyOptional({
    description: 'URLs des images',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({
    description: 'URL de la miniature',
    example: 'https://example.com/thumbnail.jpg',
  })
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Tags pour catégoriser le NFT',
    example: ['tradition', 'cuisine', 'lingala'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Collection du NFT',
    example: 'culture',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  collection?: string;

  @ApiPropertyOptional({
    description: 'URL de l\'audio (pour les chants)',
    example: 'https://example.com/audio.mp3',
  })
  @IsUrl()
  @IsOptional()
  audioUrl?: string;

  @ApiPropertyOptional({
    description: 'Rareté du NFT',
    example: 'rare',
    enum: ['common', 'rare', 'epic', 'legendary'],
  })
  @IsOptional()
  @IsIn(['common', 'rare', 'epic', 'legendary'])
  rarity?: string;

  @ApiPropertyOptional({
    description: 'Attributs personnalisés',
    example: [{ trait_type: 'Région', value: 'Kasaï' }],
    type: 'array',
  })
  @IsArray()
  @IsOptional()
  attributes?: Array<{ trait_type: string; value: string }>;
}

export class UpdateNFTDto extends PartialType(CreateNFTDto) {
  @ApiPropertyOptional({
    description: 'Nouveau statut',
    enum: NFTStatus,
  })
  @IsEnum(NFTStatus)
  @IsOptional()
  status?: NFTStatus;

  @ApiPropertyOptional({
    description: 'Mettre en avant',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Vérifié',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  verified?: boolean;
}

export class GetNFTDto {
  @ApiPropertyOptional({
    description: 'ID du NFT',
  })
  @Expose()
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par créateur',
  })
  @Expose()
  @IsUUID()
  @IsOptional()
  creatorId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par type',
    enum: NFTType,
  })
  @Expose()
  @IsEnum(NFTType)
  @IsOptional()
  type?: NFTType;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: NFTStatus,
  })
  @Expose()
  @IsEnum(NFTStatus)
  @IsOptional()
  status?: NFTStatus;

  @ApiPropertyOptional({
    description: 'Prix minimum',
    example: 10,
  })
  @Expose()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Prix maximum',
    example: 100,
  })
  @Expose()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Recherche textuelle',
    example: 'recette',
  })
  @Expose()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par collection',
    example: 'culture',
  })
  @Expose()
  @IsString()
  @IsOptional()
  collection?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par vérifiés',
    example: true,
  })
  @Expose()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrer par mis en avant',
    example: true,
  })
  @Expose()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrer par rareté',
    example: 'rare',
    enum: ['common', 'rare', 'epic', 'legendary'],
  })
  @Expose()
  @IsIn(['common', 'rare', 'epic', 'legendary'])
  @IsOptional()
  rarity?: string;

  @ApiPropertyOptional({
    description: 'Tags à rechercher',
    example: ['tradition', 'cuisine'],
    type: [String],
  })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    minimum: 1,
  })
  @Expose()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @Expose()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'createdAt',
    enum: ['createdAt', 'views', 'likes', 'price'],
  })
  @Expose()
  @IsOptional()
  @IsIn(['createdAt', 'views', 'likes', 'price'])
  sortBy?: 'createdAt' | 'views' | 'likes' | 'price';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @Expose()
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
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

  @ApiPropertyOptional({ example: ['https://example.com/image1.jpg'] })
  images?: string[];

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.jpg' })
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: ['tradition', 'cuisine'] })
  tags?: string[];

  @ApiPropertyOptional({ example: 'culture' })
  collection?: string;

  @ApiProperty({ example: 0 })
  views!: number;

  @ApiProperty({ example: 0 })
  likes!: number;

  @ApiPropertyOptional({ example: 'https://example.com/audio.mp3' })
  audioUrl?: string;

  @ApiProperty({ example: false })
  verified!: boolean;

  @ApiProperty({ example: false })
  featured!: boolean;

  @ApiPropertyOptional({ example: 'rare' })
  rarity?: string;

  @ApiPropertyOptional({ example: [{ trait_type: 'Région', value: 'Kasaï' }] })
  attributes?: Array<{ trait_type: string; value: string }>;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;
}

export class NFTListResponseDto {
  @ApiProperty({ type: [NFTResponseDto] })
  data!: NFTResponseDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;
}
