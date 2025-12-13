import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  HttpStatus,
  HttpCode,
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
  CreateProductDto,
  GetProductDto,
  UpdateProductDto,
} from '../dto/products.dto';
import { ProductEntity, ProductStatus } from '../entities/entities';
import { Public } from '@/modules/auth/decorators/public.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import { UserEntity } from '@/modules/auth/entities/user.entity';

@ApiTags('products')
@Controller('products')
@Public() // À sécuriser quand l'admin enverra le JWT
export class ControllersController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un produit',
    description: 'Enregistre un nouveau produit agricole',
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Produit créé avec succès',
    type: ProductEntity,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Données invalides',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'SKU ou code-barres déjà utilisé',
  })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductEntity> {
    return this.servicesService.createProduct(createProductDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Mettre à jour un produit',
    description: "Modifie les informations d'un produit",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produit mis à jour',
    type: ProductEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit non trouvé',
  })
  async updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.servicesService.updateProduct(id, updateProductDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un produit',
    description: "Récupère les détails d'un produit par son ID",
  })
  @ApiParam({
    name: 'id',
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Détails du produit',
    type: ProductEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit non trouvé',
  })
  async getProductById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductEntity> {
    return this.servicesService.getProductById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'Lister les produits',
    description: 'Récupère la liste des produits avec filtres optionnels et pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des produits avec pagination',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductEntity' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async getProducts(@Query() query: GetProductDto) {
    return this.servicesService.getProducts(query);
  }

  @Get(':id/stats')
  @ApiOperation({
    summary: 'Obtenir les statistiques d\'un produit',
    description: 'Récupère les statistiques détaillées d\'un produit',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques du produit',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit non trouvé',
  })
  async getProductStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.servicesService.getProductStats(id);
  }

  @Get('stats/global')
  @ApiOperation({
    summary: 'Obtenir les statistiques globales',
    description: 'Récupère les statistiques globales de tous les produits',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistiques globales',
  })
  async getGlobalStats() {
    return this.servicesService.getGlobalStats();
  }

  @Get('low-stock')
  @ApiOperation({
    summary: 'Obtenir les produits en rupture de stock',
    description: 'Récupère la liste des produits dont le stock est inférieur ou égal au niveau minimum',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Liste des produits en rupture de stock',
    type: [ProductEntity],
  })
  async getLowStockProducts() {
    return this.servicesService.getLowStockProducts();
  }

  @Post(':id/verify')
  @ApiOperation({
    summary: 'Vérifier un produit',
    description: 'Marque un produit comme vérifié par un administrateur',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Produit vérifié',
    type: ProductEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit non trouvé',
  })
  async verifyProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: UserEntity,
  ) {
    const verifiedBy = user?.id || null;
    return this.servicesService.verifyProduct(id, verifiedBy);
  }

  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour le statut d\'un produit',
    description: 'Change le statut d\'un produit (active, inactive, out_of_stock, discontinued)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(ProductStatus),
          example: ProductStatus.ACTIVE,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statut mis à jour',
    type: ProductEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Statut invalide',
  })
  async updateProductStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ProductStatus,
  ) {
    if (!status) {
      throw new BadRequestException('Le statut est requis');
    }
    return this.servicesService.updateProductStatus(id, status);
  }

  @Put(':id/stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mettre à jour le stock d\'un produit',
    description: 'Ajoute ou retire une quantité du stock (quantité positive pour ajouter, négative pour retirer)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          example: 10,
          description: 'Quantité à ajouter (positif) ou retirer (négatif)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Stock mis à jour',
    type: ProductEntity,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit non trouvé',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Stock insuffisant',
  })
  async updateProductStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('quantity') quantity: number,
  ) {
    if (quantity === undefined || quantity === null) {
      throw new BadRequestException('La quantité est requise');
    }
    return this.servicesService.updateProductStock(id, quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un produit',
    description: 'Supprime un produit (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID du produit',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Produit supprimé',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Produit non trouvé',
  })
  async deleteProduct(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.servicesService.deleteProduct(id);
  }
}
