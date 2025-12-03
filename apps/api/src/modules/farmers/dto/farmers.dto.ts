import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateFarmerDto {
  @ApiProperty({
    description: "Nom complet de l'agriculteur",
    example: 'Jean Mukendi',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+243812345678',
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone!: string;

  @ApiPropertyOptional({
    description: 'Adresse du portefeuille Cardano (ADA)',
    example:
      'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
  })
  @IsString()
  @IsOptional()
  walletAddress?: string;

  @ApiProperty({
    description: 'Adresse physique',
    example: 'Avenue Lumumba 123, Commune de Limete',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address!: string;

  @ApiProperty({
    description: 'Ville',
    example: 'Kinshasa',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @ApiProperty({
    description: 'Province',
    example: 'Kinshasa',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  state!: string;

  @ApiProperty({
    description: 'Latitude GPS',
    example: -4.4419,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @IsLatitude()
  latitude!: number;

  @ApiProperty({
    description: 'Longitude GPS',
    example: 15.2663,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @IsLongitude()
  longitude!: number;

  @ApiPropertyOptional({
    description: 'ID de la coopérative (optionnel)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;
}

export class UpdateFarmerDto extends PartialType(CreateFarmerDto) {}

export class GetFarmerDto {
  @ApiPropertyOptional({
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par nom',
    example: 'Mukendi',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par téléphone',
    example: '+243812345678',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par ville',
    example: 'Kinshasa',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par province',
    example: 'Kinshasa',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'Recherche textuelle',
    example: 'Mukendi Kinshasa',
  })
  @IsString()
  @IsOptional()
  search?: string;
}

export class FarmerResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Jean Mukendi' })
  name!: string;

  @ApiProperty({ example: '+243812345678' })
  phone!: string;

  @ApiPropertyOptional({
    example:
      'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
  })
  walletAddress?: string;

  @ApiProperty({ example: 'Avenue Lumumba 123' })
  address!: string;

  @ApiProperty({ example: 'Kinshasa' })
  city!: string;

  @ApiProperty({ example: 'Kinshasa' })
  state!: string;

  @ApiProperty({ example: -4.4419 })
  latitude!: number;

  @ApiProperty({ example: 15.2663 })
  longitude!: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt!: Date;
}
