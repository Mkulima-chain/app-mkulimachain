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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { OwnerType } from '../interfaces/iwallet';

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
}

export class UpdateWalletDto extends PartialType(CreateWalletDto) {}

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

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;
}
