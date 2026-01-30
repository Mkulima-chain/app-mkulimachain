import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  MaxLength,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BatchStatus } from '../interfaces/ibatch';

export class HarvestQuantityDto {
  @ApiProperty({
    description: 'ID de la récolte',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  harvestId!: string;

  @ApiProperty({
    description: 'Quantité à utiliser de cette récolte (kg)',
    example: 80.5,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;
}

export class CreateBatchDto {
  @ApiProperty({
    description: 'Liste des récoltes avec leurs quantités à inclure dans le lot',
    type: [HarvestQuantityDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HarvestQuantityDto)
  @IsNotEmpty()
  harvests!: HarvestQuantityDto[];

  @ApiPropertyOptional({
    description: 'Liste des IDs de récoltes (déprécié, utiliser harvests)',
    type: [String],
    deprecated: true,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  harvestIds?: string[];

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
}

export class UpdateBatchDto extends PartialType(CreateBatchDto) {}

export class GetBatchDto {
  @ApiPropertyOptional({
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

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

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt!: Date;
}
