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
  IsEmail,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  FarmerStatus,
  FarmerGender,
  FarmerIdentificationType,
} from '../entities/entities';

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
  @MinLength(8)
  @MaxLength(20)
  phone!: string;

  @ApiPropertyOptional({
    description: 'Adresse du portefeuille Cardano (ADA)',
    example:
      'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(150)
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

  @ApiPropertyOptional({
    description: 'Adresse email',
    example: 'jean.mukendi@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Date de naissance (format ISO)',
    example: '1985-05-15',
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'Statut de l\'agriculteur',
    enum: FarmerStatus,
    default: FarmerStatus.ACTIVE,
  })
  @IsEnum(FarmerStatus)
  @IsOptional()
  status?: FarmerStatus;

  @ApiPropertyOptional({
    description: 'URL de la photo de profil',
    example: 'https://example.com/photos/farmer123.jpg',
  })
  @IsUrl()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Genre',
    enum: FarmerGender,
  })
  @IsEnum(FarmerGender)
  @IsOptional()
  gender?: FarmerGender;

  @ApiPropertyOptional({
    description: 'Numéro d\'identification (CNI, passeport, etc.)',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  identificationNumber?: string;

  @ApiPropertyOptional({
    description: 'Type d\'identification',
    enum: FarmerIdentificationType,
  })
  @IsEnum(FarmerIdentificationType)
  @IsOptional()
  identificationType?: FarmerIdentificationType;

  @ApiPropertyOptional({
    description: 'Notes et commentaires',
    example: 'Agriculteur expérimenté, spécialisé en cacao',
  })
  @IsString()
  @IsOptional()
  notes?: string;
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

  @ApiPropertyOptional({
    description: 'Filtrer par coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: FarmerStatus,
  })
  @IsEnum(FarmerStatus)
  @IsOptional()
  status?: FarmerStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par vérifié',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  verified?: boolean;

  @ApiPropertyOptional({
    description: 'Recherche par localisation (rayon en km)',
    example: '{"latitude": -4.4419, "longitude": 15.2663, "radius": 10}',
  })
  @IsOptional()
  locationSearch?: string;

  @ApiPropertyOptional({
    description: 'Numéro de page pour la pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre d éléments par page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  limit?: number;
}

export class CooperativeInfoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Coopérative de Kinshasa' })
  name!: string;
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

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  cooperativeId?: string;

  @ApiPropertyOptional({
    type: CooperativeInfoDto,
    description: 'Informations de la coopérative',
  })
  cooperative?: CooperativeInfoDto;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ example: 'jean.mukendi@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: '1985-05-15' })
  dateOfBirth?: Date;

  @ApiPropertyOptional({ enum: FarmerStatus, default: FarmerStatus.ACTIVE })
  status?: FarmerStatus;

  @ApiPropertyOptional({ example: 'https://example.com/photos/farmer123.jpg' })
  photoUrl?: string;

  @ApiPropertyOptional({ enum: FarmerGender })
  gender?: FarmerGender;

  @ApiPropertyOptional({ example: '1234567890' })
  identificationNumber?: string;

  @ApiPropertyOptional({ enum: FarmerIdentificationType })
  identificationType?: FarmerIdentificationType;

  @ApiPropertyOptional({ example: 'Notes sur l\'agriculteur' })
  notes?: string;

  @ApiPropertyOptional({ example: true, default: false })
  verified?: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  verifiedAt?: Date;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  verifiedBy?: string;
}
