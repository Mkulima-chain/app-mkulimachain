import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Category DTOs
export class CreateCategoryDto {
  @ApiProperty({ description: 'Nom de la catégorie', example: 'Cacao' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Produits de cacao' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Actif', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Nom de la catégorie' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Actif' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// Unit DTOs
export class CreateUnitDto {
  @ApiProperty({ description: 'Nom de l\'unité', example: 'Kilogramme' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name!: string;

  @ApiProperty({ description: 'Symbole', example: 'kg' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  symbol!: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Unité de masse' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Actif', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateUnitDto {
  @ApiPropertyOptional({ description: 'Nom de l\'unité' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: 'Symbole' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  symbol?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Actif' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// Currency DTOs
export class CreateCurrencyDto {
  @ApiProperty({ description: 'Code ISO 4217', example: 'USD' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  code!: string;

  @ApiProperty({ description: 'Nom de la devise', example: 'Dollar américain' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Symbole', example: '$' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  symbol?: string;

  @ApiPropertyOptional({ description: 'Actif', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCurrencyDto {
  @ApiPropertyOptional({ description: 'Code ISO 4217' })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  code?: string;

  @ApiPropertyOptional({ description: 'Nom de la devise' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Symbole' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  symbol?: string;

  @ApiPropertyOptional({ description: 'Actif' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

