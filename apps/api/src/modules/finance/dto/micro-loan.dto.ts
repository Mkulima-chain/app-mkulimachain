import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsInt,
  MaxLength,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoanStatus } from '../interfaces/imicro-loan';

export class CreateMicroLoanDto {
  @ApiProperty({
    description: "ID de l'agriculteur demandant le prêt",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  farmerId!: string;

  @ApiProperty({
    description: 'Montant du prêt en ADA',
    example: 500,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  amountADA!: number;

  @ApiProperty({
    description: "Taux d'intérêt annuel (%)",
    example: 5.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  interestRate!: number;

  @ApiProperty({
    description: 'Durée du prêt en jours',
    example: 90,
    minimum: 1,
    maximum: 365,
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(365)
  durationDays!: number;

  @ApiProperty({
    description: 'Hash du smart contract Plutus',
    example: '0xabc123def456789...',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  loanContractHash!: string;

  @ApiPropertyOptional({
    description: 'Notes sur le prêt',
    example: 'Prêt pour achat de semences',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateMicroLoanDto {
  @ApiPropertyOptional({
    description: 'Nouveau statut du prêt',
    enum: LoanStatus,
  })
  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;

  @ApiPropertyOptional({
    description: 'Hash du smart contract mis à jour',
    example: '0xabc123def456789...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  loanContractHash?: string;

  @ApiPropertyOptional({
    description: 'ID de l\'utilisateur qui a approuvé le prêt',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  approvedBy?: string;

  @ApiPropertyOptional({
    description: 'Date d\'approbation',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  approvedAt?: string | Date;

  @ApiPropertyOptional({
    description: 'Raison de rejet du prêt',
    example: 'Score de crédit insuffisant',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Notes sur le prêt',
    example: 'Prêt pour achat de semences',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class GetMicroLoanDto {
  @ApiPropertyOptional({
    description: 'ID du prêt',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par agriculteur',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: LoanStatus,
  })
  @IsEnum(LoanStatus)
  @IsOptional()
  status?: LoanStatus;

  @ApiPropertyOptional({
    description: 'Montant minimum',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Montant maximum',
    example: 1000,
  })
  @IsNumber()
  @IsOptional()
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Date de début (ISO string)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Date de fin (ISO string)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'ID de l\'utilisateur qui a approuvé',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  approvedBy?: string;
}

export class ActivateLoanDto {
  @ApiPropertyOptional({
    description: 'Hash du smart contract activé',
    example: '0xabc123def456789...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  loanContractHash?: string;
}

export class MicroLoanResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  farmerId!: string;

  @ApiProperty({ example: 500 })
  amountADA!: number;

  @ApiProperty({ example: 5.5 })
  interestRate!: number;

  @ApiProperty({ example: 90 })
  durationDays!: number;

  @ApiProperty({ enum: LoanStatus, example: LoanStatus.PENDING })
  status!: LoanStatus;

  @ApiProperty({ example: '0xabc123def456789...' })
  loanContractHash!: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  startDate?: Date;

  @ApiPropertyOptional({ example: '2024-04-15T10:30:00Z' })
  dueDate?: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;
}

export class RepaymentAmountDto {
  @ApiProperty({
    description: 'Montant total à rembourser (capital + intérêts)',
    example: 527.5,
  })
  amount!: number;
}
