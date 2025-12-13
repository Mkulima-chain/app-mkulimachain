import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ServicesService } from '../services/services.service';
import {
  CreateHarvestDto,
  GetHarvestDto,
  UpdateHarvestDto,
  HarvestResponseDto,
} from '../dto/harvest.dto';
import { HarvestEntity, HarvestStatus } from '../entities/entities';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { UserEntity } from '@/modules/auth/entities/user.entity';

@ApiTags('harvests')
@Controller('harvests')
@Public() // À sécuriser quand l'admin enverra le JWT
export class ControllersController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une récolte',
    description: 'Enregistre une nouvelle récolte',
  })
  @ApiBody({ type: CreateHarvestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Récolte créée avec succès',
    type: HarvestEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agriculteur ou produit introuvable',
  })
  async createHarvest(
    @Body() createHarvestDto: CreateHarvestDto,
  ): Promise<HarvestEntity> {
    return this.servicesService.createHarvest(createHarvestDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour une récolte',
    description: "Modifie les informations d'une récolte",
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la récolte',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateHarvestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Récolte mise à jour',
    type: HarvestEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Récolte non trouvée',
  })
  async updateHarvest(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHarvestDto: UpdateHarvestDto,
  ): Promise<HarvestEntity> {
    return this.servicesService.updateHarvest(id, updateHarvestDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir une récolte',
    description: "Récupère les détails d'une récolte par son ID",
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la récolte',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la récolte',
    type: HarvestEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Récolte non trouvée',
  })
  async getHarvest(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<HarvestEntity> {
    return this.servicesService.getHarvestById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les récoltes',
    description:
      'Récupère la liste des récoltes avec pagination et filtres',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des récoltes',
    type: HarvestResponseDto,
  })
  async getHarvests(@Query() query: GetHarvestDto): Promise<HarvestResponseDto> {
    return this.servicesService.getHarvests(query);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une récolte',
    description: 'Supprime une récolte (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la récolte',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Récolte supprimée',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Récolte non trouvée',
  })
  async deleteHarvest(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.servicesService.deleteHarvest(id);
  }

  @Get('stats/global')
  @ApiOperation({
    summary: 'Statistiques globales',
    description: 'Récupère les statistiques globales de toutes les récoltes',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques globales',
  })
  async getGlobalStats(): Promise<any> {
    return this.servicesService.getGlobalStats();
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Statistiques d\'une récolte',
    description: 'Récupère les statistiques d\'une récolte spécifique',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la récolte',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques de la récolte',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Récolte non trouvée',
  })
  async getHarvestStats(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    return this.servicesService.getHarvestStats(id);
  }

  @Get('farmer/:farmerId')
  @ApiOperation({
    summary: 'Récoltes d\'un agriculteur',
    description: 'Récupère toutes les récoltes d\'un agriculteur',
  })
  @ApiParam({
    name: 'farmerId',
    description: 'ID de l\'agriculteur',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des récoltes de l\'agriculteur',
    type: [HarvestEntity],
  })
  async getHarvestsByFarmer(
    @Param('farmerId', ParseUUIDPipe) farmerId: string,
  ): Promise<HarvestEntity[]> {
    return this.servicesService.getHarvestsByFarmer(farmerId);
  }

  @Get('product/:productId')
  @ApiOperation({
    summary: 'Récoltes d\'un produit',
    description: 'Récupère toutes les récoltes d\'un produit',
  })
  @ApiParam({
    name: 'productId',
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des récoltes du produit',
    type: [HarvestEntity],
  })
  async getHarvestsByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<HarvestEntity[]> {
    return this.servicesService.getHarvestsByProduct(productId);
  }

  @Post(':id/verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Vérifier une récolte',
    description: 'Marque une récolte comme vérifiée',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la récolte',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Récolte vérifiée',
    type: HarvestEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Récolte non trouvée',
  })
  async verifyHarvest(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<HarvestEntity> {
    return this.servicesService.verifyHarvest(id, user.id);
  }

  @Put(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Mettre à jour le statut',
    description: 'Change le statut d\'une récolte',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la récolte',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(HarvestStatus),
          example: HarvestStatus.VERIFIED,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut mis à jour',
    type: HarvestEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Récolte non trouvée',
  })
  async updateHarvestStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: HarvestStatus,
  ): Promise<HarvestEntity> {
    return this.servicesService.updateHarvestStatus(id, status);
  }
}
