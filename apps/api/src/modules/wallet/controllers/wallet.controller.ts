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
import { WalletService } from '../services/wallet.service';
import {
  CreateWalletDto,
  UpdateWalletDto,
  GetWalletDto,
  UpdateBalanceDto,
  WalletResponseDto,
} from '../dto/wallet.dto';
import { WalletEntity } from '../entities/wallet.entity';
import { OwnerType } from '../interfaces/iwallet';

@ApiTags('wallets')
@Controller('wallets')
export class WalletController {
  constructor(private readonly service: WalletService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un portefeuille',
    description: 'Crée un nouveau portefeuille Cardano lié à un utilisateur',
  })
  @ApiBody({ type: CreateWalletDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Portefeuille créé',
    type: WalletResponseDto,
  })
  async create(@Body() dto: CreateWalletDto): Promise<WalletEntity> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les portefeuilles',
    description: 'Récupère la liste des portefeuilles avec filtres',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des portefeuilles',
    type: [WalletResponseDto],
  })
  async findAll(@Query() query: GetWalletDto): Promise<WalletEntity[]> {
    return this.service.findAll(query);
  }

  @Get('address/:adaAddress')
  @ApiOperation({
    summary: 'Rechercher par adresse ADA',
    description: 'Trouve un portefeuille par son adresse Cardano',
  })
  @ApiParam({
    name: 'adaAddress',
    description: 'Adresse Cardano',
    example: 'addr1qx2fxv2...',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Portefeuille trouvé',
    type: WalletResponseDto,
  })
  async findByAdaAddress(
    @Param('adaAddress') adaAddress: string,
  ): Promise<WalletEntity> {
    return this.service.findByAdaAddress(adaAddress);
  }

  @Get('owner/:ownerType/:ownerId')
  @ApiOperation({
    summary: 'Rechercher par propriétaire',
    description: "Trouve le portefeuille d'un utilisateur",
  })
  @ApiParam({
    name: 'ownerType',
    description: 'Type de propriétaire',
    enum: OwnerType,
  })
  @ApiParam({
    name: 'ownerId',
    description: 'ID du propriétaire',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Portefeuille trouvé',
    type: WalletResponseDto,
  })
  async findByOwner(
    @Param('ownerType') ownerType: OwnerType,
    @Param('ownerId', ParseUUIDPipe) ownerId: string,
  ): Promise<WalletEntity> {
    return this.service.findByOwner(ownerType, ownerId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un portefeuille',
    description: "Récupère les détails d'un portefeuille",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du portefeuille',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du portefeuille',
    type: WalletResponseDto,
  })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WalletEntity> {
    return this.service.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un portefeuille',
    description: "Modifie les informations d'un portefeuille",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du portefeuille',
  })
  @ApiBody({ type: UpdateWalletDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Portefeuille mis à jour',
    type: WalletResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWalletDto,
  ): Promise<WalletEntity> {
    return this.service.update(id, dto);
  }

  @Post(':id/credit')
  @ApiOperation({
    summary: 'Créditer le portefeuille',
    description: 'Ajoute des ADA au portefeuille',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du portefeuille',
  })
  @ApiBody({ type: UpdateBalanceDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Portefeuille crédité',
    type: WalletResponseDto,
  })
  async credit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBalanceDto,
  ): Promise<WalletEntity> {
    return this.service.credit(id, dto.amount);
  }

  @Post(':id/debit')
  @ApiOperation({
    summary: 'Débiter le portefeuille',
    description: 'Retire des ADA du portefeuille',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du portefeuille',
  })
  @ApiBody({ type: UpdateBalanceDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Portefeuille débité',
    type: WalletResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Solde insuffisant',
  })
  async debit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBalanceDto,
  ): Promise<WalletEntity> {
    return this.service.debit(id, dto.amount);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un portefeuille',
    description: 'Supprime un portefeuille (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du portefeuille',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Portefeuille supprimé',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }
}
