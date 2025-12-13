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
  HttpCode,
  NotFoundException,
  BadRequestException,
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
  CreateFarmerDto,
  GetFarmerDto,
  UpdateFarmerDto,
  FarmerResponseDto,
} from '../dto/farmers.dto';
import { FarmerEntity } from '../entities/entities';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { UserEntity } from '@/modules/auth/entities/user.entity';
import { FarmerStatus } from '../entities/entities';

@ApiTags('farmers')
@Controller('farmers')
@Public() // Autorise l'accès public (dev). À sécuriser avec JWT quand prêt.
export class ControllersController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un agriculteur',
    description: 'Enregistre un nouvel agriculteur dans le système',
  })
  @ApiBody({ type: CreateFarmerDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Agriculteur créé avec succès',
    type: FarmerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  async createFarmer(
    @Body() createFarmerDto: CreateFarmerDto,
  ): Promise<FarmerEntity> {
    return this.servicesService.createFarmer(createFarmerDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour un agriculteur',
    description: "Modifie les informations d'un agriculteur existant",
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateFarmerDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agriculteur mis à jour',
    type: FarmerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agriculteur non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  async updateFarmer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFarmerDto: UpdateFarmerDto,
  ) {
    return this.servicesService.updateFarmer(id, updateFarmerDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un agriculteur',
    description: "Récupère les détails d'un agriculteur par son ID avec ses relations",
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Détails de l'agriculteur",
    type: FarmerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agriculteur non trouvé',
  })
  async getFarmer(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.getFarmerById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les agriculteurs',
    description: 'Récupère la liste des agriculteurs avec filtres optionnels',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des agriculteurs',
    type: [FarmerResponseDto],
  })
  async getFarmers(@Query() query: GetFarmerDto) {
    return this.servicesService.getFarmers(query);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Obtenir les statistiques d un agriculteur',
    description: 'Récupère les statistiques détaillées d un agriculteur',
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques de l agriculteur',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agriculteur non trouvé',
  })
  async getFarmerStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.getFarmerStats(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un agriculteur',
    description: 'Supprime un agriculteur (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Agriculteur supprimé',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agriculteur non trouvé',
  })
  async deleteFarmer(@Param('id', ParseUUIDPipe) id: string) {
    await this.servicesService.deleteFarmer(id);
  }

  @Post(':id/verify')
  // @UseGuards(JwtAuthGuard) // Temporairement désactivé pour le développement
  @Public() // Temporairement public pour le développement
  @ApiOperation({
    summary: 'Vérifier un agriculteur',
    description: 'Marque un agriculteur comme vérifié par un administrateur',
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agriculteur vérifié',
    type: FarmerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agriculteur non trouvé',
  })
  async verifyFarmer(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: UserEntity,
  ) {
    // Pour le développement : utiliser null si aucun utilisateur n'est fourni
    // En production, décommentez @UseGuards(JwtAuthGuard) et retirez @Public()
    const verifiedBy = user?.id || null;
    
    if (!user) {
      this.servicesService['logger']?.warn?.(
        'Vérification effectuée sans authentification (mode développement)',
      );
    }
    
    return this.servicesService.verifyFarmer(id, verifiedBy);
  }

  @Put(':id/status')
  // @UseGuards(JwtAuthGuard) // Temporairement désactivé pour le développement
  @Public() // Temporairement public pour le développement
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour le statut d\'un agriculteur',
    description: 'Change le statut d\'un agriculteur (active, inactive, suspended, etc.)',
  })
  @ApiParam({
    name: 'id',
    description: "ID de l'agriculteur",
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(FarmerStatus),
          example: FarmerStatus.ACTIVE,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut mis à jour',
    type: FarmerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agriculteur non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Statut invalide',
  })
  async updateFarmerStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: FarmerStatus,
  ) {
    if (!status) {
      throw new BadRequestException('Le statut est requis');
    }
    return this.servicesService.updateFarmerStatus(id, status);
  }
}
