import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  MaxLength,
  Min,
  IsArray,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrderStatus, OrderPriority } from '../interfaces/iorder';

export class CreateOrderDto {
  @ApiProperty({
    description: "ID de l'acheteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  buyerId!: string;

  @ApiProperty({
    description: "ID de l'article du marketplace",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  itemId!: string;

  @ApiProperty({
    description: 'Quantité en kg',
    example: 10.5,
    minimum: 0.01,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  quantityKg!: number;

  @ApiPropertyOptional({
    description: 'Adresse de livraison',
    example: '123 Rue Example, Kinshasa, RDC',
  })
  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @ApiPropertyOptional({
    description: 'Frais de livraison en ADA',
    example: 5.0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  shippingCostADA?: number;

  @ApiPropertyOptional({
    description: 'Réduction en ADA',
    example: 2.0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountADA?: number;

  @ApiPropertyOptional({
    description: 'Notes du client',
    example: 'Livraison souhaitée le matin',
  })
  @IsString()
  @IsOptional()
  buyerNotes?: string;

  @ApiPropertyOptional({
    description: 'Méthode de livraison',
    example: 'standard',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  deliveryMethod?: string;

  @ApiPropertyOptional({
    description: 'Date de livraison estimée',
    example: '2024-12-25T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional({
    description: 'ID de la coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiPropertyOptional({
    description: 'Nouveau statut',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Hash de paiement',
    example: '0x1234567890abcdef',
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  paymentHash?: string;

  @ApiPropertyOptional({
    description: 'Numéro de suivi',
    example: 'TRACK123456',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Notes internes',
    example: 'Commande prioritaire',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Notes internes',
    example: 'Commande prioritaire',
  })
  @IsString()
  @IsOptional()
  internalNotes?: string;

  @ApiPropertyOptional({
    description: 'Priorité',
    enum: OrderPriority,
  })
  @IsEnum(OrderPriority)
  @IsOptional()
  priority?: OrderPriority;

  @ApiPropertyOptional({
    description: 'Tags',
    example: ['urgent', 'vip'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Frais de livraison en ADA',
    example: 5.0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  shippingCostADA?: number;

  @ApiPropertyOptional({
    description: 'Réduction en ADA',
    example: 2.0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountADA?: number;

  @ApiPropertyOptional({
    description: 'Taxes en ADA',
    example: 1.0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  taxADA?: number;

  @ApiPropertyOptional({
    description: 'Date de livraison estimée',
    example: '2024-12-25T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  estimatedDeliveryDate?: string;

  @ApiPropertyOptional({
    description: 'Méthode de livraison',
    example: 'standard',
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  deliveryMethod?: string;
}

export class GetOrderDto {
  @ApiPropertyOptional({
    description: "ID de la commande",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Numéro de commande',
    example: 'ORD-20241212-0001',
  })
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @ApiPropertyOptional({
    description: "ID de l'acheteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  buyerId?: string;

  @ApiPropertyOptional({
    description: "ID de l'article",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  itemId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par statut',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filtrer par coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  cooperativeId?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par agriculteur',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  farmerId?: string;

  @ApiPropertyOptional({
    description: 'Montant minimum en ADA',
    example: 10.0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minTotalADA?: number;

  @ApiPropertyOptional({
    description: 'Montant maximum en ADA',
    example: 1000.0,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxTotalADA?: number;

  @ApiPropertyOptional({
    description: 'Date de création minimum',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  minCreatedAt?: string;

  @ApiPropertyOptional({
    description: 'Date de création maximum',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  maxCreatedAt?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par priorité',
    enum: OrderPriority,
  })
  @IsEnum(OrderPriority)
  @IsOptional()
  priority?: OrderPriority;

  @ApiPropertyOptional({
    description: 'Filtrer par tags',
    example: ['urgent'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Numéro de page',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Nombre de résultats par page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}

export class CancelOrderDto {
  @ApiProperty({
    description: 'Raison de l\'annulation',
    example: 'Client a changé d\'avis',
  })
  @IsString()
  @IsNotEmpty()
  cancellationReason!: string;
}

export class RefundOrderDto {
  @ApiProperty({
    description: 'Hash de la transaction de remboursement',
    example: '0x1234567890abcdef',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  refundHash!: string;
}

export class PayOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  paymentHash!: string;
}

export class ShipOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  trackingNumber!: string;
}

export class OrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  orderNumber?: string;

  @ApiProperty()
  buyerId!: string;

  @ApiProperty()
  itemId!: string;

  @ApiProperty()
  quantityKg!: number;

  @ApiProperty()
  unitPriceADA!: number;

  @ApiProperty()
  totalADA!: number;

  @ApiPropertyOptional()
  shippingCostADA?: number;

  @ApiPropertyOptional()
  discountADA?: number;

  @ApiPropertyOptional()
  taxADA?: number;

  @ApiProperty({ enum: OrderStatus })
  status!: OrderStatus;

  @ApiPropertyOptional()
  paymentHash?: string;

  @ApiPropertyOptional()
  shippingAddress?: string;

  @ApiPropertyOptional()
  trackingNumber?: string;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiPropertyOptional()
  shippedAt?: Date;

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiPropertyOptional()
  cancelledBy?: string;

  @ApiPropertyOptional()
  cancellationReason?: string;

  @ApiPropertyOptional()
  refundedAt?: Date;

  @ApiPropertyOptional()
  refundHash?: string;

  @ApiPropertyOptional()
  estimatedDeliveryDate?: Date;

  @ApiPropertyOptional()
  deliveryMethod?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  buyerNotes?: string;

  @ApiPropertyOptional()
  internalNotes?: string;

  @ApiPropertyOptional({ enum: OrderPriority })
  priority?: OrderPriority;

  @ApiPropertyOptional({ type: [String] })
  tags?: string[];

  @ApiPropertyOptional()
  cooperativeId?: string;

  @ApiPropertyOptional()
  farmerId?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class OrdersResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  data!: OrderResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
