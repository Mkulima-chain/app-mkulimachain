import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsUrl,
  IsNumber,
  IsLatitude,
  IsLongitude,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CooperativeStatus } from '../entities/entities';

export class CreateCooperativeDto {
  @ApiProperty({
    description: 'Nom de la coopérative',
    example: 'Coopérative Agricole du Kasaï',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Localisation de la coopérative',
    example: 'Mbuji-Mayi, Kasaï-Oriental',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  location!: string;

  @ApiProperty({
    description: 'Nom du responsable/leader',
    example: 'Pierre Kabongo',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  leader!: string;

  @ApiPropertyOptional({
    description: 'Adresse email de la coopérative',
    example: 'contact@cooperative-kasai.cd',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Numéro de téléphone',
    example: '+243812345678',
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Statut de la coopérative',
    enum: CooperativeStatus,
    default: CooperativeStatus.ACTIVE,
  })
  @IsEnum(CooperativeStatus)
  @IsOptional()
  status?: CooperativeStatus;

  @ApiPropertyOptional({
    description: 'URL du logo de la coopérative',
    example: 'https://example.com/logos/cooperative-kasai.jpg',
  })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Description de la coopérative',
    example: 'Coopérative spécialisée dans la production de cacao et café',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Numéro d\'enregistrement légal',
    example: 'RC-KIN-2024-001',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  registrationNumber?: string;

  @ApiPropertyOptional({
    description: 'Date de création de la coopérative (format ISO)',
    example: '2020-01-15',
  })
  @IsDateString()
  @IsOptional()
  foundedDate?: string;

  @ApiPropertyOptional({
    description: 'Nombre de membres',
    example: 50,
    minimum: 0,
    default: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  memberCount?: number;

  @ApiPropertyOptional({
    description: 'Notes et commentaires',
    example: 'Coopérative certifiée bio depuis 2022',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Latitude GPS',
    example: -6.1369,
    minimum: -90,
    maximum: 90,
  })
  @Type(() => Number)
  @IsNumber()
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude GPS',
    example: 23.5898,
    minimum: -180,
    maximum: 180,
  })
  @Type(() => Number)
  @IsNumber()
  @IsLongitude()
  @IsOptional()
  longitude?: number;
}

export class UpdateCooperativeDto extends PartialType(CreateCooperativeDto) {}

export class GetCooperativeDto {
  @ApiPropertyOptional({
    description: 'ID de la coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par nom',
    example: 'Kasaï',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par localisation',
    example: 'Mbuji-Mayi',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par leader',
    example: 'Kabongo',
  })
  @IsString()
  @IsOptional()
  leader?: string;

  @ApiPropertyOptional({
    description: 'Recherche textuelle',
    example: 'Kasaï agricole',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: CooperativeStatus,
  })
  @IsEnum(CooperativeStatus)
  @IsOptional()
  status?: CooperativeStatus;

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
    example: '{"latitude": -6.1369, "longitude": 23.5898, "radius": 10}',
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
    description: 'Nombre d\'éléments par page',
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

export class CooperativeResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Coopérative Agricole du Kasaï' })
  name!: string;

  @ApiProperty({ example: 'Mbuji-Mayi, Kasaï-Oriental' })
  location!: string;

  @ApiProperty({ example: 'Pierre Kabongo' })
  leader!: string;

  @ApiPropertyOptional({ example: 'contact@cooperative-kasai.cd' })
  email?: string;

  @ApiPropertyOptional({ example: '+243812345678' })
  phone?: string;

  @ApiPropertyOptional({ enum: CooperativeStatus, default: CooperativeStatus.ACTIVE })
  status?: CooperativeStatus;

  @ApiPropertyOptional({ example: 'https://example.com/logos/cooperative-kasai.jpg' })
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Coopérative spécialisée dans la production de cacao et café' })
  description?: string;

  @ApiPropertyOptional({ example: 'RC-KIN-2024-001' })
  registrationNumber?: string;

  @ApiPropertyOptional({ example: '2020-01-15' })
  foundedDate?: Date;

  @ApiPropertyOptional({ example: 50, default: 0 })
  memberCount?: number;

  @ApiPropertyOptional({ example: 'Coopérative certifiée bio depuis 2022' })
  notes?: string;

  @ApiPropertyOptional({ example: true, default: false })
  verified?: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00Z' })
  verifiedAt?: Date;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  verifiedBy?: string;

  @ApiPropertyOptional({ example: -6.1369 })
  latitude?: number;

  @ApiPropertyOptional({ example: 23.5898 })
  longitude?: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt!: Date;
}
