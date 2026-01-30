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
  ApiQuery,
} from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/settings.dto';
import { CategoryEntity } from '../entities/category.entity';
import { Public } from '@/modules/auth/decorators/public.decorator';

@ApiTags('categories')
@Controller('categories')
@Public()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une catégorie' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: CategoryEntity })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoryService.create(createCategoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une catégorie' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: HttpStatus.OK, type: CategoryEntity })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une catégorie' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK, type: CategoryEntity })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CategoryEntity> {
    return this.categoryService.findOne(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les catégories' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiResponse({ status: HttpStatus.OK, type: [CategoryEntity] })
  async findAll(
    @Query('activeOnly') activeOnly?: string,
  ): Promise<CategoryEntity[]> {
    return this.categoryService.findAll(activeOnly === 'true');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  @ApiParam({ name: 'id', type: 'string' })
  @ApiResponse({ status: HttpStatus.OK })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.categoryService.delete(id);
  }
}
