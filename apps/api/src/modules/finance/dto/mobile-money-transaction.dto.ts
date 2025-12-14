import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  MaxLength,
  Min,
  Matches,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MobileMoneyProvider,
  TransactionStatus,
  TransactionType,
} from '../interfaces/imobile-money-transaction';

export class CreateMobileMoneyTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'fromMobileNumber must be a valid phone number',
  })
  fromMobileNumber!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  toAdaAddress!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount!: number;

  @IsEnum(MobileMoneyProvider)
  @IsNotEmpty()
  provider!: MobileMoneyProvider;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type!: TransactionType;

  @ApiPropertyOptional({
    description: "ID de l'agriculteur associé",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({
    description: 'ID du prêt associé',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  loanId?: string;

  @ApiPropertyOptional({
    description: 'Notes sur la transaction',
    example: 'Paiement de prêt #123',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateMobileMoneyTransactionDto {
  @ApiPropertyOptional({
    description: 'Statut de la transaction',
    enum: TransactionStatus,
  })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiPropertyOptional({
    description: 'Référence de la transaction',
    example: 'TXN123456',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  transactionRef?: string;

  @ApiPropertyOptional({
    description: 'Raison d\'échec de la transaction',
    example: 'Fonds insuffisants',
  })
  @IsString()
  @IsOptional()
  failureReason?: string;

  @ApiPropertyOptional({
    description: 'Montant en ADA',
    example: 100.5,
  })
  @IsNumber()
  @IsOptional()
  amountADA?: number;

  @ApiPropertyOptional({
    description: "ID de l'agriculteur associé",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({
    description: 'ID du prêt associé',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  loanId?: string;

  @ApiPropertyOptional({
    description: 'Notes sur la transaction',
    example: 'Paiement de prêt #123',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class GetMobileMoneyTransactionDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  fromMobileNumber?: string;

  @IsString()
  @IsOptional()
  toAdaAddress?: string;

  @IsEnum(MobileMoneyProvider)
  @IsOptional()
  provider?: MobileMoneyProvider;

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @ApiPropertyOptional({
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({
    description: 'ID du prêt',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  loanId?: string;

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
}

export class CompleteTransactionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  transactionRef!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amountADA!: number;
}

export class FailTransactionDto {
  @IsString()
  @IsNotEmpty()
  failureReason!: string;
}
