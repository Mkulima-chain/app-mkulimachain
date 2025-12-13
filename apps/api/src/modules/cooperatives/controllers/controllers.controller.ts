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
  BadRequestException,
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
  CreateCooperativeDto,
  GetCooperativeDto,
  UpdateCooperativeDto,
  CooperativeResponseDto,
} from '../dto/cooperatives.dto';
import {
  CooperativeEntity,
  CooperativeStatus,
} from '../entities/entities';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { UserEntity } from '@/modules/auth/entities/user.entity';

@ApiTags('cooperatives')
@Controller('cooperatives')
@Public() // Autorise l'accès public (dev). À sécuriser avec JWT quand prêt.
export class ControllersController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une coopérative',
    description: 'Enregistre une nouvelle coopérative agricole',
  })
  @ApiBody({ type: CreateCooperativeDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Coopérative créée avec succès',
    type: CooperativeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  async createCooperative(
    @Body() createCooperativeDto: CreateCooperativeDto,
  ): Promise<CooperativeEntity> {
    return this.servicesService.createCooperative(createCooperativeDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour une coopérative',
    description: "Modifie les informations d'une coopérative",
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateCooperativeDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coopérative mise à jour',
    type: CooperativeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coopérative non trouvée',
  })
  async updateCooperative(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCooperativeDto: UpdateCooperativeDto,
  ): Promise<CooperativeEntity> {
    return this.servicesService.updateCooperative(id, updateCooperativeDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir une coopérative',
    description: "Récupère les détails d'une coopérative par son ID",
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la coopérative',
    type: CooperativeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coopérative non trouvée',
  })
  async getCooperativeById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CooperativeEntity> {
    return this.servicesService.getCooperativeById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les coopératives',
    description: 'Récupère la liste des coopératives avec filtres optionnels et pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des coopératives avec pagination',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/CooperativeResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async getCooperatives(@Query() query: GetCooperativeDto) {
    return this.servicesService.getCooperatives(query);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Obtenir les statistiques d\'une coopérative',
    description: 'Récupère les statistiques détaillées d\'une coopérative',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques de la coopérative',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coopérative non trouvée',
  })
  async getCooperativeStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.getCooperativeStats(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer une coopérative',
    description: 'Supprime une coopérative (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Coopérative supprimée',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coopérative non trouvée',
  })
  async deleteCooperative(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.servicesService.deleteCooperative(id);
  }

  @Post(':id/verify')
  // @UseGuards(JwtAuthGuard) // Temporairement désactivé pour le développement
  @Public() // Temporairement public pour le développement
  @ApiOperation({
    summary: 'Vérifier une coopérative',
    description: 'Marque une coopérative comme vérifiée par un administrateur',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Coopérative vérifiée',
    type: CooperativeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coopérative non trouvée',
  })
  async verifyCooperative(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: UserEntity,
  ) {
    // Pour le développement : utiliser null si aucun utilisateur n'est fourni
    // En production, décommentez @UseGuards(JwtAuthGuard) et retirez @Public()
    const verifiedBy = user?.id || null;

    if (!user) {
      this.servicesService['logger']?.warn?.(
        'Vérification effectuée sans authentification (mode développement)',
      );
    }

    return this.servicesService.verifyCooperative(id, verifiedBy);
  }

  @Put(':id/status')
  // @UseGuards(JwtAuthGuard) // Temporairement désactivé pour le développement
  @Public() // Temporairement public pour le développement
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour le statut d\'une coopérative',
    description: 'Change le statut d\'une coopérative (active, inactive, suspended, etc.)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la coopérative',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(CooperativeStatus),
          example: CooperativeStatus.ACTIVE,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut mis à jour',
    type: CooperativeResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Coopérative non trouvée',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Statut invalide',
  })
  async updateCooperativeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: CooperativeStatus,
  ) {
    if (!status) {
      throw new BadRequestException('Le statut est requis');
    }
    return this.servicesService.updateCooperativeStatus(id, status);
  }
}
