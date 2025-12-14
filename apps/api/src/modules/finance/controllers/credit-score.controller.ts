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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreditScoreService } from '../services/credit-score.service';
import {
  CreateCreditScoreDto,
  UpdateCreditScoreDto,
  GetCreditScoreDto,
  RecordHarvestDto,
  CreditScoreResponseDto,
} from '../dto/credit-score.dto';
import { CreditScoreEntity } from '../entities/credit-score.entity';
import { RiskLevel } from '../interfaces/icredit-score';

@ApiTags('credit-scores')
@Controller('credit-scores')
export class CreditScoreController {
  constructor(private readonly service: CreditScoreService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un score de crédit',
    description: 'Initialise le score de crédit pour un agriculteur',
  })
  @ApiBody({ type: CreateCreditScoreDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Score créé',
    type: CreditScoreResponseDto,
  })
  async create(@Body() dto: CreateCreditScoreDto): Promise<CreditScoreEntity> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les scores',
    description: 'Récupère la liste des scores avec filtres',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des scores',
    type: [CreditScoreResponseDto],
  })
  async findAll(
    @Query() query: GetCreditScoreDto,
  ): Promise<CreditScoreEntity[]> {
    return this.service.findAll(query);
  }

  @Get('farmer/:farmerId')
  @ApiOperation({
    summary: "Score d'un agriculteur",
    description: "Récupère le score de crédit d'un agriculteur",
  })
  @ApiParam({
    name: 'farmerId',
    description: "ID de l'agriculteur",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Score de l'agriculteur",
    type: CreditScoreResponseDto,
  })
  async findByFarmerId(
    @Param('farmerId', ParseUUIDPipe) farmerId: string,
  ): Promise<CreditScoreEntity> {
    return this.service.findByFarmerId(farmerId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un score',
    description: "Récupère les détails d'un score",
  })
  @ApiParam({ name: 'id', description: 'ID du score' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du score',
    type: CreditScoreResponseDto,
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CreditScoreEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un score',
    description: 'Modifie les données du score',
  })
  @ApiParam({ name: 'id', description: 'ID du score' })
  @ApiBody({ type: UpdateCreditScoreDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Score mis à jour',
    type: CreditScoreResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCreditScoreDto,
  ): Promise<CreditScoreEntity> {
    return this.service.update(id, dto);
  }

  @Post('farmer/:farmerId/recalculate')
  @ApiOperation({
    summary: 'Recalculer le score',
    description:
      "Recalcule le score basé sur l'historique des récoltes et prêts",
  })
  @ApiParam({
    name: 'farmerId',
    description: "ID de l'agriculteur",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Score recalculé',
    type: CreditScoreResponseDto,
  })
  async recalculateScore(
    @Param('farmerId', ParseUUIDPipe) farmerId: string,
  ): Promise<CreditScoreEntity> {
    return this.service.recalculateScore(farmerId);
  }

  @Post('farmer/:farmerId/harvest')
  @ApiOperation({
    summary: 'Enregistrer une récolte',
    description:
      'Met à jour le score après une nouvelle récolte (proof-of-harvest)',
  })
  @ApiParam({
    name: 'farmerId',
    description: "ID de l'agriculteur",
  })
  @ApiBody({ type: RecordHarvestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Score mis à jour',
    type: CreditScoreResponseDto,
  })
  async recordHarvest(
    @Param('farmerId', ParseUUIDPipe) farmerId: string,
    @Body() dto: RecordHarvestDto,
  ): Promise<CreditScoreEntity> {
    return this.service.recordHarvest(farmerId, dto.harvestValue);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un score',
    description: 'Supprime un score de crédit',
  })
  @ApiParam({ name: 'id', description: 'ID du score' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Score supprimé',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques des scores',
    description: 'Récupère les statistiques globales des scores de crédit',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques des scores',
  })
  async getStatistics() {
    return this.service.getStatistics();
  }

  @Get('farmer/:farmerId/history')
  @ApiOperation({
    summary: 'Historique de crédit',
    description: "Récupère l'historique de crédit d'un agriculteur",
  })
  @ApiParam({
    name: 'farmerId',
    description: "ID de l'agriculteur",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Historique de crédit',
    type: CreditScoreResponseDto,
  })
  async getCreditHistory(
    @Param('farmerId', ParseUUIDPipe) farmerId: string,
  ): Promise<CreditScoreEntity> {
    return this.service.getCreditHistory(farmerId);
  }

  @Get('risk-level/:level')
  @ApiOperation({
    summary: 'Scores par niveau de risque',
    description: 'Récupère tous les scores d\'un niveau de risque donné',
  })
  @ApiParam({
    name: 'level',
    description: 'Niveau de risque (low, medium, high, very_high)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des scores',
    type: [CreditScoreResponseDto],
  })
  async getByRiskLevel(
    @Param('level') level: string,
    @Query() query: GetCreditScoreDto,
  ): Promise<CreditScoreEntity[]> {
    const riskLevel = level.toUpperCase() as keyof typeof RiskLevel;
    if (!RiskLevel[riskLevel]) {
      throw new BadRequestException(`Niveau de risque invalide: ${level}`);
    }
    return this.service.findAll({ ...query, riskLevel: RiskLevel[riskLevel] });
  }
}
