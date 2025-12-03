import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IProduct } from '../interfaces/iproducts';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto implements IProduct {
  @ApiProperty({
    description: 'The name of the product',
    example: 'Product Name',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The unit of the product',
    example: 'kg',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  unit: string;

  @ApiProperty({
    description: 'The description of the product',
    example: 'Product Description',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  description: string;

  @ApiProperty({
    description: 'The image of the product',
    example: 'Product Image',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  image: string[];
}

export class UpdateProductDto implements IProduct {
  @ApiProperty({
    description: 'The id of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'The name of the product',
    example: 'Product Name',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The unit of the product',
    example: 'kg',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  unit: string;

  @ApiProperty({
    description: 'The description of the product',
    example: 'Product Description',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  description: string;

  @ApiProperty({
    description: 'The image of the product',
    example: 'Product Image',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  image?: string[];
}

export class GetProductDto implements IProduct {
  @ApiProperty({
    description: 'The id of the product',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'The name of the product',
    example: 'Product Name',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The unit of the product',
    example: 'kg',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  unit: string;

  @ApiProperty({
    description: 'The description of the product',
    example: 'Product Description',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  description: string;

  @ApiProperty({
    description: 'The image of the product',
    example: 'Product Image',
  })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  image?: string[];
}
