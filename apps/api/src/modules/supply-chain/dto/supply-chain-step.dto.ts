import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDate,
  IsDateString,
  MaxLength,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUrl,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  StepType,
  StepStatus,
  Quality,
} from '../interfaces/isupply-chain-step';

export class CreateSupplyChainStepDto {
  @ApiProperty({
    description: 'ID du lot associé',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  batchId!: string;

  @ApiProperty({
    description: "Type d'étape dans la chaîne",
    enum: StepType,
    example: StepType.HARVEST,
  })
  @IsEnum(StepType)
  @IsNotEmpty()
  stepType!: StepType;

  @ApiPropertyOptional({
    description: "Horodatage de l'étape",
    example: '2024-01-15T10:30:00Z',
  })
  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @ApiProperty({
    description: 'Hash des métadonnées on-chain',
    example: '0xabc123def456...',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  metadataHash!: string;

  @ApiPropertyOptional({
    description: 'Nom ou description de l\'étape',
    example: 'Récolte - Champ A1',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de l\'étape',
    example: 'Récolte effectuée manuellement dans le champ A1',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Lieu où l\'étape a été effectuée',
    example: 'Champ A1, Kasaï',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'Latitude GPS',
    example: -6.2453,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude GPS',
    example: 22.4894,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Température enregistrée (°C)',
    example: 25.5,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(-50)
  @Max(100)
  temperature?: number;

  @ApiPropertyOptional({
    description: 'Humidité relative (%)',
    example: 65.5,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  humidity?: number;

  @ApiPropertyOptional({
    description: 'Quantité traitée à cette étape',
    example: 100.5,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Poids traité (kg)',
    example: 50.25,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

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
    description: 'Statut de l\'étape',
    enum: StepStatus,
    default: StepStatus.PENDING,
  })
  @IsEnum(StepStatus)
  @IsOptional()
  status?: StepStatus;

  @ApiPropertyOptional({
    description: 'ID de la personne responsable',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  responsiblePersonId?: string;

  @ApiPropertyOptional({
    description: 'Nom de la personne responsable',
    example: 'Jean Kabila',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  responsiblePerson?: string;

  @ApiPropertyOptional({
    description: 'URL ou référence du certificat',
    example: 'https://example.com/certificate.pdf',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  certificate?: string;

  @ApiPropertyOptional({
    description: 'Notes internes',
    example: 'Étape réalisée conformément aux normes',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'URLs des photos',
    example: ['https://example.com/photo1.jpg'],
    type: [String],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  photos?: string[];

  @ApiPropertyOptional({
    description: 'URLs des documents associés',
    example: ['https://example.com/document.pdf'],
    type: [String],
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  documents?: string[];

  @ApiPropertyOptional({
    description: 'Durée de l\'étape en minutes',
    example: 120,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  duration?: number;

  @ApiPropertyOptional({
    description: 'Équipement utilisé',
    example: 'Moissonneuse-batteuse',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  equipment?: string;

  @ApiPropertyOptional({
    description: 'Coût associé à cette étape',
    example: 500.50,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  cost?: number;

  @ApiPropertyOptional({
    description: 'Qualité observée',
    enum: Quality,
  })
  @IsEnum(Quality)
  @IsOptional()
  quality?: Quality;

  @ApiPropertyOptional({
    description: 'ID de l\'étape précédente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  previousStepId?: string;

  @ApiPropertyOptional({
    description: 'ID de l\'étape suivante',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  nextStepId?: string;

  @ApiPropertyOptional({
    description: 'Ordre de séquence dans la chaîne',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  sequenceOrder?: number;

  @ApiPropertyOptional({
    description: 'Hash de la transaction blockchain',
    example: '0xabc123def456...',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  blockchainTxHash?: string;

  @ApiPropertyOptional({
    description: 'Code QR associé',
    example: 'QR-STEP-001',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  qrCode?: string;

  @ApiPropertyOptional({
    description: 'ID de la coopérative associée',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;

  @ApiPropertyOptional({
    description: 'ID de l\'installation/facilité',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  facilityId?: string;
}

export class UpdateSupplyChainStepDto extends PartialType(
  CreateSupplyChainStepDto,
) {}

export class GetSupplyChainStepDto {
  @ApiPropertyOptional({
    description: "ID de l'étape",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  batchId?: string;

  @ApiPropertyOptional({
    description: "Filtrer par type d'étape",
    enum: StepType,
  })
  @IsEnum(StepType)
  @IsOptional()
  stepType?: StepType;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: StepStatus,
  })
  @IsEnum(StepStatus)
  @IsOptional()
  status?: StepStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par vérifié',
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  verified?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrer par qualité',
    enum: Quality,
  })
  @IsEnum(Quality)
  @IsOptional()
  quality?: Quality;

  @ApiPropertyOptional({
    description: 'Filtrer par localisation',
    example: 'Kasaï',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par responsable',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  responsiblePersonId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;

  @ApiPropertyOptional({
    description: 'Recherche textuelle (nom, description, localisation)',
    example: 'récolte',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Date de début (pour plage de dates)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin (pour plage de dates)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Numéro de page (pour pagination)',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'timestamp',
    enum: ['timestamp', 'createdAt', 'sequenceOrder', 'name'],
    default: 'timestamp',
  })
  @IsEnum(['timestamp', 'createdAt', 'sequenceOrder', 'name'])
  @IsOptional()
  sortBy?: 'timestamp' | 'createdAt' | 'sequenceOrder' | 'name';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    default: 'ASC',
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class SupplyChainStepResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  batchId!: string;

  @ApiProperty({ enum: StepType, example: StepType.HARVEST })
  stepType!: StepType;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  timestamp!: Date;

  @ApiProperty({ example: '0xabc123def456...' })
  metadataHash!: string;

  @ApiPropertyOptional({ example: 'Récolte - Champ A1' })
  name?: string;

  @ApiPropertyOptional({ example: 'Description détaillée' })
  description?: string;

  @ApiPropertyOptional({ example: 'Kasaï' })
  location?: string;

  @ApiPropertyOptional({ example: -6.2453 })
  latitude?: number;

  @ApiPropertyOptional({ example: 22.4894 })
  longitude?: number;

  @ApiPropertyOptional({ example: 25.5 })
  temperature?: number;

  @ApiPropertyOptional({ example: 65.5 })
  humidity?: number;

  @ApiPropertyOptional({ example: 100.5 })
  quantity?: number;

  @ApiPropertyOptional({ example: 50.25 })
  weight?: number;

  @ApiPropertyOptional({ example: 'kg' })
  unit?: string;

  @ApiPropertyOptional({ enum: StepStatus, example: StepStatus.COMPLETED })
  status?: StepStatus;

  @ApiPropertyOptional({ example: true })
  verified?: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  verifiedAt?: Date;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  verifiedBy?: string;

  @ApiPropertyOptional({ example: 'Jean Kabila' })
  responsiblePerson?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  responsiblePersonId?: string;

  @ApiPropertyOptional({ example: 'https://example.com/certificate.pdf' })
  certificate?: string;

  @ApiPropertyOptional({ example: 'Notes internes' })
  notes?: string;

  @ApiPropertyOptional({ example: ['https://example.com/photo1.jpg'] })
  photos?: string[];

  @ApiPropertyOptional({ example: ['https://example.com/document.pdf'] })
  documents?: string[];

  @ApiPropertyOptional({ example: 120 })
  duration?: number;

  @ApiPropertyOptional({ example: 'Moissonneuse-batteuse' })
  equipment?: string;

  @ApiPropertyOptional({ example: 500.50 })
  cost?: number;

  @ApiPropertyOptional({ enum: Quality, example: Quality.EXCELLENT })
  quality?: Quality;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  nextStepId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  previousStepId?: string;

  @ApiPropertyOptional({ example: 1 })
  sequenceOrder?: number;

  @ApiPropertyOptional({ example: '0xabc123def456...' })
  blockchainTxHash?: string;

  @ApiPropertyOptional({ example: 'QR-STEP-001' })
  qrCode?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  cooperativeId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  facilityId?: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt!: Date;
}

export class SupplyChainTimelineDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  batchId!: string;

  @ApiProperty({ type: [SupplyChainStepResponseDto] })
  steps!: SupplyChainStepResponseDto[];

  @ApiProperty({ example: 5 })
  totalSteps!: number;

  @ApiProperty({ example: 4 })
  completedSteps!: number;

  @ApiProperty({ example: 1 })
  pendingSteps!: number;
}

export class VerifyStepDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur qui vérifie',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  verifiedBy!: string;
}

export class UpdateStepStatusDto {
  @ApiProperty({
    description: 'Nouveau statut',
    enum: StepStatus,
    example: StepStatus.COMPLETED,
  })
  @IsEnum(StepStatus)
  @IsNotEmpty()
  status!: StepStatus;
}
