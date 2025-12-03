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
import { CooperativeEntity } from '../entities/entities';
import { ICooperative } from '../interfaces/icooperative';

@ApiTags('cooperatives')
@Controller('cooperatives')
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
    description: 'Récupère la liste des coopératives avec filtres optionnels',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des coopératives',
    type: [CooperativeResponseDto],
  })
  async getCooperatives(
    @Query() query: GetCooperativeDto,
  ): Promise<CooperativeEntity[]> {
    return this.servicesService.getCooperatives(query as Partial<ICooperative>);
  }

  @Delete(':id')
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
    status: HttpStatus.OK,
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
}
