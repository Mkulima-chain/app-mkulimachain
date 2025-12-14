import {
  Controller,
  Get,
  Post,
  Put,
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
  ApiQuery,
} from '@nestjs/swagger';
import { MobileMoneyTransactionService } from '../services/mobile-money-transaction.service';
import {
  CreateMobileMoneyTransactionDto,
  UpdateMobileMoneyTransactionDto,
  GetMobileMoneyTransactionDto,
  CompleteTransactionDto,
  FailTransactionDto,
} from '../dto/mobile-money-transaction.dto';
import { MobileMoneyTransactionEntity } from '../entities/mobile-money-transaction.entity';

@ApiTags('mobile-money-transactions')
@Controller('mobile-money')
export class MobileMoneyTransactionController {
  constructor(private readonly service: MobileMoneyTransactionService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une transaction mobile money',
    description: 'Crée une nouvelle transaction mobile money',
  })
  @ApiBody({ type: CreateMobileMoneyTransactionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction créée',
    type: MobileMoneyTransactionEntity,
  })
  async create(
    @Body() dto: CreateMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les transactions',
    description: 'Récupère la liste des transactions avec filtres',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des transactions',
    type: [MobileMoneyTransactionEntity],
  })
  async findAll(
    @Query() query: GetMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.service.findAll(query);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques des transactions',
    description: 'Récupère les statistiques globales des transactions',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques des transactions',
  })
  async getStats(): Promise<{
    total: number;
    success: number;
    failed: number;
    pending: number;
    totalAmount: number;
    totalAmountADA: number;
  }> {
    return this.service.getStats();
  }

  @Get('stats/detailed')
  @ApiOperation({
    summary: 'Statistiques détaillées',
    description: 'Récupère les statistiques détaillées avec temps de traitement moyen',
  })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques détaillées',
  })
  async getDetailedStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    if (start && end) {
      return this.service.getStatsByDateRange(start, end);
    }
    return this.service.getStats(start, end);
  }

  @Get('mobile/:mobileNumber')
  @ApiOperation({
    summary: 'Transactions par numéro mobile',
    description: 'Récupère toutes les transactions d\'un numéro mobile',
  })
  @ApiParam({
    name: 'mobileNumber',
    description: 'Numéro de téléphone mobile',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des transactions',
    type: [MobileMoneyTransactionEntity],
  })
  async findByMobileNumber(
    @Param('mobileNumber') mobileNumber: string,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.service.findByMobileNumber(mobileNumber);
  }

  @Get('address/:adaAddress')
  @ApiOperation({
    summary: 'Transactions par adresse ADA',
    description: 'Récupère toutes les transactions vers une adresse ADA',
  })
  @ApiParam({
    name: 'adaAddress',
    description: 'Adresse ADA',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des transactions',
    type: [MobileMoneyTransactionEntity],
  })
  async findByAdaAddress(
    @Param('adaAddress') adaAddress: string,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.service.findByAdaAddress(adaAddress);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir une transaction',
    description: 'Récupère les détails d\'une transaction',
  })
  @ApiParam({ name: 'id', description: 'ID de la transaction' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails de la transaction',
    type: MobileMoneyTransactionEntity,
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour une transaction',
    description: 'Modifie les informations d\'une transaction',
  })
  @ApiParam({ name: 'id', description: 'ID de la transaction' })
  @ApiBody({ type: UpdateMobileMoneyTransactionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction mise à jour',
    type: MobileMoneyTransactionEntity,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMobileMoneyTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.update(id, dto);
  }

  @Post(':id/complete')
  @ApiOperation({
    summary: 'Compléter une transaction',
    description: 'Marque une transaction comme complétée avec succès',
  })
  @ApiParam({ name: 'id', description: 'ID de la transaction' })
  @ApiBody({ type: CompleteTransactionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction complétée',
    type: MobileMoneyTransactionEntity,
  })
  async complete(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.complete(id, dto);
  }

  @Post(':id/fail')
  @ApiOperation({
    summary: 'Marquer comme échouée',
    description: 'Marque une transaction comme échouée',
  })
  @ApiParam({ name: 'id', description: 'ID de la transaction' })
  @ApiBody({ type: FailTransactionDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction marquée comme échouée',
    type: MobileMoneyTransactionEntity,
  })
  async fail(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FailTransactionDto,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.fail(id, dto);
  }

  @Post(':id/link-loan')
  @ApiOperation({
    summary: 'Lier à un prêt',
    description: 'Lie une transaction à un prêt',
  })
  @ApiParam({ name: 'id', description: 'ID de la transaction' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        loanId: {
          type: 'string',
          format: 'uuid',
          description: 'ID du prêt',
        },
      },
      required: ['loanId'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction liée au prêt',
    type: MobileMoneyTransactionEntity,
  })
  async linkToLoan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('loanId') loanId: string,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.linkToLoan(id, loanId);
  }

  @Post(':id/link-farmer')
  @ApiOperation({
    summary: 'Lier à un agriculteur',
    description: 'Lie une transaction à un agriculteur',
  })
  @ApiParam({ name: 'id', description: 'ID de la transaction' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        farmerId: {
          type: 'string',
          format: 'uuid',
          description: "ID de l'agriculteur",
        },
      },
      required: ['farmerId'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transaction liée à l\'agriculteur',
    type: MobileMoneyTransactionEntity,
  })
  async linkToFarmer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('farmerId') farmerId: string,
  ): Promise<MobileMoneyTransactionEntity> {
    return this.service.linkToFarmer(id, farmerId);
  }

  @Get('farmer/:farmerId')
  @ApiOperation({
    summary: 'Transactions d\'un agriculteur',
    description: 'Récupère toutes les transactions d\'un agriculteur',
  })
  @ApiParam({
    name: 'farmerId',
    description: "ID de l'agriculteur",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des transactions',
    type: [MobileMoneyTransactionEntity],
  })
  async getByFarmerId(
    @Param('farmerId', ParseUUIDPipe) farmerId: string,
  ): Promise<MobileMoneyTransactionEntity[]> {
    return this.service.getTransactionHistory(farmerId);
  }
}
