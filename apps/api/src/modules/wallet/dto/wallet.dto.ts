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
  IsBoolean,
  IsObject,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OwnerType, WalletStatus } from '../interfaces/iwallet';

export class CreateWalletDto {
  @ApiProperty({
    description: 'Type de propriétaire',
    enum: OwnerType,
    example: OwnerType.FARMER,
  })
  @IsEnum(OwnerType)
  @IsNotEmpty()
  ownerType!: OwnerType;

  @ApiProperty({
    description: 'ID du propriétaire (farmer, buyer ou cooperative)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  ownerId!: string;

  @ApiProperty({
    description: 'Adresse du portefeuille Cardano',
    example:
      'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  adaAddress!: string;

  @ApiPropertyOptional({
    description: 'Numéro Mobile Money (Airtel, Orange, M-Pesa)',
    example: '+243812345678',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'mobileMoneyNumber must be a valid phone number',
  })
  mobileMoneyNumber?: string;

  @ApiPropertyOptional({
    description: 'Solde initial en ADA',
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  balanceADA?: number;

  @ApiPropertyOptional({
    description: 'Statut du portefeuille',
    enum: WalletStatus,
    example: WalletStatus.ACTIVE,
  })
  @IsEnum(WalletStatus)
  @IsOptional()
  status?: WalletStatus;

  @ApiPropertyOptional({
    description: 'Libellé/alias du portefeuille',
    example: 'Portefeuille principal',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  label?: string;

  @ApiPropertyOptional({
    description: 'Description du portefeuille',
    example: 'Portefeuille utilisé pour les transactions principales',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Notes et commentaires',
    example: 'Portefeuille vérifié manuellement',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Métadonnées supplémentaires au format JSON',
    example: { source: 'mobile_app', version: '1.0' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class UpdateWalletDto extends PartialType(CreateWalletDto) {
  @ApiPropertyOptional({
    description: 'Marquer comme vérifié',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Date de vérification',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  verifiedAt?: Date;

  @ApiPropertyOptional({
    description: 'ID de l\'utilisateur qui a vérifié',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  verifiedBy?: string;

  @ApiPropertyOptional({
    description: 'Date de dernière synchronisation',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  lastSyncedAt?: Date;
}

export class GetWalletDto {
  @ApiPropertyOptional({
    description: 'ID du portefeuille',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par type de propriétaire',
    enum: OwnerType,
  })
  @IsEnum(OwnerType)
  @IsOptional()
  ownerType?: OwnerType;

  @ApiPropertyOptional({
    description: 'Filtrer par ID du propriétaire',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par adresse ADA',
    example: 'addr1qx2fxv2...',
  })
  @IsString()
  @IsOptional()
  adaAddress?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: WalletStatus,
  })
  @IsEnum(WalletStatus)
  @IsOptional()
  status?: WalletStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par vérification',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Solde minimum',
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minBalance?: number;

  @ApiPropertyOptional({
    description: 'Solde maximum',
    example: 10000,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxBalance?: number;

  @ApiPropertyOptional({
    description: 'Recherche textuelle (adaAddress, label, mobileMoneyNumber)',
    example: 'addr1',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    enum: ['balanceADA', 'createdAt', 'lastTransactionAt', 'transactionCount'],
    example: 'balanceADA',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'balanceADA' | 'createdAt' | 'lastTransactionAt' | 'transactionCount';

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d\'éléments par page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}

export class UpdateBalanceDto {
  @ApiProperty({
    description: 'Montant en ADA',
    example: 100.5,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  amount!: number;
}

export class WalletResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ enum: OwnerType, example: OwnerType.FARMER })
  ownerType!: OwnerType;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  ownerId!: string;

  @ApiProperty({
    example:
      'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
  })
  adaAddress!: string;

  @ApiPropertyOptional({ example: '+243812345678' })
  mobileMoneyNumber?: string;

  @ApiProperty({ example: 1250.5 })
  balanceADA!: number;

  @ApiProperty({ enum: WalletStatus, example: WalletStatus.ACTIVE })
  status!: WalletStatus;

  @ApiPropertyOptional({ example: 'Portefeuille principal' })
  label?: string;

  @ApiPropertyOptional({ example: 'Portefeuille utilisé pour les transactions principales' })
  description?: string;

  @ApiProperty({ example: false })
  isVerified!: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  verifiedAt?: Date;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  verifiedBy?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  lastTransactionAt?: Date;

  @ApiProperty({ example: 42 })
  transactionCount!: number;

  @ApiProperty({ example: 5000.0 })
  totalReceived!: number;

  @ApiProperty({ example: 3750.5 })
  totalSent!: number;

  @ApiPropertyOptional({ example: 100.0 })
  minBalance?: number;

  @ApiPropertyOptional({ example: 5000.0 })
  maxBalance?: number;

  @ApiPropertyOptional({ example: 'Notes sur le portefeuille' })
  notes?: string;

  @ApiPropertyOptional({ example: { source: 'mobile_app', version: '1.0' } })
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  lastSyncedAt?: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt!: Date;
}

export class WalletsResponseDto {
  @ApiProperty({ type: [WalletResponseDto] })
  data!: WalletResponseDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 10 })
  totalPages!: number;
}

export class WalletStatsDto {
  @ApiProperty({ example: 42 })
  transactionCount!: number;

  @ApiProperty({ example: 5000.0 })
  totalReceived!: number;

  @ApiProperty({ example: 3750.5 })
  totalSent!: number;

  @ApiPropertyOptional({ example: 100.0 })
  minBalance?: number;

  @ApiPropertyOptional({ example: 5000.0 })
  maxBalance?: number;
}
