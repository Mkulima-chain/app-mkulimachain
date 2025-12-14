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
  NFTListResponseDto,
} from '../dto/nft.dto';
import { NFTEntity } from '../entities/nft.entity';
import { NFTType } from '../interfaces/inft';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('nfts')
@Controller('nfts')
@Public() // À sécuriser quand l'auth sera activée côté admin
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
    description: 'Récupère la liste des NFTs avec filtres et pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des NFTs avec pagination',
    type: NFTListResponseDto,
  })
  async findAll(@Query() query: GetNFTDto): Promise<{
    data: NFTEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
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

  @Get('stats')
  @ApiOperation({
    summary: 'Statistiques des NFTs',
    description: 'Récupère les statistiques globales des NFTs',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        listed: { type: 'number' },
        sold: { type: 'number' },
        totalRevenue: { type: 'number' },
        totalViews: { type: 'number' },
        totalLikes: { type: 'number' },
        byType: { type: 'object' },
        byCollection: { type: 'object' },
      },
    },
  })
  async getStats(): Promise<{
    total: number;
    listed: number;
    sold: number;
    totalRevenue: number;
    totalViews: number;
    totalLikes: number;
    byType: Record<string, number>;
    byCollection: Record<string, number>;
  }> {
    return this.service.getStats();
  }

  @Get('featured')
  @ApiOperation({
    summary: 'NFTs mis en avant',
    description: 'Récupère les NFTs mis en avant',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFTs mis en avant',
    type: [NFTResponseDto],
  })
  async getFeatured(
    @Query('limit') limit?: number,
  ): Promise<NFTEntity[]> {
    return this.service.getFeatured(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('trending')
  @ApiOperation({
    summary: 'NFTs tendances',
    description: 'Récupère les NFTs les plus vus et likés',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFTs tendances',
    type: [NFTResponseDto],
  })
  async getTrending(
    @Query('limit') limit?: number,
  ): Promise<NFTEntity[]> {
    return this.service.getTrending(limit ? parseInt(limit.toString()) : 10);
  }

  @Get('tags')
  @ApiOperation({
    summary: 'NFTs par tags',
    description: 'Récupère les NFTs correspondant aux tags',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'NFTs par tags',
    type: [NFTResponseDto],
  })
  async findByTags(@Query('tags') tags: string): Promise<NFTEntity[]> {
    const tagsArray = tags.split(',').map((tag) => tag.trim());
    return this.service.findByTags(tagsArray);
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

  @Post(':id/view')
  @ApiOperation({
    summary: 'Incrémenter les vues',
    description: "Incrémente le compteur de vues d'un NFT",
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vues incrémentées',
  })
  async incrementViews(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.incrementViews(id);
  }

  @Post(':id/like')
  @ApiOperation({
    summary: 'Liker un NFT',
    description: "Incrémente le compteur de likes d'un NFT",
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Like ajouté',
  })
  async like(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.incrementLikes(id);
  }

  @Post(':id/unlike')
  @ApiOperation({
    summary: 'Retirer le like',
    description: "Décrémente le compteur de likes d'un NFT",
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Like retiré',
  })
  async unlike(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.decrementLikes(id);
  }

  @Put(':id/featured')
  @ApiOperation({
    summary: 'Mettre en avant / Retirer de la mise en avant',
    description: 'Change le statut de mise en avant d\'un NFT',
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        featured: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut de mise en avant modifié',
    type: NFTResponseDto,
  })
  async setFeatured(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('featured') featured: boolean,
  ): Promise<NFTEntity> {
    return this.service.setFeatured(id, featured);
  }

  @Put(':id/verify')
  @ApiOperation({
    summary: 'Vérifier / Dévérifier un NFT',
    description: 'Change le statut de vérification d\'un NFT',
  })
  @ApiParam({ name: 'id', description: 'ID du NFT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        verified: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut de vérification modifié',
    type: NFTResponseDto,
  })
  async setVerified(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('verified') verified: boolean,
  ): Promise<NFTEntity> {
    return this.service.setVerified(id, verified);
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
