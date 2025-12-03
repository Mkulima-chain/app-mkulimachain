import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDate,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StepType } from '../interfaces/isupply-chain-step';

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
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  timestamp?: Date;

  @ApiProperty({
    description: 'Hash des métadonnées on-chain',
    example: '0xabc123def456...',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  metadataHash!: string;
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

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;
}
