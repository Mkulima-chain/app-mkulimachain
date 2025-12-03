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
import { NFTService } from '../services/nft.service';
import {
  CreateNFTDto,
  UpdateNFTDto,
  GetNFTDto,
  MintNFTDto,
  NFTResponseDto,
} from '../dto/nft.dto';
import { NFTEntity } from '../entities/nft.entity';
import { NFTType } from '../interfaces/inft';

@ApiTags('nfts')
@Controller('nfts')
export class NFTController {
  constructor(private readonly service: NFTService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un NFT',
    description: 'Crée un nouveau NFT culturel (recette, conte, chant...)',
  })
  @ApiBody({ type: CreateNFTDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'NFT créé',
    type: NFTResponseDto,
  })
  async create(@Body() dto: CreateNFTDto): Promise<NFTEntity> {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les NFTs',
    description: 'Récupère la liste des NFTs avec filtres',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des NFTs',
    type: [NFTResponseDto],
  })
  async findAll(@Query() query: GetNFTDto): Promise<NFTEntity[]> {
    return this.service.findAll(query);
  }

  @Get('listed')
  @ApiOperation({
    summary: 'NFTs en vente',
    description: 'Récupère les NFTs listés à la vente',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFTs en vente',
    type: [NFTResponseDto],
  })
  async findListed(): Promise<NFTEntity[]> {
    return this.service.findListed();
  }

  @Get('type/:type')
  @ApiOperation({
    summary: 'NFTs par type',
    description: "Récupère les NFTs d'un type spécifique",
  })
  @ApiParam({
    name: 'type',
    description: 'Type de NFT',
    enum: NFTType,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFTs du type',
    type: [NFTResponseDto],
  })
  async findByType(@Param('type') type: NFTType): Promise<NFTEntity[]> {
    return this.service.findByType(type);
  }

  @Get('creator/:creatorId')
  @ApiOperation({
    summary: "NFTs d'un créateur",
    description: 'Récupère les NFTs créés par un artiste',
  })
  @ApiParam({
    name: 'creatorId',
    description: 'ID du créateur',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFTs du créateur',
    type: [NFTResponseDto],
  })
  async findByCreatorId(
    @Param('creatorId', ParseUUIDPipe) creatorId: string,
  ): Promise<NFTEntity[]> {
    return this.service.findByCreatorId(creatorId);
  }

  @Get('hash/:onChainHash')
  @ApiOperation({
    summary: 'Rechercher par hash',
    description: 'Trouve un NFT par son hash on-chain',
  })
  @ApiParam({
    name: 'onChainHash',
    description: 'Hash blockchain',
    example: '0xabc123def456...',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFT trouvé',
    type: NFTResponseDto,
  })
  async findByOnChainHash(
    @Param('onChainHash') onChainHash: string,
  ): Promise<NFTEntity> {
    return this.service.findByOnChainHash(onChainHash);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un NFT',
    description: "Récupère les détails d'un NFT",
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du NFT',
    type: NFTResponseDto,
  })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<NFTEntity> {
    return this.service.findById(id);
  }

  @Get(':id/revenue-shares')
  @ApiOperation({
    summary: 'Parts des revenus',
    description: 'Calcule la distribution des revenus pour une vente',
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Parts en ADA',
    schema: {
      type: 'object',
      properties: {
        creator: { type: 'number', example: 35 },
        schoolFund: { type: 'number', example: 10 },
        platform: { type: 'number', example: 5 },
      },
    },
  })
  async getRevenueShares(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ creator: number; schoolFund: number; platform: number }> {
    const nft = await this.service.findById(id);
    return this.service.calculateRevenueShares(nft);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un NFT',
    description: "Modifie les informations d'un NFT",
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiBody({ type: UpdateNFTDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFT mis à jour',
    type: NFTResponseDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNFTDto,
  ): Promise<NFTEntity> {
    return this.service.update(id, dto);
  }

  @Post(':id/mint')
  @ApiOperation({
    summary: 'Mint le NFT',
    description: 'Crée le NFT sur la blockchain Cardano',
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiBody({ type: MintNFTDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFT minté',
    type: NFTResponseDto,
  })
  async mint(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MintNFTDto,
  ): Promise<NFTEntity> {
    return this.service.mint(id, dto);
  }

  @Post(':id/list')
  @ApiOperation({
    summary: 'Mettre en vente',
    description: 'Liste le NFT sur le marketplace',
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFT listé',
    type: NFTResponseDto,
  })
  async list(@Param('id', ParseUUIDPipe) id: string): Promise<NFTEntity> {
    return this.service.list(id);
  }

  @Post(':id/sell')
  @ApiOperation({
    summary: 'Vendre le NFT',
    description: 'Finalise la vente du NFT',
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFT vendu',
    type: NFTResponseDto,
  })
  async sell(@Param('id', ParseUUIDPipe) id: string): Promise<NFTEntity> {
    return this.service.sell(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer un NFT',
    description: 'Supprime un NFT (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFT supprimé',
  })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.delete(id);
  }
}
