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
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  GetOrderDto,
  PayOrderDto,
  ShipOrderDto,
  CancelOrderDto,
  RefundOrderDto,
  OrdersResponseDto,
  OrderResponseDto,
} from '../dto/order.dto';
import { OrderEntity } from '../entities/order.entity';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('orders')
@Controller('orders')
@Public() // À sécuriser quand l'auth sera activée côté admin
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une commande',
    description: 'Crée une nouvelle commande pour un article du marketplace',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Commande créée avec succès',
    type: OrderResponseDto,
  })
  async create(@Body() dto: CreateOrderDto): Promise<OrderEntity> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les commandes',
    description: 'Récupère la liste des commandes avec filtres et pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste paginée des commandes',
    type: OrdersResponseDto,
  })
  async findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: false,
        skipMissingProperties: true,
      }),
    )
    query: GetOrderDto,
  ): Promise<OrdersResponseDto> {
    return this.service.findAll(query);
  }

  @Get('stats/global')
  @ApiOperation({
    summary: 'Statistiques globales',
    description: 'Récupère les statistiques globales des commandes',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques globales',
  })
  async getGlobalStats() {
    return this.service.getGlobalStats();
  }

  @Get('stats/farmer/:farmerId')
  @ApiOperation({
    summary: 'Statistiques par agriculteur',
    description: 'Récupère les statistiques des commandes pour un agriculteur',
  })
  @ApiParam({
    name: 'farmerId',
    description: "ID de l'agriculteur",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques par agriculteur',
  })
  async getStatsByFarmer(@Param('farmerId', ParseUUIDPipe) farmerId: string) {
    return this.service.getStatsByFarmer(farmerId);
  }

  @Get('stats/cooperative/:cooperativeId')
  @ApiOperation({
    summary: 'Statistiques par coopérative',
    description: 'Récupère les statistiques des commandes pour une coopérative',
  })
  @ApiParam({
    name: 'cooperativeId',
    description: 'ID de la coopérative',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques par coopérative',
  })
  async getStatsByCooperative(
    @Param('cooperativeId', ParseUUIDPipe) cooperativeId: string,
  ) {
    return this.service.getStatsByCooperative(cooperativeId);
  }

  @Get('buyer/:buyerId')
  @ApiOperation({
    summary: 'Commandes d\'un acheteur',
    description: 'Récupère toutes les commandes d\'un acheteur',
  })
  @ApiParam({
    name: 'buyerId',
    description: "ID de l'acheteur",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des commandes de l\'acheteur',
    type: [OrderResponseDto],
  })
  async findByBuyerId(
    @Param('buyerId', ParseUUIDPipe) buyerId: string,
  ): Promise<OrderEntity[]> {
    return this.service.findByBuyerId(buyerId);
  }

  @Get('seller/:farmerId')
  @ApiOperation({
    summary: 'Commandes d\'un vendeur',
    description: 'Récupère toutes les commandes d\'un agriculteur',
  })
  @ApiParam({
    name: 'farmerId',
    description: "ID de l'agriculteur",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des commandes du vendeur',
    type: [OrderResponseDto],
  })
  async findBySellerId(
    @Param('farmerId', ParseUUIDPipe) farmerId: string,
  ): Promise<OrderEntity[]> {
    return this.service.findBySellerId(farmerId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Détails d\'une commande',
    description: 'Récupère les détails d\'une commande par son ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la commande',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la commande',
    type: OrderResponseDto,
  })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<OrderEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Modifier une commande',
    description: 'Met à jour les informations d\'une commande',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la commande',
    type: String,
  })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Commande modifiée',
    type: OrderResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<OrderEntity> {
    return this.service.update(id, dto);
  }

  @Post(':id/pay')
  @ApiOperation({
    summary: 'Marquer comme payée',
    description: 'Marque une commande comme payée avec le hash de paiement',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la commande',
    type: String,
  })
  @ApiBody({ type: PayOrderDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Commande marquée comme payée',
    type: OrderResponseDto,
  })
  async pay(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PayOrderDto,
  ): Promise<OrderEntity> {
    return this.service.pay(id, dto.paymentHash);
  }

  @Post(':id/ship')
  @ApiOperation({
    summary: 'Marquer comme expédiée',
    description: 'Marque une commande comme expédiée avec le numéro de suivi',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la commande',
    type: String,
  })
  @ApiBody({ type: ShipOrderDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Commande marquée comme expédiée',
    type: OrderResponseDto,
  })
  async ship(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ShipOrderDto,
  ): Promise<OrderEntity> {
    return this.service.ship(id, dto.trackingNumber);
  }

  @Post(':id/complete')
  @ApiOperation({
    summary: 'Marquer comme complétée',
    description: 'Marque une commande comme complétée',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la commande',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Commande marquée comme complétée',
    type: OrderResponseDto,
  })
  async complete(@Param('id', ParseUUIDPipe) id: string): Promise<OrderEntity> {
    return this.service.complete(id);
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Annuler une commande',
    description: 'Annule une commande avec une raison',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la commande',
    type: String,
  })
  @ApiBody({ type: CancelOrderDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Commande annulée',
    type: OrderResponseDto,
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderDto,
  ): Promise<OrderEntity> {
    return this.service.cancel(id, dto);
  }

  @Post(':id/refund')
  @ApiOperation({
    summary: 'Rembourser une commande',
    description: 'Marque une commande comme remboursée avec le hash de remboursement',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la commande',
    type: String,
  })
  @ApiBody({ type: RefundOrderDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Commande remboursée',
    type: OrderResponseDto,
  })
  async refund(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RefundOrderDto,
  ): Promise<OrderEntity> {
    return this.service.refund(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une commande',
    description: 'Supprime une commande (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la commande',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Commande supprimée',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }
}
