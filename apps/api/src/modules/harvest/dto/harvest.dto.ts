import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsArray,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { HarvestStatus } from '../entities/entities';

export class CreateHarvestDto {
  @ApiProperty({
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  farmerId!: string;

  @ApiProperty({
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    description: 'Quantité récoltée',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  quantity!: number;

  @ApiProperty({
    description: 'Date/heure de récolte (ISO)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  harvestAt!: string;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 12.345678,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 12.345678,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @ApiProperty({
    description: 'Hash de preuve (on-chain ou IPFS)',
    example: '0xabc123...',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  proofHash!: string;

  @ApiPropertyOptional({
    description: 'Statut de la récolte',
    enum: HarvestStatus,
    example: HarvestStatus.PENDING,
  })
  @IsEnum(HarvestStatus)
  @IsOptional()
  status?: HarvestStatus;

  @ApiPropertyOptional({
    description: 'Unité de mesure',
    example: 'kg',
    default: 'kg',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  unit?: string;

  @ApiPropertyOptional({
    description: 'Qualité de la récolte',
    example: 'excellent',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  quality?: string;

  @ApiPropertyOptional({
    description: 'Notes internes',
    example: 'Récolte effectuée tôt le matin',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'URLs des photos de la récolte',
    example: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({
    description: 'Conditions météorologiques',
    example: 'Ensoleillé, 25°C',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  weatherConditions?: string;

  @ApiPropertyOptional({
    description: 'Méthode de récolte',
    example: 'Manuel',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  harvestMethod?: string;

  @ApiPropertyOptional({
    description: 'Lieu de stockage',
    example: 'Entrepôt principal - Zone A',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  storageLocation?: string;

  @ApiPropertyOptional({
    description: 'Numéro de lot',
    example: 'LOT-2024-001',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  batchNumber?: string;

  @ApiPropertyOptional({
    description: 'Certifications',
    example: 'Bio, Équitable',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  certification?: string;

  @ApiPropertyOptional({
    description: 'Valeur estimée',
    example: 1500.50,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  estimatedValue?: number;

  @ApiPropertyOptional({
    description: 'ID de la coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;
}

export class GetHarvestDto {
  @ApiPropertyOptional({
    description: 'ID de la récolte',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: "ID de l'agriculteur",
  })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({
    description: 'ID du produit',
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({
    description: 'ID de la coopérative',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;

  @ApiPropertyOptional({
    description: 'Statut de la récolte',
    enum: HarvestStatus,
  })
  @IsEnum(HarvestStatus)
  @IsOptional()
  status?: HarvestStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par vérifié',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  verified?: boolean;

  @ApiPropertyOptional({
    description: 'Qualité de la récolte',
    example: 'excellent',
  })
  @IsString()
  @IsOptional()
  quality?: string;

  @ApiPropertyOptional({
    description: 'Quantité minimum',
    example: 50,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minQuantity?: number;

  @ApiPropertyOptional({
    description: 'Quantité maximum',
    example: 500,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxQuantity?: number;

  @ApiPropertyOptional({
    description: 'Date de début (ISO)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin (ISO)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Recherche texte sur proofHash, batchNumber, etc.',
    example: '0xabc',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
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
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Colonne de tri',
    example: 'harvestAt',
    default: 'harvestAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class UpdateHarvestDto extends PartialType(CreateHarvestDto) {}

export class HarvestResponseDto {
  @ApiProperty()
  data: any[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
