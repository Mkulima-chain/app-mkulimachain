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
import { ServicesService } from '../services/services.service';
import {
  CreateFarmerDto,
  GetFarmerDto,
  UpdateFarmerDto,
  FarmerResponseDto,
} from '../dto/farmers.dto';
import { FarmerEntity } from '../entities/entities';
import { Public } from '@/modules/auth/decorators/public.decorator';

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
  async updateFarmer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFarmerDto: UpdateFarmerDto,
  ) {
    return this.servicesService.updateFarmer(id, updateFarmerDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un agriculteur',
    description: "Récupère les détails d'un agriculteur par son ID",
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

  @Delete(':id')
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
    status: HttpStatus.OK,
    description: 'Agriculteur supprimé',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agriculteur non trouvé',
  })
  async deleteFarmer(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.deleteFarmer(id);
  }
}
