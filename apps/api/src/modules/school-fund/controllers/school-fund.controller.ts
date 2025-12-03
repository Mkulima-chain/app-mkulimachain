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
import { SchoolFundService } from '../services/school-fund.service';
import {
  CreateSchoolFundDto,
  UpdateSchoolFundDto,
  GetSchoolFundDto,
  AddFundingDto,
  DisburseFundDto,
  SchoolFundResponseDto,
  SchoolFundStatsDto,
  ProvinceStatsDto,
} from '../dto/school-fund.dto';
import { SchoolFundEntity } from '../entities/school-fund.entity';

@ApiTags('school-funds')
@Controller('school-funds')
export class SchoolFundController {
  constructor(private readonly service: SchoolFundService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un fonds scolaire',
    description: 'Enregistre une nouvelle école bénéficiaire',
  })
  @ApiBody({ type: CreateSchoolFundDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'École enregistrée',
    type: SchoolFundResponseDto,
  })
  async create(@Body() dto: CreateSchoolFundDto): Promise<SchoolFundEntity> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les écoles',
    description: 'Récupère la liste des écoles avec filtres',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des écoles',
    type: [SchoolFundResponseDto],
  })
  async findAll(@Query() query: GetSchoolFundDto): Promise<SchoolFundEntity[]> {
    return this.service.findAll(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques globales',
    description: 'Récupère les statistiques du programme',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques',
    type: SchoolFundStatsDto,
  })
  async getStats(): Promise<{
    totalSchools: number;
    activeSchools: number;
    totalFunded: number;
    totalDisbursed: number;
    availableBalance: number;
  }> {
    return this.service.getStats();
  }

  @Get('stats/provinces')
  @ApiOperation({
    summary: 'Statistiques par province',
    description: 'Récupère les stats ventilées par province',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stats par province',
    type: [ProvinceStatsDto],
  })
  async getProvinceStats(): Promise<
    { province: string; schools: number; totalFunded: number }[]
  > {
    return this.service.getProvinceStats();
  }

  @Get('active')
  @ApiOperation({
    summary: 'Écoles actives',
    description: 'Récupère les écoles recevant activement des fonds',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Écoles actives',
    type: [SchoolFundResponseDto],
  })
  async findActive(): Promise<SchoolFundEntity[]> {
    return this.service.findActive();
  }

  @Get('province/:province')
  @ApiOperation({
    summary: 'Écoles par province',
    description: "Récupère les écoles d'une province",
  })
  @ApiParam({
    name: 'province',
    description: 'Nom de la province',
    example: 'Kinshasa',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Écoles de la province',
    type: [SchoolFundResponseDto],
  })
  async findByProvince(
    @Param('province') province: string,
  ): Promise<SchoolFundEntity[]> {
    return this.service.findByProvince(province);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir une école',
    description: "Récupère les détails d'une école",
  })
  @ApiParam({ name: 'id', description: "ID de l'école" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Détails de l'école",
    type: SchoolFundResponseDto,
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SchoolFundEntity> {
    return this.service.findById(id);
  }

  @Get(':id/balance')
  @ApiOperation({
    summary: 'Solde disponible',
    description: 'Calcule le solde disponible pour une école',
  })
  @ApiParam({ name: 'id', description: "ID de l'école" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Solde',
    schema: {
      type: 'object',
      properties: {
        availableBalance: { type: 'number', example: 1000.25 },
      },
    },
  })
  async getBalance(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ availableBalance: number }> {
    const school = await this.service.findById(id);
    return { availableBalance: this.service.getAvailableBalance(school) };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour une école',
    description: "Modifie les informations d'une école",
  })
  @ApiParam({ name: 'id', description: "ID de l'école" })
  @ApiBody({ type: UpdateSchoolFundDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'École mise à jour',
    type: SchoolFundResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSchoolFundDto,
  ): Promise<SchoolFundEntity> {
    return this.service.update(id, dto);
  }

  @Post(':id/fund')
  @ApiOperation({
    summary: 'Ajouter des fonds',
    description: "Ajoute des ADA au fonds de l'école",
  })
  @ApiParam({ name: 'id', description: "ID de l'école" })
  @ApiBody({ type: AddFundingDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fonds ajoutés',
    type: SchoolFundResponseDto,
  })
  async addFunding(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddFundingDto,
  ): Promise<SchoolFundEntity> {
    return this.service.addFunding(id, dto.amount);
  }

  @Post(':id/disburse')
  @ApiOperation({
    summary: 'Débourser des fonds',
    description: "Retire des ADA pour les envoyer à l'école",
  })
  @ApiParam({ name: 'id', description: "ID de l'école" })
  @ApiBody({ type: DisburseFundDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fonds déboursés',
    type: SchoolFundResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Solde insuffisant',
  })
  async disburse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DisburseFundDto,
  ): Promise<SchoolFundEntity> {
    return this.service.disburse(id, dto.amount);
  }

  @Post(':id/activate')
  @ApiOperation({
    summary: 'Activer une école',
    description: 'Passe l\'école au statut "active"',
  })
  @ApiParam({ name: 'id', description: "ID de l'école" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'École activée',
    type: SchoolFundResponseDto,
  })
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SchoolFundEntity> {
    return this.service.activate(id);
  }

  @Post(':id/deactivate')
  @ApiOperation({
    summary: 'Désactiver une école',
    description: 'Passe l\'école au statut "inactive"',
  })
  @ApiParam({ name: 'id', description: "ID de l'école" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'École désactivée',
    type: SchoolFundResponseDto,
  })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SchoolFundEntity> {
    return this.service.deactivate(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une école',
    description: 'Supprime une école (soft delete)',
  })
  @ApiParam({ name: 'id', description: "ID de l'école" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'École supprimée',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }
}
