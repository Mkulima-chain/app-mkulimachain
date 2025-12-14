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
import { SupplyChainStepService } from '../services/supply-chain-step.service';
import {
  CreateSupplyChainStepDto,
  UpdateSupplyChainStepDto,
  GetSupplyChainStepDto,
  SupplyChainStepResponseDto,
  SupplyChainTimelineDto,
  VerifyStepDto,
  UpdateStepStatusDto,
} from '../dto/supply-chain-step.dto';
import { SupplyChainStepEntity } from '../entities/supply-chain-step.entity';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('supply-chain')
@Controller('supply-chain-steps')
@Public() // À sécuriser quand l'auth sera activée côté admin
export class SupplyChainStepController {
  constructor(private readonly service: SupplyChainStepService) {}

  @Post()
  @ApiOperation({
    summary: 'Ajouter une étape',
    description:
      "Enregistre une nouvelle étape dans la chaîne d'approvisionnement",
  })
  @ApiBody({ type: CreateSupplyChainStepDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Étape créée avec succès',
    type: SupplyChainStepResponseDto,
  })
  async create(
    @Body() dto: CreateSupplyChainStepDto,
  ): Promise<SupplyChainStepEntity> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les étapes',
    description: 'Récupère la liste des étapes avec filtres optionnels et pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste paginée des étapes',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/SupplyChainStepResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async findAll(@Query() query: GetSupplyChainStepDto): Promise<{
    data: SupplyChainStepEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.service.findAll(query);
  }

  // Routes spécifiques AVANT la route générique :id
  @Get('statistics')
  @ApiOperation({
    summary: 'Statistiques globales',
    description: 'Récupère les statistiques globales sur les étapes',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques',
  })
  async getStatistics(@Query('batchId') batchId?: string): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    verified: number;
    unverified: number;
  }> {
    return this.service.getStatistics(batchId);
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Étapes en attente',
    description: 'Récupère toutes les étapes en attente',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des étapes en attente',
    type: [SupplyChainStepResponseDto],
  })
  async findPendingSteps(): Promise<SupplyChainStepEntity[]> {
    return this.service.findPendingSteps();
  }

  @Get('batch/:batchId')
  @ApiOperation({
    summary: 'Étapes par lot',
    description: "Récupère toutes les étapes d'un lot spécifique",
  })
  @ApiParam({
    name: 'batchId',
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Étapes du lot',
    type: [SupplyChainStepResponseDto],
  })
  async findByBatch(
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ): Promise<SupplyChainStepEntity[]> {
    return this.service.findByBatchId(batchId);
  }

  @Get('batch/:batchId/timeline')
  @ApiOperation({
    summary: 'Timeline complète d\'un lot',
    description: "Récupère la timeline complète de toutes les étapes d'un lot",
  })
  @ApiParam({
    name: 'batchId',
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Timeline du lot',
    type: SupplyChainTimelineDto,
  })
  async getBatchTimeline(
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ): Promise<SupplyChainTimelineDto> {
    return this.service.getBatchTimeline(batchId);
  }

  @Get('batch/:batchId/statistics')
  @ApiOperation({
    summary: 'Statistiques d\'un lot',
    description: "Récupère les statistiques des étapes d'un lot spécifique",
  })
  @ApiParam({
    name: 'batchId',
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques du lot',
  })
  async getBatchStatistics(
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    verified: number;
    unverified: number;
  }> {
    return this.service.getStatistics(batchId);
  }

  @Get('batch/:batchId/validate')
  @ApiOperation({
    summary: 'Valider l\'intégrité de la chaîne',
    description: 'Vérifie l\'intégrité et la cohérence de la chaîne d\'approvisionnement d\'un lot',
  })
  @ApiParam({
    name: 'batchId',
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Résultat de la validation',
  })
  async validateChainIntegrity(
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    return this.service.validateChainIntegrity(batchId);
  }

  @Get('batch/:batchId/quality')
  @ApiOperation({
    summary: 'Métriques de qualité',
    description: 'Récupère les métriques de qualité d\'un lot',
  })
  @ApiParam({
    name: 'batchId',
    description: 'ID du lot',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Métriques de qualité',
  })
  async getQualityMetrics(
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ): Promise<{
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    average: number;
  }> {
    return this.service.getQualityMetrics(batchId);
  }

  @Get('qr/:qrCode')
  @ApiOperation({
    summary: 'Recherche par QR code',
    description: "Récupère une étape par son code QR",
  })
  @ApiParam({
    name: 'qrCode',
    description: 'Code QR',
    example: 'QR-STEP-001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Étape trouvée',
    type: SupplyChainStepResponseDto,
  })
  async findByQrCode(@Param('qrCode') qrCode: string): Promise<SupplyChainStepEntity> {
    return this.service.findByQrCode(qrCode);
  }

  // Route générique :id doit être EN DERNIER
  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir une étape',
    description: "Récupère les détails d'une étape par son ID",
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'étape",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Détails de l'étape",
    type: SupplyChainStepResponseDto,
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SupplyChainStepEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour une étape',
    description: "Modifie les informations d'une étape",
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'étape",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateSupplyChainStepDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Étape mise à jour',
    type: SupplyChainStepResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplyChainStepDto,
  ): Promise<SupplyChainStepEntity> {
    return this.service.update(id, dto);
  }

  @Post(':id/verify')
  @ApiOperation({
    summary: 'Vérifier une étape',
    description: 'Marque une étape comme vérifiée',
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'étape",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: VerifyStepDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Étape vérifiée',
    type: SupplyChainStepResponseDto,
  })
  async verifyStep(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyStepDto,
  ): Promise<SupplyChainStepEntity> {
    return this.service.verifyStep(id, dto.verifiedBy);
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Mettre à jour le statut',
    description: "Modifie le statut d'une étape",
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'étape",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateStepStatusDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut mis à jour',
    type: SupplyChainStepResponseDto,
  })
  async updateStepStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStepStatusDto,
  ): Promise<SupplyChainStepEntity> {
    return this.service.updateStepStatus(id, dto.status);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une étape',
    description: 'Supprime une étape (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'étape",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Étape supprimée',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }
}
