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
  UseInterceptors,
  UploadedFiles,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { validate } from 'class-validator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { NFTService } from '../services/nft.service';
import {
  CreateNFTDto,
  UpdateNFTDto,
  GetNFTDto,
  MintNFTDto,
  NFTResponseDto,
  RevenueDistributionDto,
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
    description:
      'Crée un nouveau NFT culturel (recette, conte, chant...). Peut uploader des fichiers (image, audio) sur IPFS automatiquement.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'audio', maxCount: 1 },
      ],
      {
        limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
      },
    ),
  )
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'creatorId',
        'type',
        'title',
        'priceADA',
        'revenueDistribution',
      ],
      properties: {
        creatorId: { type: 'string', format: 'uuid' },
        type: { type: 'string', enum: Object.values(NFTType) },
        title: { type: 'string', maxLength: 200 },
        description: { type: 'string' },
        metadataURI: {
          type: 'string',
          description: 'Optionnel si fichiers fournis',
        },
        priceADA: { type: 'number', minimum: 0.000001 },
        revenueDistribution: {
          type: 'object',
          properties: {
            creatorPercent: { type: 'number', minimum: 0, maximum: 100 },
            schoolFundPercent: { type: 'number', minimum: 0, maximum: 100 },
            platformPercent: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Fichier image (optionnel)',
        },
        audio: {
          type: 'string',
          format: 'binary',
          description: 'Fichier audio (optionnel)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'NFT créé',
    type: NFTResponseDto,
  })
  async create(
    @Req() req: Request,
    @UploadedFiles()
    files?: {
      image?: Express.Multer.File[];
      audio?: Express.Multer.File[];
    },
  ): Promise<NFTEntity> {
    const imageFile = files?.image?.[0];
    const audioFile = files?.audio?.[0];

    // Parser et transformer les données FormData
    const body = req.body;

    // Log pour débogage
    console.log('Received FormData body:', {
      creatorId: body.creatorId,
      type: body.type,
      title: body.title,
      priceADA: body.priceADA,
      revenueDistribution: {
        creatorPercent:
          body['revenueDistribution[creatorPercent]'] ||
          body.revenueDistribution?.creatorPercent,
        schoolFundPercent:
          body['revenueDistribution[schoolFundPercent]'] ||
          body.revenueDistribution?.schoolFundPercent,
        platformPercent:
          body['revenueDistribution[platformPercent]'] ||
          body.revenueDistribution?.platformPercent,
      },
      hasImage: !!imageFile,
      hasAudio: !!audioFile,
    });

    // Extraire revenueDistribution (peut être dans différents formats)
    let creatorPercent: number;
    let schoolFundPercent: number;
    let platformPercent: number;

    if (
      body.revenueDistribution &&
      typeof body.revenueDistribution === 'object'
    ) {
      creatorPercent = parseFloat(
        String(body.revenueDistribution.creatorPercent || 0),
      );
      schoolFundPercent = parseFloat(
        String(body.revenueDistribution.schoolFundPercent || 0),
      );
      platformPercent = parseFloat(
        String(body.revenueDistribution.platformPercent || 0),
      );
    } else {
      creatorPercent = parseFloat(
        String(body['revenueDistribution[creatorPercent]'] || 0),
      );
      schoolFundPercent = parseFloat(
        String(body['revenueDistribution[schoolFundPercent]'] || 0),
      );
      platformPercent = parseFloat(
        String(body['revenueDistribution[platformPercent]'] || 0),
      );
    }

    // Créer une instance de RevenueDistributionDto pour la validation
    const revenueDistribution = new RevenueDistributionDto();
    revenueDistribution.creatorPercent = creatorPercent;
    revenueDistribution.schoolFundPercent = schoolFundPercent;
    revenueDistribution.platformPercent = platformPercent;

    // Valider que les pourcentages sont des nombres valides
    if (
      isNaN(revenueDistribution.creatorPercent) ||
      isNaN(revenueDistribution.schoolFundPercent) ||
      isNaN(revenueDistribution.platformPercent)
    ) {
      throw new BadRequestException(
        'Revenue distribution percentages must be valid numbers',
      );
    }

    // Valider que la somme des pourcentages est égale à 100
    const total =
      revenueDistribution.creatorPercent +
      revenueDistribution.schoolFundPercent +
      revenueDistribution.platformPercent;
    if (Math.abs(total - 100) > 0.01) {
      throw new BadRequestException(
        `Revenue distribution percentages must sum to 100. Current sum: ${total}`,
      );
    }

    // Parser priceADA
    const priceADAValue = String(body.priceADA || '').trim();
    const priceADA = parseFloat(priceADAValue);
    if (!priceADAValue || isNaN(priceADA) || priceADA < 0.000001) {
      throw new BadRequestException(
        'priceADA must be a number and not less than 0.000001',
      );
    }

    // Valider creatorId (doit être un UUID valide)
    const creatorId = String(body.creatorId || '').trim();
    if (!creatorId) {
      throw new BadRequestException(
        'creatorId is required. Please provide a valid user UUID.',
      );
    }

    // Valider le format UUID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(creatorId)) {
      throw new BadRequestException(
        `creatorId must be a valid UUID format. Received: "${creatorId}". Example: "123e4567-e89b-12d3-a456-426614174000"`,
      );
    }

    const dto = new CreateNFTDto();
    dto.creatorId = creatorId;
    dto.type = body.type as NFTType;
    dto.title = String(body.title || '').trim();
    dto.description = body.description
      ? String(body.description).trim()
      : undefined;
    dto.metadataURI = body.metadataURI
      ? String(body.metadataURI).trim()
      : undefined;
    dto.priceADA = priceADA;
    dto.revenueDistribution = revenueDistribution;

    // Valider le DTO
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages: string[] = [];
      const errorDetails: Record<string, string[]> = {};

      errors.forEach((error) => {
        const property = error.property;
        const constraints = error.constraints || {};
        const messages = Object.values(constraints);

        // Log pour débogage
        console.error(`Validation error for ${property}:`, {
          property,
          constraints,
          messages,
          value: (dto as any)[property],
        });

        if (messages.length > 0) {
          errorMessages.push(`${property}: ${messages.join(', ')}`);
          errorDetails[property] = messages;
        } else {
          // Si pas de contraintes, utiliser le type d'erreur
          const errorType = error.target
            ? error.target.constructor.name
            : 'Unknown';
          errorMessages.push(`${property}: validation failed (${errorType})`);
          errorDetails[property] = ['validation failed'];
        }
      });

      const errorMessage =
        errorMessages.length > 0
          ? errorMessages.join('; ')
          : 'Validation failed';

      // Log pour débogage
      console.error('Validation errors:', {
        errorMessages,
        errorDetails,
        dto: {
          creatorId: dto.creatorId,
          type: dto.type,
          title: dto.title,
          priceADA: dto.priceADA,
          revenueDistribution: dto.revenueDistribution,
        },
      });

      // NestJS formate BadRequestException avec statusCode, message, error
      // On doit passer les erreurs dans le message ou utiliser un format personnalisé
      const errorResponse: any = {
        message: errorMessage,
        errors: errorDetails,
        statusCode: 400,
      };

      throw new BadRequestException(errorResponse);
    }

    return this.service.create(dto, imageFile, audioFile);
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
