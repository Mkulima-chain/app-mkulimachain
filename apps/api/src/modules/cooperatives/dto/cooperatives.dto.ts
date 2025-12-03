import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

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

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt!: Date;
}
