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
    description: 'Récupère la liste des étapes avec filtres optionnels',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des étapes',
    type: [SupplyChainStepResponseDto],
  })
  async findAll(
    @Query() query: GetSupplyChainStepDto,
  ): Promise<SupplyChainStepEntity[]> {
    return this.service.findAll(query);
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
