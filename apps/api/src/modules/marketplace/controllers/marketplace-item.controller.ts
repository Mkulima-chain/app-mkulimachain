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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { MarketplaceItemService } from '../services/marketplace-item.service';
import {
  CreateMarketplaceItemDto,
  UpdateMarketplaceItemDto,
  GetMarketplaceItemDto,
  UpdateStockDto,
  MarketplaceItemResponseDto,
} from '../dto/marketplace-item.dto';
import { MarketplaceItemEntity } from '../entities/marketplace-item.entity';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplaceItemController {
  constructor(private readonly service: MarketplaceItemService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un article',
    description: 'Met un nouveau produit en vente sur le marketplace',
  })
  @ApiBody({ type: CreateMarketplaceItemDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Article créé',
    type: MarketplaceItemResponseDto,
  })
  async create(
    @Body() dto: CreateMarketplaceItemDto,
  ): Promise<MarketplaceItemEntity> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les articles',
    description: 'Récupère la liste des articles avec filtres',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des articles',
    type: [MarketplaceItemResponseDto],
  })
  async findAll(
    @Query() query: GetMarketplaceItemDto,
  ): Promise<MarketplaceItemEntity[]> {
    return this.service.findAll(query);
  }

  @Get('active')
  @ApiOperation({
    summary: 'Articles actifs',
    description: 'Récupère uniquement les articles en vente',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Articles actifs',
    type: [MarketplaceItemResponseDto],
  })
  async findActive(): Promise<MarketplaceItemEntity[]> {
    return this.service.findActive();
  }

  @Get('farmer/:farmerId')
  @ApiOperation({
    summary: "Articles d'un vendeur",
    description: "Récupère les articles d'un agriculteur",
  })
  @ApiParam({
    name: 'farmerId',
    description: "ID de l'agriculteur",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Articles du vendeur',
    type: [MarketplaceItemResponseDto],
  })
  async findByFarmerId(
    @Param('farmerId', ParseUUIDPipe) farmerId: string,
  ): Promise<MarketplaceItemEntity[]> {
    return this.service.findByFarmerId(farmerId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un article',
    description: "Récupère les détails d'un article",
  })
  @ApiParam({ name: 'id', description: "ID de l'article" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Détails de l'article",
    type: MarketplaceItemResponseDto,
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MarketplaceItemEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un article',
    description: "Modifie les informations d'un article",
  })
  @ApiParam({ name: 'id', description: "ID de l'article" })
  @ApiBody({ type: UpdateMarketplaceItemDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Article mis à jour',
    type: MarketplaceItemResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMarketplaceItemDto,
  ): Promise<MarketplaceItemEntity> {
    return this.service.update(id, dto);
  }

  @Post(':id/stock/add')
  @ApiOperation({
    summary: 'Ajouter du stock',
    description: 'Augmente le stock disponible',
  })
  @ApiParam({ name: 'id', description: "ID de l'article" })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock mis à jour',
    type: MarketplaceItemResponseDto,
  })
  async addStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockDto,
  ): Promise<MarketplaceItemEntity> {
    return this.service.addStock(id, dto.quantity);
  }

  @Post(':id/stock/reduce')
  @ApiOperation({
    summary: 'Réduire le stock',
    description: 'Diminue le stock disponible (après une vente)',
  })
  @ApiParam({ name: 'id', description: "ID de l'article" })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock mis à jour',
    type: MarketplaceItemResponseDto,
  })
  async reduceStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockDto,
  ): Promise<MarketplaceItemEntity> {
    return this.service.reduceStock(id, dto.quantity);
  }

  @Post(':id/publish')
  @ApiOperation({
    summary: 'Publier un article',
    description: 'Passe l\'article au statut "active" pour le mettre en vente',
  })
  @ApiParam({ name: 'id', description: "ID de l'article" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Article publié',
    type: MarketplaceItemResponseDto,
  })
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MarketplaceItemEntity> {
    return this.service.publish(id);
  }

  @Post(':id/archive')
  @ApiOperation({
    summary: 'Archiver un article',
    description: "Retire l'article de la vente",
  })
  @ApiParam({ name: 'id', description: "ID de l'article" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Article archivé',
    type: MarketplaceItemResponseDto,
  })
  async archive(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MarketplaceItemEntity> {
    return this.service.archive(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un article',
    description: 'Supprime un article (soft delete)',
  })
  @ApiParam({ name: 'id', description: "ID de l'article" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Article supprimé',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }
}
