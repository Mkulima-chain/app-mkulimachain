import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { IHarvest } from '../interfaces/iharvest';
import { ApiProperty } from '@nestjs/swagger';
import { FarmerEntity } from '@/modules/farmers/entities/entities';
import { ProductEntity } from '@/modules/products/entities/entities';

export class CreateHarvestDto implements IHarvest {
  @ApiProperty({
    description: 'The farmer id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  farmer: FarmerEntity;

  @ApiProperty({
    description: 'The product id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  product: ProductEntity;

  @ApiProperty({
    description: 'The quantity of the harvest',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({
    description: 'The harvest at',
    example: new Date(),
  })
  @IsDate()
  @IsNotEmpty()
  harvestAt: Date;

  @ApiProperty({
    description: 'The latitude of the harvest',
    example: 12.345678,
  })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({
    description: 'The longitude of the harvest',
    example: 12.345678,
  })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({
    description: 'The proof hash of the harvest',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  proofHash: string;
}

export class GetHarvestDto implements IHarvest {
  @ApiProperty({
    description: 'The id of the harvest',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'The farmer id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  farmer: FarmerEntity;

  @ApiProperty({
    description: 'The product id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  product: ProductEntity;

  @ApiProperty({
    description: 'The quantity of the harvest',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  quantity: number;

  @ApiProperty({
    description: 'The harvest at',
    example: new Date(),
  })
  @IsDate()
  @IsOptional()
  harvestAt?: Date;

  @ApiProperty({
    description: 'The latitude of the harvest',
    example: 12.345678,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    description: 'The longitude of the harvest',
    example: 12.345678,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    description: 'The proof hash of the harvest',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  proofHash: string;
}

export class UpdateHarvestDto implements IHarvest {
  @ApiProperty({
    description: 'The id of the harvest',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'The farmer id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  farmer: FarmerEntity;

  @ApiProperty({
    description: 'The product id',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  product: ProductEntity;

  @ApiProperty({
    description: 'The quantity of the harvest',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  quantity: number;

  @ApiProperty({
    description: 'The harvest at',
    example: new Date(),
  })
  @IsDate()
  @IsOptional()
  harvestAt?: Date;

  @ApiProperty({
    description: 'The proof hash of the harvest',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsOptional()
  proofHash: string;
}
