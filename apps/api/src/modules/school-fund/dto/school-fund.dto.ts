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
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { SchoolStatus } from '../interfaces/ischool-fund';

export class CreateSchoolFundDto {
  @ApiProperty({
    description: "Nom de l'école",
    example: 'École Primaire Lumumba',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  schoolName!: string;

  @ApiProperty({
    description: 'Province',
    example: 'Kinshasa',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  province!: string;

  @ApiPropertyOptional({
    description: 'Ville',
    example: 'Kinshasa',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Adresse complète',
    example: 'Avenue de la Libération 45, Commune de Gombe',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Nom du contact',
    example: 'Marie Mbala',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  contactPerson?: string;

  @ApiPropertyOptional({
    description: 'Téléphone du contact',
    example: '+243812345678',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'contactPhone must be a valid phone number',
  })
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Adresse du portefeuille pour recevoir les fonds',
    example:
      'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
  })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  walletAddress?: string;

  @ApiPropertyOptional({
    description: "Nombre d'élèves",
    example: 350,
    minimum: 0,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  studentCount?: number;
}

export class UpdateSchoolFundDto extends PartialType(CreateSchoolFundDto) {
  @ApiPropertyOptional({
    description: "Statut de l'école",
    enum: SchoolStatus,
  })
  @IsEnum(SchoolStatus)
  @IsOptional()
  status?: SchoolStatus;
}

export class GetSchoolFundDto {
  @ApiPropertyOptional({
    description: "ID de l'école",
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par nom',
    example: 'Lumumba',
  })
  @IsString()
  @IsOptional()
  schoolName?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par province',
    example: 'Kinshasa',
  })
  @IsString()
  @IsOptional()
  province?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: SchoolStatus,
  })
  @IsEnum(SchoolStatus)
  @IsOptional()
  status?: SchoolStatus;

  @ApiPropertyOptional({
    description: 'Recherche textuelle',
    example: 'école primaire',
  })
  @IsString()
  @IsOptional()
  search?: string;
}

export class AddFundingDto {
  @ApiProperty({
    description: 'Montant à ajouter en ADA',
    example: 100,
    minimum: 0.000001,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.000001)
  amount!: number;

  @ApiPropertyOptional({
    description: 'Hash de la transaction blockchain',
    example: '0xabc123def456...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  transactionHash?: string;

  @ApiPropertyOptional({
    description: 'Source du financement',
    example: 'Vente NFT #123',
  })
  @IsString()
  @IsOptional()
  source?: string;
}

export class DisburseFundDto {
  @ApiProperty({
    description: 'Montant à débourser en ADA',
    example: 50,
    minimum: 0.000001,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.000001)
  amount!: number;

  @ApiPropertyOptional({
    description: 'Hash de la transaction',
    example: '0xdef789abc123...',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  transactionHash?: string;

  @ApiPropertyOptional({
    description: 'Objet du débours',
    example: 'Achat de fournitures scolaires',
  })
  @IsString()
  @IsOptional()
  purpose?: string;
}

export class SchoolFundResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'École Primaire Lumumba' })
  schoolName!: string;

  @ApiProperty({ example: 'Kinshasa' })
  province!: string;

  @ApiPropertyOptional({ example: 'Kinshasa' })
  city?: string;

  @ApiProperty({ example: 1500.5 })
  totalFundedADA!: number;

  @ApiProperty({ example: 500.25 })
  totalDisbursedADA!: number;

  @ApiPropertyOptional({ example: 350 })
  studentCount?: number;

  @ApiProperty({ enum: SchoolStatus, example: SchoolStatus.ACTIVE })
  status!: SchoolStatus;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  lastUpdate!: Date;
}

export class SchoolFundStatsDto {
  @ApiProperty({ example: 25 })
  totalSchools!: number;

  @ApiProperty({ example: 20 })
  activeSchools!: number;

  @ApiProperty({ example: 15000.5 })
  totalFunded!: number;

  @ApiProperty({ example: 8500.25 })
  totalDisbursed!: number;

  @ApiProperty({ example: 6500.25 })
  availableBalance!: number;
}

export class ProvinceStatsDto {
  @ApiProperty({ example: 'Kinshasa' })
  province!: string;

  @ApiProperty({ example: 10 })
  schools!: number;

  @ApiProperty({ example: 5000.5 })
  totalFunded!: number;
}
