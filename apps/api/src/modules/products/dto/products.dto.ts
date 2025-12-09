import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  IsArray,
} from 'class-validator';
import { IProduct } from '../interfaces/iproducts';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateProductDto implements IProduct {
  @ApiProperty({
    description: 'Nom du produit',
    example: 'Cacao premium',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Unité de mesure',
    example: 'kg',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  unit: string;

  @ApiProperty({
    description: 'Description du produit',
    example: 'Cacao biologique provenant du Nord Kivu',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({
    description: 'URLs des images du produit',
    example: ['https://exemple.com/image1.jpg'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  image?: string[];
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class GetProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;
}
