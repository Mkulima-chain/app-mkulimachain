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
import { MicroLoanService } from '../services/micro-loan.service';
import {
  CreateMicroLoanDto,
  UpdateMicroLoanDto,
  GetMicroLoanDto,
  MicroLoanResponseDto,
  RepaymentAmountDto,
} from '../dto/micro-loan.dto';
import { MicroLoanEntity } from '../entities/micro-loan.entity';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('micro-loans')
@Controller('loans')
@Public() // À sécuriser quand l'auth sera activée côté admin
export class MicroLoanController {
  constructor(private readonly service: MicroLoanService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un micro-prêt',
    description: 'Demande un nouveau micro-prêt DeFi pour un agriculteur',
  })
  @ApiBody({ type: CreateMicroLoanDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Prêt créé (statut: pending)',
    type: MicroLoanResponseDto,
  })
  async create(@Body() dto: CreateMicroLoanDto): Promise<MicroLoanEntity> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les prêts',
    description: 'Récupère la liste des prêts avec filtres',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des prêts',
    type: [MicroLoanResponseDto],
  })
  async findAll(@Query() query: GetMicroLoanDto): Promise<MicroLoanEntity[]> {
    return this.service.findAll(query);
  }

  @Get('overdue')
  @ApiOperation({
    summary: 'Prêts en retard',
    description: "Récupère les prêts dont la date d'échéance est dépassée",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des prêts en retard',
    type: [MicroLoanResponseDto],
  })
  async findOverdueLoans(): Promise<MicroLoanEntity[]> {
    return this.service.findOverdueLoans();
  }

  @Get('farmer/:farmerId')
  @ApiOperation({
    summary: "Prêts d'un agriculteur",
    description: "Récupère tous les prêts d'un agriculteur",
  })
  @ApiParam({
    name: 'farmerId',
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des prêts',
    type: [MicroLoanResponseDto],
  })
  async findByFarmerId(
    @Param('farmerId', ParseUUIDPipe) farmerId: string,
  ): Promise<MicroLoanEntity[]> {
    return this.service.findByFarmerId(farmerId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un prêt',
    description: "Récupère les détails d'un prêt",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du prêt',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du prêt',
    type: MicroLoanResponseDto,
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MicroLoanEntity> {
    return this.service.findById(id);
  }

  @Get(':id/repayment-amount')
  @ApiOperation({
    summary: 'Calculer le remboursement',
    description: 'Calcule le montant total à rembourser (capital + intérêts)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du prêt',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Montant du remboursement',
    type: RepaymentAmountDto,
  })
  async getRepaymentAmount(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ amount: number }> {
    const loan = await this.service.findById(id);
    return { amount: this.service.calculateRepaymentAmount(loan) };
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un prêt',
    description: "Modifie les informations d'un prêt",
  })
  @ApiParam({ name: 'id', description: 'ID du prêt' })
  @ApiBody({ type: UpdateMicroLoanDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Prêt mis à jour',
    type: MicroLoanResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMicroLoanDto,
  ): Promise<MicroLoanEntity> {
    return this.service.update(id, dto);
  }

  @Post(':id/activate')
  @ApiOperation({
    summary: 'Activer un prêt',
    description: 'Passe le prêt au statut "active" et démarre le compteur',
  })
  @ApiParam({ name: 'id', description: 'ID du prêt' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Prêt activé',
    type: MicroLoanResponseDto,
  })
  async activate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MicroLoanEntity> {
    return this.service.activate(id);
  }

  @Post(':id/repay')
  @ApiOperation({
    summary: 'Rembourser un prêt',
    description: 'Marque le prêt comme remboursé',
  })
  @ApiParam({ name: 'id', description: 'ID du prêt' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Prêt remboursé',
    type: MicroLoanResponseDto,
  })
  async repay(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MicroLoanEntity> {
    return this.service.repay(id);
  }

  @Post(':id/default')
  @ApiOperation({
    summary: 'Marquer en défaut',
    description: 'Marque le prêt comme en défaut de paiement',
  })
  @ApiParam({ name: 'id', description: 'ID du prêt' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Prêt marqué en défaut',
    type: MicroLoanResponseDto,
  })
  async markDefaulted(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MicroLoanEntity> {
    return this.service.markDefaulted(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un prêt',
    description: 'Supprime un prêt (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID du prêt' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Prêt supprimé',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }
}
