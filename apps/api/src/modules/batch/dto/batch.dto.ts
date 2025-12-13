import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  MaxLength,
  IsNumber,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { BatchStatus } from '../interfaces/ibatch';
import { Type } from 'class-transformer';

export class CreateBatchDto {
  @ApiProperty({
    description: 'Liste des IDs de récoltes à inclure dans le lot',
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  harvestIds!: string[];

  @ApiProperty({
    description: 'Code QR unique pour la traçabilité',
    example: 'BATCH-2024-001-KASAI',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  qrCode!: string;

  @ApiProperty({
    description: 'Hash on-chain pour vérification blockchain',
    example:
      '0x1234567890abcdef1234567890abcdef12345678901234567890abcdef12345678',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  batchHash!: string;

  @ApiPropertyOptional({
    description: 'Statut initial du lot',
    enum: BatchStatus,
    default: BatchStatus.CREATED,
  })
  @IsEnum(BatchStatus)
  @IsOptional()
  status?: BatchStatus;

  @ApiPropertyOptional({
    description: 'Nom du lot',
    example: 'Lot Maïs 2024-001',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description détaillée du lot',
    example: 'Lot de maïs de qualité supérieure',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Quantité totale du lot',
    example: 1000.5,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  totalQuantity?: number;

  @ApiPropertyOptional({
    description: 'Poids total du lot en kg',
    example: 500.25,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  totalWeight?: number;

  @ApiPropertyOptional({
    description: 'Unité de mesure',
    example: 'kg',
    maxLength: 20,
    default: 'kg',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({
    description: 'Date de production du lot',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  productionDate?: string;

  @ApiPropertyOptional({
    description: 'Date d\'expiration du lot',
    example: '2025-01-15T10:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  expirationDate?: string;

  @ApiPropertyOptional({
    description: 'Qualité du lot',
    example: 'excellent',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  quality?: string;

  @ApiPropertyOptional({
    description: 'Notes internes sur le lot',
    example: 'Lot vérifié et approuvé',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'URLs des photos du lot',
    example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({
    description: 'Lieu d\'origine du lot',
    example: 'Kasaï, RDC',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  originLocation?: string;

  @ApiPropertyOptional({
    description: 'Lieu de destination du lot',
    example: 'Kinshasa, RDC',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  destinationLocation?: string;

  @ApiPropertyOptional({
    description: 'Certifications',
    example: 'Bio, Équitable',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  certification?: string;

  @ApiPropertyOptional({
    description: 'Valeur estimée du lot',
    example: 5000.00,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedValue?: number;

  @ApiPropertyOptional({
    description: 'ID de la coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;

  @ApiPropertyOptional({
    description: 'ID de l\'agriculteur principal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({
    description: 'ID du produit principal',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Indique si le lot est vérifié',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @ApiPropertyOptional({
    description: 'Date de vérification',
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  verifiedAt?: string;

  @ApiPropertyOptional({
    description: 'ID de l\'utilisateur qui a vérifié',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  verifiedBy?: string;
}

export class UpdateBatchDto extends PartialType(CreateBatchDto) {}

export class GetBatchDto {
  // Note: Ce DTO est utilisé uniquement pour les paramètres de requête GET
  // Les propriétés non listées ici seront automatiquement rejetées par ValidationPipe
  
  @ApiPropertyOptional({
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par code QR ou nom',
    example: 'BATCH-2024-001',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par code QR',
    example: 'BATCH-2024-001',
  })
  @IsString()
  @IsOptional()
  qrCode?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: BatchStatus,
  })
  @IsEnum(BatchStatus)
  @IsOptional()
  status?: BatchStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par vérifié',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  verified?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrer par qualité',
    example: 'excellent',
  })
  @IsString()
  @IsOptional()
  quality?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par agriculteur',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

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

export class BatchResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'BATCH-2024-001-KASAI' })
  qrCode!: string;

  @ApiProperty({ example: '0x1234567890abcdef...' })
  batchHash!: string;

  @ApiProperty({ enum: BatchStatus, example: BatchStatus.CREATED })
  status!: BatchStatus;

  @ApiPropertyOptional({ example: 'Lot Maïs 2024-001' })
  name?: string;

  @ApiPropertyOptional({ example: 'Lot de maïs de qualité supérieure' })
  description?: string;

  @ApiPropertyOptional({ example: 1000.5 })
  totalQuantity?: number;

  @ApiPropertyOptional({ example: 500.25 })
  totalWeight?: number;

  @ApiPropertyOptional({ example: 'kg' })
  unit?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  productionDate?: Date;

  @ApiPropertyOptional({ example: '2025-01-15T10:30:00Z' })
  expirationDate?: Date;

  @ApiProperty({ example: false })
  verified!: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  verifiedAt?: Date;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  verifiedBy?: string;

  @ApiPropertyOptional({ example: 'excellent' })
  quality?: string;

  @ApiPropertyOptional({ example: 'Lot vérifié et approuvé' })
  notes?: string;

  @ApiPropertyOptional({ example: ['https://example.com/photo1.jpg'] })
  photos?: string[];

  @ApiPropertyOptional({ example: 'Kasaï, RDC' })
  originLocation?: string;

  @ApiPropertyOptional({ example: 'Kinshasa, RDC' })
  destinationLocation?: string;

  @ApiPropertyOptional({ example: 'Bio, Équitable' })
  certification?: string;

  @ApiPropertyOptional({ example: 5000.00 })
  estimatedValue?: number;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  cooperativeId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  farmerId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  productId?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt!: Date;
}
