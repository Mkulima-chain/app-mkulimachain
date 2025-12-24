import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { OrderStatus } from '../interfaces/iorder';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  buyerId!: string;

  @IsUUID()
  @IsNotEmpty()
  itemId!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  quantityKg!: number;

  @IsString()
  @IsOptional()
  shippingAddress?: string;
}

export class UpdateOrderDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  paymentHash?: string;

  @IsString()
  @IsOptional()
  shippingAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  trackingNumber?: string;
}

export class GetOrderDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsUUID()
  @IsOptional()
  buyerId?: string;

  @IsUUID()
  @IsOptional()
  itemId?: string;

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
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

export class UpdateTraceabilityDto {
  @IsString()
  @IsOptional()
  txHash?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
