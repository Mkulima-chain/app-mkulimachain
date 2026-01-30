import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  Patch,
  ParseEnumPipe,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  GetOrderDto,
  PayOrderDto,
  ShipOrderDto,
  UpdateTraceabilityDto,
} from '../dto/order.dto';
import { TraceabilityStep } from '../interfaces/iorder';
import { OrderEntity } from '../entities/order.entity';
import { Public } from '@/modules/auth/decorators/public.decorator';

@Controller('orders')
@Public() // À sécuriser quand l'auth sera activée côté admin
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Post()
  async create(@Body() dto: CreateOrderDto): Promise<OrderEntity> {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query() query: GetOrderDto): Promise<OrderEntity[]> {
    return this.service.findAll(query);
  }

  @Get('buyer/:buyerId')
  async findByBuyerId(
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ): Promise<OrderEntity[]> {
    return this.service.findByBuyerId(buyerId);
  }

  @Get('seller/:farmerId')
  async findBySellerId(
    @Param('farmerId', ParseUUIDPipe) farmerId: string,
  ): Promise<OrderEntity[]> {
    return this.service.findBySellerId(farmerId);
  }

  @Get(':id')
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<OrderEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<OrderEntity> {
    return this.service.update(id, dto);
  }

  @Post(':id/pay')
  async pay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PayOrderDto,
  ): Promise<OrderEntity> {
    return this.service.pay(id, dto.paymentHash);
  }

  @Post(':id/ship')
  async ship(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ShipOrderDto,
  ): Promise<OrderEntity> {
    return this.service.ship(id, dto.trackingNumber);
  }

  @Post(':id/complete')
  async complete(@Param('id', ParseUUIDPipe) id: string): Promise<OrderEntity> {
    return this.service.complete(id);
  }

  @Post(':id/cancel')
  async cancel(@Param('id', ParseUUIDPipe) id: string): Promise<OrderEntity> {
    return this.service.cancel(id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }

  @Patch(':id/traceability/:step')
  async updateTraceabilityStep(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('step', new ParseEnumPipe(TraceabilityStep)) step: TraceabilityStep,
    @Body() dto: UpdateTraceabilityDto,
  ): Promise<OrderEntity> {
    return this.service.updateTraceabilityStep(id, step, dto);
  }
}
