import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCreditScoreDto {
  @ApiProperty({
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  farmerId!: string;

  @ApiPropertyOptional({
    description: 'Score initial (calculé via proof-of-harvest)',
    example: 500,
    minimum: 0,
    maximum: 1000,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1000)
  score?: number;
}

export class UpdateCreditScoreDto {
  @ApiPropertyOptional({
    description: 'Nouveau score',
    example: 650,
    minimum: 0,
    maximum: 1000,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(1000)
  score?: number;

  @ApiPropertyOptional({
    description: 'Nombre de récoltes enregistrées',
    example: 15,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  harvestCount?: number;

  @ApiPropertyOptional({
    description: 'Valeur totale des récoltes en ADA',
    example: 5000.5,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  totalHarvestValue?: number;

  @ApiPropertyOptional({
    description: 'Taux de remboursement des prêts (%)',
    example: 95.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  loanRepaymentRate?: number;
}

export class GetCreditScoreDto {
  @ApiPropertyOptional({
    description: 'ID du score',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({
    description: 'Score minimum',
    example: 300,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  minScore?: number;

  @ApiPropertyOptional({
    description: 'Score maximum',
    example: 800,
    maximum: 1000,
  })
  @IsInt()
  @IsOptional()
  @Max(1000)
  maxScore?: number;
}

export class RecordHarvestDto {
  @ApiProperty({
    description: 'Valeur de la récolte en ADA',
    example: 250.5,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  harvestValue!: number;
}

export class CreditScoreResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  farmerId!: string;

  @ApiProperty({ example: 650 })
  score!: number;

  @ApiProperty({ example: 15 })
  harvestCount!: number;

  @ApiProperty({ example: 5000.5 })
  totalHarvestValue!: number;

  @ApiProperty({ example: 95.5 })
  loanRepaymentRate!: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  lastUpdate!: Date;
}
