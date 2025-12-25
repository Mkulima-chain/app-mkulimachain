import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateHarvestDto {
  @ApiProperty({
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  farmerId!: string;

  @ApiProperty({
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({
    description: 'Quantité récoltée (kg)',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

  @ApiProperty({
    description: 'Date/heure de récolte (ISO)',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  harvestAt!: string;

  @ApiPropertyOptional({
    description: 'Latitude',
    example: 12.345678,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude',
    example: 12.345678,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    description: 'Hash de preuve (on-chain ou IPFS)',
    example: '0xabc123...',
  })
  @IsString()
  @IsNotEmpty()
  proofHash!: string;
}

export class GetHarvestDto {
  @ApiPropertyOptional({
    description: 'ID de la récolte',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: "ID de l'agriculteur",
  })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({
    description: 'ID du produit',
  })
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Quantité',
    example: 100,
  })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Recherche texte sur proofHash',
    example: '0xabc',
  })
  @IsString()
  @IsOptional()
  search?: string;
}

export class UpdateHarvestDto extends PartialType(CreateHarvestDto) {
  // Tous les champs sont optionnels grâce à PartialType
  // L'id est passé dans l'URL, pas dans le body
}
