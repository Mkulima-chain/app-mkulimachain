import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpStatus,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BatchService } from '../services/batch.service';
import {
  CreateBatchDto,
  UpdateBatchDto,
  GetBatchDto,
  BatchResponseDto,
} from '../dto/batch.dto';
import { BatchEntity } from '../entities/batch.entity';
import { BatchStatus } from '../interfaces/ibatch';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('batches')
@Controller('batches')
@Public() // Autorise l'accès public (dev). À sécuriser avec JWT quand prêt.
export class BatchController {
  constructor(private readonly service: BatchService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un lot de production',
    description: 'Crée un nouveau lot à partir de récoltes sélectionnées',
  })
  @ApiBody({ type: CreateBatchDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lot créé avec succès',
    type: BatchResponseDto,
  })
  async create(@Body() dto: CreateBatchDto): Promise<BatchEntity> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les lots',
    description:
      'Récupère la liste des lots avec pagination et filtres optionnels',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste paginée des lots',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/BatchResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async findAll(
    @Query(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false, // Plus permissif pour les requêtes GET
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        skipMissingProperties: true,
      }),
    )
    query: GetBatchDto,
  ): Promise<{
    data: BatchEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.service.findAll(query);
  }

  @Get('qr/:qrCode')
  @ApiOperation({
    summary: 'Rechercher par QR code',
    description: 'Trouve un lot par son code QR (pour scanner)',
  })
  @ApiParam({
    name: 'qrCode',
    description: 'Code QR du lot',
    example: 'BATCH-2024-001-KASAI',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lot trouvé',
    type: BatchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Lot non trouvé',
  })
  async findByQrCode(@Param('qrCode') qrCode: string): Promise<BatchEntity> {
    return this.service.findByQrCode(qrCode);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un lot',
    description: "Récupère les détails d'un lot par son ID",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du lot',
    type: BatchResponseDto,
  })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<BatchEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un lot',
    description: "Modifie les informations d'un lot",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateBatchDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lot mis à jour',
    type: BatchResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBatchDto,
  ): Promise<BatchEntity> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un lot',
    description: 'Supprime un lot (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lot supprimé',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }

  @Post(':id/verify')
  @ApiOperation({
    summary: 'Vérifier un lot',
    description: 'Marque un lot comme vérifié par un administrateur',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          format: 'uuid',
          description: 'ID de l\'utilisateur qui vérifie',
        },
      },
      required: ['userId'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lot vérifié avec succès',
    type: BatchResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Le lot est déjà vérifié',
  })
  async verifyBatch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId') userId: string,
  ): Promise<BatchEntity> {
    return this.service.verifyBatch(id, userId);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Changer le statut d\'un lot',
    description: 'Met à jour le statut d\'un lot',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(BatchStatus),
          description: 'Nouveau statut',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut mis à jour avec succès',
    type: BatchResponseDto,
  })
  async updateBatchStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: BatchStatus,
  ): Promise<BatchEntity> {
    return this.service.updateBatchStatus(id, status);
  }

  @Get('stats/summary')
  @ApiOperation({
    summary: 'Statistiques des lots',
    description: 'Récupère les statistiques des lots',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques des lots',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        byStatus: { type: 'object' },
        verified: { type: 'number' },
        unverified: { type: 'number' },
        totalQuantity: { type: 'number' },
        totalValue: { type: 'number' },
      },
    },
  })
  async getBatchStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    verified: number;
    unverified: number;
    totalQuantity: number;
    totalValue: number;
  }> {
    return this.service.getBatchStats();
  }

  @Get('stats/global')
  @ApiOperation({
    summary: 'Statistiques globales',
    description: 'Récupère les statistiques globales des lots',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques globales',
    schema: {
      type: 'object',
      properties: {
        totalBatches: { type: 'number' },
        totalQuantity: { type: 'number' },
        totalValue: { type: 'number' },
        verifiedBatches: { type: 'number' },
        batchesByStatus: { type: 'object' },
        batchesByQuality: { type: 'object' },
      },
    },
  })
  async getGlobalStats(): Promise<{
    totalBatches: number;
    totalQuantity: number;
    totalValue: number;
    verifiedBatches: number;
    batchesByStatus: Record<string, number>;
    batchesByQuality: Record<string, number>;
  }> {
    return this.service.getGlobalStats();
  }
}
