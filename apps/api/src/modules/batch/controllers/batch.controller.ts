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
import { BatchService } from '../services/batch.service';
import {
  CreateBatchDto,
  UpdateBatchDto,
  GetBatchDto,
  BatchResponseDto,
} from '../dto/batch.dto';
import { BatchEntity } from '../entities/batch.entity';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('batches')
@Controller('batches')
@Public() // Rendre les lots accessibles publiquement
export class BatchController {
  constructor(private readonly service: BatchService) { }

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
    description: 'Récupère la liste des lots avec filtres optionnels',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des lots',
    type: [ BatchResponseDto ],
  })
  async findAll(@Query() query: GetBatchDto): Promise<BatchEntity[]> {
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
}
